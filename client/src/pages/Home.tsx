import { Link } from "wouter";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

const NAVY = "#0d1b2a";
const NAVY_BORDER = "#243a52";
const CREAM = "#f0ede8";
const MUTED = "#8eaec4";
const WHITE = "#ffffff";

export default function Home() {
  return (
    <div
      style={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: NAVY,
        color: CREAM,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 0",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.68rem",
            fontWeight: 400,
            letterSpacing: "0.15em",
            color: MUTED,
          }}
        >
          EDWARD'S スタッフ専用フォーム
        </span>
        <Link href="/admin">
          <button
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              fontWeight: 400,
              color: MUTED,
              background: "transparent",
              border: `1px solid ${NAVY_BORDER}`,
              borderRadius: "100px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              minHeight: "36px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <LayoutDashboard style={{ width: 12, height: 12 }} />
            管理
          </button>
        </Link>
      </header>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 24px 24px",
          overflow: "hidden",
        }}
      >
        <div>
          {/* Sub label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.4em",
              color: MUTED,
              marginBottom: "20px",
              textTransform: "uppercase",
            }}
          >
            Staff Coordinate
          </motion.p>

          {/* Large headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "min(18vw, 5rem)",
                fontWeight: 300,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                color: CREAM,
                margin: 0,
              }}
            >
              STAFF'S
            </h1>
            <h1
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "min(18vw, 5rem)",
                fontWeight: 300,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                color: "transparent",
                WebkitTextStroke: `1px ${CREAM}`,
                margin: "4px 0",
              }}
            >
              BUY
            </h1>
            <h1
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "min(18vw, 5rem)",
                fontWeight: 300,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                color: "transparent",
                WebkitTextStroke: `1px ${CREAM}`,
                margin: 0,
              }}
            >
              APP
            </h1>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              width: "100%",
              height: "1px",
              background: `linear-gradient(to right, ${NAVY_BORDER}, transparent)`,
              marginTop: "32px",
              marginBottom: "24px",
              transformOrigin: "left",
            }}
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              lineHeight: 1.9,
              color: MUTED,
            }}
          >
            着用アイテムや写真を入力して送信してください。
            <br />
            情報はECサイトに掲載されます。
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          style={{ marginTop: "40px", flexShrink: 0 }}
        >
          <Link href="/submit">
            <button
              style={{
                width: "100%",
                minHeight: "56px",
                background: CREAM,
                color: NAVY,
                border: "none",
                borderRadius: "12px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                cursor: "pointer",
                transition: "transform 0.15s, opacity 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = "scale(0.98)";
                e.currentTarget.style.opacity = "0.9";
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <span>入力フォームへ進む</span>
              <ArrowRight style={{ width: 20, height: 20 }} />
            </button>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "16px 24px 28px",
          borderTop: `1px solid ${NAVY_BORDER}`,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            color: WHITE,
            fontWeight: 300,
            margin: 0,
            marginBottom: "4px",
          }}
        >
          © EDWARD'S Staff's Buy App
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.52rem",
            letterSpacing: "0.1em",
            color: WHITE,
            fontWeight: 300,
            margin: 0,
            opacity: 0.7,
          }}
        >
          Designed &amp; Developed by Shigesato Kurita
        </p>
      </footer>
    </div>
  );
}
