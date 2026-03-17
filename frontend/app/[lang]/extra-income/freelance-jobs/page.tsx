"use client";

import dynamic from "next/dynamic";

const FreelanceJobsPage = dynamic(
	() => import("@pages/extra-income/freelance-jobs"),
	{ ssr: true },
);

export default function Page() {
	return <FreelanceJobsPage />;
}
