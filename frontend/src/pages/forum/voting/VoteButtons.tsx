// frontend/src/pages/forum/voting/VoteButtons.tsx
import React, { useState, useEffect } from "react";
import "./VoteButtons.css"; // Or your chosen CSS file name
// import { auth } from '../../../firebase'; // Path to your firebase.ts
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { castVote, getUserVoteForItem } from './voteService'; // To be created

interface VoteButtonsProps {
	itemId: string;
	initialHelpfulVotes: number;
	initialNotHelpfulVotes: number;
	itemType: "post" | "comment";
}

type UserVoteType = "helpful" | "notHelpful" | null;

const VoteButtons: React.FC<VoteButtonsProps> = ({
	itemId,
	initialHelpfulVotes,
	initialNotHelpfulVotes,
	itemType,
}) => {
	const [helpfulVotes, setHelpfulVotes] = useState<number>(initialHelpfulVotes);
	const [notHelpfulVotes, setNotHelpfulVotes] = useState<number>(
		initialNotHelpfulVotes,
	);
	const [currentUserVote, setCurrentUserVote] = useState<UserVoteType>(null);
	const [loading, setLoading] = useState<boolean>(false);
	// const [currentUser, setCurrentUser] = useState<User | null>(null); // To store logged-in user

	// Placeholder for fetching current user and their vote
	// useEffect(() => {
	//   const unsubscribe = onAuthStateChanged(auth, (user) => {
	//     setCurrentUser(user);
	//     if (user) {
	//       setLoading(true);
	//       getUserVoteForItem(user.uid, itemId)
	//         .then(vote => setCurrentUserVote(vote as UserVoteType))
	//         .catch(console.error)
	//         .finally(() => setLoading(false));
	//     } else {
	//       setCurrentUserVote(null);
	//     }
	//   });
	//   return () => unsubscribe();
	// }, [itemId]);

	const handleFeedback = async (feedbackType: "helpful" | "notHelpful") => {
		// if (!currentUser) {
		//   alert("Please log in to provide feedback.");
		//   return;
		// }
		if (loading) return;
		setLoading(true);

		console.log(`Submitting feedback: ${feedbackType} for item ${itemId}`);

		// --- FIREBASE/VOTESERVICE LOGIC WILL GO HERE ---
		// Optimistic UI updates:
		let newHelpful = helpfulVotes;
		let newNotHelpful = notHelpfulVotes;
		let newVoteStatus: UserVoteType = null;

		if (feedbackType === "helpful") {
			if (currentUserVote === "helpful") {
				// Un-helpful
				newHelpful--;
				newVoteStatus = null;
			} else {
				if (currentUserVote === "notHelpful") newNotHelpful--; // Remove previous notHelpful vote
				newHelpful++;
				newVoteStatus = "helpful";
			}
		} else {
			// feedbackType === 'notHelpful'
			if (currentUserVote === "notHelpful") {
				// Un-notHelpful
				newNotHelpful--;
				newVoteStatus = null;
			} else {
				if (currentUserVote === "helpful") newHelpful--; // Remove previous helpful vote
				newNotHelpful++;
				newVoteStatus = "notHelpful";
			}
		}

		setHelpfulVotes(newHelpful);
		setNotHelpfulVotes(newNotHelpful);
		setCurrentUserVote(newVoteStatus);

		// try {
		//   await castVote(currentUser.uid, itemId, itemType, feedbackType, currentUserVote);
		//   // Optionally, fetch updated counts from server if optimistic updates are not sufficient
		// } catch (error) {
		//   console.error("Error submitting feedback:", error);
		//   // Revert optimistic updates
		//   setHelpfulVotes(helpfulVotes);
		//   setNotHelpfulVotes(notHelpfulVotes);
		//   setCurrentUserVote(currentUserVote);
		//   alert("Failed to submit feedback. Please try again.");
		// } finally {
		//   setLoading(false);
		// }
		await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API
		setLoading(false);
	};

	const totalVotes = helpfulVotes + notHelpfulVotes;
	const helpfulPercentage =
		totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 0;

	return (
		<div className='feedback-buttons-container'>
			<div className='feedback-actions'>
				<button
					onClick={() => handleFeedback("helpful")}
					className={`feedback-button helpful ${
						currentUserVote === "helpful" ? "selected" : ""
					}`}
					disabled={loading /*|| !currentUser*/}
					title='Mark as helpful'
				>
					{/* Add SVG icon for "helpful" (e.g., thumbs up) later if desired */}
					Helpful
				</button>
				<button
					onClick={() => handleFeedback("notHelpful")}
					className={`feedback-button not-helpful ${
						currentUserVote === "notHelpful" ? "selected" : ""
					}`}
					disabled={loading /*|| !currentUser*/}
					title='Mark as not helpful'
				>
					{/* Add SVG icon for "not helpful" (e.g., thumbs down) later if desired */}
					Not Helpful
				</button>
			</div>
			{totalVotes > 0 && ( // Only show stats if there are votes
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
		</div>
	);
};

export default VoteButtons;
