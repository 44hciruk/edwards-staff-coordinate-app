import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trash2, ChevronLeft, ChevronRight,
  User, Ruler, Weight, Shirt, MessageSquare, Loader2, LogIn,
  Download, Calendar, MapPin, XCircle, ArrowLeft, Search
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

type Post = {
  id: number;
  staffName: string;
  storeName: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  outfitDescription: string;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  photos: { id: number; postId: number; url: string; fileKey: string; sortOrder: number; createdAt: Date }[];
};

// CSV生成ユーティリティ
function generateCsv(posts: Post[]): string {
  const headers = [
    "ID", "受信日時", "名前", "所属店舗", "年齢", "身長(cm)", "体重(kg)",
    "着用服", "コメント",
    "写真1", "写真2", "写真3", "写真4", "写真5",
    "写真6", "写真7", "写真8", "写真9", "写真10",
  ];

  const escape = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = posts.map((p) => {
    const photoUrls = Array.from({ length: 10 }, (_, i) => p.photos[i]?.url ?? "");
    return [
      p.id,
      new Date(p.createdAt).toLocaleString("ja-JP"),
      p.staffName,
      p.storeName,
      p.age ?? "",
      p.height ?? "",
      p.weight ?? "",
      p.outfitDescription,
      p.comment ?? "",
      ...photoUrls,
    ].map(escape).join(",");
  });

  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── 詳細パネル（PC用インライン / スマホ用モーダル共通） ── */
function PostDetail({
  post,
  photoIndex,
  setPhotoIndex,
  onDelete,
  deletePending,
}: {
  post: Post;
  photoIndex: number;
  setPhotoIndex: (i: number) => void;
  onDelete: () => void;
  deletePending: boolean;
}) {
  return (
    <>
      {/* 写真カルーセル */}
      {post.photos.length > 0 && (
        <div className="relative bg-muted" style={{ aspectRatio: "3/4", maxHeight: "50dvh" }}>
          <img
            src={post.photos[photoIndex]?.url}
            alt="コーディネート写真"
            className="w-full h-full object-contain"
          />
          {post.photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                disabled={photoIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 disabled:opacity-30 min-w-[40px] min-h-[40px] flex items-center justify-center"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPhotoIndex(Math.min(post.photos.length - 1, photoIndex + 1))}
                disabled={photoIndex === post.photos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 disabled:opacity-30 min-w-[40px] min-h-[40px] flex items-center justify-center"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === photoIndex ? "bg-white scale-125" : "bg-white/40"
                    }`}
                    style={{ minWidth: "8px", minHeight: "8px" }}
                  />
                ))}
              </div>
            </>
          )}
          {post.photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {photoIndex + 1} / {post.photos.length}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-medium mb-1">{post.staffName}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {post.storeName}
        </p>

        {/* スタッフ情報 */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {post.age && (
            <div className="bg-muted rounded-xl px-4 py-2.5 text-center flex-1 min-w-[70px]">
              <User className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground">年齢</p>
              <p className="text-sm font-medium">{post.age}歳</p>
            </div>
          )}
          {post.height && (
            <div className="bg-muted rounded-xl px-4 py-2.5 text-center flex-1 min-w-[70px]">
              <Ruler className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground">身長</p>
              <p className="text-sm font-medium">{post.height}cm</p>
            </div>
          )}
          {post.weight && (
            <div className="bg-muted rounded-xl px-4 py-2.5 text-center flex-1 min-w-[70px]">
              <Weight className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground">体重</p>
              <p className="text-sm font-medium">{post.weight}kg</p>
            </div>
          )}
        </div>

        {/* 着用服 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shirt className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground">着用服</h4>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted rounded-xl p-3.5">
            {post.outfitDescription}
          </p>
        </div>

        {post.comment && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <h4 className="text-xs tracking-widest uppercase text-muted-foreground">コメント</h4>
            </div>
            <p className="text-sm leading-relaxed italic text-muted-foreground bg-muted rounded-xl p-3.5">
              "{post.comment}"
            </p>
          </div>
        )}

        {/* 写真ダウンロード */}
        {post.photos.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-2">写真ダウンロード</h4>
            <div className="flex flex-wrap gap-2">
              {post.photos.map((photo, i) => (
                <a
                  key={photo.id}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors min-h-[40px] flex items-center"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  写真{i + 1}を開く
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="h-px w-full bg-border mb-4" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleString("ja-JP")}
          </p>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 min-h-[40px]"
            disabled={deletePending}
          >
            {deletePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            削除
          </Button>
        </div>
      </div>
    </>
  );
}

/* ── 投稿カード（一覧用） ── */
function PostCard({ post, isSelected, onClick }: { post: Post; isSelected: boolean; onClick: () => void }) {
  const mainPhoto = post.photos[0];
  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="flex">
        {/* サムネイル */}
        <div className="w-[100px] min-h-[100px] bg-muted flex-shrink-0">
          {mainPhoto ? (
            <img src={mainPhoto.url} alt={post.staffName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt className="w-6 h-6 text-muted-foreground/30" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm truncate">{post.staffName}</p>
            {post.photos.length > 1 && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                {post.photos.length}枚
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{post.storeName}</span>
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
            {post.outfitDescription}
          </p>
          <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = trpc.useUtils();

  const { data: posts, isLoading } = trpc.posts.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: exportData } = trpc.posts.exportCsv.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.exportCsv.invalidate();
      toast.success("投稿を削除しました");
      setConfirmDelete(null);
      setSelectedPost(null);
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "削除に失敗しました"),
  });

  const handleExportCsv = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("エクスポートするデータがありません");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    const csv = generateCsv(exportData as Post[]);
    downloadCsv(csv, `coordinate_posts_${date}.csv`);
    toast.success(`${exportData.length}件をCSVでエクスポートしました`);
  };

  const openDetail = (post: Post) => {
    setSelectedPost(post);
    setPhotoIndex(0);
  };

  const filteredPosts = posts
    ? (posts as Post[]).filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.staffName.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.outfitDescription.toLowerCase().includes(q)
        );
      })
    : [];

  // Auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100dvh" }}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-6 gap-6" style={{ minHeight: "100dvh" }}>
        <h2 className="text-xl font-medium">管理者ログイン</h2>
        <p className="text-sm text-muted-foreground text-center">
          管理画面にアクセスするにはログインが必要です
        </p>
        <a href={getLoginUrl()}>
          <Button className="gap-2 min-h-[48px] px-8 text-base">
            <LogIn className="w-5 h-5" />
            ログインする
          </Button>
        </a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center px-6 gap-4" style={{ minHeight: "100dvh" }}>
        <XCircle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
        <h2 className="text-xl font-medium">アクセス権限がありません</h2>
        <p className="text-sm text-muted-foreground">管理者のみアクセス可能です</p>
        <Link href="/">
          <Button variant="outline" className="min-h-[48px] px-8">トップに戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background" style={{ minHeight: "100dvh" }}>
      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 h-[52px] flex items-center justify-between gap-3" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <Link href="/">
            <button className="flex items-center gap-1.5 text-muted-foreground min-h-[44px] min-w-[44px] bg-transparent border-none cursor-pointer p-1"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <ArrowLeft className="w-[18px] h-[18px]" />
              <span className="text-xs tracking-wider">戻る</span>
            </button>
          </Link>
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Admin</span>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs min-h-[40px] px-3"
            disabled={!exportData || exportData.length === 0}
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </header>

      {/* ── メインコンテンツ: PC=2カラム / スマホ=1カラム ── */}
      <div className="flex" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* 左: 投稿一覧 */}
        <div className="flex-1 min-w-0 lg:max-w-[520px] lg:border-r lg:border-border">
          <div className="px-4 py-5">
            {/* タイトル */}
            <div className="mb-4">
              <h2 className="text-xl font-medium mb-0.5">受信一覧</h2>
              <p className="text-xs text-muted-foreground">
                {posts?.length ?? 0}件の投稿
              </p>
            </div>

            {/* 検索 */}
            <div className="mb-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="名前・店舗・着用服で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[48px] pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: "16px", WebkitAppearance: "none" as any }}
              />
            </div>

            {/* 投稿一覧 */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <Shirt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" strokeWidth={1} />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? "検索結果がありません" : "まだ投稿がありません"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isSelected={selectedPost?.id === post.id}
                    onClick={() => openDetail(post)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右: PC用詳細パネル（lgブレークポイント以上で表示） */}
        <div className="hidden lg:block flex-1 min-w-0 sticky top-[52px]" style={{ height: "calc(100dvh - 52px)" }}>
          {selectedPost ? (
            <div className="h-full overflow-y-auto">
              <PostDetail
                post={selectedPost}
                photoIndex={photoIndex}
                setPhotoIndex={setPhotoIndex}
                onDelete={() => setConfirmDelete(selectedPost.id)}
                deletePending={deletePost.isPending}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Shirt className="w-12 h-12 mb-3 opacity-20" strokeWidth={1} />
              <p className="text-sm">投稿を選択してください</p>
            </div>
          )}
        </div>
      </div>

      {/* ── スマホ用詳細モーダル（lgブレークポイント未満で表示） ── */}
      <div className="lg:hidden">
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="max-w-lg max-h-[92dvh] overflow-y-auto p-0 rounded-t-2xl sm:rounded-2xl mx-2">
            {selectedPost && (
              <PostDetail
                post={selectedPost}
                photoIndex={photoIndex}
                setPhotoIndex={setPhotoIndex}
                onDelete={() => setConfirmDelete(selectedPost.id)}
                deletePending={deletePost.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* ── 削除確認 ── */}
      <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>投稿を削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">この操作は取り消せません。写真も含めて削除されます。</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 min-h-[48px]" onClick={() => setConfirmDelete(null)}>
              キャンセル
            </Button>
            <Button
              className="flex-1 min-h-[48px] bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => confirmDelete && deletePost.mutate({ id: confirmDelete })}
              disabled={deletePost.isPending}
            >
              {deletePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "削除する"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
