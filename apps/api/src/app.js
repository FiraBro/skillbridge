import express from "express";
import routes from "./routes.js";
import helmet from "helmet";
import globalErrorHandler from "./modules/middlewares/error.middleware.js";
export const app = express();
app.use(helmet());
app.use(express.json());
app.use(routes);
app.use(globalErrorHandler);
