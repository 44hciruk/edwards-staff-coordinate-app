import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

// ── Express アプリをモジュールレベルで構築（Vercel/local 共通） ──

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"));
    }
  },
});

app.post("/api/upload/photos", upload.array("photos", 10), async (req, res) => {
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
  } catch (err: any) {
    console.error("[Upload] Error:", err);
    return res.status(500).json({ error: err.message || "アップロードに失敗しました" });
  }
});

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

// Vercel / api/index.ts から import されるときはこれだけ使う
export default app;

// ── ローカル開発時のみ HTTP サーバーを起動 ──
// Vercel 環境では process.env.VERCEL=1 が設定されるためスキップ

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(console.error);
}
