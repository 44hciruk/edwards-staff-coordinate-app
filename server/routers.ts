import { TRPCError } from "@trpc/server";
import type { Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { verifyAdminCredentials, createAdminToken } from "./_core/adminAuth";
import {
  addPhotosToPost,
  createPost,
  deletePost,
  getAllPosts,
  getPhotosByPostId,
  getPhotosForPosts,
  getPostById,
} from "./db";
import { storageDelete } from "./storage";
import { z } from "zod";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      (ctx.res as Response).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const admin = await verifyAdminCredentials(input.email, input.password);
        if (!admin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "メールアドレスまたはパスワードが違います",
          });
        }
        const token = await createAdminToken(admin.email, admin.name);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as Response).cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
  }),

  // ---- 投稿関連 ----
  posts: router({
    // スタッフが投稿を作成（公開エンドポイント・ログイン不要）
    create: publicProcedure
      .input(
        z.object({
          staffName: z.string().min(1).max(100),
          storeName: z.string().min(1).max(100),
          age: z.number().int().min(15).max(80).optional(),
          height: z.number().int().min(100).max(250).optional(),
          weight: z.number().int().min(30).max(200).optional(),
          outfitDescription: z.string().min(1),
          comment: z.string().optional(),
          photoKeys: z.array(
            z.object({ url: z.string(), fileKey: z.string() })
          ).max(10),
        })
      )
      .mutation(async ({ input }) => {
        const postId = await createPost({
          staffName: input.staffName,
          storeName: input.storeName,
          age: input.age,
          height: input.height,
          weight: input.weight,
          outfitDescription: input.outfitDescription,
          comment: input.comment,
        });

        if (input.photoKeys.length > 0) {
          await addPhotosToPost(
            input.photoKeys.map((p, i) => ({
              postId,
              url: p.url,
              fileKey: p.fileKey,
              sortOrder: i,
            }))
          );
        }

        // オーナーに通知
        await notifyOwner({
          title: `新しいコーディネート投稿：${input.staffName}`,
          content: `${input.staffName}（${input.storeName}）から新しいコーディネート投稿がありました。`,
        }).catch(() => {});

        return { postId };
      }),

    // 管理者: 全投稿一覧
    list: adminProcedure
      .query(async () => {
        const posts = await getAllPosts();
        if (posts.length === 0) return [];
        const postIds = posts.map((p) => p.id);
        const photos = await getPhotosForPosts(postIds);
        return posts.map((post) => ({
          ...post,
          photos: photos.filter((ph) => ph.postId === post.id),
        }));
      }),

    // 管理者: 投稿詳細
    detail: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "投稿が見つかりません" });
        const photos = await getPhotosByPostId(input.id);
        return { ...post, photos };
      }),

    // 管理者: 投稿削除（写真も Supabase Storage から削除）
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const photos = await getPhotosByPostId(input.id);
        await deletePost(input.id);
        await Promise.allSettled(
          photos.map((photo) => storageDelete(photo.fileKey))
        );
        return { success: true };
      }),

    // 管理者: CSVエクスポート用データ取得
    exportCsv: adminProcedure
      .query(async () => {
        const posts = await getAllPosts();
        if (posts.length === 0) return [];
        const postIds = posts.map((p) => p.id);
        const photos = await getPhotosForPosts(postIds);
        return posts.map((post) => ({
          ...post,
          photos: photos.filter((ph) => ph.postId === post.id),
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
