declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string;
    JWT_SECRET: string;
    // Add other environment variables here
  }
}