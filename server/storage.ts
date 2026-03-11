import { db } from "./db.js";
import { users, presets, savedResults } from "../shared/schema.js";
import type { User, InsertUser, Preset, InsertPreset, SavedResult, InsertSavedResult } from "../shared/schema.js";
import { eq, and } from "drizzle-orm";

export const storage = {
  async createUser(data: Omit<InsertUser, "id" | "createdAt">): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  },

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getPresets(userId: number): Promise<Preset[]> {
    return db.select().from(presets).where(eq(presets.userId, userId)).orderBy(presets.createdAt);
  },

  async createPreset(data: Omit<InsertPreset, "id" | "createdAt">): Promise<Preset> {
    const [preset] = await db.insert(presets).values(data).returning();
    return preset;
  },

  async deletePreset(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(presets).where(and(eq(presets.id, id), eq(presets.userId, userId))).returning();
    return result.length > 0;
  },

  async getSavedResults(userId: number): Promise<SavedResult[]> {
    return db.select().from(savedResults).where(eq(savedResults.userId, userId)).orderBy(savedResults.createdAt);
  },

  async createSavedResult(data: Omit<InsertSavedResult, "id" | "createdAt">): Promise<SavedResult> {
    const [result] = await db.insert(savedResults).values(data).returning();
    return result;
  },

  async deleteSavedResult(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(savedResults).where(and(eq(savedResults.id, id), eq(savedResults.userId, userId))).returning();
    return result.length > 0;
  },
};
