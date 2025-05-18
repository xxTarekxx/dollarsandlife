import React, { useEffect, useState } from "react";

interface Movie {
	title: string;
	year: number;
	poster?: string;
	imdb?: {
		rating?: number;
	};
}

export default function MovieList() {
	const [movies, setMovies] = useState<Movie[]>([]);

	useEffect(() => {
		fetch("http://localhost:5000/api/movies")
			.then((res) => res.json())
			.then((data) => setMovies(data))
			.catch((err) => console.error("Fetch failed:", err));
	}, []);

	return (
		<div>
			<h2>🎬 Movies from MongoDB</h2>
			<ul>
				{movies.map((movie, i) => (
					<li key={i} style={{ marginBottom: "1rem" }}>
						{movie.poster && (
							<img src={movie.poster} alt={movie.title} width={100} />
						)}
						<div>
							<strong>{movie.title}</strong> ({movie.year})<br />
							IMDb: {movie.imdb?.rating ?? "N/A"}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
