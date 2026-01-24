import express from "express";
import routes from "./routes.js";
import globalErrorHandler from "./modules/middlewares/error.middleware.js";
export const app = express();

app.use(express.json());
app.use(routes);
app.use(globalErrorHandler);
