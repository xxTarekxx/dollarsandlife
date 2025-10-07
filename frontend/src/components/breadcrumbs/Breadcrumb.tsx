import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toAbsoluteUrl, getBaseUrl } from "../../utils/url";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	const [origin, setOrigin] = useState<string>(getBaseUrl());

	useEffect(() => {
		if (typeof window !== "undefined") {
			// Use the actual origin for client-side rendering
			setOrigin(getBaseUrl());
		}
	}, []);

	if (!paths || paths.length === 0) return null;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: paths.map((path, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@id": toAbsoluteUrl(path.url, origin),
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
