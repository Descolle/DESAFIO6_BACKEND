import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import cors from "cors";
import route from "./Routes/SoftJobsRoutes.js";

const app = express();

// Inicializa el servidor
app.listen(3000, () => {
  console.log("Server online");
});

app.use(cors());
app.use(express.json());

app.use(route);
