import Link from "next/link";
import React from "react";
import { toAbsoluteUrl } from "../../utils/url";

// Use a fixed base URL for JSON-LD so server and client render the same (avoids hydration mismatch).
// NEXT_PUBLIC_ vars are inlined at build time, so same on server and client.
const BREADCRUMB_BASE_URL =
	typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
		? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
		: "https://www.dollarsandlife.com";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	if (!paths || paths.length === 0) return null;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: paths.map((path, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@id": toAbsoluteUrl(path.url, BREADCRUMB_BASE_URL),
				name: path.title || "Untitled",
			},
		})),
	};

	return (
		<nav aria-label='Breadcrumb Navigation' className='breadcrumb-wrapper'>
			{/* JSON-LD Structured Data for SEO */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>

			<ol
				className='breadcrumb-list'
				itemScope
				itemType='https://schema.org/BreadcrumbList'
			>
				{paths.map((path, index) => (
					<li
						key={index}
						className='breadcrumb-item'
						itemProp='itemListElement'
						itemScope
						itemType='https://schema.org/ListItem'
					>
						<Link
							href={path.url}
							itemProp='item'
							aria-current={index === paths.length - 1 ? "page" : undefined}
						>
							<span itemProp='name'>{path.title || "Untitled"}</span>
						</Link>
						<meta itemProp='position' content={(index + 1).toString()} />
						{index < paths.length - 1 && (
							<span className='breadcrumb-separator'>››</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};

export default React.memo(Breadcrumb);
