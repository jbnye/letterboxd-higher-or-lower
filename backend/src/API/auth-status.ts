import express from "express";
import { verifyJWT, AuthenticatedRequest } from "../verifyJWT";

const router = express.Router();

router.get("/auth-status", verifyJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: req.user });
});


export default router;