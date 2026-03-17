"use client";

import dynamic from "next/dynamic";

const BudgetPage = dynamic(() => import("@pages/extra-income/budget"), {
	ssr: true,
});

export default function Page() {
	return <BudgetPage />;
}
