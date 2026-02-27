import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, X, Upload, CheckCircle, Loader2, ImagePlus } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  staffName: z.string().min(1, "お名前を入力してください").max(100),
  storeName: z.string().min(1, "所属店舗を入力してください").max(100),
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  outfitDescription: z.string().min(1, "着用服の説明を入力してください"),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UploadedPhoto {
  url: string;
  fileKey: string;
  preview: string;
}

const STORES = [
  "EDWARD'S 新宿高峳屋店",
  "EDWARD'S 大丸東京店",
  "EDWARD'S 横浜高峳屋店",
  "EDWARD'S そごう千葉店",
  "EDWARD'S 大阪高峳屋店",
  "EDWARD'S 京都高峳屋店",
  "EDWARD'S 大丸京都店",
  "EDWARD'S 山陽百貨店",
  "EDWARD'S Select あべのハルカス近鉄本店",
  "EDWARD'S Select 鶴屋百貨店",
  "EDWARD'S 本社",
];

export default function SubmitForm() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      reset();
      setPhotos([]);
    },
    onError: (err) => {
      toast.error(err.message || "投稿に失敗しました");
    },
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    if (photos.length + files.length > 10) {
      toast.error("写真は最大10枚まです");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("photos", f));
      const res = await fetch("/api/upload/photos", { method: "POST", body: formData });
      if (!res.ok) throw new Error("アップロードに失敗しました");
      const data = await res.json();
      const newPhotos: UploadedPhoto[] = data.photos.map((p: { url: string; fileKey: string }, i: number) => ({
        url: p.url,
        fileKey: p.fileKey,
        preview: URL.createObjectURL(files[i]),
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (e: any) {
      toast.error(e.message || "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }, [photos.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) uploadFiles(files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    await createPost.mutateAsync({
      staffName: values.staffName,
      storeName: values.storeName,
      age: values.age ? parseInt(values.age) : undefined,
      height: values.height ? parseInt(values.height) : undefined,
      weight: values.weight ? parseInt(values.weight) : undefined,
      outfitDescription: values.outfitDescription,
      comment: values.comment,
      photoKeys: photos.map((p) => ({ url: p.url, fileKey: p.fileKey })),
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-emerald-500" strokeWidth={1.5} />
          <h2 className="text-3xl mb-3">ありがとうございます</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            コーディネートの投稿を受け付けました。<br />
            管理者の確認後、ECサイトに掲載されます。
          </p>
          <div className="divider-gold mb-8" />
          <div className="flex flex-col gap-3">
            <Button onClick={() => setSubmitted(false)} className="w-full">
              続けて投稿する
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                トップに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">← Back</span>
          </Link>
          <h1 className="text-sm font-medium tracking-widest uppercase">Coordinate Post</h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl mb-2">コーディネート投稿</h2>
          <div className="divider-gold w-24 mx-auto my-4" />
          <p className="text-xs text-muted-foreground tracking-wide">
            スタッフの着こなしをご投稿ください
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-xs tracking-widest uppercase mb-3 block">
              写真 <span className="text-muted-foreground">（最大10枚）</span>
            </Label>

            {/* Upload Area */}
            <div
              className={`photo-upload-area rounded-lg p-6 text-center cursor-pointer transition-all ${dragOver ? "drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground">アップロード中...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <ImagePlus className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-muted-foreground">
                    タップして写真を選択
                  </span>
                  <span className="text-xs text-muted-foreground">またはドラッグ＆ドロップ</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded overflow-hidden bg-muted group">
                    <img
                      src={photo.preview}
                      alt={`写真 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        メイン
                      </span>
                    )}
                  </div>
                ))}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded border-2 border-dashed border-border flex items-center justify-center hover:border-foreground transition-colors"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="divider-gold" />

          {/* Staff Info */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-widest uppercase text-muted-foreground">スタッフ情報</h3>

            <div>
              <Label htmlFor="staffName" className="text-xs mb-1.5 block">
                お名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staffName"
                placeholder="山田 花子"
                {...register("staffName")}
                className="h-11"
              />
              {errors.staffName && (
                <p className="text-destructive text-xs mt-1">{errors.staffName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="storeName" className="text-xs mb-1.5 block">
                所属店舗 <span className="text-destructive">*</span>
              </Label>
              <select
                id="storeName"
                {...register("storeName")}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">店舗を選択してください</option>
                {STORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.storeName && (
                <p className="text-destructive text-xs mt-1">{errors.storeName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="age" className="text-xs mb-1.5 block">年齢</Label>
                <div className="relative">
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min={15}
                    max={80}
                    {...register("age")}
                    className="h-11 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">歳</span>
                </div>
              </div>
              <div>
                <Label htmlFor="height" className="text-xs mb-1.5 block">身長</Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="number"
                    placeholder="165"
                    min={100}
                    max={250}
                    {...register("height")}
                    className="h-11 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
                </div>
              </div>
              <div>
                <Label htmlFor="weight" className="text-xs mb-1.5 block">体重</Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="52"
                    min={30}
                    max={200}
                    {...register("weight")}
                    className="h-11 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divider-gold" />

          {/* Outfit Info */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-widest uppercase text-muted-foreground">コーディネート情報</h3>

            <div>
              <Label htmlFor="outfitDescription" className="text-xs mb-1.5 block">
                着用服 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="outfitDescription"
                placeholder="例：トップス / ホワイトブラウス（品番: AB-123）&#10;ボトムス / ネイビースカート（品番: CD-456）&#10;シューズ / ベージュパンプス"
                rows={4}
                {...register("outfitDescription")}
                className="resize-none text-sm"
              />
              {errors.outfitDescription && (
                <p className="text-destructive text-xs mt-1">{errors.outfitDescription.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="comment" className="text-xs mb-1.5 block">
                コーディネートについて一言
              </Label>
              <Textarea
                id="comment"
                placeholder="例：今季のトレンドを取り入れながら、百貨店らしい上品さを意識しました。"
                rows={3}
                {...register("comment")}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full h-12 text-sm tracking-widest uppercase"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 送信中...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> 投稿する</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center pb-8">
            投稿内容は管理者の確認後、ECサイトに掲載されます
          </p>
        </form>
      </div>
    </div>
  );
}
