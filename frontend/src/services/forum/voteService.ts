// frontend/src/services/forum/voteService.ts // Updated path comment
import {
	doc,
	Firestore,
	getDoc,
	runTransaction
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
	db: Firestore, // db is now a required parameter
	userId: string,
	itemId: string,
	itemType: ItemType,
	newVoteStatus: VoteType,
	previousVoteStatus: VoteType | null,
	authorId?: string,
	postIdForItem?: string,
) => {
	if (!authorId) {
		return;
	}

	const itemRef = doc(
		db,
		itemType === "post" ? "forumPosts" : `forumPosts/${postIdForItem}/answers`,
		itemId,
	);
	// FIX: Use userItemVotes/{userId}_{itemId} for vote storage
	const voteDocId = `${userId}_${itemId}`;
	const userVoteRef = doc(db, "userItemVotes", voteDocId);
	const authorRef = doc(db, "users", authorId);

	await runTransaction(db, async (transaction) => {
		const itemDoc = await transaction.get(itemRef);
		const userVoteDoc = await transaction.get(userVoteRef);
		const authorDoc = await transaction.get(authorRef);

		if (!itemDoc.exists()) {
			throw new Error("Item not found");
		}

		const itemData = itemDoc.data();
		const voteData = userVoteDoc.exists() ? userVoteDoc.data() : null;
		const authorData = authorDoc.exists()
			? authorDoc.data()
			: { totalHelpfulVotes: 0, totalNotHelpfulVotes: 0 };

		let helpfulIncrement = 0;
		let notHelpfulIncrement = 0;
		let authorHelpfulIncrement = 0;
		let authorNotHelpfulIncrement = 0;

		// Re-calculating increments based on the change in vote
		if (newVoteStatus !== previousVoteStatus) {
			// Undoing the previous vote's effect
			if (previousVoteStatus === "helpful") {
				helpfulIncrement--;
				authorHelpfulIncrement--;
			} else if (previousVoteStatus === "notHelpful") {
				notHelpfulIncrement--;
				authorNotHelpfulIncrement--;
			}

			// Applying the new vote's effect
			if (newVoteStatus === "helpful") {
				helpfulIncrement++;
				authorHelpfulIncrement++;
			} else if (newVoteStatus === "notHelpful") {
				notHelpfulIncrement++;
				authorNotHelpfulIncrement++;
			}
		} else {
			// This case means un-voting
			if (newVoteStatus === "helpful") {
				helpfulIncrement--;
				authorHelpfulIncrement--;
			} else if (newVoteStatus === "notHelpful") {
				notHelpfulIncrement--;
				authorNotHelpfulIncrement--;
			}
		}

		transaction.update(itemRef, {
			helpfulVoteCount: (itemData.helpfulVoteCount || 0) + helpfulIncrement,
			notHelpfulVoteCount:
				(itemData.notHelpfulVoteCount || 0) + notHelpfulIncrement,
		});

		if (voteData && newVoteStatus === previousVoteStatus) {
			transaction.delete(userVoteRef);
		} else {
			transaction.set(
				userVoteRef,
				{
					voteType: newVoteStatus,
					itemId: itemId,
					itemType: itemType,
					...(postIdForItem && { postId: postIdForItem }),
					userId: userId, // Ensure userId is set for Firestore rules
					timestamp: new Date(), // Add timestamp for Firestore rules
				},
				{ merge: true },
			);
		}

		// set with merge: true so author doc is created if it doesn't exist yet
		transaction.set(
			authorRef,
			{
				totalHelpfulVotes:
					(authorData.totalHelpfulVotes || 0) + authorHelpfulIncrement,
				totalNotHelpfulVotes:
					(authorData.totalNotHelpfulVotes || 0) + authorNotHelpfulIncrement,
			},
			{ merge: true },
		);
	});
};
