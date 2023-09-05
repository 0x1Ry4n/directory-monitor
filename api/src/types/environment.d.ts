export {};

declare global {
  namespace Env {
    interface ProcessEnv {
      MONGO_URI: string;
      PORT?: number;
      ENV: "test" | "dev" | "prod";
    }
  }
}
