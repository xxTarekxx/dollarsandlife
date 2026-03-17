import { NextRequest, NextResponse } from "next/server";

const API_BASE =
	process.env.NEXT_PUBLIC_REACT_APP_API_BASE ||
	process.env.API_INTERNAL_BASE ||
	"http://localhost:5000";

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ path?: string[] }> },
) {
	const { path } = await context.params;
	const segment = path && path.length > 0 ? path.join("/") : "";
	const url = `${API_BASE.replace(/\/$/, "")}/${segment}`;
	try {
		const res = await fetch(url, { cache: "no-store" });
		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		console.error("Proxy fetch error:", url, err);
		return NextResponse.json(
			{ error: "Upstream request failed" },
			{ status: 502 },
		);
	}
}
