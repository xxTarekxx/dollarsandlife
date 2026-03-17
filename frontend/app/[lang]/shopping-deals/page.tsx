"use client";

import dynamic from "next/dynamic";

const ShoppingDealsPage = dynamic(() => import("@pages/shopping-deals"), {
	ssr: true,
});

export default function Page() {
	return <ShoppingDealsPage />;
}
