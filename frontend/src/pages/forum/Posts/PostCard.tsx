import React from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";
import VoteButtons from "../voting/VoteButtons";
import tagColors from "../../../utils/tagColors";
import { Auth } from "firebase/auth"; // Import Auth type
import { Firestore } from "firebase/firestore"; // Import Firestore type

export interface PostData {
	id: string;
	title: string;
	authorDisplayName?: string;
	authorId?: string;
	timestamp?: any;
	snippet?: string;
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
	tags?: string[];
}

interface PostCardProps {
	post: PostData;
	auth: Auth | null; // Can be null if Firebase not yet initialized
	db: Firestore | null; // Can be null
}

const PostCard: React.FC<PostCardProps> = ({ post, auth, db }) => {
	const formatTimestamp = (ts: any) => {
		if (!ts) return "Some time ago";
		// Check if 'ts' is a Firebase Timestamp object
		if (ts && typeof ts.toDate === "function") {
			return ts.toDate().toLocaleDateString();
		}
		// Check if 'ts' is already a Date object
		if (ts instanceof Date) {
			return ts.toLocaleDateString();
		}
		// Try to parse if it's a string or number (less ideal)
		const date = new Date(ts);
		if (!isNaN(date.getTime())) {
			return date.toLocaleDateString();
		}
		return "Date unavailable";
	};

	return (
		<article className='post-card'>
			<h3 className='post-card-title'>
				<Link to={`/forum/post/${post.id}`} className='post-card-title-link'>
					{post.title}
				</Link>
			</h3>
			<div className='post-card-meta'>
				<span>By: {post.authorDisplayName || "Anonymous"}</span>
				<span>{formatTimestamp(post.timestamp)}</span>
				{post.tags && post.tags.length > 0 && (
					<span>
						<span className='tag-label'>Tags:</span>
						<span className='tag-list'>
							{post.tags?.map((tag) => {
								const color = tagColors[tag.toLowerCase()] || {
									bg: "#ccc",
									text: "#000",
								};
								return (
									<span
										key={tag}
										className='tag-pill'
										style={{
											backgroundColor: color.bg,
											color: color.text,
										}}
									>
										{tag.replace(/\b\w/g, (l) => l.toUpperCase())}
									</span>
								);
							})}
						</span>
					</span>
				)}
			</div>
			{post.snippet && <p className='post-card-snippet'>{post.snippet}</p>}
			<div className='post-card-actions'>
				{auth && db ? ( // Only render VoteButtons if auth and db are available
					<VoteButtons
						itemId={post.id}
						initialHelpfulVotes={post.helpfulVoteCount}
						initialNotHelpfulVotes={post.notHelpfulVoteCount}
						itemType='post'
						itemAuthorId={post.authorId}
						auth={auth} // Pass auth instance
						db={db} // Pass db instance
					/>
				) : (
					<div className='vote-placeholder'>Voting unavailable...</div>
				)}
				<Link
					to={`/forum/post/${post.id}#answers`}
					className='post-card-view-link'
				>
					{post.answerCount || 0} Answers
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
