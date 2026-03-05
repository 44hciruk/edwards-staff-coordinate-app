import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// スタッフコーディネート投稿テーブル
export const coordinatePosts = pgTable("coordinate_posts", {
  id: serial("id").primaryKey(),
  staffName: varchar("staffName", { length: 100 }).notNull(),
  storeName: varchar("storeName", { length: 100 }).notNull(),
  age: integer("age"),
  height: integer("height"), // cm
  weight: integer("weight"), // kg
  outfitDescription: text("outfitDescription").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CoordinatePost = typeof coordinatePosts.$inferSelect;
export type InsertCoordinatePost = typeof coordinatePosts.$inferInsert;

// 投稿写真テーブル
export const postPhotos = pgTable("post_photos", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostPhoto = typeof postPhotos.$inferSelect;
export type InsertPostPhoto = typeof postPhotos.$inferInsert;
