import express from "express";
import { router as v1 } from "./routes/v1";

const app = express();

app.use("/api/v1", v1);

app.listen(process.env.PORT || 3000);
