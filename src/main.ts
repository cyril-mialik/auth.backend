import express from "express";
import authRoutes from "./routes/auth.route.js";
import { config } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
