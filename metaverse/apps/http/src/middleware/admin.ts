import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../config"
import { NextFunction, Request, Response } from "express"

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = res.header["authorizaton"]
  const token = header?.split(" ")[1]

  if (!token) {
    res.json({ message: "Unauthorizeed" })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as { role: string, userId: string }
    if (decoded.role != "Admin") {
      res.status(401).json({ message: "Unauthorizeed" })
      return
    }

    req.userId = decoded.userId;
    next()
  } catch (e) {
    res.status(401).json({ message: "Unauthorizeed" })
    return
  }
}
