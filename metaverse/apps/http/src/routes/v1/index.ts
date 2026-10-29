import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { signinSchema, signupSchema } from "../../types";
import jwt from "jsonwebtoken";
import { client } from "@repo/db/client";
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";

export const router = Router();

router.post("/signup", async (req, res) => {
  console.log("inside signup");
  // check the user
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log("parsed data incorrect");
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  try {
    const hashedPassword = await hash(parsedData.data.password);
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    console.error("Signup failed:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = signinSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    const isValid = await compare(parsedData.data.password, user.password);

    if (!isValid) {
      res.status(403).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_PASSWORD,
    );

    res.json({
      token,
    });
  } catch (e) {
    console.error("Signin failed:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/elements", (req, res) => {});

router.get("/avatars", (req, res) => {});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
