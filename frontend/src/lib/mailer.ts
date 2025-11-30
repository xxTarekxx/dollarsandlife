import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;

const FROM = process.env.SENDER_EMAIL;

let resend: Resend | null = null;

function getResend() {
    if (!key) return null;

    if (!resend) resend = new Resend(key);

    return resend;
}

export async function sendEmail(
    to: string,
    subject: string,
    html: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
    try {
        if (!key) return { ok: false, error: "Missing RESEND_API_KEY" };

        if (!FROM) return { ok: false, error: "Missing SENDER_EMAIL" };

        if (!to || typeof to !== "string")
            return { ok: false, error: "Invalid 'to' address" };

        if (!subject) return { ok: false, error: "Missing subject" };

        if (!html) return { ok: false, error: "Missing html" };

        const client = getResend();

        if (!client) return { ok: false, error: "Resend not initialized" };

        const recipient = to.trim().toLowerCase();

        const res = await client.emails.send({
            from: FROM,
            to: recipient,
            subject,
            html,
        });

        if ((res as any).error) {
            return {
                ok: false,
                error: String((res as any).error?.message || "Resend send error"),
            };
        }

        return { ok: true, id: (res as any).id };
    } catch (err: any) {
        return { ok: false, error: err?.message || "Unknown mail error" };
    }
}

