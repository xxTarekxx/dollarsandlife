import React from "react";
import styled from "styled-components";

const AdsContainer = styled.div`
	background: #eee; // Change this to your ad background color
	height: 90px; // Set the height to 90px
	width: 728px; // Set the width to 100%
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

const AdTitle = styled.h3`
	margin: 0;
	color: #333;
	font-size: 16px;
`;

const AdImage = styled.img`
	width: 100%;
	height: auto;
	margin-top: 10px;
`;

const AdText = styled.p`
	font-size: 14px;
	color: #666;
	margin-top: 10px;
`;

interface AdProps {
	title: string;
	imageUrl: string;
	// text: string;
}

const Ad: React.FC<AdProps> = ({ title, imageUrl, text }) => {
	return (
		<AdsContainer>
			<AdTitle>{title}</AdTitle>
			<AdImage src={imageUrl} alt={title} />
			{/* <AdText>{text}</AdText> */}
		</AdsContainer>
	);
};

export default Ad;
