declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string;
    JWT_SECRET: string;
    GOOGLE_MAP_API_KEY: string;
    SESSION_PASSWORD: string;
    GOOGLE_OPENID_CLIENT_ID: string;
    GOOGLE_OPENID_CLIENT_SECRET: string;
    GOOGLE_OPENID_REDIRECT_URI: string;
    BASE_URL: string;
    // Add other environment variables here
  }
}
