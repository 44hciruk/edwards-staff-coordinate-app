import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, ImagePlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">EDWARD'S</p>
          <h1 className="text-xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Staff Snap
          </h1>
        </div>
        {user?.role === "admin" && (
          <Link href="/admin">
            <Button variant="outline" size="sm" className="text-xs tracking-wide gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              管理画面
            </Button>
          </Link>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm mx-auto">
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[oklch(0.78_0.08_75)]" />
            <Camera className="w-5 h-5 text-[oklch(0.78_0.08_75)]" strokeWidth={1.5} />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[oklch(0.78_0.08_75)]" />
          </div>

          <h2 className="leading-snug mb-4" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "clamp(1.6rem, 6vw, 2.4rem)", fontWeight: 300, letterSpacing: "0.05em" }}>
            EDWARD'S<br />
            <span style={{ fontWeight: 400 }}>スタッフスナップ</span>
          </h2>

          <div className="h-px w-16 mx-auto my-6 bg-gradient-to-r from-transparent via-[oklch(0.78_0.08_75)] to-transparent" />

          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            着用アイテムや写真を入力して送信してください。いただいた情報はECサイトに掲載されます。
          </p>

          <Link href="/submit">
            <Button className="w-full h-12 text-sm tracking-widest uppercase gap-2">
              投稿フォームへ
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 pb-16">
        <div className="max-w-sm mx-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-10" />
          <div className="grid grid-cols-2 gap-6 text-center">
            {[
              { icon: ImagePlus, label: "写真を複数枚送れます", desc: "最大10枚まで" },
              { icon: Camera, label: "スマホから簡単投稿", desc: "ブラウザで完結" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
          EDWARD'S Staff Snap App
        </p>
      </footer>
    </div>
  );
}
