import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SILUA",
    short_name: "SILUA",
    description: "Your body, taking shape.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4ebdd",
    theme_color: "#f4ebdd",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
