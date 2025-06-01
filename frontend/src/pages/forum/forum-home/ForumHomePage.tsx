import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebase";
import "./ForumHomePage.css";
import CreatePostForm from "../post-form/CreatePostForm";
import PostCard, { PostData } from "../Posts/PostCard";
import tagColors from "../../../utils/tagColors";

const ForumHomePage: React.FC = () => {
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showModal, setShowModal] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [sortBy, setSortBy] = useState<"timestamp" | "helpfulVoteCount">(
		"timestamp",
	);
	const [activeTag, setActiveTag] = useState<string | null>(null);

	const openModal = () => {
		setIsModalVisible(true);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setTimeout(() => {
			setIsModalVisible(false);
			setFormKey((prev) => prev + 1);
		}, 200);
	};

	useEffect(() => {
		const fetchPosts = async () => {
			setLoading(true);
			const postsRef = collection(db, "forumPosts");

			const q = activeTag
				? query(
						postsRef,
						where("tags", "array-contains", activeTag),
						orderBy(sortBy, "desc"),
				  )
				: query(postsRef, orderBy(sortBy, "desc"));

			const snapshot = await getDocs(q);
			const fetchedPosts = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as PostData[];

			setPosts(fetchedPosts);
			setLoading(false);
		};

		fetchPosts();
	}, [sortBy, activeTag]);

	return (
		<div className={`forum-homepage-container ${showModal ? "blurred" : ""}`}>
			<header className='forum-header'>
				<h1>Welcome to the Forum!</h1>
				<button className='create-post-button-main' onClick={openModal}>
					Ask a Question
				</button>
			</header>

			{isModalVisible && (
				<div className={`modal-overlay ${showModal ? "fade-in" : "fade-out"}`}>
					<div className='modal-content'>
						<button className='close-modal' onClick={closeModal}>
							×
						</button>
						<CreatePostForm key={formKey} onPostSuccess={closeModal} />
					</div>
				</div>
			)}

			<div className='sort-controls'>
				<label htmlFor='sort-select'>Sort by:</label>
				<select
					id='sort-select'
					value={sortBy}
					onChange={(e) =>
						setSortBy(e.target.value as "timestamp" | "helpfulVoteCount")
					}
				>
					<option value='timestamp'>Newest</option>
					<option value='helpfulVoteCount'>Most Helpful</option>
				</select>
			</div>

			<div className='forum-content'>
				<main className='post-feed-area'>
					<h2>Recent Questions</h2>
					{loading && <p>Loading posts...</p>}
					{!loading && posts.length === 0 && (
						<p>No posts yet. Be the first to ask a question!</p>
					)}
					{!loading && posts.length > 0 && (
						<div className='post-list'>
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</main>

				<aside className='forum-sidebar'>
					<h3>Popular Tags</h3>
					<ul className='tag-filter-list'>
						{[
							"Budgeting",
							"Saving",
							"Investing",
							"Credit",
							"Side Hustles",
							"Debt",
							"Freelancing",
							"Real Estate",
							"Taxes",
							"Retirement",
						].map((tag) => {
							const color = tagColors[tag.toLowerCase()] || {
								bg: "#ccc",
								text: "#000",
							};

							return (
								<li
									key={tag}
									style={{
										backgroundColor: color.bg,
										color: color.text,
									}}
									className={`tag-pill ${
										activeTag === tag.toLowerCase() ? "active-tag" : ""
									}`}
									onClick={() => setActiveTag(tag.toLowerCase())}
								>
									{tag}
								</li>
							);
						})}
						{activeTag && (
							<li className='clear-tag' onClick={() => setActiveTag(null)}>
								Clear Filter ✕
							</li>
						)}
					</ul>
				</aside>
			</div>
		</div>
	);
};

export default ForumHomePage;
