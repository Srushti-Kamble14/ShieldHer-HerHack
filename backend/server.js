import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import riskAssessmentRoutes from "./routes/riskAssessmentRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shield-her-x2gl.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/sos", sosRoutes); 
app.use("/api/risk-assessment", riskAssessmentRoutes);


const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
        console.error(' Error connecting to MongoDB', err);
    });

app.get('/', (req, res) => {
    res.send('Hello World');
}
);

// console.log(process.env.JWT_SECRET);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
