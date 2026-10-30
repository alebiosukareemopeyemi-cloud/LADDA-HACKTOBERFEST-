import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const toHex = (b64url) => Buffer.from(b64url, "base64url").toString("hex");

const priv = toHex(privateKey.export({ format: "jwk" }).d);
const pub = toHex(publicKey.export({ format: "jwk" }).x);

console.log("\nCREDENTIAL_PRIVATE_KEY=" + priv);
console.log("CREDENTIAL_PUBLIC_KEY=" + pub);
console.log("\nSave BOTH in your password manager NOW. Lose the private key and every issued credential stops verifying.\n");