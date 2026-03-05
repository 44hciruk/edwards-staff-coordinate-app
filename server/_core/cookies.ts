// Express 型に依存せず Node.js の基本型のみを使用する

type SessionCookieOptions = {
  httpOnly: boolean;
  path: string;
  sameSite: boolean | "lax" | "strict" | "none";
  secure: boolean;
  domain?: string;
};

// express.Request と互換性のある最小インターフェース
interface MinimalRequest {
  protocol?: string;
  headers: Record<string, string | string[] | undefined>;
}

function isSecureRequest(req: MinimalRequest): boolean {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList: string[] = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: MinimalRequest): SessionCookieOptions {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // sameSite:"none" requires secure:true; fall back to "lax" for HTTP (localhost)
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
