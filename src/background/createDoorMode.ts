import OBR, {
  buildPath,
  buildShape,
  isPath,
  Item,
  MathM,
  Path,
  ToolEvent,
  Vector2,
} from "@owlbear-rodeo/sdk";
import { Drawing, isDrawing } from "../types/Drawing";
import { CanvasKit, Path as SkPath } from "canvaskit-wasm";
import { PathHelpers, PathIntersection } from "./util/PathHelpers";
import { inverseTransformPoint, transformPoint } from "./util/math";
import { getPluginId } from "../util/getPluginId";
import { Door } from "../types/Door";
import { getMetadata } from "../util/getMetadata";

import doorModeIcon from "../assets/door-mode.svg";

const MIN_INTERSECTION_DISTANCE = 75;

type DoorIntersection = PathIntersection & { world: Vector2 };

let startId: string | null = null;
let endId: string | null = null;
let subpathId: string | null = null;
let target: { id: string; skPath: SkPath; item: Drawing } | null = null;
let startHit: DoorIntersection | null = null;
let endHit: DoorIntersection | null = null;

export function createDoorMode(CanvasKit: CanvasKit) {
  function getIntersection(pointerPosition: Vector2): DoorIntersection | null {
    if (!target) {
      return null;
    }

    const transform = MathM.fromItem(target.item);
    const intersection = PathHelpers.getSkPathIntersection(
      CanvasKit,
      target.skPath,
      inverseTransformPoint(transform, pointerPosition)
    );
    return {
      ...intersection,
      world: transformPoint(transform, intersection.point),
    };
  }

  function createControlPoint(position: Vector2) {
    return buildShape()
      .position(position)
      .width(24)
      .height(24)
      .shapeType("CIRCLE")
      .fillColor("#ff7433")
      .strokeColor("#ff7433")
      .layer("CONTROL")
      .disableHit(true)
      .build();
  }

  function createSubpath(parent: Drawing) {
    return buildPath()
      .position(parent.position)
      .rotation(parent.rotation)
      .scale(parent.scale)
      .fillOpacity(0)
      .strokeWidth(parent.style.strokeWidth)
      .strokeColor("#ff7433")
      .layer("CONTROL")
      .disableHit(true)
      .build();
  }

  /**
   * Manage the start circle indicator
   */
  async function createOrUpdateStart(event: ToolEvent) {
    if (
      event.target &&
      event.target.layer === "FOG" &&
      isDrawing(event.target)
    ) {
      // Create or update target path if needed
      if (!target || event.target.id !== target.id) {
        target?.skPath.delete();
        const skPath = PathHelpers.drawingToSkPath(event.target, CanvasKit);
        target = skPath
          ? {
              id: event.target.id,
              skPath: skPath,
              item: event.target,
            }
          : null;
      }

      const hit = getIntersection(event.pointerPosition);
      if (!hit) {
        return;
      }

      // Remove the starting indicator if we go too far away
      if (hit.distance > MIN_INTERSECTION_DISTANCE) {
        if (startId) {
          await OBR.scene.local.deleteItems([startId]);
          startId = null;
        }
        return;
      }

      if (startId) {
        await OBR.scene.local.updateItems(
          [startId],
          (items) => {
            for (const item of items) {
              item.position = hit.world;
            }
          },
          true
        );
      } else {
        const start = createControlPoint(hit.world);
        startId = start.id;
        await OBR.scene.local.addItems([start]);
      }

      startHit = hit;
    } else if (startId) {
      // No target so delete the starting indicator
      await OBR.scene.local.deleteItems([startId]);
      startId = null;
      target?.skPath.delete();
      target = null;
    }
  }

  function updateSubpathCommands(
    path: Path,
    skPath: SkPath,
    start: DoorIntersection,
    end: DoorIntersection
  ) {
    const commands = PathHelpers.getCommandsBetween(
      CanvasKit,
      skPath,
      start.contour,
      end.contour
    );
    if (commands) {
      path.commands = commands;
    }
  }

  /**
   * Get the attached parent if the target is a door overlay
   * also get which door was selected for that parent
   */
  async function getAttachedDoor(
    target?: Item
  ): Promise<[Item, number] | null> {
    if (
      target &&
      getPluginId("door-index") in target.metadata &&
      target.attachedTo
    ) {
      const doorIndex = getMetadata(
        target.metadata,
        getPluginId("door-index"),
        -1
      );
      const parent = (await OBR.scene.items.getItems([target.attachedTo]))[0];
      if (parent) {
        return [parent, doorIndex];
      }
    }
    return null;
  }

  /**
   * Get the attached parent if the target is a light overlay
   */
  async function getAttachedLight(target?: Item): Promise<Item | null> {
    if (
      target &&
      getPluginId("light-overlay") in target.metadata &&
      target.attachedTo
    ) {
      const parent = (await OBR.scene.items.getItems([target.attachedTo]))[0];
      if (parent) {
        return parent;
      }
    }
    return null;
  }

  async function toggleDoorOpen(parent: Item, index: number) {
    await OBR.scene.items.updateItems([parent], (items) => {
      const item = items[0];
      if (item) {
        const doors = getMetadata<Door[]>(
          item.metadata,
          getPluginId("doors"),
          []
        );
        const door = doors[index];
        if (door) {
          door.open = !door.open;
        }
      }
    });
  }

  async function deleteDoor(parent: Item, index: number) {
    await OBR.scene.items.updateItems([parent], (items) => {
      const item = items[0];
      if (item) {
        const doors = getMetadata<Door[]>(
          item.metadata,
          getPluginId("doors"),
          []
        );
        if (index >= 0 && index < doors.length) {
          doors.splice(index, 1);
        }
      }
    });
  }

  async function clearControls() {
    const toDelete: string[] = [];
    if (endId) {
      toDelete.push(endId);
    }
    if (subpathId) {
      toDelete.push(subpathId);
    }
    if (startId) {
      toDelete.push(startId);
    }
    endId = null;
    subpathId = null;
    startId = null;
    target?.skPath.delete();
    target = null;
    await OBR.scene.local.deleteItems(toDelete);
  }

  OBR.tool.createMode({
    id: getPluginId("door-mode"),
    icons: [
      {
        icon: doorModeIcon,
        label: "门",
        filter: {
          activeTools: ["rodeo.owlbear.tool/fog"],
        },
      },
    ],
    async onToolClick(_, event) {
      // Toggle door or select a light if selecting their overlay
      const door = await getAttachedDoor(event.target);
      if (door) {
        const [item, index] = door;
        if (event.altKey) {
          await deleteDoor(item, index);
        } else {
          await toggleDoorOpen(item, index);
        }
      } else {
        const light = await getAttachedLight(event.target);
        if (light) {
          await OBR.player.select([light.id], true);
        }
      }
    },
    async onToolDoubleClick(_, event) {
      // Delete door if selecting their overlay
      const door = await getAttachedDoor(event.target);
      if (door) {
        const [item, index] = door;
        await deleteDoor(item, index);
      }
    },
    async onToolMove(_, event) {
      if (!endId) {
        await createOrUpdateStart(event);
      }
    },
    async onToolDragStart(_, event) {
      await createOrUpdateStart(event);

      if (!startId || !target) {
        return;
      }

      const hit = getIntersection(event.pointerPosition);
      if (!hit) {
        return;
      }

      endHit = hit;
      const end = createControlPoint(hit.world);
      endId = end.id;
      const subpath = createSubpath(target.item);
      subpathId = subpath.id;
      await OBR.scene.local.addItems([end, subpath]);
    },
    async onToolDragMove(_, event) {
      if (!endId || !target || !startHit || !subpathId) {
        return;
      }

      const hit = getIntersection(event.pointerPosition);
      // Prevent movement if changing between shape contours
      if (!hit || hit.contour.index !== startHit.contour.index) {
        return;
      }

      endHit = hit;

      await OBR.scene.local.updateItems([endId, subpathId], (items) => {
        for (const item of items) {
          if (item.id === endId) {
            item.position = hit.world;
          } else if (
            item.id === subpathId &&
            isPath(item) &&
            target &&
            startHit &&
            endHit
          ) {
            updateSubpathCommands(item, target.skPath, startHit, endHit);
          }
        }
      });
    },
    async onToolDragEnd() {
      if (target && startHit && endHit) {
        const start = startHit.contour;
        const end = endHit.contour;
        OBR.scene.items.updateItems([target.item], (items) => {
          const item = items[0];
          if (item) {
            const metadata: Door[] | undefined = item.metadata[
              getPluginId("doors")
            ] as Door[];
            if (metadata && Array.isArray(metadata)) {
              metadata.push({ open: false, start, end });
            } else {
              item.metadata[getPluginId("doors")] = [
                { open: false, start, end },
              ];
            }
          }
        });
      }
      await clearControls();
    },
    async onToolDragCancel() {
      await clearControls();
    },
    async onDeactivate() {
      await clearControls();
    },
    cursors: [
      {
        cursor: "Pointer",
        filter: {
          target: [
            {
              key: ["metadata", getPluginId("door-index")],
              value: undefined,
              operator: "!=",
              coordinator: "||",
            },
            {
              key: ["metadata", getPluginId("light-overlay")],
              value: undefined,
              operator: "!=",
            },
          ],
        },
      },
      {
        cursor: "crosshair",
        filter: {},
      },
    ],
    shortcut: "O",
  });
}
