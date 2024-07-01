import React from "react";
import styled from "styled-components";

const CardContainer = styled.div`
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.3s, box-shadow 0.3s;
	display: flex;
	flex-direction: column;
	max-width: 300px;
	width: 100%;
	margin: 20px;

	&:hover {
		transform: translateY(-10px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}
`;

const CardImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: cover;
`;

const CardContent = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardTitle = styled.h3`
	font-size: 1.5rem;
	margin: 0;
	color: #333;
	font-weight: 700;
`;

const CardDescription = styled.p`
	font-size: 0.875rem;
	color: #666;
	margin: 10px 0;
`;

const CardPrice = styled.p`
	font-size: 1rem;
	color: #333;
	margin: 10px 0;
`;

const OriginalPrice = styled.span`
	text-decoration: line-through;
	color: #999;
	margin-right: 10px;
`;

const DiscountedPrice = styled.span`
	color: #e60023;
	font-weight: bold;
`;

const BuyNowButton = styled.a`
	display: inline-block;
	margin-top: 10px;
	padding: 10px 20px;
	background: #007bff;
	color: white;
	text-decoration: none;
	border-radius: 5px;
	text-align: center;
	transition: background 0.3s;

	&:hover {
		background: #0056b3;
	}
`;

interface ProductCardProps {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	originalPrice: string;
	discountedPrice: string;
	affiliateLink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
	title,
	imageUrl,
	description,
	originalPrice,
	discountedPrice,
	affiliateLink,
}) => {
	return (
		<CardContainer>
			<CardImage src={imageUrl} alt={title} />
			<CardContent>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
				<CardPrice>
					<OriginalPrice>{originalPrice}</OriginalPrice>
					<DiscountedPrice>{discountedPrice}</DiscountedPrice>
				</CardPrice>
				<BuyNowButton
					href={affiliateLink}
					target='_blank'
					rel='noopener noreferrer'
				>
					Buy Now
				</BuyNowButton>
			</CardContent>
		</CardContainer>
	);
};

export default ProductCard;
