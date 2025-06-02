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
} from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

export type VoteType = "helpful" | "notHelpful";
export type ItemType = "post" | "answer";

/**
 * Retrieves a user's vote for a specific item.
 * @param userId The ID of the user.
 * @param itemId The ID of the item (post or answer).
 * @returns The user's vote type ('helpful', 'notHelpful') or null if no vote exists.
 */
export const getUserVoteForItem = async (
	userId: string,
	itemId: string,
): Promise<VoteType | null> => {
	if (!userId || !itemId) {
		console.warn("getUserVoteForItem: Called with missing userId or itemId.");
		return null;
	}
	const voteDocId = `${userId}_${itemId}`;
	const voteRef = doc(db, "userItemVotes", voteDocId);

	try {
		// console.log(`Fetching user vote: /userItemVotes/${voteDocId}`);
		const voteSnap = await getDoc(voteRef);
		if (voteSnap.exists()) {
			const voteData = voteSnap.data();
			// console.log(`User vote found for ${itemId}:`, voteData.voteType);
			return voteData.voteType as VoteType;
		}
		// console.log(`No user vote found for ${itemId} by user ${userId}`);
		return null;
	} catch (error) {
		console.error(
			`Error fetching user vote for item ${itemId} by user ${userId}:`,
			error,
		);
		throw error;
	}
};

/**
 * Casts, changes, or removes a user's vote for an item.
 * @param userId The ID of the user casting the vote.
 * @param itemId The ID of the item being voted on (post ID or answer ID).
 * @param itemType The type of the item ('post' or 'answer').
 * @param newVoteAction The vote action being performed ('helpful' or 'notHelpful').
 * @param currentVote The user's existing vote on the item, if any.
 * @param itemAuthorId The ID of the author of the item.
 * @param postIdForItem If itemType is 'answer', this is the ID of the parent post.
 */
export const castVote = async (
	userId: string,
	itemId: string,
	itemType: ItemType,
	newVoteAction: VoteType,
	currentVote: VoteType | null,
	itemAuthorId: string | undefined,
	postIdForItem?: string,
): Promise<void> => {
	// Parameter validation
	if (!userId) throw new Error("User ID is required to cast a vote.");
	if (!itemId) throw new Error("Item ID is required to cast a vote.");
	if (!itemType) throw new Error("Item type is required to cast a vote.");
	if (!newVoteAction) throw new Error("New vote action is required.");

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
		voteType: newVoteAction, // This will be the new state of the vote
		timestamp: serverTimestamp(),
	};

	if (currentVote === newVoteAction) {
		// Case 1: User is "un-voting" (clicking the same button again)
		// console.log(`Un-voting: Deleting /userItemVotes/${voteDocId}`);
		batch.delete(userVoteRef);
		if (newVoteAction === "helpful") helpfulIncrementValue = -1;
		else notHelpfulIncrementValue = -1;
	} else {
		// Case 2: User is casting a new vote or changing their existing vote
		// console.log(`Voting/Changing vote: Setting /userItemVotes/${voteDocId} to`, dataForUserItemVote);
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
		// console.log(`Updating item ${itemRef.path} with increments:`, itemUpdateData);
		batch.update(itemRef, itemUpdateData);
	} else {
		// console.log("No change in item vote counts needed for this action.");
	}
	
	// --- Enhanced Debug Logging right before commit ---
	// console.log("--- Batch Commit Details ---");
	// console.log("Attempting to operate on User Vote Ref Path:", userVoteRef.path);
	// if (currentVote === newVoteAction) {
	//     console.log("User Vote Action: DELETE");
	// } else {
	//     console.log("User Vote Action: SET with data:", dataForUserItemVote);
	// }
	// console.log("Attempting to operate on Item Ref Path:", itemRef.path);
	// if (Object.keys(itemUpdateData).length > 0) {
	//     console.log("Item Update Data (increments):", JSON.stringify(itemUpdateData));
	// } else {
	//     console.log("No item count update in this batch.");
	// }
	// console.log("--- End Batch Commit Details ---");


	try {
		await batch.commit();
		// console.log("Vote batch committed successfully.");
	} catch (error) {
		console.error("Error committing vote batch for item:", itemId, "Error:", error);
		// Log more details if possible, including what was in the batch
		// This is where the "Missing or insufficient permissions" would likely originate if it's from Firestore
		throw error;
	}
};