import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  /* other options */
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(config as any);
