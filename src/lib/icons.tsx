// Minimal inline icon set for the customer-facing app (auth, profile, merchant
// pages). Stroke-based, 20px default, inherits color via currentColor — no
// icon library dependency for a handful of glyphs.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="12" r="7" fill="var(--am-accent)" />
      <circle cx="15" cy="12" r="7" fill="var(--am-accent)" opacity="0.45" />
    </svg>
  );
}

export const IconBolt = (p: IconProps) => (
  <svg {...base(p)}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
);
export const IconShield = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3 4.5 6v6c0 4.5 3.1 7.7 7.5 9 4.4-1.3 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconStore = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 9.5 4.5 4h15L21 9.5" /><path d="M4 9.5v10h16v-10" /><path d="M9.5 19.5v-5a2.5 2.5 0 0 1 5 0v5" /><path d="M3 9.5a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" /></svg>
);
export const IconCloud = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 18a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 17.3 8.1 4 4 0 0 1 17 18H7Z" /></svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base(p)}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
export const IconUserPlus = (p: IconProps) => (
  <svg {...base(p)}><circle cx="10" cy="8" r="4" /><path d="M2.5 20a7.5 7.5 0 0 1 15 0" /><path d="M19 8v6M22 11h-6" /></svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
);
export const IconEye = (p: IconProps) => (
  <svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconEyeOff = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1-4 4.6M6.5 6.6A15.7 15.7 0 0 0 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
);
export const IconMapPin = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 4h4l1.5 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15 13.5l5 1.5v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 4Z" /></svg>
);
export const IconCard = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>
);
export const IconBookmark = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
);
export const IconGavel = (p: IconProps) => (
  <svg {...base(p)}><path d="m14 5 5 5" /><path d="m8 11 5 5" /><path d="m3 21 6-6" /><path d="m11.5 7.5 5-5 4 4-5 5-4-4Z" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base(p)}><path d="m18 6-12 12M6 6l12 12" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>
);
export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
);
export const IconTag = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 11.5 11.5 3H19a2 2 0 0 1 2 2v7.5L12.5 21 3 11.5Z" /><circle cx="15" cy="9" r="1.4" /></svg>
);
export const IconChart = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20V10M11 20V4M18 20v-7" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconCompass = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 6-6 2 2-6 6-2Z" /></svg>
);
export const IconCart = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18H18a2 2 0 0 0 2-1.6L21.5 8H6" /><circle cx="9.5" cy="21" r="1.3" /><circle cx="17.5" cy="21" r="1.3" /></svg>
);
export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg>
);
export const IconReceipt = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></svg>
);
export const IconBike = (p: IconProps) => (
  <svg {...base(p)}><circle cx="6" cy="17" r="3.5" /><circle cx="18" cy="17" r="3.5" /><path d="M6 17 10 8h4l3 5M10 8 8 5h3m-1 12 4-9" /></svg>
);
export const IconShirt = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 4 4 7l2 3 2-1.3V20h8V8.7L18 10l2-3-4-3-2 2h-4L8 4Z" /></svg>
);
export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 0 1 15.3-6.3L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.3L3 16M3 21v-5h5" /></svg>
);
