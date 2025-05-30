// frontend/src/pages/forum/ForumHomePage.tsx
import React, { useState, useEffect } from "react";
import "./ForumHomePage.css";
// We will import other components like CreatePostForm, PostFeed later

// Dummy post data for now
const dummyPosts = [
	{
		id: "1",
		title: "How to learn React effectively?",
		author: "UserA",
		votes: 15,
		comments: 3,
		snippet: "Looking for tips and resources...",
	},
	{
		id: "2",
		title: "Best way to manage state in large applications?",
		author: "UserB",
		votes: 22,
		comments: 5,
		snippet: "Context API vs Redux vs Zustand...",
	},
	{
		id: "3",
		title: "Firebase vs Supabase for new projects?",
		author: "UserC",
		votes: 8,
		comments: 2,
		snippet: "Pros and cons discussion...",
	},
];

const ForumHomePage: React.FC = () => {
	// We'll add state for posts, loading, errors etc. later
	// const [posts, setPosts] = useState([]);
	// const [loading, setLoading] = useState(true);

	// useEffect(() => {
	//   // Fetch posts from Firestore/Supabase here
	//   // For now, using dummy data
	//   // setPosts(dummyPosts);
	//   // setLoading(false);
	// }, []);

	return (
		<div className='forum-homepage-container'>
			<header className='forum-header'>
				<h1>Welcome to the Forum!</h1>
				<button className='create-post-button-main'>Ask a Question</button>
			</header>

			<div className='forum-content'>
				<main className='post-feed-area'>
					<h2>Recent Questions</h2>
					{dummyPosts.map((post) => (
						<div key={post.id} className='dummy-post-card'>
							<h3>{post.title}</h3>
							{/* ADDED A META CLASS FOR THIS LINE */}
							<p className='post-meta'>
								By: {post.author} | Votes: {post.votes} | Comments:{" "}
								{post.comments}
							</p>
							<p>{post.snippet}</p>
							{/* <hr /> REMOVED HR, CARD BORDER IS ENOUGH */}
						</div>
					))}
				</main>

				<aside className='forum-sidebar'>
					<h3>Popular Tags</h3>
					<ul>
						<li>React</li>
						<li>Firebase</li>
						<li>JavaScript</li>
						<li>CSS</li>
						<li>Node.js</li>
					</ul>
				</aside>
			</div>
		</div>
	);
};

export default ForumHomePage;
