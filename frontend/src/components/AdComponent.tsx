import React from "react";
import AdSense from "react-adsense";

const AdComponent: React.FC<{ width: number; height: number }> = ({
	width,
	height,
}) => (
	<AdSense.Google
		client='ca-pub-1234567890123456'
		slot='1234567890'
		style={{ display: "block", width, height }}
		format='auto'
		responsive='true'
	/>
);

export default AdComponent;
