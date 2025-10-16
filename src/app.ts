// src/app.js
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://salesduo-backend.onrender.com,https://salesduo-frontend.vercel.app";
const allowedOrigins = allowedOriginsEnv.split(",").map(s => s.trim()).filter(Boolean);

const allowCredentials = (process.env.CORS_ALLOW_CREDENTIALS || "false").toLowerCase() === "true";

function isAllowedOrigin(origin: string | undefined | null): boolean {
  if (!origin) return true; // server-side or non-browser calls
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true; // allow previews
  } catch (e) {
    // ignore parse errors
  }
  return false;
}

// debug logger
app.use((req, res, next) => {
  if (process.env.DEBUG_CORS === "true") {
    console.log("[CORS DEBUG] origin:", req.headers.origin, "method:", req.method, "path:", req.path);
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    // origin === undefined for server-side requests; allow those
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // do NOT throw here; fail gracefully
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: allowCredentials,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ensure OPTIONS returns correctly
app.options("*", (req, res) => res.sendStatus(204));

app.use("/api", routes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => res.send("OK"));

app.use(errorHandler);

export default app;
