import { useState, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, X, CheckCircle, Loader2, ImagePlus, ArrowLeft, Send, Eye, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

/* ── カラーパレット ── */
const BG = "#ffffff";
const BG_SOFT = "#f7f8fa";
const NAVY = "#0d1b2a";
const NAVY_BORDER = "#d0d9e3";
const NAVY_ACCENT = "#243a52";
const TEXT = "#0d1b2a";
const TEXT_MUTED = "#6b8099";
const TEXT_LIGHT = "#9ab0c4";
const CREAM = "#f0ede8";

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

/* ── モバイル最適化スタイル ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: BG_SOFT,
  border: `1px solid ${NAVY_BORDER}`,
  borderRadius: "10px",
  color: TEXT,
  fontFamily: "'Zen Kaku Gothic New', sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  letterSpacing: "0.03em",
  padding: "14px 16px",
  outline: "none",
  transition: "border-color 0.2s",
  WebkitAppearance: "none" as any,
  minHeight: "48px",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Zen Kaku Gothic New', sans-serif",
  fontSize: "0.82rem",
  fontWeight: 500,
  letterSpacing: "0.06em",
  color: TEXT,
  display: "block",
  marginBottom: "8px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.62rem",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  color: TEXT_LIGHT,
  marginBottom: "20px",
};

const errorStyle: React.CSSProperties = {
  color: "#c0392b",
  fontSize: "0.78rem",
  marginTop: "6px",
  fontFamily: "'Zen Kaku Gothic New', sans-serif",
};

/* ── 確認画面用プレビューコンポーネント ── */
function ConfirmPreview({
  values,
  photos,
  inline,
}: {
  values: FormValues;
  photos: UploadedPhoto[];
  inline?: boolean;
}) {
  const previewItemStyle: React.CSSProperties = {
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: `1px solid ${NAVY_BORDER}`,
  };
  const previewLabelStyle: React.CSSProperties = {
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 400,
    color: TEXT_LIGHT,
    marginBottom: "4px",
    letterSpacing: "0.06em",
  };
  const previewValueStyle: React.CSSProperties = {
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    fontSize: "0.88rem",
    fontWeight: 500,
    color: TEXT,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  };

  return (
    <div>
      {!inline && (
        <div style={{ marginBottom: "20px" }}>
          <p style={sectionTitleStyle}>Preview</p>
          <h3 style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "1.1rem", fontWeight: 500, color: TEXT,
          }}>
            入力内容プレビュー
          </h3>
        </div>
      )}

      {/* 写真 */}
      {photos.length > 0 && (
        <div style={{ ...previewItemStyle }}>
          <p style={previewLabelStyle}>写真（{photos.length}枚）</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${inline ? 3 : Math.min(photos.length, 4)}, 1fr)`,
            gap: "8px",
            marginTop: "8px",
          }}>
            {photos.map((photo, i) => (
              <div key={i} style={{
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                border: `1px solid ${NAVY_BORDER}`,
              }}>
                <img src={photo.preview} alt={`写真 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* スタッフ情報 */}
      <div style={previewItemStyle}>
        <p style={previewLabelStyle}>お名前</p>
        <p style={previewValueStyle}>{values.staffName || "—"}</p>
      </div>
      <div style={previewItemStyle}>
        <p style={previewLabelStyle}>所属店舗</p>
        <p style={previewValueStyle}>{values.storeName || "—"}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", ...previewItemStyle }}>
        <div>
          <p style={previewLabelStyle}>年齢</p>
          <p style={previewValueStyle}>{values.age ? `${values.age}歳` : "—"}</p>
        </div>
        <div>
          <p style={previewLabelStyle}>身長</p>
          <p style={previewValueStyle}>{values.height ? `${values.height}cm` : "—"}</p>
        </div>
        <div>
          <p style={previewLabelStyle}>体重</p>
          <p style={previewValueStyle}>{values.weight ? `${values.weight}kg` : "—"}</p>
        </div>
      </div>

      {/* コーディネート情報 */}
      <div style={previewItemStyle}>
        <p style={previewLabelStyle}>着用アイテム</p>
        <p style={previewValueStyle}>{values.outfitDescription || "—"}</p>
      </div>
      {values.comment && (
        <div style={{ marginBottom: "16px" }}>
          <p style={previewLabelStyle}>コーディネートについて一言</p>
          <p style={previewValueStyle}>{values.comment}</p>
        </div>
      )}
    </div>
  );
}

