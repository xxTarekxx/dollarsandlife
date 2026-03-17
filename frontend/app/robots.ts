import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/seo/canonical";

/**
 * Generate robots.txt. Allow all language-prefixed paths (/en/, /es/, /ar/, etc.) for indexing.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/auth/action",
					"/forum/create-post",
					"/forum/my-posts",
					"/new-password",
					"/forgot-password",
				],
			},
		],
		sitemap: `${SITE_BASE_URL}/sitemap.xml`,
	};
}
