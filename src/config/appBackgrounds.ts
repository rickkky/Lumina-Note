export type AppBackgroundKind = "none" | "preset" | "image";
export type AppBackgroundPreset = "paper" | "mist" | "sakura" | "dusk";

export interface AppBackgroundSettings {
  kind: AppBackgroundKind;
  preset: AppBackgroundPreset;
  imagePath: string | null;
  opacity: number;
  blur: number;
  dim: number;
}

interface AppBackgroundColorTokens {
  background: string;
  popover: string;
  muted: string;
  accent: string;
  ribbon: string;
  border: string;
}

export interface AppBackgroundPresetTokens {
  light: AppBackgroundColorTokens;
  dark: AppBackgroundColorTokens;
}

export const DEFAULT_APP_BACKGROUND: AppBackgroundSettings = {
  kind: "none",
  preset: "paper",
  imagePath: null,
  opacity: 0.46,
  blur: 0,
  dim: 0.52,
};

export const APP_BACKGROUND_PRESETS: AppBackgroundPreset[] = [
  "paper",
  "mist",
  "sakura",
  "dusk",
];

export const APP_BACKGROUND_PRESET_STYLES: Record<
  AppBackgroundPreset,
  string
> = {
  paper:
    "linear-gradient(135deg, hsl(38 56% 88%) 0%, hsl(31 44% 78%) 52%, hsl(48 44% 90%) 100%)",
  mist:
    "linear-gradient(135deg, hsl(203 62% 80%) 0%, hsl(162 42% 76%) 52%, hsl(232 38% 88%) 100%)",
  sakura:
    "linear-gradient(135deg, hsl(345 82% 84%) 0%, hsl(276 48% 78%) 50%, hsl(207 58% 88%) 100%)",
  dusk:
    "linear-gradient(135deg, hsl(224 42% 16%) 0%, hsl(270 42% 28%) 48%, hsl(22 46% 30%) 100%)",
};

export const APP_BACKGROUND_PRESET_TOKENS: Record<
  AppBackgroundPreset,
  AppBackgroundPresetTokens
> = {
  paper: {
    light: {
      background: "38 44% 96%",
      popover: "40 52% 98%",
      muted: "36 36% 91%",
      accent: "34 42% 88%",
      ribbon: "36 34% 88%",
      border: "34 24% 82%",
    },
    dark: {
      background: "34 18% 12%",
      popover: "34 18% 15%",
      muted: "34 16% 18%",
      accent: "34 18% 22%",
      ribbon: "34 16% 10%",
      border: "34 14% 27%",
    },
  },
  mist: {
    light: {
      background: "194 40% 96%",
      popover: "198 48% 98%",
      muted: "186 32% 90%",
      accent: "170 32% 87%",
      ribbon: "202 28% 88%",
      border: "194 20% 81%",
    },
    dark: {
      background: "204 22% 12%",
      popover: "204 22% 15%",
      muted: "196 18% 18%",
      accent: "182 18% 22%",
      ribbon: "206 20% 10%",
      border: "198 15% 27%",
    },
  },
  sakura: {
    light: {
      background: "340 58% 97%",
      popover: "340 70% 99%",
      muted: "335 44% 93%",
      accent: "326 56% 90%",
      ribbon: "336 34% 90%",
      border: "330 24% 84%",
    },
    dark: {
      background: "330 20% 12%",
      popover: "330 20% 15%",
      muted: "328 18% 18%",
      accent: "320 20% 22%",
      ribbon: "330 18% 10%",
      border: "326 16% 27%",
    },
  },
  dusk: {
    light: {
      background: "258 22% 96%",
      popover: "260 28% 98%",
      muted: "252 24% 91%",
      accent: "270 24% 88%",
      ribbon: "252 20% 88%",
      border: "258 16% 82%",
    },
    dark: {
      background: "248 24% 11%",
      popover: "252 24% 14%",
      muted: "258 20% 18%",
      accent: "270 22% 23%",
      ribbon: "246 22% 9%",
      border: "260 16% 28%",
    },
  },
};
