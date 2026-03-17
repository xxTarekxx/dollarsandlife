"use client";

import dynamic from "next/dynamic";

const MoneyMakingAppsPage = dynamic(
	() => import("@pages/extra-income/money-making-apps"),
	{ ssr: true },
);

export default function Page() {
	return <MoneyMakingAppsPage />;
}
