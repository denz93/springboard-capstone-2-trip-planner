declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string;
    JWT_SECRET: string;
    GOOGLE_MAP_API_KEY: string;
    SESSION_PASSWORD: string;
    // Add other environment variables here
  }
}