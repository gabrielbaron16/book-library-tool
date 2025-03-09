"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./config/container");
const express_1 = __importDefault(require("express"));
const express_openapi_validator_1 = require("express-openapi-validator");
const database_1 = require("./config/database");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./config/routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync("./swagger.yaml", "utf8"));
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use((0, express_openapi_validator_1.middleware)({
    apiSpec: "./swagger.yaml",
    validateRequests: true,
    validateResponses: true,
}));
app.use(routes_1.default);
const errorHandler = (err, req, res, next) => {
    if (err.status === 400) {
        res.status(400).json({ message: err.message, errors: err.errors });
        return;
    }
    next(err);
};
app.use(errorHandler);
(0, database_1.connectDB)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("ailed to start server due to DB error:", err);
});
