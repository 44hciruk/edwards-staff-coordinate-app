import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB module
vi.mock("./db", () => ({
  createPost: vi.fn().mockResolvedValue(1),
  addPhotosToPost: vi.fn().mockResolvedValue(undefined),
  getAllPosts: vi.fn().mockResolvedValue([
    {
      id: 1,
      staffName: "山田花子",
      storeName: "EDWARD'S 新宿高島屋店",
      age: 28,
      height: 165,
      weight: 52,
      outfitDescription: "ホワイトブラウス + ネイビースカート",
      comment: "上品さを意識しました",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getPostById: vi.fn().mockResolvedValue({
    id: 1,
    staffName: "山田花子",
    storeName: "EDWARD'S 新宿高島屋店",
    age: 28,
    height: 165,
    weight: 52,
    outfitDescription: "ホワイトブラウス + ネイビースカート",
    comment: "上品さを意識しました",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getPhotosByPostId: vi.fn().mockResolvedValue([]),
  getPhotosForPosts: vi.fn().mockResolvedValue([]),
  deletePost: vi.fn().mockResolvedValue(undefined),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("posts.create（ログイン不要）", () => {
  it("スタッフが投稿を作成できる", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.posts.create({
      staffName: "山田花子",
      storeName: "EDWARD'S 新宿高島屋店",
      age: 28,
      height: 165,
      weight: 52,
      outfitDescription: "ホワイトブラウス + ネイビースカート",
      comment: "上品さを意識しました",
      photoKeys: [],
    });
    expect(result).toEqual({ postId: 1 });
  });

  it("必須フィールドが欠けている場合はエラーになる", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.posts.create({
        staffName: "",
        storeName: "EDWARD'S 新宿高島屋店",
        outfitDescription: "テスト",
        photoKeys: [],
      })
    ).rejects.toThrow();
  });

  it("写真なしでも投稿できる", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.posts.create({
      staffName: "田中太郎",
      storeName: "EDWARD'S 本社",
      outfitDescription: "スーツスタイル",
      photoKeys: [],
    });
    expect(result).toEqual({ postId: 1 });
  });
});

describe("posts.list（管理者専用）", () => {
  it("管理者は投稿一覧を取得できる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("一般ユーザーはアクセスできない", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.posts.list()).rejects.toThrow("管理者権限が必要です");
  });

  it("未認証ユーザーはアクセスできない", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.posts.list()).rejects.toThrow();
  });
});

describe("posts.exportCsv（管理者専用）", () => {
  it("管理者はCSVエクスポート用データを取得できる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.exportCsv();
    expect(Array.isArray(result)).toBe(true);
  });

  it("一般ユーザーはCSVエクスポートできない", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.posts.exportCsv()).rejects.toThrow("管理者権限が必要です");
  });
});

describe("posts.delete（管理者専用）", () => {
  it("管理者は投稿を削除できる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("一般ユーザーは削除できない", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.posts.delete({ id: 1 })).rejects.toThrow("管理者権限が必要です");
  });
});
