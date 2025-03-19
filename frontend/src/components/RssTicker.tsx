import React, { useEffect, useState, useCallback } from "react";
import "./RssTicker.css";

interface Article {
	title: string;
	link: string;
}

const RSS_FEED_URL =
	"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812";
const REFRESH_INTERVAL = 3780000; // 1 hour 3 minutes

const RssTicker: React.FC = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY;

	// Fetch RSS Feed
	const fetchRSS = useCallback(async () => {
		if (!API_KEY) {
			console.error("❌ Missing API Key: Check your .env file!");
			return;
		}

		try {
			console.log("🔄 Fetching RSS Feed...");

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
			console.log("✅ RSS Feed Updated");
		} catch (error) {
			console.error("❌ RSS Feed Error:", error);
		}
	}, [API_KEY]);

	// Fetch on mount & set refresh interval
	useEffect(() => {
		fetchRSS();

		const intervalId = setInterval(fetchRSS, REFRESH_INTERVAL);

		return () => {
			clearInterval(intervalId);
			console.log("🛑 RSS Interval cleared");
		};
	}, [fetchRSS]);

	return (
		<div className='rss-ticker' aria-label='Latest Financial News Ticker'>
			<div className='rss-ticker-content'>
				{articles.length > 0 ? (
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
					<p>Loading latest financial news...</p>
				)}
			</div>
		</div>
	);
};

export default RssTicker;
