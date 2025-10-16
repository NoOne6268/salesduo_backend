import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (mobile clients, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // only if you use cookies/auth
}));
app.use("/api", routes);
// Generic health check
app.get("/health", (req, res) => res.json({ ok: true }));
app.use(errorHandler);
export default app;
