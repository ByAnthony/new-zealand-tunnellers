import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "New Zealand Tunnellers",
    short_name: "NZ Tunnellers",
    start_url: "/",
    display: "standalone",
    background_color: "#181a1b",
    theme_color: "#181a1b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
