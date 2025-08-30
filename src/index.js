import express from "express";
import decideRoute from "./routes/decide.route.js";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/v1/decide", decideRoute);


app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
