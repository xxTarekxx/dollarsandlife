import React, { useEffect, useState, useCallback } from "react";
import "./RssTicker.css";

interface Article {
	title: string;
	link: string;
}

const RssTicker: React.FC = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY;
	const RSS_FEED_URL =
		"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812";
	const REFRESH_INTERVAL = 3780000; // 1 hour 3 minutes

	// Memoized fetch function to ensure stable reference
	const fetchRSS = useCallback(async () => {
		try {
			if (!API_KEY) {
				console.error("Missing API Key: Check your .env file!");
				return;
			}

			console.log("🔄 Fetching RSS Feed...");
			const response = await fetch(
				`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
					RSS_FEED_URL,
				)}&api_key=${API_KEY}`,
			);

			if (!response.ok) throw new Error("Failed to fetch RSS data");

			const data = await response.json();
			if (data.status !== "ok") throw new Error(data.message);

			setArticles(data.items); // Update state with articles
			console.log("✅ RSS Feed Updated");
		} catch (error) {
			console.error("❌ Error fetching RSS feed:", error);
		}
	}, [API_KEY, RSS_FEED_URL]);

	// Effect for fetching RSS feed and managing interval
	useEffect(() => {
		fetchRSS(); // Initial fetch

		const intervalId = setInterval(fetchRSS, REFRESH_INTERVAL);

		// Cleanup on component unmount to avoid redundant intervals
		return () => {
			clearInterval(intervalId);
			console.log("🛑 Interval cleared");
		};
	}, [fetchRSS, REFRESH_INTERVAL]);

	return (
		<div className='rss-ticker'>
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
					<p>Loading latest news...</p>
				)}
			</div>
		</div>
	);
};

export default RssTicker;
