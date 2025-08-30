import express from "express";
import decideRoute from "./routes/decide.route.js";

const app = express();
app.use(express.json());

// health
app.get("/health", (_, res) => res.json({ ok: true }));

// endpoint
app.use("/v1/decide", decideRoute);

// not found
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
