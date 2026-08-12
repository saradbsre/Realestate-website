import crypto from "crypto";

// Verifies a standard Google Authenticator TOTP (Time-based One Time Password) code
// using a Base32 encoded secret key.
export function verifyTOTP(secret: string, code: string): boolean {
  try {
    // 1. Decode Base32 secret key into key buffer
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    
    // Clean spaces and sanitize
    const sanitizedSecret = secret.replace(/\s+/g, "").toUpperCase();

    for (let i = 0; i < sanitizedSecret.length; i++) {
      const val = base32chars.indexOf(sanitizedSecret.charAt(i));
      if (val < 0) continue; // Skip padding or invalid chars
      bits += val.toString(2).padStart(5, "0");
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    const key = Buffer.from(bytes);

    // 2. Get current 30-second time window (T)
    const epoch = Math.round(Date.now() / 1000);
    const time = Math.floor(epoch / 30);

    // 3. Verify code allowing a window of clock drift (T-1, T, T+1)
    for (let i = -1; i <= 1; i++) {
      const timeStep = time + i;
      
      // Buffer of 8 bytes for 64-bit integer
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(0, 0);
      buffer.writeUInt32BE(timeStep, 4);

      // Create HMAC-SHA1
      const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
      
      // Dynamic Truncation (standard RFC 4226)
      const offset = hmac[hmac.length - 1] & 0xf;
      const otp = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
      ) % 1000000;

      const generatedCode = otp.toString().padStart(6, "0");
      if (generatedCode === code) {
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.error("Error in verifyTOTP:", err);
    return false;
  }
}
