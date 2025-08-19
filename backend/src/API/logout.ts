import { Request, Response, Router } from "express";

const router = Router();

router.post("/logout", (req: Request, res: Response) => {
    const token = req.cookies?.token;
    //console.log("Logging out user with token:", token);
    //console.log("IP Address:", req.ip);

    res.clearCookie("token", {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
    });
    res.status(200).json({ message: "Logged out successfully" });
});

export default router;