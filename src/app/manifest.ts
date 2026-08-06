import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "쉐잎미 ShapeMe",
    short_name: "쉐잎미",
    description: "운동, 식단, 물 섭취와 몸의 변화를 한곳에 기록하는 셀프케어 웹앱",
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
