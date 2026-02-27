import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, X, CheckCircle, Loader2, ImagePlus, ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

// 白背景・ネイビー差し色パレット
const BG = "#ffffff";
const BG_SOFT = "#f7f8fa";
const NAVY = "#0d1b2a";
const NAVY_LIGHT = "#1a2e42";
const NAVY_BORDER = "#d0d9e3";
const NAVY_ACCENT = "#243a52";
const TEXT = "#0d1b2a";
const TEXT_MUTED = "#6b8099";
const TEXT_LIGHT = "#9ab0c4";

const schema = z.object({
  staffName: z.string().min(1, "お名前を入力してください").max(100),
  storeName: z.string().min(1, "所属店舗を選択してください").max(100),
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
  "EDWARD'S 新宿高島屋店",
  "EDWARD'S 大丸東京店",
  "EDWARD'S 横浜高島屋店",
  "EDWARD'S そごう千葉店",
  "EDWARD'S 大阪高島屋店",
  "EDWARD'S 京都高島屋店",
  "EDWARD'S 大丸京都店",
  "EDWARD'S 山陽百貨店",
  "EDWARD'S Select あべのハルカス近鉄本店",
  "EDWARD'S Select 鶴屋百貨店",
  "EDWARD'S 本社",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: BG_SOFT,
  border: `1px solid ${NAVY_BORDER}`,
  borderRadius: "6px",
  color: TEXT,
  fontFamily: "'Zen Kaku Gothic New', sans-serif",
  fontSize: "0.9rem",
  fontWeight: 300,
  letterSpacing: "0.04em",
  padding: "11px 14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  color: TEXT_MUTED,
  display: "block",
  marginBottom: "6px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.58rem",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  color: TEXT_LIGHT,
  marginBottom: "16px",
};

const dividerStyle: React.CSSProperties = {
  width: "100%",
  height: "1px",
  background: NAVY_BORDER,
  margin: "24px 0",
};

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
      toast.error("写真は最大10枚までです");
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

  // 送信完了画面
  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ background: BG, color: TEXT }}
      >
        <div className="text-center max-w-sm">
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#eaf5f0", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
          }}>
            <CheckCircle style={{ width: 28, height: 28, color: "#3a9a6a" }} strokeWidth={1.5} />
          </div>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1.6rem", fontWeight: 300,
            letterSpacing: "-0.01em", color: TEXT, marginBottom: "12px",
          }}>
            ありがとうございます
          </h2>
          <p style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "0.8rem", fontWeight: 300,
            letterSpacing: "0.06em", lineHeight: 2,
            color: TEXT_MUTED, marginBottom: "32px",
          }}>
            コーディネートの投稿を受け付けました。<br />
            情報はECサイトに掲載されます。
          </p>
          <div style={dividerStyle} />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                width: "100%", height: "52px",
                background: NAVY, color: "#f0ede8",
                border: "none", borderRadius: "6px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem", fontWeight: 400,
                letterSpacing: "0.15em", cursor: "pointer",
              }}
            >
              続けて投稿する
            </button>
            <Link href="/">
              <button style={{
                width: "100%", height: "52px",
                background: "transparent", color: TEXT_MUTED,
                border: `1px solid ${NAVY_BORDER}`, borderRadius: "6px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem", fontWeight: 400,
                letterSpacing: "0.15em", cursor: "pointer",
              }}>
                トップに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: `${BG}f0`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${NAVY_BORDER}`,
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/">
          <button style={{
            background: "transparent", border: "none",
            color: TEXT_MUTED, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.65rem", letterSpacing: "0.15em",
          }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back
          </button>
        </Link>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.75rem", fontWeight: 300,
          letterSpacing: "0.25em", color: NAVY,
        }}>
          EDWARD'S
        </span>
        <div style={{ width: 48 }} />
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <p style={sectionTitleStyle}>Coordinate Post</p>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1.6rem", fontWeight: 300,
            letterSpacing: "-0.01em", color: TEXT, lineHeight: 1.2,
          }}>
            コーディネート<br />投稿フォーム
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── 写真アップロード ── */}
          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>
              写真 <span style={{ color: TEXT_LIGHT }}>（最大10枚）</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `1.5px dashed ${dragOver ? NAVY_ACCENT : NAVY_BORDER}`,
                borderRadius: "8px", padding: "32px 16px",
                textAlign: "center", cursor: "pointer",
                background: dragOver ? "#f0f4f8" : BG_SOFT,
                transition: "all 0.2s",
              }}
            >
              {uploading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <Loader2 style={{ width: 28, height: 28, color: TEXT_MUTED }} className="animate-spin" strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "0.75rem", color: TEXT_MUTED }}>
                    アップロード中...
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <ImagePlus style={{ width: 28, height: 28, color: TEXT_LIGHT }} strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "0.85rem", color: TEXT_MUTED }}>
                    タップして写真を選択
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: TEXT_LIGHT, letterSpacing: "0.1em" }}>
                    またはドラッグ＆ドロップ
                  </span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

            {photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{
                    position: "relative", aspectRatio: "1",
                    borderRadius: "6px", overflow: "hidden", background: BG_SOFT,
                    border: `1px solid ${NAVY_BORDER}`,
                  }}>
                    <img src={photo.preview} alt={`写真 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: "absolute", top: "4px", right: "4px",
                        background: "rgba(255,255,255,0.9)", border: "none",
                        borderRadius: "50%", width: "20px", height: "20px",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      }}
                    >
                      <X style={{ width: 10, height: 10, color: NAVY }} />
                    </button>
                    {i === 0 && (
                      <span style={{
                        position: "absolute", bottom: "4px", left: "4px",
                        background: NAVY, color: "#f0ede8",
                        fontSize: "0.55rem", padding: "2px 6px", borderRadius: "3px",
                        fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
                      }}>
                        MAIN
                      </span>
                    )}
                  </div>
                ))}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: "1", borderRadius: "6px",
                      border: `1.5px dashed ${NAVY_BORDER}`, background: BG_SOFT,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    <Camera style={{ width: 18, height: 18, color: TEXT_LIGHT }} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={dividerStyle} />

          {/* ── スタッフ情報 ── */}
          <div style={{ marginBottom: "8px" }}>
            <p style={sectionTitleStyle}>スタッフ情報</p>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="staffName" style={labelStyle}>
                お名前 <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                id="staffName"
                placeholder="山田 太郎"
                {...register("staffName")}
                style={inputStyle}
              />
              {errors.staffName && (
                <p style={{ color: "#c0392b", fontSize: "0.7rem", marginTop: "4px" }}>{errors.staffName.message}</p>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="storeName" style={labelStyle}>
                所属店舗 <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <select
                id="storeName"
                {...register("storeName")}
                style={{ ...inputStyle, appearance: "none" as const, color: TEXT }}
              >
                <option value="">店舗を選択してください</option>
                {STORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.storeName && (
                <p style={{ color: "#c0392b", fontSize: "0.7rem", marginTop: "4px" }}>{errors.storeName.message}</p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { id: "age", label: "年齢", placeholder: "35", unit: "歳", min: 15, max: 80 },
                { id: "height", label: "身長", placeholder: "175", unit: "cm", min: 100, max: 250 },
                { id: "weight", label: "体重", placeholder: "70", unit: "kg", min: 30, max: 200 },
              ].map(({ id, label, placeholder, unit, min, max }) => (
                <div key={id}>
                  <label htmlFor={id} style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id={id}
                      type="number"
                      placeholder={placeholder}
                      min={min}
                      max={max}
                      {...register(id as keyof FormValues)}
                      style={{ ...inputStyle, paddingRight: "28px" }}
                    />
                    <span style={{
                      position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                      fontSize: "0.65rem", color: TEXT_LIGHT,
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    }}>
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={dividerStyle} />

          {/* ── コーディネート情報 ── */}
          <div>
            <p style={sectionTitleStyle}>コーディネート情報</p>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="outfitDescription" style={labelStyle}>
                着用アイテム <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <Textarea
                id="outfitDescription"
                placeholder={`例：
ジャケット / チャコールグレー スーツジャケット（品番: HS-504-D）
スラックス / ネイビーウールスラックス（品番: HS-505-N）
シャツ / ホワイトドレスシャツ（品番: HS-201-W）
ネクタイ / シルクストライプタイ（品番: HT-102-B）
シューズ / ブラックレザーオックスフォード`}
                rows={8}
                {...register("outfitDescription")}
                style={{
                  ...inputStyle,
                  minHeight: "200px",
                  resize: "both",
                  lineHeight: 1.8,
                  padding: "12px 14px",
                  overflow: "auto",
                }}
                className=""
              />
              {errors.outfitDescription && (
                <p style={{ color: "#c0392b", fontSize: "0.7rem", marginTop: "4px" }}>{errors.outfitDescription.message}</p>
              )}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="comment" style={labelStyle}>
                コーディネートについて一言
              </label>
              <Textarea
                id="comment"
                placeholder="例：今季のトレンドを取り入れながら、紳士服らしい上品さを意識しました。"
                rows={5}
                {...register("comment")}
                style={{
                  ...inputStyle,
                  minHeight: "120px",
                  resize: "both",
                  lineHeight: 1.8,
                  padding: "12px 14px",
                  overflow: "auto",
                }}
                className=""
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            style={{
              width: "100%", height: "56px",
              background: isSubmitting || uploading ? "#e0e8f0" : NAVY,
              color: isSubmitting || uploading ? TEXT_MUTED : "#f0ede8",
              border: "none", borderRadius: "6px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem", fontWeight: 400,
              letterSpacing: "0.15em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: isSubmitting || uploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isSubmitting ? (
              <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> 送信中...</>
            ) : (
              <><Send style={{ width: 15, height: 15 }} /> 送信する</>
            )}
          </button>

          <p style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "0.65rem", color: TEXT_LIGHT,
            textAlign: "center", marginTop: "16px",
            letterSpacing: "0.06em", paddingBottom: "32px",
          }}>
            投稿内容は管理者の確認後、ECサイトに掲載されます
          </p>
        </form>
      </div>
    </div>
  );
}
