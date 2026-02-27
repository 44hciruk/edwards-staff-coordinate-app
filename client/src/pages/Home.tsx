import { Link } from "wouter";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// ネイビーカラーパレット
const NAVY = "#0d1b2a";
const NAVY_LIGHT = "#1a2e42";
const NAVY_BORDER = "#243a52";
const CREAM = "#f0ede8";
const MUTED = "#7a9ab5";
const MUTED_DARK = "#4a6a85";

export default function Home() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: NAVY, color: CREAM }}
    >
      {/* Nav */}
      <header className="px-6 pt-8 pb-0 flex items-center justify-between">
        <span
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "0.85rem",
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: CREAM,
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
                color: MUTED,
                background: "transparent",
                border: `1px solid ${NAVY_BORDER}`,
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

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-between px-6 pt-16 pb-12">
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              color: MUTED,
              marginBottom: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            Staff Coordinate
          </p>

          {/* Large headline */}
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(3.5rem, 15vw, 7rem)",
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              color: CREAM,
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
              WebkitTextStroke: `1px ${CREAM}`,
              marginBottom: "2.5rem",
            }}
          >
            SNAP
          </h1>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: `linear-gradient(to right, ${NAVY_BORDER}, transparent)`,
              marginBottom: "2rem",
            }}
          />

          {/* Description */}
          <p
            style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              lineHeight: 2,
              color: MUTED,
              maxWidth: "280px",
            }}
          >
            着用アイテムや写真を入力して送信してください。
            情報はECサイトに掲載されます。
          </p>
        </div>

        {/* Bottom section */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: `1px solid ${NAVY_BORDER}`,
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
                color: MUTED,
                fontWeight: 300,
              }}
            >
              EDWARD'S
            </span>
            <span style={{ width: "1px", height: "10px", background: NAVY_BORDER }} />
            <span
              style={{
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: MUTED,
                fontWeight: 300,
              }}
            >
              スタッフ専用フォーム
            </span>
          </div>

          {/* CTA */}
          <Link href="/submit">
            <button
              style={{
                width: "100%",
                height: "60px",
                background: CREAM,
                color: NAVY,
                border: "none",
                borderRadius: "8px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 400,
                letterSpacing: "0.15em",
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
        className="px-6 py-5 flex flex-col gap-1"
        style={{ borderTop: `1px solid ${NAVY_BORDER}` }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: NAVY_BORDER,
              fontWeight: 300,
            }}
          >
            © EDWARD'S Staff Snap App
          </span>
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: MUTED_DARK,
          }}
        >
          Designed &amp; Developed by Shigesato Kurita
        </span>
      </footer>
    </div>
  );
}
