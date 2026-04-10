import dynamic from "next/dynamic";

const ExtraIncomePage = dynamic(() => import("@pages/extra-income"), { ssr: true });

export default async function Page({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	return <ExtraIncomePage key={lang} />;
}
