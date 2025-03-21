import "reflect-metadata";
import "./config/container";
import express, {Request, Response, NextFunction, ErrorRequestHandler} from "express";
import {middleware as OpenApiValidatorMiddleware} from "express-openapi-validator";
import {connectDB} from "./config/database";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import dotenv from "dotenv";
import router from "./config/routes";
import {ScheduledJobs} from "./presentation/jobs/ScheduledJob";
import logger from "./config/logger"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8")) as Record<string, any>;
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    OpenApiValidatorMiddleware({
        apiSpec: "./swagger.yaml",
        validateRequests: true,
        validateResponses: false,
    })
);

app.use(router);

const errorHandler: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err.status === 400) {
        res.status(400).json({message: err.message, errors: err.errors});
        return;
    }
    next(err);
};
app.use(errorHandler);

if (require.main === module) {
    connectDB().then(() => {
        ScheduledJobs.startJobs();
        app.listen(PORT, () => {
            logger.info("Application started successfully!");
        });
    }).catch((err) => {
        logger.error({err: err}, "failed to start server due to DB error:");
    });
}

export {app};