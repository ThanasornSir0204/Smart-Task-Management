import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily Task Log",
    short_name: "TaskLog",
    description: "Daily task management with Firebase",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0284c7",
    lang: "th",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
