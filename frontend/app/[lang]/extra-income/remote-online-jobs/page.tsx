"use client";

import dynamic from "next/dynamic";

const RemoteJobsPage = dynamic(
	() => import("@pages/extra-income/remote-online-jobs"),
	{ ssr: true },
);

export default function Page() {
	return <RemoteJobsPage />;
}
