import * as crypto from "crypto";
/**
 * Khuyến nghị: nạp key Ed25519 dạng PEM (PKCS#8 / SPKI)
 *  - JWKS_PRIVATE: -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----
 *  - JWKS_PUBLIC : -----BEGIN PUBLIC KEY-----  ... -----END PUBLIC KEY-----
 */
export function loadPrivateKey() {
    const pem = process.env.JWKS_PRIVATE;
    if (!pem) {
        console.warn("Missing JWKS_PRIVATE. Using throwaway key for signing. THIS IS NOT SECURE.");
        return crypto.generateKeyPairSync("ed25519").privateKey;
    }
    return crypto.createPrivateKey(pem);
}
export function loadPublicKey() {
    const pem = process.env.JWKS_PUBLIC;
    if (!pem) {
        console.warn("Missing JWKS_PUBLIC. Using throwaway key for verification. THIS IS NOT SECURE.");
        return crypto.generateKeyPairSync("ed25519").publicKey;
    }
    return crypto.createPublicKey(pem);
}
export function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
export function b64url(buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export function signEd25519Hex(hex) {
    const priv = loadPrivateKey();
    // Ed25519: algorithm=null theo Node.js khi KeyObject là Ed25519
    const sig = crypto.sign(null, Buffer.from(hex, "hex"), priv);
    return b64url(sig);
}
export function verifyEd25519Hex(hex, sigB64Url) {
    try {
        const pub = loadPublicKey();
        const sig = Buffer.from(sigB64Url.replace(/-/g, "+").replace(/_/g, "/"), "base64");
        return crypto.verify(null, Buffer.from(hex, "hex"), pub, sig);
    }
    catch (e) {
        console.error("Verification failed:", e);
        return false;
    }
}
