import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

function getClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
    throw new Error(
      "Supabase credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_KEY"
    );
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceKey);
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);
  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data as Uint8Array);

  const { error } = await client.storage
    .from(ENV.supabaseBucket)
    .upload(key, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage
    .from(ENV.supabaseBucket)
    .getPublicUrl(key);

  return { key, url: urlData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const { data } = client.storage
    .from(ENV.supabaseBucket)
    .getPublicUrl(key);

  return { key, url: data.publicUrl };
}

export async function storageDelete(relKey: string): Promise<void> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const { error } = await client.storage
    .from(ENV.supabaseBucket)
    .remove([key]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
