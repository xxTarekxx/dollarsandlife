import React from "react";
import styled from "styled-components";
import AdSense from "react-adsense";

const AdWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f5f5f5;
	padding: 20px 0;
	margin: 20px 0;
	border: 1px solid #ddd;
`;

const AdContent = styled.div`
	width: 728px; /* Width of a standard leaderboard ad */
	height: 90px; /* Height of a standard leaderboard ad */
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #fff;
	border: 1px solid #ccc;
	text-align: center;
	font-size: 16px;
	color: #000;
`;

const AdComponent: React.FC = () => (
	<AdWrapper>
		<AdContent>
			<AdSense.Google
				client='ca-pub-1234567890123456'
				slot='1234567890'
				style={{ display: "block", width: 728, height: 90 }}
				format='auto'
				responsive='true'
			/>
			<div>
				<p>Ad content here: Buy the best products at amazing prices!</p>
				<p>
					Visit <a href='https://example.com'>example.com</a> for more details.
				</p>
			</div>
		</AdContent>
	</AdWrapper>
);

export default AdComponent;

// const AdsContainer = styled.div`
// 	background: #eee; // Change this to your ad background color
// 	height: 90px; // Set the height to 90px
// 	width: 728px; // Set the width to 100%
// 	display: flex;
// 	justify-content: center;
// 	align-items: center;
// 	flex-direction: column;
// `;

// const AdTitle = styled.h3`
// 	margin: 0;
// 	color: #333;
// 	font-size: 16px;
// `;

// const AdImage = styled.img`
// 	width: 100%;
// 	height: auto;
// 	margin-top: 10px;
// `;

// const AdText = styled.p`
// 	font-size: 14px;
// 	color: #666;
// 	margin-top: 10px;
// `;

// interface AdProps {
// 	title: string;
// 	imageUrl: string;
// }

// const Ad: React.FC<AdProps> = ({ title, imageUrl }) => {
// 	return (
// 		<AdsContainer>
// 			<AdTitle>{title}</AdTitle>
// 			<AdImage src={imageUrl} alt={title} />
// 		</AdsContainer>
// 	);
// };

// export default Ad;
