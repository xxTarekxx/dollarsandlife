import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/mongo";
import { sendEmail } from "@/lib/mailer";
import { signUnsubscribe } from "@/lib/signing";

type Segment = "extra-income" | "shopping-deals" | "breaking-news";

interface NotifyRequestBody {
    segment: Segment;
    title: string;
    url: string;
}

function isValidSegment(segment: string): segment is Segment {
    return ["extra-income", "shopping-deals", "breaking-news"].includes(segment);
}

function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST method
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        // Parse and validate body
        const body: NotifyRequestBody = req.body;

        if (!body.segment || typeof body.segment !== "string") {
            return res.status(400).json({ ok: false, error: "Segment is required" });
        }

        if (!isValidSegment(body.segment)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid segment. Must be one of: extra-income, shopping-deals, breaking-news",
            });
        }

        if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
            return res.status(400).json({ ok: false, error: "Title is required and cannot be empty" });
        }

        if (!body.url || typeof body.url !== "string") {
            return res.status(400).json({ ok: false, error: "URL is required" });
        }

        if (!isValidUrl(body.url)) {
            return res.status(400).json({ ok: false, error: "Invalid URL. Must be http:// or https://" });
        }

        // Get database and collection
        const database = await db();
        const collection = database.collection("subscribers");

        // Fetch all subscribers matching the segment
        const subscribers = await collection.find({ segment: body.segment }).toArray();

        let sent = 0;
        let failed = 0;

        // Get origin from request headers
        const origin = req.headers.origin || req.headers.host
            ? `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`
            : "http://localhost:3000";

        // Send emails one-by-one
        for (const subscriber of subscribers) {
            try {
                // Generate unsubscribe signature
                const { e, s, sig } = signUnsubscribe(subscriber.email, subscriber.segment);
                const unsubUrl = `${origin}/api/unsubscribe?e=${e}&s=${s}&sig=${sig}`;

                // Generate temporary HTML email
                const html = `
					<p>A new update is available:</p>
					<p><a href="${body.url}">${body.title}</a></p>
					<p style="margin-top:20px;font-size:12px;color:#555">If you no longer want these updates, <a href="${unsubUrl}">unsubscribe here</a>.</p>
				`;

                // Send email
                const result = await sendEmail(
                    subscriber.email,
                    `New Update: ${body.title}`,
                    html
                );

                if (result.ok) {
                    sent++;
                } else {
                    failed++;
                    console.error(`Failed to send email to ${subscriber.email}:`, result.error);
                }
            } catch (err: any) {
                failed++;
                console.error(`Error sending email to ${subscriber.email}:`, err);
            }
        }

        return res.status(200).json({ ok: true, sent, failed });
    } catch (error) {
        console.error("Notify API error:", error);
        return res
            .status(500)
            .json({ ok: false, error: "Internal server error" });
    }
}

