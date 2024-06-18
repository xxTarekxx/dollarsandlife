import React from "react";
import styled from "styled-components";

// Styled components for layout and animations
const ProductsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1rem;
	justify-items: center;
	padding: 1rem;
`;

const ProductCard = styled.div`
	border: 1px solid #ddd;
	padding: 1rem;
	border-radius: 8px;
	width: 100%;
	max-width: 300px;
	transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
`;

const ProductImage = styled.img`
	width: 100%;
	height: auto;
	border-radius: 4px;
`;

// ProductComponent props interface
interface ProductProps {
	id: number;
	title: string;
	imageUrl: string;
	description: string;
	originalPrice: number;
	discountedPrice: number;
	affiliateLink: string;
}

// ProductComponent definition
const ProductComponent: React.FC<ProductProps> = ({
	id,
	title,
	imageUrl,
	description,
	originalPrice,
	discountedPrice,
	affiliateLink,
}) => {
	return (
		<ProductCard key={id}>
			<ProductImage src={imageUrl} alt={title} />
			<h2>{title}</h2>
			<p>{description}</p>
			<p>
				Original Price: <s>${originalPrice}</s>
			</p>
			<p>Discounted Price: ${discountedPrice}</p>
			<a href={affiliateLink} target='_blank' rel='noopener noreferrer'>
				Buy Now
			</a>
		</ProductCard>
	);
};

// ProductsContainer with dummy data
const ProductsContainer: React.FC = () => {
	// Dummy product data
	const dummyProducts: ProductProps[] = [
		{
			id: 1,
			title: "Product 1",
			imageUrl: "path/to/image1.png",
			description: "Description for product 1",
			originalPrice: 59.99,
			discountedPrice: 49.99,
			affiliateLink: "#",
		},
		{
			id: 2,
			title: "Product 2",
			imageUrl: "path/to/image2.png",
			description: "Description for product 2",
			originalPrice: 69.99,
			discountedPrice: 59.99,
			affiliateLink: "#",
		},
		{
			id: 3,
			title: "Product 3",
			imageUrl: "path/to/image3.png",
			description: "Description for product 3",
			originalPrice: 89.99,
			discountedPrice: 79.99,
			affiliateLink: "#",
		},
		{
			id: 4,
			title: "Product 3",
			imageUrl: "path/to/image3.png",
			description: "Description for product 3",
			originalPrice: 89.99,
			discountedPrice: 79.99,
			affiliateLink: "https://amzn.to/4euFCSe",
		},
	];

	return (
		<ProductsGrid>
			{dummyProducts.map((product) => (
				<ProductComponent {...product} />
			))}
		</ProductsGrid>
	);
};

export default ProductsContainer;
