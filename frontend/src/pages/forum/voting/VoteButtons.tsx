// frontend/src/pages/forum/voting/VoteButtons.tsx
import React, { useState, useEffect, useCallback } from "react";
import "./VoteButtons.css";
import { auth } from "../../../firebase"; // Adjust path if needed
import { onAuthStateChanged, User } from "firebase/auth";
import {
	castVote,
	getUserVoteForItem,
	VoteType,
	ItemType,
} from "../services/voteService";
import toast from "react-hot-toast";
interface VoteButtonsProps {
	itemId: string;
	initialHelpfulVotes: number;
	initialNotHelpfulVotes: number;
	itemType: ItemType;
	itemAuthorId?: string; // ID of the author of the item (post or answer)
	postIdForItem?: string; // Required if itemType is 'answer', represents the parent post ID
}
const VoteButtons: React.FC<VoteButtonsProps> = ({
	itemId,
	initialHelpfulVotes,
	initialNotHelpfulVotes,
	itemType,
	itemAuthorId,
	postIdForItem,
}) => {
	const [helpfulVotes, setHelpfulVotes] = useState<number>(initialHelpfulVotes);
	const [notHelpfulVotes, setNotHelpfulVotes] = useState<number>(
		initialNotHelpfulVotes,
	);
	const [currentUserVote, setCurrentUserVote] = useState<VoteType | null>(null);
	const [isLoadingVote, setIsLoadingVote] = useState<boolean>(true);
	const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	useEffect(() => {
		setHelpfulVotes(initialHelpfulVotes);
		setNotHelpfulVotes(initialNotHelpfulVotes);
	}, [initialHelpfulVotes, initialNotHelpfulVotes]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			if (user && itemId) {
				setIsLoadingVote(true);
				getUserVoteForItem(user.uid, itemId)
					.then((vote) => {
						setCurrentUserVote(vote);
					})
					.catch((err) => {
						console.error("Error fetching user's current vote:", err);
					})
					.finally(() => {
						setIsLoadingVote(false);
					});
			} else {
				setCurrentUserVote(null);
				setIsLoadingVote(false);
			}
		});
		return () => unsubscribe();
	}, [itemId]); // Removed currentUser dependency to avoid re-fetching on every currentUser object change if only uid matters

	const handleFeedback = useCallback(
		async (feedbackType: VoteType) => {
			if (!currentUser) {
				toast.error("Please log in to vote.");
				// Consider calling a global modal open function here if available
				return;
			}

			if (currentUser.uid === itemAuthorId) {
				// This check should ideally prevent this function from being called
				// by not rendering the buttons for the author, but as a safeguard:
				toast.error("You cannot vote on your own " + itemType + ".");
				return;
			}

			if (isSubmittingVote) return;
			setIsSubmittingVote(true);

			const previousHelpfulVotes = helpfulVotes;
			const previousNotHelpfulVotes = notHelpfulVotes;
			const previousUserVoteStatus = currentUserVote;

			let newHelpful = helpfulVotes;
			let newNotHelpful = notHelpfulVotes;
			let newVoteStatusForUI: VoteType | null = null;

			if (feedbackType === currentUserVote) {
				if (feedbackType === "helpful") newHelpful--;
				else newNotHelpful--;
				newVoteStatusForUI = null;
			} else {
				if (feedbackType === "helpful") {
					newHelpful++;
					if (currentUserVote === "notHelpful") newNotHelpful--;
				} else {
					newNotHelpful++;
					if (currentUserVote === "helpful") newHelpful--;
				}
				newVoteStatusForUI = feedbackType;
			}

			setHelpfulVotes(newHelpful);
			setNotHelpfulVotes(newNotHelpful);
			setCurrentUserVote(newVoteStatusForUI);

			try {
				// castVote MUST update the parent item's (post/answer) vote counts in Firestore
				await castVote(
					currentUser.uid,
					itemId,
					itemType,
					feedbackType,
					previousUserVoteStatus,
					itemAuthorId, // Pass itemAuthorId (for potential checks in castVote, not strictly needed for vote logic)
					itemType === "answer" ? postIdForItem : undefined, // Pass parent postId if item is an answer
				);
				// If castVote successfully updates Firestore and returns new counts, you could use them.
				// Otherwise, rely on Firestore listeners or re-fetch to get authoritative counts.
				// For now, optimistic updates are kept.
			} catch (error: any) {
				console.error("Error submitting vote:", error);
				toast.error(
					error.message || "Failed to submit vote. Please try again.",
				);
				setHelpfulVotes(previousHelpfulVotes);
				setNotHelpfulVotes(previousNotHelpfulVotes);
				setCurrentUserVote(previousUserVoteStatus);
			} finally {
				setIsSubmittingVote(false);
			}
		},
		[
			currentUser,
			itemAuthorId,
			itemType,
			isSubmittingVote,
			helpfulVotes,
			notHelpfulVotes,
			currentUserVote,
			itemId,
			postIdForItem,
		],
	);

	const totalVotes = helpfulVotes + notHelpfulVotes;
	const helpfulPercentage =
		totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 0;

	// Hide voting buttons if the current user is the author of the item.
	// Show stats regardless (or conditionally based on your preference).
	if (itemAuthorId && currentUser && itemAuthorId === currentUser.uid) {
		return (
			<div className='feedback-buttons-container is-author'>
				{totalVotes > 0 && (
					<div className='helpfulness-stat'>
						<p className='helpfulness-stat-text'>
							{helpfulVotes} of {totalVotes} user{totalVotes === 1 ? "" : "s"}{" "}
							found this helpful.
						</p>
						<div className='helpfulness-bar-container'>
							<div
								className='helpfulness-bar-foreground'
								style={{ width: `${helpfulPercentage}%` }}
							></div>
						</div>
					</div>
				)}
				{totalVotes === 0 && !isLoadingVote && (
					<p className='helpfulness-stat-text'>
						No votes yet (this is your {itemType}).
					</p>
				)}
				{isLoadingVote && (
					<p className='helpfulness-stat-text'>Loading stats...</p>
				)}
			</div>
		);
	}

	const commonButtonProps = {
		disabled: isSubmittingVote || isLoadingVote || !currentUser,
	};

	return (
		<div className='feedback-buttons-container'>
			<div className='feedback-actions'>
				<button
					onClick={() => handleFeedback("helpful")}
					className={`feedback-button helpful ${
						currentUserVote === "helpful" ? "selected" : ""
					}`}
					{...commonButtonProps}
					title={
						!currentUser
							? "Log in to vote"
							: currentUserVote === "helpful"
							? "Remove helpful vote"
							: "Mark as helpful"
					}
				>
					Helpful
				</button>
				<button
					onClick={() => handleFeedback("notHelpful")}
					className={`feedback-button not-helpful ${
						currentUserVote === "notHelpful" ? "selected" : ""
					}`}
					{...commonButtonProps}
					title={
						!currentUser
							? "Log in to vote"
							: currentUserVote === "notHelpful"
							? "Remove not helpful vote"
							: "Mark as not helpful"
					}
				>
					Not Helpful
				</button>
			</div>
			{(totalVotes > 0 || !isLoadingVote) && (
				<div className='helpfulness-stat'>
					{totalVotes > 0 ? (
						<>
							<p className='helpfulness-stat-text'>
								{helpfulVotes} of {totalVotes} user
								{totalVotes === 1 ? "" : "s"} found this helpful.
							</p>
							<div className='helpfulness-bar-container'>
								<div
									className='helpfulness-bar-foreground'
									style={{ width: `${helpfulPercentage}%` }}
								></div>
							</div>
						</>
					) : (
						!isLoadingVote && (
							<p className='helpfulness-stat-text'>No votes yet.</p>
						)
					)}
				</div>
			)}
			{isLoadingVote && (
				<p className='helpfulness-stat-text'>Loading votes...</p>
			)}
		</div>
	);
};

export default VoteButtons;
