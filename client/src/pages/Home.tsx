import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Camera, Grid3X3 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// ダミーのグリッドプレースホルダー（モックフィード）
const GRID_PLACEHOLDERS = [
  { bg: "bg-stone-100" },
  { bg: "bg-zinc-200" },
  { bg: "bg-neutral-100" },
  { bg: "bg-stone-200" },
  { bg: "bg-zinc-100" },
  { bg: "bg-neutral-200" },
  { bg: "bg-stone-100" },
  { bg: "bg-zinc-200" },
  { bg: "bg-neutral-100" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Top Nav — Instagram style */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-xl font-semibold tracking-tight text-gray-900 select-none"
            style={{ fontFamily: "'Noto Serif JP', serif", letterSpacing: "-0.01em" }}
          >
            EDWARD'S
          </span>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link href="/admin">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-gray-700" strokeWidth={1.8} />
                </button>
              </Link>
            )}
            <Link href="/submit">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5 text-gray-700" strokeWidth={1.8} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile section — Instagram profile page style */}
      <div className="max-w-lg mx-auto w-full px-4 pt-8 pb-6">
        {/* Avatar + stats row */}
        <div className="flex items-center gap-6 mb-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-200 to-zinc-300 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <span
              className="text-2xl font-light text-gray-600 select-none"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              E
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-base font-semibold text-gray-900">10</p>
              <p className="text-xs text-gray-500">店舗</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">∞</p>
              <p className="text-xs text-gray-500">スナップ</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">EDWARD'S スタッフスナップ</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            着用アイテムや写真を入力して送信してください。<br />
            いただいた情報はECサイトに掲載されます。
          </p>
        </div>

        {/* CTA Button */}
        <Link href="/submit">
          <Button
            className="w-full h-9 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg gap-1.5"
          >
            投稿フォームへ
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Divider with grid icon */}
      <div className="max-w-lg mx-auto w-full border-t border-gray-200">
        <div className="flex justify-center py-3">
          <Grid3X3 className="w-4 h-4 text-gray-900" strokeWidth={2} />
        </div>
      </div>

      {/* Grid — mock feed */}
      <div className="max-w-lg mx-auto w-full px-0 pb-16">
        <div className="grid grid-cols-3 gap-px bg-gray-200">
          {GRID_PLACEHOLDERS.map((item, i) => (
            <div
              key={i}
              className={`aspect-square ${item.bg} flex items-center justify-center`}
            >
              <Camera className="w-6 h-6 text-gray-300" strokeWidth={1} />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          スタッフから投稿が届くとここに表示されます
        </p>
      </div>

      {/* Bottom nav bar — Instagram style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-lg mx-auto h-14 flex items-center justify-around px-4">
          <Link href="/">
            <button className="p-2 flex flex-col items-center gap-0.5">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </Link>
          <Link href="/submit">
            <button className="p-2 flex flex-col items-center gap-0.5">
              <div className="w-8 h-8 rounded-lg border-2 border-gray-900 flex items-center justify-center">
                <span className="text-gray-900 text-lg leading-none font-light">+</span>
              </div>
            </button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin">
              <button className="p-2 flex flex-col items-center gap-0.5">
                <LayoutDashboard className="w-6 h-6 text-gray-500" strokeWidth={1.8} />
              </button>
            </Link>
          )}
        </div>
      </nav>

    </div>
  );
}
