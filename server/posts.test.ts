import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB module
vi.mock("./db", () => ({
  createPost: vi.fn().mockResolvedValue(1),
  addPhotosToPost: vi.fn().mockResolvedValue(undefined),
  getAllPosts: vi.fn().mockResolvedValue([]),
  getPostById: vi.fn().mockResolvedValue({
    id: 1,
    staffName: "山田花子",
    storeName: "東京伊勢丹新宿店",
    age: 28,
    height: 165,
    weight: 52,
    outfitDescription: "ホワイトブラウス + ネイビースカート",
    comment: "上品さを意識しました",
    status: "pending",
    adminNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getPhotosByPostId: vi.fn().mockResolvedValue([]),
  getPhotosForPosts: vi.fn().mockResolvedValue([]),
  updatePostStatus: vi.fn().mockResolvedValue(undefined),
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

describe("posts.create", () => {
  it("スタッフが投稿を作成できる", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.posts.create({
      staffName: "山田花子",
      storeName: "東京伊勢丹新宿店",
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
        storeName: "東京伊勢丹新宿店",
        outfitDescription: "テスト",
        photoKeys: [],
      })
    ).rejects.toThrow();
  });
});

describe("posts.list (admin only)", () => {
  it("管理者は投稿一覧を取得できる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.list({ status: "all" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("一般ユーザーはアクセスできない", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.posts.list({ status: "all" })).rejects.toThrow("管理者権限が必要です");
  });

  it("未認証ユーザーはアクセスできない", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.posts.list({ status: "all" })).rejects.toThrow();
  });
});

describe("posts.updateStatus (admin only)", () => {
  it("管理者は投稿を承認できる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.updateStatus({ id: 1, status: "approved" });
    expect(result).toEqual({ success: true });
  });

  it("管理者は投稿を非承認にできる", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.posts.updateStatus({
      id: 1,
      status: "rejected",
      adminNote: "写真の品質が基準を満たしていません",
    });
    expect(result).toEqual({ success: true });
  });

  it("一般ユーザーはステータス変更できない", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.posts.updateStatus({ id: 1, status: "approved" })
    ).rejects.toThrow("管理者権限が必要です");
  });
});

describe("posts.delete (admin only)", () => {
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
