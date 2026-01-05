import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import AuthActionHandler from "../../src/auth/AuthActionHandler";

const AuthActionPage: React.FC = () => {
	const router = useRouter();
	
	// Always use clean canonical URL without query params
	const canonicalUrl = "https://www.dollarsandlife.com/auth/action";
	
	// If there are no auth params, redirect to forum immediately
	useEffect(() => {
		const { mode, oobCode } = router.query;
		if (!mode && !oobCode && router.isReady) {
			router.replace("/forum");
		}
	}, [router.isReady, router.query.mode, router.query.oobCode, router]);

	return (
		<>
			<Head>
				<title>Authentication Action | Dollars & Life</title>
				<meta name="robots" content="noindex, nofollow" />
				<link rel="canonical" href={canonicalUrl} />
			</Head>
			<AuthActionHandler />
		</>
	);
};

export default AuthActionPage;

