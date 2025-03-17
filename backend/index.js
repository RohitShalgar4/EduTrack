import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import studentRoute from './routes/studentRoute.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import teacherRoute from './routes/teacherRoute.js';
import adminRoute from './routes/adminRoute.js';

dotenv.config({});

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/teacher", teacherRoute);
app.use("/api/v1/admin", adminRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening at port ${PORT}`);
    });
});
