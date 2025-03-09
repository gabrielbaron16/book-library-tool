"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_openapi_validator_1 = require("express-openapi-validator");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync("./controllers/swagger.yaml", "utf8"));
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use((0, express_openapi_validator_1.middleware)({
    apiSpec: "./controllers/swagger.yaml",
    validateRequests: true,
    validateResponses: true,
}));
app.get("/", (req, res) => {
    res.send("¡Hi Express With Typescript!");
});
// Error-handling middleware
const errorHandler = (err, req, res, next) => {
    if (err.status === 400) {
        res.status(400).json({ message: err.message, errors: err.errors });
        return;
    }
    next(err);
};
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
