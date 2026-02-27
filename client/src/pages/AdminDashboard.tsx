import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Clock, Trash2, ChevronLeft, ChevronRight,
  User, MapPin, Ruler, Weight, Shirt, MessageSquare, Loader2, LogIn
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_LABELS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: "審査中", className: "status-pending", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "承認済", className: "status-approved", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "非承認", className: "status-rejected", icon: <XCircle className="w-3 h-3" /> },
};

type Post = {
  id: number;
  staffName: string;
  storeName: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  outfitDescription: string;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  photos: { id: number; postId: number; url: string; fileKey: string; sortOrder: number; createdAt: Date }[];
};

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: posts, isLoading } = trpc.posts.list.useQuery(
    { status: filter },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const updateStatus = trpc.posts.updateStatus.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      toast.success("ステータスを更新しました");
      setSelectedPost(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      toast.success("投稿を削除しました");
      setConfirmDelete(null);
      setSelectedPost(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleStatusUpdate = (id: number, status: "pending" | "approved" | "rejected") => {
    updateStatus.mutate({ id, status, adminNote: adminNote || undefined });
  };

  const openDetail = (post: Post) => {
    setSelectedPost(post);
    setAdminNote(post.adminNote || "");
    setPhotoIndex(0);
  };

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
          管理者ダッシュボードにアクセスするにはログインが必要です
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

  const pendingCount = posts?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="text-xs text-muted-foreground tracking-widest uppercase">← Back</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-sm font-medium tracking-widest uppercase">Admin Dashboard</h1>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              審査待ち {pendingCount}件
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl mb-1">投稿管理</h2>
          <p className="text-xs text-muted-foreground tracking-wide">
            {posts?.length ?? 0}件の投稿
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                filter === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "すべて" : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">投稿がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => {
              const statusInfo = STATUS_LABELS[post.status];
              const mainPhoto = post.photos[0];
              return (
                <div
                  key={post.id}
                  onClick={() => openDetail(post as Post)}
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
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-sm">{post.staffName}</p>
                        <p className="text-xs text-muted-foreground">{post.storeName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.outfitDescription}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                      {post.photos.length > 1 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{post.photos.length - 1}枚
                        </span>
                      )}
                    </div>
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
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${STATUS_LABELS[selectedPost.status].className}`}>
                      {STATUS_LABELS[selectedPost.status].icon}
                      {STATUS_LABELS[selectedPost.status].label}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl">{selectedPost.staffName}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{selectedPost.storeName}</p>
                </DialogHeader>

                {/* Staff Info */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {selectedPost.age && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <User className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-xs text-muted-foreground">年齢</p>
                      <p className="text-sm font-medium">{selectedPost.age}歳</p>
                    </div>
                  )}
                  {selectedPost.height && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <Ruler className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-xs text-muted-foreground">身長</p>
                      <p className="text-sm font-medium">{selectedPost.height}cm</p>
                    </div>
                  )}
                  {selectedPost.weight && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <Weight className="w-4 h-4 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-xs text-muted-foreground">体重</p>
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
                    <p className="text-sm leading-relaxed italic text-muted-foreground">
                      "{selectedPost.comment}"
                    </p>
                  </div>
                )}

                <div className="h-px w-full bg-border mb-5" />

                {/* Admin Note */}
                <div className="mb-5">
                  <Label className="text-xs tracking-widest uppercase mb-2 block">管理者メモ（任意）</Label>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="承認・非承認の理由など"
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(selectedPost.id, "approved")}
                    disabled={updateStatus.isPending || selectedPost.status === "approved"}
                    className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    承認
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedPost.id, "rejected")}
                    disabled={updateStatus.isPending || selectedPost.status === "rejected"}
                    variant="outline"
                    className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    非承認
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedPost.id, "pending")}
                    disabled={updateStatus.isPending || selectedPost.status === "pending"}
                    variant="outline"
                    className="gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setConfirmDelete(selectedPost.id)}
                    variant="outline"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDelete(null)}
            >
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
