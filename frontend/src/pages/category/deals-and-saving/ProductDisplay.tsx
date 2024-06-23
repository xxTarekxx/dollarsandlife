import React from "react";
import ProductsContainer from "./ProductsContainer"; // Import the ProductsContainer component

// ProductDisplay component definition
const ProductDisplay: React.FC = () => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				backgroundImage: "url('../src/images/under-construction.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<ProductsContainer />
		</div>
	);
};

export default ProductDisplay;
