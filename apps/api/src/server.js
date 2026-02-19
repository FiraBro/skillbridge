import { app } from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 6000;

// Use global variable to prevent multiple listen() on hot reload
if (!global.__server__) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API running on http://0.0.0.0:${PORT}`);
    if (env.GITHUB_CALLBACK_URL) {
      console.log(
        `   GitHub callback URL (must match OAuth App): ${env.GITHUB_CALLBACK_URL}`,
      );
    }
  });

  global.__server__ = server;

  // Graceful shutdown for nodemon, ctrl+c, docker
  const shutdown = (signal) => {
    console.log(`🛑 ${signal} received. Closing server...`);
    server.close(() => {
      console.log("✅ Server closed cleanly");
      process.exit(0);
    });
  };

  process.on("SIGUSR2", () => shutdown("SIGUSR2")); // nodemon restart
  process.on("SIGINT", () => shutdown("SIGINT")); // ctrl+c
  process.on("SIGTERM", () => shutdown("SIGTERM")); // docker / kill
}
