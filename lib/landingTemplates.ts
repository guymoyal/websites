/** Shared props for lightweight partner / offer landing templates (static export–friendly). */
export type LandingFocusProps = {
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaLabel: string;
  /** Short line under CTA, e.g. affiliate disclosure */
  disclosure?: string;
  /** Optional badge above title */
  kicker?: string;
};

export type LandingSplitProps = LandingFocusProps & {
  imageSrc: string;
  imageAlt: string;
  /** When true, hero image uses fetchPriority high (LCP). */
  imagePriority?: boolean;
};
