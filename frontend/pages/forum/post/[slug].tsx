// frontend/pages/forum/post/[postId].tsx
"use client"; // Keep for client-side interactions like modals, answer submission, voting
import { Auth, onAuthStateChanged, User } from "firebase/auth"; // Add onAuthStateChanged and User
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	Firestore,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AuthPromptModal from "../../../src/auth/AuthPromptModal";
import VoteButtons from "../../../src/components/forum/VoteButtons";
import { initializeFirebaseAndGetServices } from "../../../src/firebase";
import { deleteForumPost as deleteForumPostService } from "../../../src/services/forum/forumService";
import tagColors from "../../../src/utils/tagColors";
import { sanitizeAndTruncateHTML } from "../../../src/utils/sanitization.server";

interface PostData {
	// Ensure this matches the structure from your Firestore and what PostCard expects
	id: string;
	title: string;
	content: string;
	authorDisplayName: string;
	authorId?: string;
	timestamp: unknown;
	tags: string[];
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
	metaDescription?: string;
}
interface AnswerData {
	id: string;
	content: string;
	authorDisplayName: string;
	authorId: string;
	postId: string; // Keep this to know which post the answer belongs to
	timestamp: unknown;
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
}

const AuthenticatedViewPostPageContent: React.FC<{
	postId: string;
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	initialPostData?: PostData | null; // Added
	ssrError?: string; // Added
}> = ({ postId, firebaseAuth, firebaseDb, initialPostData, ssrError }) => {
	const router = useRouter();
	const [post, setPost] = useState<PostData | null>(initialPostData || null); // Initialize with SSR data
	const [answers, setAnswers] = useState<AnswerData[]>([]);
	const [newAnswerContent, setNewAnswerContent] = useState("");
	// setLoadingData to true only if initialPostData is not available, to trigger client-side fetch for post
	const [loadingData, setLoadingData] = useState<boolean>(!initialPostData);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

	// Replace useAuthState with manual state management
	const [user, setUser] = useState<User | null>(null);
	const [authLoadingHook, setAuthLoadingHook] = useState(true);

	// Manual auth state listener
	useEffect(() => {
		if (!firebaseAuth) return;

		const unsubscribe = onAuthStateChanged(
			firebaseAuth,
			(user) => {
				setUser(user);
				setAuthLoadingHook(false);
			},
			(error) => {
				console.error("Auth error:", error);
				setAuthLoadingHook(false);
			}
		);

		return () => unsubscribe();
	}, [firebaseAuth]);

	const isPostAuthor = user?.uid === post?.authorId;

	useEffect(() => {
		if (!firebaseDb) {
			setLoadingData(false);
			if (ssrError) toast.error(ssrError); // Show SSR error if DB isn't even available
			return;
		}

		const fetchPostAndAnswers = async () => {
			// Only fetch main post if initialPostData wasn't provided or there was an SSR error
			if (!initialPostData && !ssrError) {
				setLoadingData(true); // For main post fetch
				try {
					const postDocRef = doc(firebaseDb, "forumPosts", postId);
					const postSnapshot = await getDoc(postDocRef);
					if (postSnapshot.exists()) {
						setPost({
							id: postSnapshot.id,
							...postSnapshot.data(),
						} as PostData);
					} else {
						toast.error("Post not found (client-side).");
						setPost(null);
						// router.replace('/forum/not-found'); // Or handle differently
					}
				} catch {
					console.error("ViewPostPage: Error loading post (client-side):");
					toast.error("Error loading post content (client-side).");
					setPost(null);
				}
			} else if (ssrError && !initialPostData) {
				// If there was an SSR error for the main post, show it and don't try to refetch post.
				// Answers will still be fetched.
				toast.error(`Error loading post: ${ssrError}`);
			}

			// Always fetch answers client-side for now
			// Could also be moved to SSR if desired, but often comments/answers are more dynamic
			try {
				const answersCollectionRef = collection(
					firebaseDb,
					"forumPosts",
					postId,
					"answers",
				);
				const answersQuery = query(
					answersCollectionRef,
					orderBy("timestamp", "desc"),
				);
				const answersSnapshot = await getDocs(answersQuery);
				setAnswers(
					answersSnapshot.docs.map((d) => ({
						id: d.id,
						...d.data(),
					})) as AnswerData[],
				);
			} catch {
				console.error("ViewPostPage: Error loading answers (client-side):");
				toast.error("Error loading answers.");
			} finally {
				// setLoadingData to false only after all necessary client-side fetches are done
				// If initialPostData was provided, main post loading is already "done".
				if (!initialPostData || ssrError) {
					setLoadingData(false);
				} else {
					// If post came from SSR, we might only be loading answers
					// For simplicity, let's assume loading is done once answers are attempted
					setLoadingData(false);
				}
			}
		};

		fetchPostAndAnswers();
	}, [postId, firebaseDb, initialPostData, ssrError]); // Add initialPostData & ssrError to dependencies

	const handleSubmitAnswer = async () => {
		if (!postId || !firebaseDb) {
			toast.error(
				"Cannot submit answer: Services not ready or Post ID is missing.",
			);
			return;
		}
		if (!user) {
			setShowAuthModal(true);
			return;
		}
		if (!newAnswerContent.trim()) {
			toast.error("Answer cannot be empty.");
			return;
		}
		setIsSubmittingAnswer(true);

		const answerDataToSubmit = {
			content: newAnswerContent.trim(),
			authorId: user.uid,
			postId: postId, // Important for context
			timestamp: serverTimestamp(),
			authorDisplayName: user.displayName || "Anonymous User",
			helpfulVoteCount: 0,
			notHelpfulVoteCount: 0,
		};

		try {
			const answersCollectionRef = collection(
				firebaseDb,
				"forumPosts",
				postId,
				"answers",
			);
			const newAnswerDocRef = await addDoc(
				answersCollectionRef,
				answerDataToSubmit,
			);
			const optimisticAnswer: AnswerData = {
				...answerDataToSubmit,
				id: newAnswerDocRef.id,
				timestamp: new Date(),
			};
			setAnswers((prevAnswers) => [optimisticAnswer, ...prevAnswers]);
			setNewAnswerContent("");

			if (post) {
				const postDocRef = doc(firebaseDb, "forumPosts", postId);
				await updateDoc(postDocRef, {
					answerCount: (post.answerCount || 0) + 1,
				});
				setPost((prevPost) =>
					prevPost
						? { ...prevPost, answerCount: (prevPost.answerCount || 0) + 1 }
						: null,
				);
			}
			toast.success("Answer posted successfully!");
		} catch (error: unknown) {
			console.error("ViewPostPage: Error posting answer:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to post answer.",
			);
		} finally {
			setIsSubmittingAnswer(false);
		}
	};

	const handleDeletePost = async () => {
		if (!post?.id || !firebaseDb) return;
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		try {
			await deleteForumPostService(firebaseDb, post.id);
			toast.success("Post deleted successfully!");
			router.push("/forum"); // Changed from navigate
		} catch {
			toast.error("Failed to delete post.");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (!postId || !answerId || !firebaseDb) return;
		if (!window.confirm("Are you sure you want to delete this answer?")) return;
		try {
			await deleteDoc(
				doc(firebaseDb, "forumPosts", postId, "answers", answerId),
			);
			setAnswers((prevAnswers) =>
				prevAnswers.filter((ans) => ans.id !== answerId),
			);
			if (
				post &&
				typeof post.answerCount === "number" &&
				post.answerCount > 0
			) {
				const postDocRef = doc(firebaseDb, "forumPosts", postId);
				await updateDoc(postDocRef, { answerCount: post.answerCount - 1 });
				setPost((prevPost) =>
					prevPost
						? { ...prevPost, answerCount: prevPost.answerCount - 1 }
						: null,
				);
			}
			toast.success("Answer deleted successfully.");
		} catch (e: unknown) {
			toast.error(e instanceof Error ? e.message : "Failed to delete answer.");
		}
	};

	if (authLoadingHook || loadingData) {
		// loadingData now correctly reflects client-side needs
		return (
			<div className='page-loading-indicator'>Loading post details...</div>
		);
	}

	// If there was an SSR error for the post and no client-side fallback succeeded
	if (ssrError && !post) {
		return (
			<div className='page-error-indicator'>
				<Head>
					<title>Error Loading Post</title>
				</Head>
				Error: {ssrError}
			</div>
		);
	}

	if (!post) {
		// If no SSR data, no client-side data, and no SSR error, means not found or other issue
		return (
			<div className='page-error-indicator'>
				<Head>
					<title>Post Not Found</title>
				</Head>
				Post not found or error loading data.
			</div>
		);
	}

	const pageTitle = post.title
		? `${post.title} | Dollars & Life Forum`
		: "Forum Post | Dollars & Life";

	function slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and dashes
			.replace(/\s+/g, "-") // Replace spaces with dashes
			.replace(/-+/g, "-") // Collapse multiple dashes
			.replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
	}

	return (
		<>
			<Head>
				<title>{`${Array.isArray(pageTitle) ? pageTitle.join("") : pageTitle
					}`}</title>
				<meta name='description' content={post.metaDescription} />
				{post && (
					<link
						rel='canonical'
						href={`https://www.dollarsandlife.com/forum/post/${slugify(
							post.title,
						)}`}
					/>
				)}
			</Head>
			<div className={`view-post-container ${showAuthModal ? "blurred" : ""}`}>
				<h1>{post.title}</h1>
				<div className='post-meta-row'>
					<div className='post-meta-info-group'>
						<span>By: {post.authorDisplayName || "Anonymous User"}</span>
						<span className='post-meta-separator-mobile'> • </span>
						<span>
							{(() => {
								const t = post.timestamp;
								if (
									t &&
									typeof t === "object" &&
									"seconds" in t &&
									typeof t.seconds === "number"
								) {
									return new Date(t.seconds * 1000).toLocaleDateString();
								} else if (t instanceof Date) {
									return t.toLocaleDateString();
								} else {
									return "Date unavailable";
								}
							})()}
						</span>
						<span className='post-meta-separator-mobile'> • </span>
						<span>{post.answerCount || 0} Answers</span>
					</div>
					{isPostAuthor && (
						<button
							className='delete-post-button'
							onClick={handleDeletePost}
							disabled={!firebaseDb}
						>
							Delete Post 🗑️
						</button>
					)}
				</div>

				<div
					className='post-content'
					dangerouslySetInnerHTML={{ __html: post.content }}
				></div>

				{post.tags && post.tags.length > 0 && (
					<div className='post-tags'>
						{post.tags.map((tag) => {
							const T_color = tagColors[tag.toLowerCase()] || {
								bg: "#e9ecef",
								text: "#495057",
							};
							return (
								<span
									key={tag}
									className='tag-pill'
									style={{
										backgroundColor: T_color.bg,
										color: T_color.text,
										borderColor:
											T_color.bg !== "#e9ecef" ? T_color.bg : "#dee2e6",
									}}
								>
									{tag.replace(/\b\w/g, (l) => l.toUpperCase())}
								</span>
							);
						})}
					</div>
				)}

				<div className='vote-buttons-wrapper-viewpost'>
					<VoteButtons
						itemId={post.id}
						initialHelpfulVotes={post.helpfulVoteCount}
						initialNotHelpfulVotes={post.notHelpfulVoteCount}
						itemType='post'
						itemAuthorId={post.authorId}
						auth={firebaseAuth}
						db={firebaseDb!}
					/>
				</div>

				<div className='answer-form'>
					<h3>Post Your Answer</h3>
					{user ? (
						<>
							<textarea
								placeholder='Share your knowledge...'
								value={newAnswerContent}
								onChange={(e) => setNewAnswerContent(e.target.value)}
								rows={5}
								disabled={isSubmittingAnswer || !firebaseDb}
							/>
							<button
								onClick={handleSubmitAnswer}
								disabled={
									!newAnswerContent.trim() || isSubmittingAnswer || !firebaseDb
								}
							>
								{isSubmittingAnswer ? "Submitting..." : "Post Answer"}
							</button>
						</>
					) : (
						<div className='answer-form-prompt'>
							<p>
								Please{" "}
								<button
									className='link-button'
									onClick={() => setShowAuthModal(true)}
								>
									{" "}
									log in{" "}
								</button>{" "}
								or{" "}
								<button
									className='link-button'
									onClick={() => setShowAuthModal(true)}
								>
									{" "}
									sign up{" "}
								</button>{" "}
								to post an answer.
							</p>
						</div>
					)}
				</div>

				<div className='answers-section' id='answers'>
					<h3>{(answers && answers.length) || 0} Answers</h3>
					{answers && answers.length > 0 ? (
						<div className='answers-list'>
							{answers.map((ans) => (
								<div key={ans.id} className='answer-card'>
									<div className='answer-text'>{ans.content}</div>
									<div className='answer-meta'>
										<span>By: {ans.authorDisplayName || "Anonymous User"}</span>
										<span>
											{(() => {
												const t = ans.timestamp;
												if (
													t &&
													typeof t === "object" &&
													"seconds" in t &&
													typeof t.seconds === "number"
												) {
													return new Date(
														t.seconds * 1000,
													).toLocaleDateString();
												} else if (t instanceof Date) {
													return t.toLocaleDateString();
												} else {
													return "A moment ago";
												}
											})()}
										</span>
										{user?.uid === ans.authorId && (
											<button
												className='delete-answer-button'
												onClick={() => handleDeleteAnswer(ans.id)}
												disabled={!firebaseDb}
											>
												Delete ❌
											</button>
										)}
									</div>
									<div className='vote-buttons-wrapper-answer'>
										<VoteButtons
											itemId={ans.id}
											initialHelpfulVotes={ans.helpfulVoteCount || 0}
											initialNotHelpfulVotes={ans.notHelpfulVoteCount || 0}
											itemType='answer'
											itemAuthorId={ans.authorId}
											postIdForItem={postId}
											auth={firebaseAuth}
											db={firebaseDb!}
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className='no-answers-yet'>
							No answers yet. Be the first to respond!
						</p>
					)}
				</div>
			</div>
			{showAuthModal && (
				<AuthPromptModal
					onClose={() => setShowAuthModal(false)}
					auth={firebaseAuth}
				/>
			)}
		</>
	);
};

// PostData interface is defined above
export const getServerSideProps: GetServerSideProps = async (context) => {
	const { slug } = context.params || {};
	if (!slug || typeof slug !== "string") {
		return { notFound: true };
	}

	function slugify(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and dashes
			.replace(/\s+/g, "-") // Replace spaces with dashes
			.replace(/-+/g, "-") // Collapse multiple dashes
			.replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
	}

	try {
		const { collection, getDocs, doc, getDoc } = await import(
			"firebase/firestore"
		);
		const { initializeFirebaseAndGetServices } = await import(
			"../../../src/firebase"
		);
		const { db } = await initializeFirebaseAndGetServices();

		// If the slug param looks like a Firestore ID, fetch by ID and redirect
		if (slug.length > 20 && /^[a-zA-Z0-9]+$/.test(slug)) {
			const postDocRef = doc(db, "forumPosts", slug);
			const postDoc = await getDoc(postDocRef);
			if (postDoc.exists()) {
				const postData = postDoc.data();
				const generatedSlug = slugify(postData.title || "");
				if (generatedSlug) {
					return {
						redirect: {
							destination: `/forum/post/${generatedSlug}`,
							permanent: true,
						},
					};
				}
				// If no title, just show the post
				const initialPostData = { id: postDoc.id, ...postData };
				return { props: { initialPostData } };
			} else {
				return { notFound: true };
			}
		}

		// Otherwise, treat as slug: fetch all posts, find by slugified title
		const postsRef = collection(db, "forumPosts");
		const snapshot = await getDocs(postsRef);
		let found = null;
		for (const docSnap of snapshot.docs) {
			const data = docSnap.data();
			const generatedSlug = slugify(data.title || "");
			if (generatedSlug === slug) {
				found = { id: docSnap.id, ...data };
				break;
			}
		}
		if (found) {
			(found as PostData).metaDescription = sanitizeAndTruncateHTML((found as PostData).content, 160);
			return { props: { initialPostData: found } };
		}
		return { notFound: true };
	} catch (error) {
		console.error(
			"getServerSideProps: Error in getServerSideProps for forum post by slug:",
			error,
		);
		return {
			props: {
				initialPostData: null,
				error: "Server error fetching post by slug.",
			},
		};
	}
};

interface ViewPostPageProps {
	initialPostData?: PostData | null;
	error?: string; // Renamed from ssrError for clarity in this scope
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({
	initialPostData,
	error: ssrError,
}) => {
	const router = useRouter();
	const { postId } = router.query; // Still needed for client-side logic like answer submission if postId isn't passed down further

	const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
	const [firebaseDb, setFirebaseDb] = useState<Firestore | null>(null);
	const [firebaseInitialized, setFirebaseInitialized] = useState(false);
	const [firebaseError, setFirebaseError] = useState<Error | null>(null);

	useEffect(() => {
		initializeFirebaseAndGetServices()
			.then(
				({
					auth: initializedAuth,
					db: initializedDb,
				}: {
					auth: Auth;
					db: Firestore;
				}) => {
					setFirebaseAuth(initializedAuth);
					setFirebaseDb(initializedDb);
					setFirebaseInitialized(true);
				},
			)
			.catch((err: Error) => {
				// Renamed error to err to avoid conflict
				console.error("ViewPostPage: Firebase initialization failed:", err);
				setFirebaseError(err);
				setFirebaseInitialized(true);
			});
	}, []);

	if (!router.isReady && !initialPostData && !ssrError) {
		// If no SSR data, wait for router
		return <div className='page-loading-indicator'>Loading router...</div>;
	}

	const currentPostId =
		typeof postId === "string" ? postId : initialPostData?.id;

	if (!currentPostId) {
		// This case should ideally be caught by getServerSideProps notFound,
		// but as a fallback if client-side routing somehow lands here without a postId.
		return (
			<div className='page-error-indicator'>
				Error: Post ID is missing or invalid.
			</div>
		);
	}

	if (!firebaseInitialized) {
		return (
			<div className='page-loading-indicator'>Initializing services...</div>
		);
	}

	if (firebaseError) {
		return (
			<div className='page-error-indicator'>
				Error initializing Firebase: {firebaseError.message}. Please try
				refreshing.
			</div>
		);
	}

	if (!firebaseAuth) {
		return (
			<div className='page-error-indicator'>
				Authentication service could not be loaded. Please try refreshing.
			</div>
		);
	}

	return (
		<AuthenticatedViewPostPageContent
			postId={currentPostId} // Use derived currentPostId
			firebaseAuth={firebaseAuth}
			firebaseDb={firebaseDb}
			initialPostData={initialPostData}
			ssrError={ssrError}
		/>
	);
};

export default ViewPostPage;
