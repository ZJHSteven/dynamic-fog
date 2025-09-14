import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../util/getPluginId";

import lightOnIcon from "../assets/light-on.svg";
import lightSettingsIcon from "../assets/light-settings.svg";

export function createLightMenu() {
  OBR.contextMenu.create({
    id: getPluginId("light-menu/add"),
    icons: [
      {
        icon: lightOnIcon,
        label: "添加光源",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: ["metadata", getPluginId("light")], value: undefined },
          ],
          permissions: ["UPDATE"],
        },
      },
      {
        icon: lightOnIcon,
        label: "添加光源",
        filter: {
          every: [
            { key: "type", value: "SHAPE" },
            { key: "shapeType", value: "CIRCLE" },
            { key: ["metadata", getPluginId("light")], value: undefined },
          ],
          permissions: ["UPDATE"],
        },
      },
    ],
    async onClick(context) {
      const dpi = await OBR.scene.grid.getDpi();
      // 6 grid cell radius or 30ft in a 5ft grid
      const attenuationRadius = 6 * dpi;
      // Make source radius smaller than the default 50 to make it easier
      // to fit through a 5ft door
      const sourceRadius = 25;
      // Make the falloff smaller than the default 1 as it better suits
      // the new source radius and makes things a little clearer
      const falloff = 0.2;

      await OBR.scene.items.updateItems(context.items, (items) => {
        for (const item of items) {
          item.metadata[getPluginId("light")] = {
            attenuationRadius,
            sourceRadius,
            falloff,
          };
        }
      });
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("light-menu/settings"),
    icons: [
      {
        icon: lightSettingsIcon,
        label: "光源设置",
        filter: {
          every: [
            {
              key: ["metadata", getPluginId("light")],
              value: undefined,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
        },
      },
    ],
    embed: {
      url: "/menu.html",
      height: 194,
    },
  });
}
