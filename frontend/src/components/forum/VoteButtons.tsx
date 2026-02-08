// frontend/src/components/forum/VoteButtons.tsx
import React, { useCallback, useEffect, useState } from "react";
import styles from "./VoteButtons.module.css";
// import { auth } from "../../../firebase"; // REMOVE direct import
import { Auth, onAuthStateChanged, User } from "firebase/auth"; // Import Auth type & onAuthStateChanged
import { Firestore } from "firebase/firestore"; // Import Firestore type
import toast from "react-hot-toast";
import {
	castVote,
	getUserVoteForItem,
	ItemType,
	VoteType,
} from "../../services/forum/voteService";

interface VoteButtonsProps {
	itemId: string;
	initialHelpfulVotes: number;
	initialNotHelpfulVotes: number;
	itemType: ItemType;
	itemAuthorId?: string;
	postIdForItem?: string;
	auth: Auth;
	db: Firestore;
	/** When provided, called instead of toast when a guest clicks vote; use to open login modal */
	onLoginRequired?: () => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
	itemId,
	initialHelpfulVotes,
	initialNotHelpfulVotes,
	itemType,
	itemAuthorId,
	postIdForItem,
	auth,
	db,
	onLoginRequired,
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
		// Use the passed 'auth' instance for onAuthStateChanged
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			if (user && itemId && db) {
				// Check for db as well
				setIsLoadingVote(true);
				getUserVoteForItem(db, user.uid, itemId) // Pass db
					.then((vote) => {
						setCurrentUserVote(vote);
					})
					.catch((err) => {
						console.error(
							"VoteButtons: Error fetching user's current vote:",
							err,
						);
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
	}, [itemId, auth, db]); // Add auth and db to dependency array

	const handleFeedback = useCallback(
		async (feedbackType: VoteType) => {
			if (!currentUser) {
				if (onLoginRequired) onLoginRequired();
				else toast.error("Please log in to vote.");
				return;
			}
			if (currentUser.uid === itemAuthorId) {
				toast.error("You cannot vote on your own " + itemType + ".");
				return;
			}
			if (isSubmittingVote || !db) {
				// Check for db
				if (!db) toast.error("Database service unavailable.");
				return;
			}
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
				await castVote(
					db, // Pass db
					currentUser.uid,
					itemId,
					itemType,
					feedbackType,
					previousUserVoteStatus,
					itemAuthorId,
					itemType === "answer" ? postIdForItem : undefined,
				);
			} catch (error: unknown) {
				const message =
					typeof error === "object" &&
					error &&
					"message" in error &&
					typeof (error as { message?: string }).message === "string"
						? (error as { message?: string }).message
						: "Failed to submit vote. Please try again.";
				console.error("VoteButtons: Error submitting vote:", error);
				toast.error(message ?? "Failed to submit vote. Please try again.");
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
			db,
			onLoginRequired,
		],
	);

	const totalVotes = helpfulVotes + notHelpfulVotes;
	const helpfulPercentage =
		totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 0;

	if (itemAuthorId && currentUser && itemAuthorId === currentUser.uid) {
		return (
			<div className={`${styles.feedbackButtonsContainer} ${styles.isAuthor}`}>
				{totalVotes > 0 && (
					<div className='helpfulness-stat'>
						<p className={styles.helpfulnessStatText}>
							{helpfulVotes} of {totalVotes} user{totalVotes === 1 ? "" : "s"}{" "}
							found this helpful.
						</p>
						<div className={styles.helpfulnessBarContainer}>
							<div
								className={styles.helpfulnessBarForeground}
								style={{ width: `${helpfulPercentage}%` }}
							></div>
						</div>
					</div>
				)}
				{totalVotes === 0 && !isLoadingVote && (
					<p className={styles.helpfulnessStatText}>
						No votes yet (this is your {itemType}).
					</p>
				)}
				{isLoadingVote && (
					<p className={styles.helpfulnessStatText}>Loading stats...</p>
				)}
			</div>
		);
	}

	const commonButtonProps = {
		disabled:
			isSubmittingVote ||
			isLoadingVote ||
			!db ||
			(!currentUser && !onLoginRequired),
	};

	return (
		<div className={styles.feedbackButtonsContainer}>
			<div className={styles.feedbackActions}>
				<button
					onClick={() => handleFeedback("helpful")}
					className={`${styles.feedbackButton} ${
						currentUserVote === "helpful"
							? styles.feedbackButtonHelpfulSelected
							: ""
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
					className={`${styles.feedbackButton} ${
						currentUserVote === "notHelpful"
							? styles.feedbackButtonNotHelpfulSelected
							: ""
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
							<p className={styles.helpfulnessStatText}>
								{helpfulVotes} of {totalVotes} user{totalVotes === 1 ? "" : "s"}{" "}
								found this helpful.
							</p>
							<div className={styles.helpfulnessBarContainer}>
								<div
									className={styles.helpfulnessBarForeground}
									style={{ width: `${helpfulPercentage}%` }}
								></div>
							</div>
						</>
					) : (
						!isLoadingVote && (
							<p className={styles.helpfulnessStatText}>No votes yet.</p>
						)
					)}
				</div>
			)}
			{isLoadingVote && (
				<p className={styles.helpfulnessStatText}>Loading votes...</p>
			)}
		</div>
	);
};

export default VoteButtons;
