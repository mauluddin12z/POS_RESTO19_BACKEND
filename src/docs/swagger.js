import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const swaggerDocument = YAML.load(
    path.resolve("src/docs/swagger.yaml")
);

export const swaggerDocs = (app) => {
    app.use(
        "/api/v1/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        })
    );
};