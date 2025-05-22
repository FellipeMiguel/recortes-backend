import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";

interface User {
  id: string;
  email: string;
  password: string;
}
