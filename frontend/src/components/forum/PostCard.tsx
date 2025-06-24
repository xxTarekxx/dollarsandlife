import { Auth } from "firebase/auth"; // Import Auth type
import { Firestore } from "firebase/firestore"; // Import Firestore type
import Link from "next/link"; // Changed import
import React from "react";
import tagColors from "../../utils/tagColors"; // Adjusted path
import styles from "./PostCard.module.css";
import VoteButtons from "./VoteButtons";

export interface PostData {
	id: string;
	title: string;
	authorDisplayName?: string;
	authorId?: string;
	timestamp?: unknown; // Changed from any
	snippet?: string;
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
	tags?: string[];
	slug?: string; // Add slug field
}

interface PostCardProps {
	post: PostData;
	auth: Auth | null; // Can be null if Firebase not yet initialized
	db: Firestore | null; // Can be null
}

const PostCard: React.FC<PostCardProps> = ({ post, auth, db }) => {
	const formatTimestamp = (ts: unknown) => {
		// Changed from any
		if (!ts) return "Some time ago";
		// Check if 'ts' is a Firebase Timestamp object
		if (ts && typeof (ts as { toDate?: () => Date }).toDate === "function") {
			return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
		}
		// Check if 'ts' is already a Date object
		if (ts instanceof Date) {
			return ts.toLocaleDateString();
		}
		// Try to parse if it's a string or number
		try {
			const date = new Date(ts as string | number | Date);
			if (!isNaN(date.getTime())) {
				return date.toLocaleDateString();
			}
		} catch {
			// Fallback if Date constructor fails
		}
		return "Date unavailable";
	};

	function slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and dashes
			.replace(/\s+/g, "-") // Replace spaces with dashes
			.replace(/-+/g, "-") // Collapse multiple dashes
			.replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
	}

	const postUrl = `/forum/post/${slugify(post.title)}`;

	return (
		<article className={styles.postCard}>
			<h3 className={styles.postCardTitle}>
				<Link
					href={postUrl}
					className={styles.postCardTitleLink}
				>
					{post.title}
				</Link>
			</h3>
			<div className={styles.postCardMeta}>
				<span>By: {post.authorDisplayName || "Anonymous"}</span>
				<span>{formatTimestamp(post.timestamp)}</span>
				{post.tags && post.tags.length > 0 && (
					<span>
						<span className={styles.tagLabel}>Tags:</span>
						<span className={styles.tagList}>
							{post.tags?.map((tag) => {
								const color = tagColors[tag.toLowerCase()] || {
									bg: "#ccc",
									text: "#000",
								};
								return (
									<span
										key={tag}
										className={styles.tagPill}
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
			{post.snippet && <p className={styles.postCardSnippet}>{post.snippet}</p>}
			<div className={styles.postCardActions}>
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
					<div className={styles.votePlaceholder}>Voting unavailable...</div>
				)}
				<Link
					href={`${postUrl}#answers`}
					className={styles.postCardViewLink}
				>
					{post.answerCount || 0} Answers
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
