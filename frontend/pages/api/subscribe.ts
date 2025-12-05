import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/mongo";

type Segment = "extra-income" | "shopping-deals" | "breaking-news";

interface SubscribeRequestBody {
    email: string;
    segment: Segment;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidSegment(segment: string): segment is Segment {
    return ["extra-income", "shopping-deals", "breaking-news"].includes(segment);
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
        const body: SubscribeRequestBody = req.body;

        if (!body.email || typeof body.email !== "string") {
            return res.status(400).json({ ok: false, error: "Email is required" });
        }

        if (!body.segment || typeof body.segment !== "string") {
            return res.status(400).json({ ok: false, error: "Segment is required" });
        }

        // Validate email format
        if (!isValidEmail(body.email)) {
            return res.status(400).json({ ok: false, error: "Invalid email format" });
        }

        // Validate segment
        if (!isValidSegment(body.segment)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid segment. Must be one of: extra-income, shopping-deals, breaking-news",
            });
        }

        // Get database and collection
        const database = await db();
        const collection = database.collection("subscribers");

        // Upsert: update if exists, insert if not
        const now = new Date();
        await collection.updateOne(
            { email: body.email, segment: body.segment },
            {
                $set: {
                    email: body.email,
                    segment: body.segment,
                    updatedAt: now,
                },
                $setOnInsert: {
                    createdAt: now,
                },
            },
            { upsert: true }
        );

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Subscribe API error:", error);
        return res
            .status(500)
            .json({ ok: false, error: "Internal server error" });
    }
}

