import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { user } from "@/db/drizzle/schema/auth";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error(
      "API_KEY_ENCRYPTION_SECRET is not configured",
    );
  }

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
}

export function encryptApiKey(apiKey: string) {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptApiKey(encryptedApiKey: string) {
  const key = getEncryptionKey();

  const [ivHex, authTagHex, encryptedHex] =
    encryptedApiKey.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted API key");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv,
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export async function getUserGeminiApiKey(userId: string) {
  const result = await db
    .select({
      apiKeyEncrypted: user.apiKeyEncrypted,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const encrypted = result[0]?.apiKeyEncrypted;

  if (!encrypted) {
    throw new Error("Gemini API key not configured");
  }

  return decryptApiKey(encrypted);
}