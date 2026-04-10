import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getListingPageTranslations } from "@/lib/i18n/listing-page-translations";

interface BlogPostCardProps {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	content: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	onClick?: () => void;
	href: string;
	lang?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	headline,
	image,
	content,
	datePublished,
	href,
	lang = "en",
}) => {
	const { common } = getListingPageTranslations(lang);
	const published = new Date(datePublished);
	const day = published.getDate();
	const month = new Intl.DateTimeFormat(lang, { month: "short" })
		.format(published)
		.toUpperCase();

	return (
		<Link
			href={href}
			className="blog-post-link-container"
			aria-label={`${common.readMoreAriaPrefix} ${headline}`}
			prefetch={false}
		>
			<figure className="card-container">
				{/* Full-bleed background image */}
				<div className="card-image-wrapper">
					<Image
						className="card-image"
						src={image.url || "/images/placeholder.webp"}
						alt={image.caption || headline || "Article image"}
						fill
						sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 32px), 420px"
						loading="lazy"
						style={{ objectFit: "cover" }}
					/>
				</div>

				{/* Date badge — frosted glass pill, top-left */}
				<div className="card-date-float">
					<span className="day">{day}</span>
					<span className="month">&nbsp;{month}</span>
				</div>

				{/* Overlaid content — sits above the gradient */}
				<figcaption className="card-content">
					<h2 className="card-title">{headline}</h2>
					{content && <p className="card-text">{content}</p>}
					<div className="card-footer">
						<span className="card-read-more">{common.readMore} &rarr;</span>
					</div>
				</figcaption>
			</figure>
		</Link>
	);
};

export default React.memo(BlogPostCard);
