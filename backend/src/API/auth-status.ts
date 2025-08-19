import express from "express";
import { verifyJWT, AuthenticatedRequest } from "../Middleware/verifyJWT";

const router = express.Router();

router.get("/auth-status", verifyJWT, (req: AuthenticatedRequest, res) => {
    if (!req.user){ 
        return res.status(401).json({ error: "Unauthorized: No valid token or cookie." });
    }
    //console.log("auth-status logging user from request:", req.user);
    res.json({ user: req.user });
});


export default router;