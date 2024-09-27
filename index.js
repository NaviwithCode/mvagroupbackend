import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors"
import categoryRoute from './routes/categoryRoute.js'

//configure env
dotenv.config();
// rest object
const app = express();

// databse config
connectDB();

// middelwares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors())

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category",categoryRoute)

// rest api
app.get("/", (req, res) => {
  res.send({
    message: "welcome to mva group",
  });
});
// port
const PORT = process.env.PORT || 8000;

// run listen
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
