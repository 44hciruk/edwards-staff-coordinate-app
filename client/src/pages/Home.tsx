import { Link } from "wouter";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0a0a", color: "#f5f5f0" }}
    >
      {/* Nav */}
      <header
        className="px-6 pt-8 pb-0 flex items-center justify-between"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            fontWeight: 400,
            color: "#888",
            textTransform: "uppercase",
          }}
        >
          EDWARD'S
        </span>
        {user?.role === "admin" && (
          <Link href="/admin">
            <button
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                fontWeight: 400,
                color: "#888",
                background: "transparent",
                border: "1px solid #333",
                borderRadius: "100px",
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <LayoutDashboard style={{ width: 11, height: 11 }} />
              管理画面
            </button>
          </Link>
        )}
      </header>

      {/* Hero — full viewport height */}
      <main className="flex-1 flex flex-col justify-between px-6 pt-16 pb-12">
        {/* Large headline */}
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "#555",
              marginBottom: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            Staff Coordinate
          </p>

          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(3.5rem, 15vw, 7rem)",
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              color: "#f5f5f0",
              marginBottom: "0.2rem",
            }}
          >
            STAFF
          </h1>
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(3.5rem, 15vw, 7rem)",
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              color: "transparent",
              WebkitTextStroke: "1px #f5f5f0",
              marginBottom: "2.5rem",
            }}
          >
            SNAP
          </h1>

          {/* Thin divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "linear-gradient(to right, #333, transparent)",
              marginBottom: "2rem",
            }}
          />

          <p
            style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              lineHeight: 2,
              color: "#888",
              maxWidth: "280px",
            }}
          >
            着用アイテムや写真を入力して送信してください。
            いただいた情報はECサイトに掲載されます。
          </p>
        </div>

        {/* Bottom section */}
        <div>
          {/* Store count badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #222",
              borderRadius: "100px",
              padding: "8px 16px",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "#555",
                textTransform: "uppercase",
              }}
            >
              10 Stores
            </span>
            <span style={{ width: "1px", height: "10px", background: "#333" }} />
            <span
              style={{
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "#555",
              }}
            >
              全国百貨店
            </span>
          </div>

          {/* CTA */}
          <Link href="/submit">
            <button
              style={{
                width: "100%",
                height: "60px",
                background: "#f5f5f0",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span>投稿フォームへ</span>
              <ArrowUpRight style={{ width: 18, height: 18 }} />
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-5 flex items-center justify-between"
        style={{ borderTop: "1px solid #1a1a1a" }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            color: "#333",
            textTransform: "uppercase",
          }}
        >
          © EDWARD'S
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: "#333",
          }}
        >
          Staff Snap App
        </span>
      </footer>
    </div>
  );
}
