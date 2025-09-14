import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import OBR, { GridScale, Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../util/getPluginId";

import { LightOff } from "./icons/LightOff";
import NumberField from "./util/NumberField";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { getMetadata } from "../util/getMetadata";
import { LightConfig } from "../types/LightConfig";
import { isPlainObject } from "./util/isPlainObject";
import InputAdornment from "@mui/material/InputAdornment";
import styled from "@mui/material/styles/styled";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { LightFull } from "./icons/LightFull";
import { LightHalf } from "./icons/LightHalf";
import { LightSoft } from "./icons/LightSoft";
import { LightHard } from "./icons/LightHard";
import { LightPrimary } from "./icons/LightPrimary";
import { LightSecondary } from "./icons/LightSecondary";
import { Rotate } from "./icons/Rotate";

const SmallLabel = styled(FormLabel)({
  fontSize: "0.75rem",
  marginBottom: 4,
});

export function Menu() {
  const [gridScale, setGridScale] = useState<GridScale | null>(null);
  const [gridDpi, setGridDpi] = useState<number | null>(null);
  const [selection, setSelection] = useState<string[] | null>(null);
  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const selection = await OBR.player.getSelection();
      const scale = await OBR.scene.grid.getScale();
      const dpi = await OBR.scene.grid.getDpi();
      if (mounted) {
        setSelection(selection ?? null);
        setGridScale(scale);
        setGridDpi(dpi);
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, []);

  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    if (!selection) {
      return;
    }

    let mounted = true;
    const getItems = async () => {
      const items = await OBR.scene.items.getItems(selection);
      if (mounted) {
        setItems(items);
      }
    };
    getItems();

    const unsubscribe = OBR.scene.items.onChange((items) => {
      if (mounted) {
        setItems(items.filter((item) => selection.includes(item.id)));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [selection]);

  if (items && gridScale && gridDpi) {
    return (
      <MenuControls items={items} gridScale={gridScale} gridDpi={gridDpi} />
    );
  } else {
    return <MenuSkeleton />;
  }
}

function MenuControls({
  items,
  gridScale,
  gridDpi,
}: {
  items: Item[];
  gridScale: GridScale;
  gridDpi: number;
}) {
  const config = useMemo(() => {
    for (const item of items) {
      const config = getMetadata<LightConfig>(
        item.metadata,
        getPluginId("light"),
        {}
      );
      return config;
    }
    return {};
  }, [items]);

  const values: Required<LightConfig> = {
    attenuationRadius: 12 * 150,
    sourceRadius: 25,
    falloff: 1,
    innerAngle: 360,
    outerAngle: 360,
    lightType: "PRIMARY",
    rotation: 0,
    ...config,
  };

  async function handleAttenuationChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("light")];
        if (isPlainObject(config)) {
          config.attenuationRadius = value;
        }
      }
    });
  }

  const angleValue = values.outerAngle === 360 ? "FULL" : "HALF";
  async function handleAngleChange(value: "FULL" | "HALF") {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("light")];
        if (isPlainObject(config)) {
          config.innerAngle = value === "FULL" ? 360 : 45;
          config.outerAngle = value === "FULL" ? 360 : 60;
        }
      }
    });
  }

  const edgeValue = values.falloff > 1 ? "SOFT" : "HARD";
  async function handleEdgeChange(value: "SOFT" | "HARD") {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("light")];
        if (isPlainObject(config)) {
          config.falloff = value === "SOFT" ? 1.5 : 0.2;
        }
      }
    });
  }

  async function handleTypeChange(value: "PRIMARY" | "SECONDARY") {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("light")];
        if (isPlainObject(config)) {
          config.lightType = value;
        }
      }
    });
  }

  async function handleRotationChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("light")];
        if (isPlainObject(config)) {
          config.rotation = value;
        }
      }
    });
  }

  const isHalfAngle = angleValue === "HALF";

  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel>范围</SmallLabel>
          <NumberField
            aria-label="Range"
            variant="outlined"
            numberToText={(value) =>
              `${((value / gridDpi) * gridScale.parsed.multiplier).toFixed(
                gridScale.parsed.digits
              )}`
            }
            textToNumber={(value) =>
              (parseFloat(value) / gridScale.parsed.multiplier) * gridDpi
            }
            step={gridDpi}
            size="small"
            value={values.attenuationRadius}
            onChange={handleAttenuationChange}
            autoComplete="off"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {gridScale.parsed.unit}
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth>
          {/* 中文化：角度（整圆/半圆） */}
          <SmallLabel>角度</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="angle"
            size="small"
            value={angleValue}
            onChange={(_, v) => v && handleAngleChange(v)}
            fullWidth
          >
            <ToggleButton value="FULL" aria-label="full">
              <LightFull />
            </ToggleButton>
            <ToggleButton value="HALF" aria-label="half">
              <LightHalf />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 2 }} alignItems="center">
        <FormControl fullWidth>
          {/* 中文化：边缘（硬/软） */}
          <SmallLabel>边缘</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="edge"
            size="small"
            value={edgeValue}
            onChange={(_, v) => v && handleEdgeChange(v)}
            fullWidth
          >
            <ToggleButton value="HARD" aria-label="hard">
              <LightHard />
            </ToggleButton>
            <ToggleButton value="SOFT" aria-label="soft">
              <LightSoft />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl fullWidth>
          {/* 中文化：类型（主/次光源） */}
          <SmallLabel>类型</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="type"
            size="small"
            value={values.lightType}
            onChange={(_, v) => v && handleTypeChange(v)}
            fullWidth
          >
            <ToggleButton value="PRIMARY" aria-label="primary">
              <LightPrimary />
            </ToggleButton>
            <ToggleButton value="SECONDARY" aria-label="secondary">
              <LightSecondary />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" alignItems="center">
        {isHalfAngle && (
          <Button
            size="small"
            fullWidth
            onClick={() => handleRotationChange((values.rotation + 90) % 360)}
            startIcon={<Rotate />}
          >
            {/* 中文化：旋转 */}
            旋转
          </Button>
        )}
        <Button
          size="small"
          fullWidth
          onClick={async () => {
            const selection = await OBR.player.getSelection();
            if (!selection || selection.length === 0) {
              return;
            }
            await OBR.scene.items.updateItems(selection, (items) => {
              for (const item of items) {
                delete item.metadata[getPluginId("light")];
              }
            });
          }}
          color="error"
          startIcon={<LightOff />}
        >
          {/* 中文化：移除/移除光源（半角时文案与上游保持一致的空后缀） */}
          移除{isHalfAngle ? "" : "光源"}
        </Button>
      </Stack>
    </Stack>
  );
}

function FormControlSkeleton() {
  return (
    <Stack width="100%" gap={0.5}>
      <Skeleton height={17.25} width={40} />
      <Skeleton
        variant="rectangular"
        height={40}
        width="100%"
        sx={{ borderRadius: 0.5 }}
      />
    </Stack>
  );
}

function MenuSkeleton() {
  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControlSkeleton />
        <FormControlSkeleton />
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 2 }} alignItems="center">
        <FormControlSkeleton />
        <FormControlSkeleton />
      </Stack>
      <Skeleton
        variant="rectangular"
        height={30.75}
        width="100%"
        sx={{ borderRadius: "20px" }}
      />
    </Stack>
  );
}
