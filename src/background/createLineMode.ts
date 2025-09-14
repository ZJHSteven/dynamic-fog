import OBR, {
  buildLine,
  InteractionManager,
  Line,
  Math2,
  ToolEvent,
  Vector2,
} from "@owlbear-rodeo/sdk";
import { getPluginId } from "../util/getPluginId";

import lineModeIcon from "../assets/line-mode.svg";

let interaction: InteractionManager<Line> | null = null;

export function createLineMode() {
  async function createLine(start: Vector2) {
    const color = await OBR.scene.fog.getColor();
    const strokeWidth = await OBR.scene.fog.getStrokeWidth();
    return buildLine()
      .startPosition(start)
      .endPosition(start)
      .strokeWidth(strokeWidth)
      .strokeColor(color)
      .layer("FOG")
      .build();
  }

  async function getDragPosition(event: ToolEvent) {
    return await OBR.scene.grid.snapPosition(event.pointerPosition);
  }

  OBR.tool.createMode({
    id: getPluginId("line-mode"),
    icons: [
      {
        icon: lineModeIcon,
        label: "线段",
        filter: {
          activeTools: ["rodeo.owlbear.tool/fog"],
        },
      },
    ],
    async onToolDragStart(_, event) {
      const position = await getDragPosition(event);
      const line = await createLine(position);
      interaction = await OBR.interaction.startItemInteraction(line);
    },
    async onToolDragMove(_, event) {
      if (interaction) {
        const position = await getDragPosition(event);
        const [update] = interaction;
        update((line) => {
          line.endPosition = position;
        });
      }
    },
    async onToolDragEnd(_, event) {
      if (interaction) {
        const position = await getDragPosition(event);
        const [update, stop] = interaction;
        const line = update((line) => {
          line.position = line.startPosition;
          line.endPosition = Math2.subtract(position, line.startPosition);
          line.startPosition = { x: 0, y: 0 };
          line.zIndex = Date.now();
        });
        stop();
        OBR.scene.items.addItems([line]);
        interaction = null;
      }
    },
    async onToolDragCancel() {
      if (interaction) {
        const [_, stop] = interaction;
        stop();
        interaction = null;
      }
    },
    cursors: [
      {
        cursor: "crosshair",
      },
    ],
  });
}
