import styled from "styled-components";

export const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 1rem;
`;

export const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 0px;
`;

export const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
`;

export const TopAdContainer = styled.div`
	display: flex;
	justify-content: center;
	background-color: white;
	margin-top: 2px;
	width: 100%;
	max-width: 728px;
	padding: 0rem 0;

	@media (max-width: 806px) {
		width: 360px;
		height: 120px;
		padding: 0;
	}
`;

export const AdRowContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	max-width: 660px;
	margin: 20px 0;
	background-color: white;

	@media (max-width: 806px) {
		display: none;
	}
`;

export const MobileAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 320px;
	height: 100px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

export const MobileBoxAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 250px;
	height: 250px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

export const RowContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 800px;
	align-items: center;
	margin-bottom: 20px;
`;

export const SectionHeading = styled.h2`
	font-size: 2rem;
	color: #333;
	margin: 20px 0;
	text-align: center;
`;

export const CardContainer = styled.div`
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.3s, box-shadow 0.3s;
	display: flex;
	flex-direction: row;
	max-width: 800px;
	width: 100%;
	margin: 20px 0;

	&:hover {
		transform: translateY(-10px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 806px) {
		flex-direction: column;
	}
`;

export const CardImage = styled.img`
	width: 40%;
	object-fit: cover;

	@media (max-width: 806px) {
		width: 100%;
		height: auto;
	}
`;

export const CardContent = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 60%;

	@media (max-width: 806px) {
		width: 100%;
	}
`;

export const CardTitle = styled.h3`
	font-size: 1.5rem;
	margin: 0;
	color: #333;
	font-weight: 700;
`;

export const CardAuthor = styled.p`
	font-size: 0.875rem;
	color: #555;
`;

export const CardDate = styled.p`
	font-size: 0.75rem;
	color: #999;
	margin-top: 5px;
`;

export const CardText = styled.p`
	font-size: 0.875rem;
	color: #666;
	margin: 15px 0;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.5;
`;

export const ReadMoreButton = styled.button`
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	font-size: 0.875rem;
	cursor: pointer;
	transition: background-color 0.3s;
	align-self: flex-start; /* Align to the left */

	&:hover {
		background-color: #0056b3;
	}
`;
