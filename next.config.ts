import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Wildcarded rather than pinned to one project ref, since the actual
    // host comes from NEXT_PUBLIC_SUPABASE_URL (private body/meal-photos
    // signed URLs and public avatars both live under *.supabase.co).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/**" }],
  },
};

export default nextConfig;
