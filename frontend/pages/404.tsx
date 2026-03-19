"use client";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const NotFoundPage: React.FC = () => {
	return (
		<div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", fontFamily: "'Open Sans', Arial, sans-serif" }}>
			<Head>
				<title>Page Not Found | Dollars &amp; Life</title>
				<meta name="robots" content="noindex, follow" />
				<meta
					name="description"
					content="The page you were looking for could not be found. Explore our guides on extra income, budgeting, shopping deals, and more."
				/>
				<link rel="canonical" href="https://www.dollarsandlife.com/404" />
			</Head>

			<div style={{ maxWidth: "560px" }}>
				<p style={{ fontSize: "6rem", fontWeight: 800, color: "#700877", margin: "0 0 8px", lineHeight: 1 }}>404</p>
				<h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#333", margin: "0 0 16px" }}>
					This page doesn&apos;t exist
				</h1>
				<p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.7, margin: "0 0 36px" }}>
					The URL may have changed, been removed, or you may have followed a broken link.
					Let&apos;s get you back on track.
				</p>

				<div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "48px" }}>
					<Link
						href="/"
						style={{ padding: "12px 24px", background: "linear-gradient(135deg, #700877, #B0196B)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}
					>
						Go to Homepage
					</Link>
					<Link
						href="/extra-income"
						style={{ padding: "12px 24px", background: "#f5f5f5", color: "#700877", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", border: "1px solid #ddd" }}
					>
						Extra Income
					</Link>
					<Link
						href="/financial-calculators"
						style={{ padding: "12px 24px", background: "#f5f5f5", color: "#700877", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", border: "1px solid #ddd" }}
					>
						Calculators
					</Link>
					<Link
						href="/shopping-deals"
						style={{ padding: "12px 24px", background: "#f5f5f5", color: "#700877", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", border: "1px solid #ddd" }}
					>
						Shopping Deals
					</Link>
				</div>

				<p style={{ fontSize: "0.85rem", color: "#999" }}>
					Still stuck?{" "}
					<Link href="/contact-us" style={{ color: "#700877", textDecoration: "underline" }}>
						Contact us
					</Link>{" "}
					and we&apos;ll help you find what you need.
				</p>
			</div>
		</div>
	);
};

export default NotFoundPage;
