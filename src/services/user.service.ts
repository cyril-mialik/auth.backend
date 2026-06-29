import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "../config/redis.js";
import {
  USERS_SET,
  USER_EMAIL_INDEX,
  USER_PREFIX,
} from "../constants/user.constants.js";
import type { User, UserWithoutPassword } from "../types/user.type.js";

export const createUser = async (
  email: string,
  password: string,
): Promise<UserWithoutPassword> => {
  const redis = await getRedisClient();

  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date();

  const user: User = {
    id,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(`${USER_PREFIX}${id}`, JSON.stringify(user));
  await redis.set(`${USER_EMAIL_INDEX}${email.toLowerCase()}`, id);
  await redis.sAdd(USERS_SET, id);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const findById = async (id: string): Promise<User | null> => {
  const redis = await getRedisClient();
  const data = await redis.get(`${USER_PREFIX}${id}`);

  if (!data) return null;

  const user = JSON.parse(data) as User;
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
};

export const findByEmail = async (email: string): Promise<User | null> => {
  const redis = await getRedisClient();
  const normalizedEmail = email.toLowerCase().trim();

  const userId = await redis.get(`${USER_EMAIL_INDEX}${normalizedEmail}`);
  if (!userId) return null;

  return findById(userId);
};

export const findUserByEmailWithPassword = async (
  email: string,
): Promise<User | null> => {
  return findByEmail(email);
};

export const updateUser = async (
  id: string,
  data: Partial<Omit<User, "id" | "createdAt">>,
): Promise<UserWithoutPassword | null> => {
  const redis = await getRedisClient();

  const user = await findById(id);
  if (!user) return null;

  const updatedUser: User = {
    ...user,
    ...data,
    updatedAt: new Date(),
  };

  if (data.email && data.email !== user.email) {
    const oldEmail = user.email;
    const newEmail = data.email.toLowerCase().trim();

    await redis.del(`${USER_EMAIL_INDEX}${oldEmail}`);
    await redis.set(`${USER_EMAIL_INDEX}${newEmail}`, id);
  }

  await redis.set(`${USER_PREFIX}${id}`, JSON.stringify(updatedUser));

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const redis = await getRedisClient();

  const user = await findById(id);
  if (!user) return false;

  await redis.del(`${USER_PREFIX}${id}`);
  await redis.del(`${USER_EMAIL_INDEX}${user.email}`);
  await redis.sRem(USERS_SET, id);

  return true;
};

export const getAllUsers = async (): Promise<UserWithoutPassword[]> => {
  const redis = await getRedisClient();

  const userIds = await redis.sMembers(USERS_SET);
  const users: UserWithoutPassword[] = [];

  for (const id of userIds) {
    const user = await findById(id);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      users.push(userWithoutPassword);
    }
  }

  return users;
};

export const validatePassword = async (
  user: User,
  plainPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, user.password);
};

export const cacheUser = async (user: User): Promise<void> => {
  const redis = await getRedisClient();
  await redis.setEx(
    `${USER_PREFIX}${user.id}:cache`,
    300,
    JSON.stringify(user),
  );
};

export const getCachedUser = async (id: string): Promise<User | null> => {
  const redis = await getRedisClient();
  const data = await redis.get(`${USER_PREFIX}${id}:cache`);
  if (!data) return null;
  return JSON.parse(data) as User;
};
