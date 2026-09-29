/** @type {import('next').NextStyleConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Added for your fallback avatars
      },
    ],
  },
};

export default nextConfig;
