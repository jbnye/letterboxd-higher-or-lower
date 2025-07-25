import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: {
      sub: string;
      email: string;
      name: string;
      picture: string;
    };
}

export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    console.log("req.cookie is: ",token)
    if (!token) {
      return res.status(401).json({ error: "Unauthorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedRequest["user"];
      req.user = decoded;
      //console.log(req.user);
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized, invalid token" });
    }
};