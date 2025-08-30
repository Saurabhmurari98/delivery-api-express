import { Router } from "express";
import { decide } from "../services/decide.service.js";

const router = Router();


router.post("/", (req, res) => {
  try {
    const result = decide(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
