// Loading.tsx
import React from "react";
import "./Loading.css";

const Loading: React.FC = () => {
	return (
		<div className='loading-container'>
			<div className='loading-spinner'></div>
			<p>Loading...</p>
		</div>
	);
};

export default Loading;
