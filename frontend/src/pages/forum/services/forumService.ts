// frontend/src/pages/forum/services/forumService.ts
import { db } from "../../../firebase"; // adjust if your firebase.ts is in src/
import { deleteDoc, doc, collection, addDoc, serverTimestamp } from "firebase/firestore";

interface NewPostData {
	title: string;
	content: string;
	tags: string[];
	authorId?: string;
	authorDisplayName?: string;
}

export const createForumPost = async (post: NewPostData) => {
	const postsRef = collection(db, "forumPosts");
	await addDoc(postsRef, {
		...post, // ✅ must include authorId here
		helpfulVoteCount: 0,
		notHelpfulVoteCount: 0,
		commentCount: 0,
		timestamp: serverTimestamp(),
	});
};

export const deleteForumPost = async (postId: string) => {
	const postRef = doc(db, "forumPosts", postId);
	await deleteDoc(postRef);
};
