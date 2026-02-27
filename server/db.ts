import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CoordinatePost,
  InsertCoordinatePost,
  InsertPostPhoto,
  InsertUser,
  PostPhoto,
  coordinatePosts,
  postPhotos,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ---- User helpers ----

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- CoordinatePost helpers ----

export async function createPost(data: InsertCoordinatePost): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coordinatePosts).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getAllPosts(status?: CoordinatePost["status"]) {
  const db = await getDb();
  if (!db) return [];
  const query = db
    .select()
    .from(coordinatePosts)
    .orderBy(desc(coordinatePosts.createdAt));
  if (status) {
    return query.where(eq(coordinatePosts.status, status));
  }
  return query;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coordinatePosts).where(eq(coordinatePosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePostStatus(
  id: number,
  status: CoordinatePost["status"],
  adminNote?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(coordinatePosts)
    .set({ status, adminNote: adminNote ?? null })
    .where(eq(coordinatePosts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(postPhotos).where(eq(postPhotos.postId, id));
  await db.delete(coordinatePosts).where(eq(coordinatePosts.id, id));
}

// ---- PostPhoto helpers ----

export async function addPhotosToPost(photos: InsertPostPhoto[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (photos.length === 0) return;
  await db.insert(postPhotos).values(photos);
}

export async function getPhotosByPostId(postId: number): Promise<PostPhoto[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postPhotos)
    .where(eq(postPhotos.postId, postId))
    .orderBy(postPhotos.sortOrder);
}

export async function getPhotosForPosts(postIds: number[]): Promise<PostPhoto[]> {
  if (postIds.length === 0) return [];
  const db = await getDb();
  if (!db) return [];
  // fetch all photos for given post IDs
  const results: PostPhoto[] = [];
  for (const id of postIds) {
    const photos = await db
      .select()
      .from(postPhotos)
      .where(eq(postPhotos.postId, id))
      .orderBy(postPhotos.sortOrder);
    results.push(...photos);
  }
  return results;
}
