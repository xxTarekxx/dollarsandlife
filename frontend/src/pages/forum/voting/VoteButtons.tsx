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
	itemAuthorId?: string;
	postIdForItem?: string; // Required if itemType is 'answer'
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
	const [isLoadingVote, setIsLoadingVote] = useState<boolean>(true); // For initial vote fetch
	const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false); // For vote submission
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	// Effect to update local vote counts if initial props change
	useEffect(() => {
		setHelpfulVotes(initialHelpfulVotes);
		setNotHelpfulVotes(initialNotHelpfulVotes);
	}, [initialHelpfulVotes, initialNotHelpfulVotes]);

	// Effect to fetch user's current vote on mount and when user or itemId changes
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
						// Potentially show a subtle error to the user or log
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
	}, [itemId]); // Rerun if itemId changes (e.g., navigating between posts)

	const handleFeedback = useCallback(
		async (feedbackType: VoteType) => {
			if (!currentUser) {
				toast.error("Please log in to vote.");
				// Here you could call a function to open your AuthPromptModal
				// e.g., openAuthModal();
				return;
			}

			if (currentUser.uid === itemAuthorId) {
				toast.error("You cannot vote on your own " + itemType + ".");
				return;
			}

			if (isSubmittingVote) return;
			setIsSubmittingVote(true);

			const previousHelpfulVotes = helpfulVotes;
			const previousNotHelpfulVotes = notHelpfulVotes;
			const previousUserVoteStatus = currentUserVote;

			// Optimistic UI update
			let newHelpful = helpfulVotes;
			let newNotHelpful = notHelpfulVotes;
			let newVoteStatusForUI: VoteType | null = null;

			if (feedbackType === currentUserVote) {
				// User is un-voting (clicking the same button again)
				if (feedbackType === "helpful") newHelpful--;
				else newNotHelpful--;
				newVoteStatusForUI = null;
			} else {
				// New vote or changing vote
				if (feedbackType === "helpful") {
					newHelpful++;
					if (currentUserVote === "notHelpful") newNotHelpful--; // Remove previous notHelpful vote
				} else {
					// feedbackType === "notHelpful"
					newNotHelpful++;
					if (currentUserVote === "helpful") newHelpful--; // Remove previous helpful vote
				}
				newVoteStatusForUI = feedbackType;
			}

			setHelpfulVotes(newHelpful);
			setNotHelpfulVotes(newNotHelpful);
			setCurrentUserVote(newVoteStatusForUI);

			try {
				await castVote(
					currentUser.uid,
					itemId,
					itemType,
					feedbackType, // The vote being cast now (could be different from newVoteStatusForUI if unvoting)
					previousUserVoteStatus, // The user's vote *before* this action
					itemAuthorId,
					itemType === "answer" ? postIdForItem : undefined,
				);
				// Vote counts on the item are updated via Firestore transaction in castVote
				// If successful, the optimistic UI update is confirmed.
				// If castVote returned updated counts, you could use them for more accuracy:
				// setHelpfulVotes(updatedCounts.helpful);
				// setNotHelpfulVotes(updatedCounts.notHelpful);
			} catch (error: any) {
				console.error("Error submitting vote:", error);
				toast.error(
					error.message || "Failed to submit vote. Please try again.",
				);
				// Revert optimistic UI updates on failure
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

	// If the current user is the author of the item, don't show voting buttons,
	// but do show the statistics.
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
					<p className='helpfulness-stat-text'>No votes yet.</p>
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
			{(totalVotes > 0 || !isLoadingVote) && ( // Show stats if votes exist OR loading is done
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
