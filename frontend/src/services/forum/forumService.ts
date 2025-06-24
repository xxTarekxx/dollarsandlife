// frontend/src/services/forum/forumService.ts // Updated path comment
// import { db } from "../../../firebase"; // REMOVE direct import
import { Firestore, deleteDoc, doc, collection, addDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore type

interface NewPostData {
	title: string;
	content: string;
	tags: string[];
	authorId?: string;
	authorDisplayName?: string;
}

export const createForumPost = async (db: Firestore, post: NewPostData) => { // Accept db as param
	if (!db) throw new Error("Firestore instance is required to create a forum post.");
	const postsRef = collection(db, "forumPosts");
	await addDoc(postsRef, {
		...post,
		helpfulVoteCount: 0,
		notHelpfulVoteCount: 0,
		answerCount: 0, // Changed from commentCount to answerCount for consistency
		timestamp: serverTimestamp(),
	});
};

export const deleteForumPost = async (db: Firestore, postId: string) => { // Accept db as param
	if (!db) throw new Error("Firestore instance is required to delete a forum post.");
	const postRef = doc(db, "forumPosts", postId);
	await deleteDoc(postRef);
};
