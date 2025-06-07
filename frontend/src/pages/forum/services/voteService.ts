// frontend/src/pages/forum/voting/voteService.ts
import {
	doc,
	setDoc,
	getDoc,
	deleteDoc,
	updateDoc,
	increment,
	writeBatch,
	serverTimestamp,
	Firestore, // Import Firestore type
} from "firebase/firestore";
// import { db } from "../../../firebase"; // REMOVE direct import

export type VoteType = "helpful" | "notHelpful";
export type ItemType = "post" | "answer";

export const getUserVoteForItem = async (
	db: Firestore, // Accept db as param
	userId: string,
	itemId: string,
): Promise<VoteType | null> => {
	if (!db) throw new Error("Firestore instance is required to get user vote.");
	if (!userId || !itemId) {
		console.warn("getUserVoteForItem: Called with missing userId or itemId.");
		return null;
	}
	const voteDocId = `${userId}_${itemId}`;
	const voteRef = doc(db, "userItemVotes", voteDocId);

	try {
		const voteSnap = await getDoc(voteRef);
		if (voteSnap.exists()) {
			const voteData = voteSnap.data();
			return voteData.voteType as VoteType;
		}
		return null;
	} catch (error) {
		console.error(`Error fetching user vote for item ${itemId} by user ${userId}:`, error);
		throw error;
	}
};

export const castVote = async (
	db: Firestore, // Accept db as param
	userId: string,
	itemId: string,
	itemType: ItemType,
	newVoteAction: VoteType,
	currentVote: VoteType | null,
	itemAuthorId: string | undefined,
	postIdForItem?: string,
): Promise<void> => {
	if (!db) throw new Error("Firestore instance is required to cast vote.");
	if (!userId) throw new Error("User ID is required to cast a vote.");
	if (!itemId) throw new Error("Item ID is required to cast a vote.");
	// ... (rest of the validation and logic as before) ...

	if (userId === itemAuthorId) {
		console.warn("User trying to vote on their own item:", { userId, itemId, itemType });
		throw new Error(`You cannot vote on your own ${itemType}.`);
	}

	const voteDocId = `${userId}_${itemId}`;
	const userVoteRef = doc(db, "userItemVotes", voteDocId);

	let itemRef;
	if (itemType === "post") {
		itemRef = doc(db, "forumPosts", itemId);
	} else if (itemType === "answer") {
		if (!postIdForItem) {
			console.error("castVote: postIdForItem is required for itemType 'answer'.", { itemId });
			throw new Error("Internal error: Parent post ID missing for answer vote.");
		}
		itemRef = doc(db, "forumPosts", postIdForItem, "answers", itemId);
	} else {
		console.error("castVote: Invalid itemType provided.", { itemType });
		throw new Error(`Invalid item type specified: ${itemType}`);
	}

	const batch = writeBatch(db);
	let helpfulIncrementValue = 0;
	let notHelpfulIncrementValue = 0;

	const dataForUserItemVote = {
		userId,
		itemId,
		itemType,
		voteType: newVoteAction,
		timestamp: serverTimestamp(),
	};

	if (currentVote === newVoteAction) {
		batch.delete(userVoteRef);
		if (newVoteAction === "helpful") helpfulIncrementValue = -1;
		else notHelpfulIncrementValue = -1;
	} else {
		batch.set(userVoteRef, dataForUserItemVote);
		if (newVoteAction === "helpful") {
			helpfulIncrementValue = 1;
			if (currentVote === "notHelpful") notHelpfulIncrementValue = -1;
		} else { // newVoteAction === "notHelpful"
			notHelpfulIncrementValue = 1;
			if (currentVote === "helpful") helpfulIncrementValue = -1;
		}
	}

	const itemUpdateData: { [key: string]: any } = {};
	if (helpfulIncrementValue !== 0) {
		itemUpdateData.helpfulVoteCount = increment(helpfulIncrementValue);
	}
	if (notHelpfulIncrementValue !== 0) {
		itemUpdateData.notHelpfulVoteCount = increment(notHelpfulIncrementValue);
	}

	if (Object.keys(itemUpdateData).length > 0) {
		batch.update(itemRef, itemUpdateData);
	}
	
	try {
		await batch.commit();
	} catch (error) {
		console.error("Error committing vote batch for item:", itemId, "Error:", error);
		throw error;
	}
};