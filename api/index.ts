import "dotenv/config";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { storagePut } from "../server/storage";
import { nanoid } from "nanoid";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Photo upload endpoint
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"));
    }
  },
});

app.post("/api/upload/photos", upload.array("photos", 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "ファイルが見つかりません" });
    }
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const ext = file.originalname.split(".").pop() || "jpg";
        const fileKey = `coordinate-photos/${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, file.buffer, file.mimetype);
        return { url, fileKey };
      })
    );
    return res.json({ photos: uploaded });
  } catch (err: unknown) {
    console.error("[Upload] Error:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "アップロードに失敗しました" });
  }
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

export default app;
