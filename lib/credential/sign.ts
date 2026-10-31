import { getPublicKeyAsync, signAsync } from "@noble/ed25519";
import type { CredentialPayload } from "@/lib/contract";
import { bytesToBase64, hexToBytes, payloadBytes } from "./encoding";

export async function signPayload(payload: CredentialPayload) {
  const priv = process.env.CREDENTIAL_PRIVATE_KEY;
  if (!priv) throw new Error("CREDENTIAL_PRIVATE_KEY is not set");
  const privBytes = hexToBytes(priv);
  const signature = await signAsync(payloadBytes(payload), privBytes);
  const publicKey = await getPublicKeyAsync(privBytes);
  return { signature: bytesToBase64(signature), publicKey: bytesToBase64(publicKey) };
}