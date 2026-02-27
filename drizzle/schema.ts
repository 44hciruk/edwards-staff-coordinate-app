import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// スタッフコーディネート投稿テーブル
export const coordinatePosts = mysqlTable("coordinate_posts", {
  id: int("id").autoincrement().primaryKey(),
  staffName: varchar("staffName", { length: 100 }).notNull(),
  storeName: varchar("storeName", { length: 100 }).notNull(),
  age: int("age"),
  height: int("height"), // cm
  weight: int("weight"), // kg
  outfitDescription: text("outfitDescription").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoordinatePost = typeof coordinatePosts.$inferSelect;
export type InsertCoordinatePost = typeof coordinatePosts.$inferInsert;

// 投稿写真テーブル
export const postPhotos = mysqlTable("post_photos", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostPhoto = typeof postPhotos.$inferSelect;
export type InsertPostPhoto = typeof postPhotos.$inferInsert;
