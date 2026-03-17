"use client";

import dynamic from "next/dynamic";

const FinancialCalculatorsPage = dynamic(
	() => import("@pages/financial-calculators"),
	{ ssr: true },
);

export default function Page() {
	return <FinancialCalculatorsPage />;
}
