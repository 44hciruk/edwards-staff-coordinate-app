import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trash2, ChevronLeft, ChevronRight,
  User, Ruler, Weight, Shirt, MessageSquare, Loader2, LogIn,
  Download, Calendar, MapPin, XCircle, FolderDown
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

  // BOM付きUTF-8でExcelが文字化けしないようにする
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

  // フィルタリング
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <h2 className="text-2xl">管理者ログイン</h2>
        <p className="text-sm text-muted-foreground text-center">
          管理画面にアクセスするにはログインが必要です
        </p>
        <a href={getLoginUrl()}>
          <Button className="gap-2">
            <LogIn className="w-4 h-4" />
            ログインする
          </Button>
        </a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <XCircle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
        <h2 className="text-2xl">アクセス権限がありません</h2>
        <p className="text-sm text-muted-foreground">管理者のみアクセス可能です</p>
        <Link href="/">
          <Button variant="outline">トップに戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="text-xs text-muted-foreground tracking-widest uppercase">← Back</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-sm font-medium tracking-widest uppercase">EDWARD'S Staff Snap — Admin</h1>
          </div>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={!exportData || exportData.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            CSV出力
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title & Stats */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl mb-1">受信一覧</h2>
            <p className="text-xs text-muted-foreground">
              {posts?.length ?? 0}件の投稿
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="名前・店舗・着用服で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Posts Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const mainPhoto = post.photos[0];
              return (
                <div
                  key={post.id}
                  onClick={() => openDetail(post)}
                  className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                >
                  {/* Photo */}
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto.url}
                        alt={post.staffName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="font-medium text-sm">{post.staffName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.storeName}
                        </p>
                      </div>
                      {post.photos.length > 1 && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {post.photos.length}枚
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {post.outfitDescription}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedPost && (
            <>
              {/* Photo Carousel */}
              {selectedPost.photos.length > 0 && (
                <div className="relative bg-muted aspect-video">
                  <img
                    src={selectedPost.photos[photoIndex]?.url}
                    alt="コーディネート写真"
                    className="w-full h-full object-contain"
                  />
                  {selectedPost.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                        disabled={photoIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPhotoIndex((i) => Math.min(selectedPost.photos.length - 1, i + 1))}
                        disabled={photoIndex === selectedPost.photos.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedPost.photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPhotoIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              i === photoIndex ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {/* Photo count */}
                  {selectedPost.photos.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      {photoIndex + 1} / {selectedPost.photos.length}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <DialogHeader className="mb-1">
                  <DialogTitle className="text-2xl">{selectedPost.staffName}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedPost.storeName}
                </p>

                {/* Staff Info */}
                <div className="flex gap-3 mb-5 flex-wrap">
                  {selectedPost.age && (
                    <div className="bg-muted rounded-lg px-4 py-2.5 text-center">
                      <User className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] text-muted-foreground">年齢</p>
                      <p className="text-sm font-medium">{selectedPost.age}歳</p>
                    </div>
                  )}
                  {selectedPost.height && (
                    <div className="bg-muted rounded-lg px-4 py-2.5 text-center">
                      <Ruler className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] text-muted-foreground">身長</p>
                      <p className="text-sm font-medium">{selectedPost.height}cm</p>
                    </div>
                  )}
                  {selectedPost.weight && (
                    <div className="bg-muted rounded-lg px-4 py-2.5 text-center">
                      <Weight className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] text-muted-foreground">体重</p>
                      <p className="text-sm font-medium">{selectedPost.weight}kg</p>
                    </div>
                  )}
                </div>

                {/* Outfit */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <h4 className="text-xs tracking-widest uppercase text-muted-foreground">着用服</h4>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted rounded-lg p-3">
                    {selectedPost.outfitDescription}
                  </p>
                </div>

                {selectedPost.comment && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <h4 className="text-xs tracking-widest uppercase text-muted-foreground">コメント</h4>
                    </div>
                    <p className="text-sm leading-relaxed italic text-muted-foreground bg-muted rounded-lg p-3">
                      "{selectedPost.comment}"
                    </p>
                  </div>
                )}

                {/* Photo URLs for download */}
                {selectedPost.photos.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs tracking-widest uppercase text-muted-foreground">写真ダウンロード</h4>
                      <button
                        onClick={async () => {
                          // 各写真を順番に新タブで開く（ブラウザのポップアップブロックを避けるため順次開く）
                          for (const photo of selectedPost.photos) {
                            window.open(photo.url, '_blank');
                            await new Promise(r => setTimeout(r, 300));
                          }
                        }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <FolderDown className="w-3.5 h-3.5" />
                        全写真を開く
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.photos.map((photo, i) => (
                        <a
                          key={photo.id}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 border border-border rounded hover:bg-muted transition-colors"
                        >
                          写真{i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px w-full bg-border mb-4" />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    受信：{new Date(selectedPost.createdAt).toLocaleString("ja-JP")}
                  </p>
                  <Button
                    onClick={() => setConfirmDelete(selectedPost.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    削除
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>投稿を削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">この操作は取り消せません。写真も含めて削除されます。</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
              キャンセル
            </Button>
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
