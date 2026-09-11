import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — padrão recomendado pro GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const keyBase64 = process.env["PAYMENT_CREDENTIALS_ENCRYPTION_KEY"];
  if (!keyBase64) {
    throw new Error("Missing environment variable: PAYMENT_CREDENTIALS_ENCRYPTION_KEY");
  }
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) {
    throw new Error("PAYMENT_CREDENTIALS_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

export interface EncryptedSecret {
  ciphertext: string; // base64 — ciphertext com o authTag (16 bytes) anexado no final
  iv: string; // base64
}

// Cifra em aplicação, nunca no Postgres — nem service_role vê o valor em
// claro. A chave vive só em variável de ambiente (nunca no banco, nunca
// commitada). GCM é autenticado: qualquer adulteração do ciphertext ou
// do IV faz decryptSecret falhar alto, nunca devolve lixo silenciosamente.
export function encryptSecret(plaintext: Buffer): EncryptedSecret {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(ciphertextBase64: string, ivBase64: string): Buffer {
  const combined = Buffer.from(ciphertextBase64, "base64");
  const iv = Buffer.from(ivBase64, "base64");

  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(0, combined.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
