import React from "react";

const StartABlog: React.FC = () => {
	return (
		<div
			style={{
				backgroundImage: "url('../src/images/under-construction.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				height: "100vh", // This will make sure the background covers the full height of the viewport
			}}
		>
			<h1></h1>
			{/* Add your blog posts here */}
		</div>
	);
};

export default StartABlog;
