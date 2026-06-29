import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import {
  createUser,
  findUserByEmailWithPassword,
  validatePassword,
} from "../services/user.service.js";

export const registration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await createUser(email, password);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmailWithPassword(email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValidPassword = await validatePassword(user, password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
