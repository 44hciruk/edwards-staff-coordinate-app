import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, ImagePlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs tracking-[0.25em] uppercase text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
          >
            EDWARD'S
          </span>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <span
            className="text-xs tracking-widest text-foreground"
            style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontWeight: 400 }}
          >
            スタッフスナップ
          </span>
        </div>
        {user?.role === "admin" && (
          <Link href="/admin">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <LayoutDashboard className="w-3.5 h-3.5" />
              管理画面
            </Button>
          </Link>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xs mx-auto text-center">

          {/* Brand mark */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-border mb-6">
              <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>

            <h2
              className="mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(2rem, 8vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              EDWARD'S
            </h2>
            <p
              style={{
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
                fontWeight: 300,
                letterSpacing: "0.2em",
                color: "oklch(0.45 0.01 60)",
              }}
            >
              スタッフスナップ
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <div className="w-1 h-1 rounded-full bg-[oklch(0.78_0.08_75)]" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Description */}
          <p
            className="text-muted-foreground mb-10 leading-loose"
            style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontWeight: 300,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
            }}
          >
            着用アイテムや写真を入力して送信してください。<br />
            いただいた情報はECサイトに掲載されます。
          </p>

          {/* CTA */}
          <Link href="/submit">
            <Button
              className="w-full h-12 gap-2 rounded-full"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                letterSpacing: "0.12em",
                fontSize: "0.75rem",
              }}
            >
              投稿フォームへ
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 pb-12">
        <div className="max-w-xs mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ImagePlus, label: "写真を複数枚送れます", desc: "最大10枚まで" },
              { icon: Camera, label: "スマホから簡単投稿", desc: "ブラウザで完結" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p
                  style={{
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.7rem",
                    letterSpacing: "0.04em",
                    lineHeight: 1.5,
                  }}
                >
                  {label}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.65rem", letterSpacing: "0.04em" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 text-center border-t border-border">
        <p
          className="text-muted-foreground"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            fontWeight: 400,
          }}
        >
          EDWARD'S STAFF SNAP
        </p>
      </footer>
    </div>
  );
}
