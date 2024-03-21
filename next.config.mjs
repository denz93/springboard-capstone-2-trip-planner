/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DB_URL: process.env.DB_URL || "postgres:///db_trip_planner",
  }
};

export default nextConfig;
