import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import tagColors from "../../utils/tagColors";
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
	const router = useRouter();

	const formatTimestamp = (ts: unknown): string => {
		if (!ts) return "Some time ago";
		let date: Date;
		if (ts && typeof (ts as { toDate?: () => Date }).toDate === "function") {
			date = (ts as { toDate: () => Date }).toDate();
		} else if (ts instanceof Date) {
			date = ts;
		} else {
			try {
				date = new Date(ts as string | number | Date);
				if (isNaN(date.getTime())) return "Date unavailable";
			} catch {
				return "Date unavailable";
			}
		}
		const dateStr = date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		const timeStr = date.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
		return `${dateStr}, ${timeStr}`;
	};

	function slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and dashes
			.replace(/\s+/g, "-") // Replace spaces with dashes
			.replace(/-+/g, "-") // Collapse multiple dashes
			.replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
	}

	const postUrl = `/forum/post/${post.slug || slugify(post.title)}`;

	const handleCardClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest("a")) return;
		router.push(postUrl);
	};

	return (
		<article
			className={styles.postCard}
			onClick={handleCardClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					router.push(postUrl);
				}
			}}
		>
			<h3 className={styles.postCardTitle}>
				<span className={styles.postCardTitleLink}>{post.title}</span>
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
			<div
				className={styles.postCardActions}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{auth && db ? (
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
					onClick={(e) => e.stopPropagation()}
				>
					{post.answerCount || 0} Answers
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
