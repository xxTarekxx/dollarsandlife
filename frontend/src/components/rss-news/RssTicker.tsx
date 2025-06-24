import React, { useCallback, useEffect, useState } from "react";

interface Article {
	title: string;
	link: string;
}

const RSS_FEED_URL =
	"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812";
const REFRESH_INTERVAL = 3780000; // 1 hour 3 minutes

const RssTicker: React.FC = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const API_KEY = process.env.NEXT_PUBLIC_RSS2JSON_API_KEY;

	// Fetch RSS Feed
	const fetchRSS = useCallback(async () => {
		if (!API_KEY) {
			// Don't show error in console, just set loading to false
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(
				`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
					RSS_FEED_URL,
				)}&api_key=${API_KEY}`,
			);

			if (!response.ok) throw new Error("Failed to fetch RSS data");

			const data = await response.json();

			if (data.status !== "ok")
				throw new Error(data.message || "RSS fetch error");

			setArticles(data.items);
		} catch (error) {
			console.error("RSS Feed Error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [API_KEY]);

	// Fetch on mount & set refresh interval
	useEffect(() => {
		fetchRSS();

		const intervalId = setInterval(fetchRSS, REFRESH_INTERVAL);

		return () => {
			clearInterval(intervalId);
		};
	}, [fetchRSS]);

	// Don't render anything if no API key is configured
	if (!API_KEY) {
		return null;
	}

	return (
		<div className='rss-ticker' aria-label='Latest Financial News Ticker'>
			<div className='rss-ticker-content'>
				{isLoading ? (
					<p>Loading latest financial news...</p>
				) : articles.length > 0 ? (
					articles.map((article, index) => (
						<a
							key={index}
							href={article.link}
							target='_blank'
							rel='noopener noreferrer'
						>
							• {article.title} •
						</a>
					))
				) : (
					<p>No news available at the moment.</p>
				)}
			</div>
		</div>
	);
};

export default RssTicker;
