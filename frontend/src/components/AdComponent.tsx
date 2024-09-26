import React from "react";
import AdSense from "react-adsense";
import "./AdComponent.css";

const AdComponent: React.FC<{ width: number; height: number }> = ({
	width,
	height,
}) => (
	<div className='postings-component-container' style={{ width, height }}>
		<AdSense.Google
			client='ca-pub-1234567890123456'
			slot='1234567890'
			style={{ display: "block", width: "100%", height: "100%" }}
			format='auto'
			responsive='true'
		/>
	</div>
);

export default AdComponent;