export default function SubmitForm() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmedValues, setConfirmedValues] = useState<FormValues | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const watchedValues = watch();

  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setConfirming(false);
      setConfirmedValues(null);
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

  const handleConfirm = (values: FormValues) => {
    setConfirmedValues(values);
    setConfirming(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    if (!confirmedValues) return;
    await createPost.mutateAsync({
      staffName: confirmedValues.staffName,
      storeName: confirmedValues.storeName,
      age: confirmedValues.age ? parseInt(confirmedValues.age) : undefined,
      height: confirmedValues.height ? parseInt(confirmedValues.height) : undefined,
      weight: confirmedValues.weight ? parseInt(confirmedValues.weight) : undefined,
      outfitDescription: confirmedValues.outfitDescription,
      comment: confirmedValues.comment,
      photoKeys: photos.map((p) => ({ url: p.url, fileKey: p.fileKey })),
    });
  };

  /* ── 送信完了画面 ── */
  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6"
        style={{ background: BG, color: TEXT, minHeight: "100dvh", maxWidth: "560px", margin: "0 auto" }}
      >
        <div className="text-center w-full" style={{ maxWidth: "360px" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#eaf5f0", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 28px",
          }}>
            <CheckCircle style={{ width: 32, height: 32, color: "#3a9a6a" }} strokeWidth={1.5} />
          </div>
          <h2 style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "1.4rem", fontWeight: 500,
            color: TEXT, marginBottom: "12px",
          }}>
            送信完了
          </h2>
          <p style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "0.88rem", fontWeight: 400,
            lineHeight: 1.9,
            color: TEXT_MUTED, marginBottom: "36px",
          }}>
            コーディネートの入力送信を受け付けました。
            <br />
            情報はECサイトに掲載されます。
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                width: "100%", minHeight: "56px",
                background: NAVY, color: CREAM,
                border: "none", borderRadius: "100px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.92rem", fontWeight: 500,
                letterSpacing: "0.06em", cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; e.currentTarget.style.opacity = "0.9"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
            >
              続けて送信する
            </button>
            <Link href="/">
              <button style={{
                width: "100%", minHeight: "56px",
                background: "transparent", color: TEXT_MUTED,
                border: `1px solid ${NAVY_BORDER}`, borderRadius: "100px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.92rem", fontWeight: 500,
                letterSpacing: "0.06em", cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}>
                トップに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── 確認画面（スマホ用フルスクリーン） ── */
  if (confirming && confirmedValues) {
    return (
      <div style={{ background: BG, color: TEXT, minHeight: "100dvh" }}>
        {/* ヘッダー */}
        <header style={{
          position: "sticky", top: 0, zIndex: 10,
          background: `${BG}ee`, backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${NAVY_BORDER}`,
          padding: "0 20px", height: "52px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: "transparent", border: "none",
              color: TEXT_MUTED, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.82rem",
              padding: "8px 4px",
              minHeight: "44px", minWidth: "44px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <ChevronLeft style={{ width: 18, height: 18 }} />
            <span>修正する</span>
          </button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.65rem", letterSpacing: "0.2em",
            color: TEXT_LIGHT, textTransform: "uppercase",
          }}>
            Confirm
          </span>
          <div style={{ width: 44 }} />
        </header>

        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "28px 20px 48px" }}>
          <div style={{ marginBottom: "28px" }}>
            <p style={sectionTitleStyle}>Confirmation</p>
            <h2 style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "1.3rem", fontWeight: 500,
              color: TEXT, lineHeight: 1.5,
            }}>
              入力内容の確認
            </h2>
            <p style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.82rem", color: TEXT_MUTED,
              marginTop: "8px", lineHeight: 1.7,
            }}>
              以下の内容で送信します。よろしいですか？
            </p>
          </div>

          <div style={{
            background: BG_SOFT,
            borderRadius: "14px",
            border: `1px solid ${NAVY_BORDER}`,
            padding: "24px 20px",
            marginBottom: "32px",
          }}>
            <ConfirmPreview values={confirmedValues} photos={photos} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={handleFinalSubmit}
              disabled={createPost.isPending}
              style={{
                width: "100%", minHeight: "56px",
                background: createPost.isPending ? "#e0e8f0" : NAVY,
                color: createPost.isPending ? TEXT_MUTED : CREAM,
                border: "none", borderRadius: "100px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.95rem", fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                cursor: createPost.isPending ? "not-allowed" : "pointer",
                transition: "transform 0.15s, opacity 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => {
                if (!createPost.isPending) {
                  e.currentTarget.style.transform = "scale(0.98)";
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
            >
              {createPost.isPending ? (
                <><Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> 送信中...</>
              ) : (
                <><Send style={{ width: 17, height: 17 }} /> この内容で送信する</>
              )}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                width: "100%", minHeight: "56px",
                background: "transparent", color: TEXT_MUTED,
                border: `1px solid ${NAVY_BORDER}`, borderRadius: "100px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.92rem", fontWeight: 500,
                letterSpacing: "0.06em", cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              戻って修正する
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── フォーム画面 ── */
  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100dvh" }}>
      {/* ── ヘッダー ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: `${BG}ee`, backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${NAVY_BORDER}`,
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/">
          <button style={{
            background: "transparent", border: "none",
            color: TEXT_MUTED, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "0.82rem",
            padding: "8px 4px",
            minHeight: "44px", minWidth: "44px",
            WebkitTapHighlightColor: "transparent",
          }}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
            <span>戻る</span>
          </button>
        </Link>
        <div style={{ width: 44 }} />
      </header>

      {/* PC: 2カラム / スマホ: 1カラム */}
      <div style={{
        display: "flex",
        maxWidth: "1100px",
        margin: "0 auto",
        gap: "0",
      }}>
        {/* 左: フォーム */}
        <div style={{
          flex: "1 1 560px",
          maxWidth: "560px",
          margin: "0 auto",
          padding: "28px 20px 48px",
        }}>
          {/* ── ページタイトル ── */}
          <div style={{ marginBottom: "28px" }}>
            <p style={sectionTitleStyle}>Coordinate Post</p>
            <h2 style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "1.3rem", fontWeight: 500,
              color: TEXT, lineHeight: 1.5,
            }}>
              コーディネート投稿フォーム
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleConfirm)}>
            {/* ══════ 写真アップロード ══════ */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>
                写真 <span style={{ color: TEXT_LIGHT, fontSize: "0.75rem", fontWeight: 400 }}>（最大10枚）</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? NAVY_ACCENT : NAVY_BORDER}`,
                  borderRadius: "14px",
                  padding: "36px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "#f0f4f8" : BG_SOFT,
                  transition: "all 0.2s",
                  minHeight: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {uploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Loader2 style={{ width: 32, height: 32, color: TEXT_MUTED }} className="animate-spin" strokeWidth={1.5} />
                    <span style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "0.85rem", color: TEXT_MUTED }}>
                      アップロード中...
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "#e8eef4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Camera style={{ width: 26, height: 26, color: TEXT_MUTED }} strokeWidth={1.5} />
                    </div>
                    <span style={{
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                      fontSize: "0.92rem", fontWeight: 500, color: TEXT,
                    }}>
                      タップして写真を選択
                    </span>
                    <span style={{
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                      fontSize: "0.75rem", color: TEXT_LIGHT,
                    }}>
                      カメラロールから選んでください
                    </span>
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

              {/* 写真プレビューグリッド */}
              {photos.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginTop: "14px",
                }}>
                  {photos.map((photo, i) => (
                    <div key={i} style={{
                      position: "relative", aspectRatio: "1",
                      borderRadius: "10px", overflow: "hidden", background: BG_SOFT,
                      border: `1px solid ${NAVY_BORDER}`,
                    }}>
                      <img src={photo.preview} alt={`写真 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: "absolute", top: "6px", right: "6px",
                          background: "rgba(0,0,0,0.55)", border: "none",
                          borderRadius: "50%", width: "28px", height: "28px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <X style={{ width: 14, height: 14, color: "#fff" }} />
                      </button>
                      {i === 0 && (
                        <span style={{
                          position: "absolute", bottom: "6px", left: "6px",
                          background: NAVY, color: CREAM,
                          fontSize: "0.6rem", padding: "3px 8px", borderRadius: "4px",
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
                        aspectRatio: "1", borderRadius: "10px",
                        border: `2px dashed ${NAVY_BORDER}`, background: BG_SOFT,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: "4px", cursor: "pointer",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <ImagePlus style={{ width: 22, height: 22, color: TEXT_LIGHT }} strokeWidth={1.5} />
                      <span style={{ fontSize: "0.6rem", color: TEXT_LIGHT, fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>追加</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── 区切り線 ── */}
            <div style={{ width: "100%", height: "1px", background: NAVY_BORDER, margin: "28px 0" }} />

            {/* ══════ スタッフ情報 ══════ */}
            <div style={{ marginBottom: "12px" }}>
              <p style={sectionTitleStyle}>スタッフ情報</p>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="staffName" style={labelStyle}>
                  お名前 <span style={{ color: "#c0392b", fontSize: "0.75rem" }}>*</span>
                </label>
                <input
                  id="staffName"
                  placeholder="山田 太郎"
                  {...register("staffName")}
                  style={inputStyle}
                  autoComplete="name"
                />
                {errors.staffName && <p style={errorStyle}>{errors.staffName.message}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="storeName" style={labelStyle}>
                  所属店舗 <span style={{ color: "#c0392b", fontSize: "0.75rem" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="storeName"
                    {...register("storeName")}
                    style={{
                      ...inputStyle,
                      paddingRight: "36px",
                      color: TEXT,
                    }}
                  >
                    <option value="">店舗を選択してください</option>
                    {STORES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    width: 0, height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `6px solid ${TEXT_MUTED}`,
                  }} />
                </div>
                {errors.storeName && <p style={errorStyle}>{errors.storeName.message}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        {...register(id as keyof FormValues)}
                        style={{ ...inputStyle, paddingRight: "32px", textAlign: "center" }}
                      />
                      <span style={{
                        position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                        fontSize: "0.75rem", color: TEXT_LIGHT,
                        fontFamily: "'Zen Kaku Gothic New', sans-serif",
                        pointerEvents: "none",
                      }}>
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 区切り線 ── */}
            <div style={{ width: "100%", height: "1px", background: NAVY_BORDER, margin: "28px 0" }} />

            {/* ══════ コーディネート情報 ══════ */}
            <div>
              <p style={sectionTitleStyle}>コーディネート情報</p>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="outfitDescription" style={labelStyle}>
                  着用アイテム <span style={{ color: "#c0392b", fontSize: "0.75rem" }}>*</span>
                </label>
                <p style={{ fontSize: "0.75rem", color: "#8899aa", margin: "4px 0 8px", lineHeight: 1.6 }}>
                  アイテム名・色・品番・サイズを記載してください
                </p>
                <Textarea
                  id="outfitDescription"
                  placeholder={`例：\nジャケット / チャコールグレー スーツジャケット（品番: HS-504-D）/ Lサイズ\nパンツ / ネイビー スラックス（品番: PT-201）/ 82cm\nシャツ / ホワイト ドレスシャツ（品番: SH-110）/ 首回り39cm`}
                  rows={8}
                  {...register("outfitDescription")}
                  style={{
                    ...inputStyle,
                    minHeight: "200px",
                    resize: "vertical" as const,
                    lineHeight: 1.9,
                    padding: "14px 16px",
                    overflow: "auto",
                  }}
                  className=""
                />
                {errors.outfitDescription && <p style={errorStyle}>{errors.outfitDescription.message}</p>}
              </div>

              <div style={{ marginBottom: "32px" }}>
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
                    minHeight: "130px",
                    resize: "vertical" as const,
                    lineHeight: 1.9,
                    padding: "14px 16px",
                    overflow: "auto",
                  }}
                  className=""
                />
              </div>
            </div>

            {/* ══════ 確認ボタン ══════ */}
            <button
              type="submit"
              disabled={uploading}
              style={{
                width: "100%",
                minHeight: "56px",
                background: uploading ? "#e0e8f0" : NAVY,
                color: uploading ? TEXT_MUTED : CREAM,
                border: "none",
                borderRadius: "100px",
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: uploading ? "not-allowed" : "pointer",
                transition: "transform 0.15s, opacity 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => {
                if (!uploading) {
                  e.currentTarget.style.transform = "scale(0.98)";
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
            >
              <Eye style={{ width: 17, height: 17 }} /> 確認する
            </button>

            <p style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "0.72rem", color: TEXT_LIGHT,
              textAlign: "center", marginTop: "16px",
              letterSpacing: "0.04em", paddingBottom: "24px",
              lineHeight: 1.8,
            }}>
              投稿内容は管理者の確認後、ECサイトに掲載されます
            </p>
          </form>
        </div>

        {/* 右: PC用リアルタイムプレビュー（768px以上で表示） */}
        <div
          className="hidden lg:block"
          style={{
            flex: "0 0 380px",
            position: "sticky",
            top: "52px",
            height: "calc(100dvh - 52px)",
            overflowY: "auto",
            borderLeft: `1px solid ${NAVY_BORDER}`,
            padding: "28px 24px",
            background: BG_SOFT,
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "24px",
          }}>
            <Eye style={{ width: 16, height: 16, color: TEXT_LIGHT }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem", letterSpacing: "0.2em",
              color: TEXT_LIGHT, textTransform: "uppercase",
            }}>
              Live Preview
            </span>
          </div>
          <ConfirmPreview values={watchedValues} photos={photos} inline />
        </div>
      </div>
    </div>
  );
}
