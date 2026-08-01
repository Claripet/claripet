import type { MetadataRoute } from "next";

/**
 * Web app manifest. `name` and `short_name` must stay identical to the
 * `applicationName` in app/layout.tsx and the App name in the Google Cloud
 * console — the OAuth brand review compares them.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClariPet",
    short_name: "ClariPet",
    description:
      "Toko online produk perawatan hewan peliharaan premium untuk anjing & kucing — parfum, shampoo, perawatan kulit & bulu, dan penghilang bau.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "id",
    icons: [
      { src: "/images/brand/favicon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
