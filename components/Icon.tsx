import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Icon — the Streamline Core set supplied for Process and Services.
 * Source: `Supplied Files/Icons/` (added 12 Aug).
 *
 * Inlined rather than served as files so the colour is tokenisable. Every
 * hard-coded stroke is converted to `currentColor` — the supplied files ship two
 * different colours baked in (#E3EDE9 on the Process set, #9CB0A8 on Services),
 * which would have made them impossible to reuse across surfaces.
 *
 * Internal ids are namespaced per icon (`clip0_x` -> `build-clip0_x`). Streamline
 * exports reuse the same ids across files, so two icons on one page would
 * otherwise clash and clip each other.
 *
 * Sizing is by CSS (`h-icon w-icon`), colour by `text-*`. The two families keep
 * their own stroke weights — Process is drawn heavier relative to its box because
 * it renders large inside the 120px circle.
 */

export type IconName =
  | "discovery" | "design" | "build" | "launch"
  | "web" | "apps" | "ecommerce" | "seo" | "brand" | "support";

const ICONS: Record<IconName, { viewBox: string; label: string; paths: ReactNode }> = {
  discovery: {
    viewBox: "0 0 48 48",
    label: "Discovery",
    paths: (
      <>
      <path d="M18.8584 30.8569H1.71556V41.1426C1.71556 42.052 2.07678 42.924 2.71977 43.567C3.36275 44.21 4.23482 44.5712 5.14413 44.5712H15.4298C16.3392 44.5712 17.2112 44.21 17.8542 43.567C18.4972 42.924 18.8584 42.052 18.8584 41.1426V30.8569Z" stroke="currentColor" strokeWidth="3.42857" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M46.2867 30.8569H29.1438V41.1426C29.1438 42.052 29.5051 42.924 30.148 43.567C30.791 44.21 31.6631 44.5712 32.5724 44.5712H42.8581C43.7674 44.5712 44.6395 44.21 45.2825 43.567C45.9255 42.924 46.2867 42.052 46.2867 41.1426V30.8569Z" stroke="currentColor" strokeWidth="3.42857" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.8569 30.8569H29.1426" stroke="currentColor" strokeWidth="3.42857" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M46.2861 30.8573V10.2859C46.2861 8.46723 45.5636 6.72309 44.2777 5.43712C42.9917 4.15116 41.2476 3.42871 39.4289 3.42871H36.0004" stroke="currentColor" strokeWidth="3.42857" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.71556 30.8573V10.2859C1.71556 8.46723 2.43801 6.72309 3.72397 5.43712C5.00994 4.15116 6.75408 3.42871 8.5727 3.42871H12.0013" stroke="currentColor" strokeWidth="3.42857" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
  design: {
    viewBox: "0 0 46 46",
    label: "Design",
    paths: (
      <>
      <g clipPath="url(#design-clip0_36_308)">
      <path d="M18.0717 41.0717C18.9797 40.2348 19.7044 39.2187 20.2001 38.0877C20.6958 36.9566 20.9517 35.7352 20.9517 34.5003C20.9517 33.2654 20.6958 32.0439 20.2001 30.9129C19.7044 29.7818 18.9797 28.7658 18.0717 27.9288C17.2348 27.0208 16.2187 26.2961 15.0877 25.8004C13.9566 25.3047 12.7352 25.0488 11.5003 25.0488C10.2654 25.0488 9.04389 25.3047 7.91286 25.8004C6.78182 26.2961 5.76579 27.0208 4.92884 27.9288C1.64313 31.2146 1.64313 44.3574 1.64313 44.3574C1.64313 44.3574 14.786 44.3574 18.0717 41.0717Z" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42.4486 3.54937C41.3104 2.42564 39.8014 1.75562 38.2045 1.66489C36.6077 1.57415 35.0325 2.06894 33.7743 3.05651L14.7829 16.4294L12.45 25.1037C14.5911 25.3749 16.5743 26.3723 18.0686 27.9294C19.6257 29.4237 20.6231 31.4069 20.8943 33.5479L29.5686 31.2151L42.9415 12.2237C43.929 10.9655 44.4238 9.39032 44.3331 7.79344C44.2424 6.19655 43.5723 4.68758 42.4486 3.54937V3.54937Z" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.64313 44.3573L12.3217 33.6787" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="design-clip0_36_308">
      <rect width="46" height="46" fill="white"/>
      </clipPath>
      </defs>
      </>
    ),
  },
  build: {
    viewBox: "0 0 46 46",
    label: "Build",
    paths: (
      <>
      <g clipPath="url(#build-clip0_36_318)">
      <path d="M20.9591 2.5936L12.4556 11.0971C11.1725 12.3802 11.1725 14.4606 12.4556 15.7438L30.2525 33.5406C31.5356 34.8238 33.616 34.8238 34.8992 33.5406L43.4026 25.0372C44.6858 23.754 44.6858 21.6736 43.4026 20.3905L25.6058 2.5936C24.3226 1.31044 22.2422 1.31044 20.9591 2.5936Z" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.99014 36.4389C2.11871 37.3103 1.62915 38.4922 1.62915 39.7246C1.62915 40.9569 2.11871 42.1389 2.99014 43.0103C3.86156 43.8817 5.04347 44.3713 6.27585 44.3713C7.50823 44.3713 8.69014 43.8817 9.56157 43.0103L24.643 27.9289L18.0716 21.3574L2.99014 36.4389Z" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="build-clip0_36_318">
      <rect width="46" height="46" fill="white"/>
      </clipPath>
      </defs>
      </>
    ),
  },
  launch: {
    viewBox: "0 0 46 46",
    label: "Launch",
    paths: (
      <>
      <g clipPath="url(#launch-clip0_36_327)">
      <path d="M11.1355 34.8614H6.37117C5.18016 34.7623 4.06991 34.2191 3.26065 33.3396C2.45138 32.4602 2.0022 31.3087 2.0022 30.1136C2.0022 28.9184 2.45138 27.7669 3.26065 26.8875C4.06991 26.008 5.18016 25.4649 6.37117 25.3657H13.9283L18.7912 20.5028L5.45117 12.2886C4.42418 11.6537 3.67654 10.6526 3.35938 9.48762C3.04221 8.32265 3.17918 7.0807 3.7426 6.01285C3.99132 5.40172 4.36261 4.84802 4.83357 4.38592C5.30453 3.92382 5.86518 3.56312 6.48092 3.32605C7.09667 3.08899 7.75446 2.9806 8.41371 3.00757C9.07296 3.03453 9.7197 3.19629 10.314 3.48285L27.7283 11.5328L36.1397 3.02285C37.046 2.11657 38.2752 1.60742 39.5569 1.60742C40.8386 1.60742 42.0677 2.11657 42.974 3.02285C43.8803 3.92913 44.3895 5.15831 44.3895 6.43999C44.3895 7.72167 43.8803 8.95085 42.974 9.85713L34.464 18.2686L42.514 35.8471C42.7788 36.4325 42.9234 37.0651 42.939 37.7074C42.9547 38.3497 42.8412 38.9886 42.6052 39.5862C42.3692 40.1838 42.0156 40.7279 41.5653 41.1862C41.1151 41.6445 40.5773 42.0077 39.984 42.2543C38.9162 42.8177 37.6742 42.9547 36.5093 42.6375C35.3443 42.3203 34.3432 41.5727 33.7083 40.5457L25.494 27.2057L20.6312 32.0686V39.6257C20.532 40.8167 19.9888 41.927 19.1094 42.7362C18.2299 43.5455 17.0784 43.9947 15.8833 43.9947C14.6882 43.9947 13.5367 43.5455 12.6572 42.7362C11.7778 41.927 11.2346 40.8167 11.1355 39.6257V34.8614Z" stroke="currentColor" strokeWidth="3.28571" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="launch-clip0_36_327">
      <rect width="46" height="46" fill="white"/>
      </clipPath>
      </defs>
      </>
    ),
  },
  web: {
    viewBox: "0 0 100 100",
    label: "Web Design & Development",
    paths: (
      <>
      <g clipPath="url(#web-clip0_67_1764)">
      <path d="M43.7853 86.1434C32.8568 97.1434 14.2853 100.786 3.57104 89.7863C17.8568 75.0006 3.57104 67.8577 14.2853 57.1434C16.1667 55.0478 18.4556 53.3577 21.0122 52.1766C23.5688 50.9955 26.3394 50.3481 29.1546 50.274C31.9699 50.1999 34.7707 50.7007 37.3859 51.7457C40.0011 52.7907 42.3757 54.358 44.3647 56.3518C46.3536 58.3456 47.9151 60.7241 48.9538 63.3418C49.9924 65.9595 50.4863 68.7616 50.4053 71.5767C50.3244 74.3917 49.6702 77.1608 48.4829 79.7145C47.2955 82.2682 45.5999 84.5529 43.4996 86.4292L43.7853 86.1434Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M93.2792 6.71444C91.8939 5.338 90.241 4.2602 88.4228 3.54764C86.6045 2.83509 84.6595 2.50289 82.7078 2.57159C80.7574 2.6246 78.8386 3.07658 77.0695 3.89967C75.3005 4.72275 73.7189 5.89948 72.4221 7.3573L33.9935 50.2144C38.1144 51.0304 41.8818 53.1013 44.7792 56.143C47.3852 58.7384 49.2793 61.9608 50.2792 65.5002L92.6364 27.5716C94.0856 26.283 95.2573 24.7128 96.0801 22.9568C96.9028 21.2007 97.3594 19.2955 97.4221 17.3573C97.5007 15.3938 97.1733 13.4351 96.4605 11.6039C95.7477 9.7726 94.6647 8.1081 93.2792 6.71444V6.71444Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="web-clip0_67_1764">
      <rect width="100" height="100" fill="white"/>
      </clipPath>
      </defs>
      </>
    ),
  },
  apps: {
    viewBox: "0 0 100 100",
    label: "Apps & Dashboards",
    paths: (
      <>
      <path d="M78.5714 3.57129H21.4285C17.4836 3.57129 14.2856 6.76925 14.2856 10.7141V89.2856C14.2856 93.2305 17.4836 96.4284 21.4285 96.4284H78.5714C82.5163 96.4284 85.7142 93.2305 85.7142 89.2856V10.7141C85.7142 6.76925 82.5163 3.57129 78.5714 3.57129Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44.6428 78.5713H55.3571" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
  ecommerce: {
    viewBox: "0 0 100 100",
    label: "E-Commerce Builds",
    paths: (
      <>
      <path d="M95.4284 47.2856C95.5504 46.2886 95.4608 45.2771 95.1654 44.3171C94.8701 43.3571 94.3755 42.4701 93.7141 41.7142C93.0447 40.9523 92.2208 40.3417 91.2971 39.9229C90.3734 39.5042 89.3711 39.2869 88.3569 39.2856H11.6427C10.6285 39.2869 9.62621 39.5042 8.70251 39.9229C7.77882 40.3417 6.95488 40.9523 6.28552 41.7142C5.62411 42.4701 5.12957 43.3571 4.83418 44.3171C4.53878 45.2771 4.44919 46.2886 4.57124 47.2856L9.92838 90.1428C10.1389 91.885 10.9835 93.4887 12.3009 94.6481C13.6183 95.8074 15.3164 96.4412 17.0712 96.4285H83.0712C84.8261 96.4412 86.5242 95.8074 87.8416 94.6481C89.159 93.4887 90.0036 91.885 90.2141 90.1428L95.4284 47.2856Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.8572 39.2856V35.7141C17.8572 27.1893 21.2436 19.0137 27.2716 12.9857C33.2996 6.95776 41.4752 3.57129 50 3.57129C58.5249 3.57129 66.7005 6.95776 72.7285 12.9857C78.7564 19.0137 82.1429 27.1893 82.1429 35.7141V39.2856" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35.7144 60.7144V75.0001" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M64.2856 60.7144V75.0001" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
  seo: {
    viewBox: "0 0 100 100",
    label: "SEO & Analytics",
    paths: (
      <>
      <path d="M3.57153 96.4287H96.4287" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32.143 96.4284V3.57129H3.57153V96.4284" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60.7143 96.4287V46.4287H32.1428V96.4287" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M89.2858 96.4286V25H60.7144V96.4286" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
  brand: {
    viewBox: "0 0 100 100",
    label: "Brand Identity",
    paths: (
      <>
      <path d="M35.7143 35.7141C44.5903 35.7141 51.7857 28.5187 51.7857 19.6427C51.7857 10.7667 44.5903 3.57129 35.7143 3.57129C26.8382 3.57129 19.6428 10.7667 19.6428 19.6427C19.6428 28.5187 26.8382 35.7141 35.7143 35.7141Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.0001 89.286H3.57153V78.5717C3.62839 73.1274 5.06423 67.7863 7.74491 63.0473C10.4256 58.3083 14.2637 54.3261 18.9006 51.4726C23.5376 48.6191 28.8222 46.9874 34.2607 46.7299C39.6992 46.4724 45.1143 47.5976 50.0001 50.0003" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M96.4279 60.7156L62.7851 94.3585L47.5708 96.4299L49.7137 81.2156L83.2851 47.5728L96.4279 60.7156Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
  support: {
    viewBox: "0 0 100 100",
    label: "Retainer & Support",
    paths: (
      <>
      <path d="M95.9279 25.6463C95.7898 24.8978 95.4959 24.1867 95.0652 23.5591C94.6345 22.9315 94.0767 22.4015 93.4278 22.0035L79.1421 36.2892C78.4758 36.9805 77.677 37.5304 76.7933 37.906C75.9097 38.2815 74.9594 38.4751 73.9993 38.4751C73.0391 38.4751 72.0888 38.2815 71.2052 37.906C70.3216 37.5304 69.5227 36.9805 68.8564 36.2892L63.4278 31.4321C62.1191 30.0969 61.386 28.3017 61.386 26.4321C61.386 24.5624 62.1191 22.7673 63.4278 21.4321L77.7136 7.14635C77.402 6.41447 76.9334 5.76 76.3409 5.22924C75.7485 4.69849 75.0466 4.30442 74.285 4.07492C69.3005 3.08092 64.1371 3.5064 59.3826 5.30294C54.6281 7.09947 50.4735 10.1949 47.3919 14.2367C44.3102 18.2786 42.4254 23.1045 41.9519 28.165C41.4784 33.2255 42.4352 38.3173 44.7136 42.8606L5.71356 81.5035C5.03324 82.1687 4.49267 82.9632 4.12362 83.8402C3.75456 84.7172 3.56445 85.6591 3.56445 86.6106C3.56445 87.5621 3.75456 88.5041 4.12362 89.3811C4.49267 90.2581 5.03324 91.0526 5.71356 91.7178L8.28499 94.2892C8.95022 94.9695 9.74466 95.5101 10.6217 95.8792C11.4987 96.2482 12.4406 96.4383 13.3921 96.4383C14.3436 96.4383 15.2856 96.2482 16.1626 95.8792C17.0396 95.5101 17.8341 94.9695 18.4993 94.2892L57.4993 55.3606C62.0439 57.5258 67.1 58.3881 72.1053 57.8515C77.1107 57.3149 81.8691 55.4005 85.8515 52.3212C89.8338 49.2419 92.8841 45.1184 94.663 40.4092C96.4419 35.6999 96.8797 30.5896 95.9279 25.6463V25.6463Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  },
};

export interface IconProps {
  name: IconName;
  /** Give the icon an accessible name. Omit when it is purely decorative. */
  titled?: boolean;
  className?: string;
  /**
   * ⚠️ For ONE caller: the Services reel sizes its glyphs in `em` against the
   * column's `text-numeral`, so a single value governs the icon and the spacing
   * around it. Everything else sizes with `w-`/`h-` tokens and should keep doing so —
   * this is not a general escape hatch for arbitrary sizes (CLAUDE.md §1).
   */
  style?: CSSProperties;
}

export function Icon({ name, titled = false, className, style }: IconProps) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={titled ? "img" : undefined}
      aria-hidden={titled ? undefined : true}
      aria-label={titled ? icon.label : undefined}
      className={cn("h-icon w-icon", className)}
      style={style}
    >
      {icon.paths}
    </svg>
  );
}

/** Which icon belongs to which slot — matched 1:1 against the Figma frames. */
export const PROCESS_ICONS: IconName[] = ["discovery", "design", "build", "launch"];
export const SERVICE_ICONS: IconName[] = ["web", "apps", "ecommerce", "seo", "brand", "support"];
