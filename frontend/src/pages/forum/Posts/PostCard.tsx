import React from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";
import VoteButtons from "../voting/VoteButtons";
import tagColors from "../../../utils/tagColors";
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
}
const PostCard: React.FC<PostCardProps> = ({ post }) => {
	const formatTimestamp = (ts: any) => {
		if (!ts) return "Some time ago";
		if (ts.toDate) return ts.toDate().toLocaleDateString();
		if (ts instanceof Date) return ts.toLocaleDateString();
		return new Date(ts).toLocaleDateString();
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
				<VoteButtons
					itemId={post.id}
					initialHelpfulVotes={post.helpfulVoteCount}
					initialNotHelpfulVotes={post.notHelpfulVoteCount}
					itemType='post'
					itemAuthorId={post.authorId} // <-- FIXED: Pass authorId
				/>
				<Link
					to={`/forum/post/${post.id}#answers`}
					className='post-card-view-link'
				>
					{post.answerCount} Answers
				</Link>
			</div>
		</article>
	);
};

export default PostCard;
