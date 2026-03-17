"use client";

import dynamic from "next/dynamic";

const ExtraIncomePage = dynamic(() => import("@pages/extra-income"), { ssr: true });

export default function Page() {
	return <ExtraIncomePage />;
}
