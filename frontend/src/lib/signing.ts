import crypto from "crypto";

const SECRET = process.env.UNSUBSCRIBE_SECRET || "change-me-in-production";

export function signUnsubscribe(
    email: string,
    segment: string
): { e: string; s: string; sig: string } {
    const e = encodeURIComponent(email);
    const s = encodeURIComponent(segment);
    const message = `${e}|${s}`;
    const sig = crypto.createHmac("sha256", SECRET).update(message).digest("hex");
    return { e, s, sig };
}

