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
    <>
      <style>{`
        /* Mobile defaults */
        .h-h1 { font-size: min(18vw, 5rem); }
        .h-logo-svg { width: min(72vw, 380px); }
        /* PC overrides (768px+) */
        @media (min-width: 768px) {
          .h-header { padding: 20px 56px 0 !important; }
          .h-header-title { font-size: 0.9rem !important; }
          .h-admin-btn { font-size: 0.72rem !important; padding: 8px 18px !important; min-height: 38px !important; }
          .h-admin-icon { width: 13px !important; height: 13px !important; }
          .h-main { padding: 16px 56px 14px !important; }
          .h-sublabel { font-size: 0.72rem !important; margin-bottom: 10px !important; }
          .h-logo-svg { width: calc(80vw - 112px) !important; max-width: none !important; margin-bottom: 2px !important; }
          .h-h1 { font-size: 20vw !important; line-height: 0.88 !important; }
          .h-divider { margin-top: 16px !important; margin-bottom: 14px !important; }
          .h-bottom { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: 32px !important; }
          .h-desc { font-size: 0.88rem !important; }
          .h-cta-btn { font-size: 0.92rem !important; min-height: 52px !important; padding: 0 28px !important; }
          .h-footer { padding: 10px 56px 14px !important; text-align: left !important; }
          .h-footer-copy { font-size: 0.68rem !important; }
          .h-footer-credit { font-size: 0.58rem !important; }
        }
      `}</style>
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
          className="h-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
            flexShrink: 0,
          }}
        >
          <span
            className="h-header-title"
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
              className="h-admin-btn"
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
              <LayoutDashboard className="h-admin-icon" style={{ width: 12, height: 12 }} />
              管理
            </button>
          </Link>
        </header>

        {/* Hero */}
        <main
          className="h-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "28px 24px 20px",
            minHeight: 0,
          }}
        >
          {/* Top: sublabel + logo + titles */}
          <div style={{ flexShrink: 0 }}>
            <motion.p
              className="h-sublabel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.4em",
                color: MUTED,
                marginBottom: "14px",
                textTransform: "uppercase",
              }}
            >
              Staff Coordinate
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <svg
                className="h-logo-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 215.63"
                style={{
                  display: "block",
                  width: "min(72vw, 380px)",
                  height: "auto",
                  margin: "0 0 4px",
                }}
                aria-label="EDWARD'S"
                role="img"
              >
                <path fill={CREAM} d="M155.12,149.56c-2.04-.97-7.59,6.33-7.59,6.33-29.55,42.01-43.36,49.99-66.16,50.32-19.69.29-23.06-.38-23.73-10.22l-.17-78.35c.76-7.35,3.83-7.38,10.51-7.4,27-.06,27.46,41.74,27.46,41.74,0,2.24,1.8,4.05,4.04,4.04,2.23,0,4.08-1.82,4.07-4.06l-.19-86.22c0-2.19-1.86-4.04-4.09-4.03-1.85,0-3.33,1.27-3.81,2.93,0,.03-.1,0-.14.03-2.03,22.49-12.61,38.08-25.76,38.11-9.3.02-11.57-2.81-12.14-6.47,0,0,.03-70.31-.17-80.29-.22-11.1,12.06-9.09,20.87-6.75,21.28,5.7,36.56,13.74,54.06,45.67,1.03,1.97,3.5,2.69,5.46,1.65,1.99-1.05,3.26-2.03,1.36-7.31L125.02,0,4.1.23C1.79.23,0,2.07,0,4.27c0,2.19,1.81,4.01,4.11,4.01l9.96-.03c2.34.48,3.57,1.96,4.13,6.53l.41,187.81c-1.28,3.82-9.7,3.43-9.7,3.43h-4.36c-2.31.01-4.1,1.81-4.1,4.07,0,2.19,1.8,4,4.11,4l129.58-.33,4.5-.6,18.37-58.22c.96-2.02.11-4.42-1.9-5.38Z"/>
                <path fill={CREAM} d="M339.62,107.02c-.13-58.12-42.39-107.96-102.83-106.73l-2.42.12-65.22.15c-2.28,0-4.74,1.46-4.73,3.68,0,2.22.68,4.11,4.75,4.35,12.85.68,13.59,9.68,14.15,14.29l.38,172.73c-1.25,9.21-9.06,10.22-9.06,10.22l-5.04.51c-2.28,0-4.06,1.84-4.06,4.03,0,2.24,1.8,4.05,4.07,4.05l65.22-.21,1.93-.04c63.14,2.3,102.98-48.98,102.85-107.14ZM238.4,206.23c-.97,0-15.69.04-15.71-9.98,0,0-.17-166.95-.39-176.97-.03-3.12.64-11.65,13.38-11.34,36.22.84,63.66,45.16,63.77,99.58.12,54.37-25.82,98.64-61.05,98.71Z"/>
                <path fill={CREAM} d="M583.79,5.04c0-2.22-1.85-4-4.08-4l-50.4.11c-2.28,0-4.14,1.8-4.13,4.01,0,1.44.8,2.67,1.91,3.4.41.76,1.06,1.43,2.36,1.63,3.29.46,20.9,2.22,16.7,29.23-7.24,27.36-28.67,101.46-28.67,101.46,0,0-37.38-107.35-40.14-116.55-2.54-8.33,6.13-14.23,10.83-14.39,2.46-.1,3.36-.97,3.71-1.93.7-.74,1.1-1.68,1.1-2.78,0-2.22-1.84-4-4.11-4l-62.13.13c-2.26,0-4.08,1.8-4.08,4.02,0,2.28.95,4.19,3.22,4.19l2.53-.12c4.3.7,11.94,3.11,14.94,14.35l6.93,24.08-26.4,92.56s-38.48-110.55-40.54-118.14c-1.12-4.02,1.65-12.98,11.1-13,2.43,0,4.07-1.58,4.07-3.86,0-2.22-1.81-4-4.05-4l-62.17.14c-2.23,0-4.07,1.8-4.07,4.02,0,2.28,1.86,4.07,4.08,4.06,0,0,1.11.38,5.83.37,4.71,0,9.48,5.17,13.75,19.81,6.38,21.98,54.98,180.17,54.98,180.17,0,0,1.05,5.52,5.6,5.52,3.84-.01,4.06-3.44,4.78-5.91,2.21-7.04,33.48-117.24,38.93-135.28l45.34,136.63s.71,4.67,5.46,4.66c2.43,0,2.87-2.42,4.16-5.61,0,0,40.34-152.02,42.58-161.21,2.22-9.24,10.51-34.07,17.14-36.53,4.83-1.79,7.72-2.57,10.39-2.79,1.4-.67,2.54-2.78,2.54-4.45Z"/>
                <path fill={CREAM} d="M934.85,4.77l-2.34.09-62.55.15c-2.16,0-4.53,1.38-4.53,3.54,0,2.2.65,4.05,4.54,4.26,12.36.71,13.04,9.51,13.6,13.95l-.07,167.64c-1.18,9.02-7.89,10.68-12.2,10.93-6.09.43-11.36-.45-13.83-2.67-7.6-6.75-47.75-79.23-52.32-87.3-1.84-3.2-3.18-6.77.4-9.28,19.98-10.15,31.43-27.57,31.39-46.32-.07-30.15-31.39-55.97-76.26-55.31l-56.1-.61c-2.22,0-4.75,1.47-4.75,3.61,0,2.18.73,4.06,4.76,4.27,12.88.69,14.98,9.28,15.48,13.73l1.58,165.43c-.54,6.92-3.22,12.96-11.04,13.28-5.46.17-11.77-2.5-15.77-13.36L627.24,2.71s-22.44,18.84-29.3,26.26c4.34,4.31,5.23,6.38,4.92,8.54-.62,1.69-1.19,3.34-1.64,5.06-12.07,45.54-31.15,117-32.68,123.27-2.22,9.22-7.57,32.73-16.07,37.46-4.47,2.47-7.74,1.27-10.44,1.5-1.37.68-2.52,2.79-2.52,4.44,0,2.24,1.87,4.02,4.09,4.02l47.91-.11c2.23,0,4.06-1.79,4.05-4.03,0-1.43-.06-4.83-4.25-5.03-3.3-.12-19.6,3.34-13.91-28.54,2.03-9.55,6.73-28.6,12.2-48.14.21.05,46.39-.01,46.39-.01,10.78,30.11,21.23,59.3,22.64,64,3.31,10.65-6.15,12.94-9.9,12.93-2.41,0-4.78,3.62-4.78,4.69,0,2.24,2.34,4.24,4.63,4.23,0,0,44.05-.06,58.46.12l59.94.14v-.05h6.09c2.39-.01,4.27-1.91,4.26-4.26,0-2.33-1.89-4.22-4.28-4.21,0,0-2.22.57-6.09-.65-3.81-1.25-6.69-5.32-6.72-8.44,0,0-.35-34.48-.41-74.8,2.59-4.57,9.61-8,15.38,1.52,6.88,11.28,53.41,91.39,53.41,91.39l68.39-.15,37.82.12c61.39,1.79,99.25-42.31,99.11-105.05-.12-56.77-41.16-105.39-99.11-104.15ZM591.61,120.05c8.98-32,18.43-64.56,18.43-64.56,0,0,11.44,31.63,23.25,64.47l-41.69.09ZM770.72,106.75c-7.03.16-11.59-3.41-12.92-7.29-.08-38.43-1.04-71.54-1.14-76-.06-2.19,0-6.62,6.24-8.92,12.05-1.34,35.39,6.78,35.57,46.02.16,28.2-14.08,45.82-27.75,46.18ZM936.4,205.69c-.97,0-15.03.03-15.05-9.73,0,0-.16-162.89-.38-172.67-.07-3.07.58-11.37,12.78-11.1,34.74.85,61.04,44.12,61.16,97.16.12,53.1-24.72,96.25-58.51,96.34Z"/>
                <path fill={CREAM} d="M1069.98,25.45c0,3.46-.81,14.65-4.35,24.26-4.84,13.36-14.37,28.87-19.49,29.15-3.96.21,7.49-30.15,2.88-31.78-10.54-3.63-17.18-7.97-17.21-21.81-.02-10.76,9.14-19.92,19.18-19.94,9.98-.02,18.97,9.31,19,20.11Z"/>
                <path fill={CREAM} d="M1144.78,85.12c-33.61-23.22-33.36-39.97-33.37-45.3-.01-6.77,4.57-26.76,21.38-26.8,28.43-.06,39.96,53.29,48.59,53.27,2.67,0,4.62-2.43,4.4-4.94l-4.24-50.53c-.21-2.49-2.53-4.39-5.2-4.16-5.16.01-5.09,6.35-10.71,6.36-5.63.01-11.33-8.82-29.37-8.78-48.65.1-54.5,41.98-54.48,52.74.02,6.68,1.02,24.39,13.07,37.22,12.03,12.82,26.83,22.74,42.09,32.73,15.23,9.99,30.9,26.05,30.95,45.71.04,19.68-10.18,31.59-25.35,31.62-15.16.04-25.42-7.98-35.21-28.17-6.05-12.65-13.01-31.41-17.88-31.51-2.49-.09-4.48,2.49-4.38,5.35l1.74,58.37c.09,2.89,2.21,5.19,4.72,5.13,2.52-.07,4.45-2.49,4.36-5.39,0,0,2.65-8.43,12.26-1.82,3.88,2.67,7.45,8.64,33.9,8.58,27.16-.06,58.02-21.09,57.95-53.62-.07-32.51-15.52-48.57-55.22-76.05Z"/>
              </svg>
              <h1
                className="h-h1"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: "transparent",
                  WebkitTextStroke: `1px ${CREAM}`,
                  margin: "2px 0",
                }}
              >
                STUFF'S
              </h1>
              <h1
                className="h-h1"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: "transparent",
                  WebkitTextStroke: `1px ${CREAM}`,
                  margin: 0,
                }}
              >
                BUY APP
              </h1>
            </motion.div>
          </div>

          {/* Bottom section */}
          <div style={{ flexShrink: 0 }}>
            {/* Divider */}
            <motion.div
              className="h-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                width: "100%",
                height: "1px",
                background: `linear-gradient(to right, ${NAVY_BORDER}, transparent)`,
                marginTop: "20px",
                marginBottom: "16px",
                transformOrigin: "left",
              }}
            />

            {/* Description + CTA row */}
            <motion.div
              className="h-bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <p
                className="h-desc"
                style={{
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  lineHeight: 1.9,
                  color: MUTED,
                  margin: 0,
                }}
              >
                着用アイテムや写真を入力して送信してください。
                <br />
                情報はECサイトに掲載されます。
              </p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                style={{ flexShrink: 0 }}
              >
                <Link href="/submit">
                  <button
                    className="h-cta-btn"
                    style={{
                      display: "inline-flex",
                      minHeight: "52px",
                      background: CREAM,
                      color: NAVY,
                      border: "none",
                      borderRadius: "100px",
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      alignItems: "center",
                      gap: "12px",
                      padding: "0 28px",
                      cursor: "pointer",
                      transition: "transform 0.15s, opacity 0.15s",
                      WebkitTapHighlightColor: "transparent",
                      whiteSpace: "nowrap",
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
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="h-footer"
          style={{
            padding: "10px 24px 20px",
            borderTop: `1px solid ${NAVY_BORDER}`,
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          <p
            className="h-footer-copy"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: WHITE,
              fontWeight: 300,
              margin: 0,
              marginBottom: "3px",
            }}
          >
            © EDWARD'S Stuff's Buy App
          </p>
          <p
            className="h-footer-credit"
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
    </>
  );
}
