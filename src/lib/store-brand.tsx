// Visual identity per real demo store — distinct icon + accent color so the
// three connected stores read as genuinely different businesses, not three
// copies of the same generic "store" icon.
import { IconBike, IconCompass, IconShirt, IconStore } from "./icons";

export interface StoreBrand {
  icon: typeof IconStore;
  color: string;
  bg: string;
}

const BRANDS: Record<string, StoreBrand> = {
  "cadence-cycles": { icon: IconBike, color: "#1e7b3e", bg: "#e4f6ea" },
  "luna-apparel": { icon: IconShirt, color: "#b3261e", bg: "#fcebe9" },
  "trailworks": { icon: IconCompass, color: "#8a5a00", bg: "#fff4e0" },
};

export function getStoreBrand(slug: string): StoreBrand {
  return BRANDS[slug] ?? { icon: IconStore, color: "var(--am-accent)", bg: "var(--am-accent-soft)" };
}
