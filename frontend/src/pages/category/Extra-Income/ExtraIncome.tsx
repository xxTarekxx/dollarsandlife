import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import Budgettingimg from "/images/icons/img-budgetting.webp";
import FreeLancerimg from "/images/icons/img-freelancer.webp";
import RemoteJobimg from "/images/icons/img-remotejobs.webp";
import MoneyMakingAppsimg from "/images/icons/img-moneymakingapps.webp";
import "./ExtraIncome.css";

const ExtraIncome: React.FC = () => {
	useEffect(() => {
		document.title = "Extra Income";
	}, []);

	const compressedFreeLancerimg = useCompressedImage(FreeLancerimg);
	const compressedRemoteJobimg = useCompressedImage(RemoteJobimg);
	const compressedMoneyMakingAppsimg = useCompressedImage(MoneyMakingAppsimg);
	const compressedBudgettingimg = useCompressedImage(Budgettingimg);

	const linkBoxes = [
		{
			to: "/extra-income/Freelancers",
			ariaLabel: "Become A Freelancer",
			imgSrc: compressedFreeLancerimg || FreeLancerimg,
			altText: "Freelancer Icon",
			captionText: "Freelance Opportunities",
		},
		{
			to: "/extra-income/Budget/",
			ariaLabel: "Budgeting Guides",
			imgSrc: compressedBudgettingimg || Budgettingimg,
			altText: "Budgeting Icon",
			captionText: "Budgeting",
		},
		{
			to: "/extra-income/Remote-Jobs",
			ariaLabel: "Remote Jobs",
			imgSrc: compressedRemoteJobimg || RemoteJobimg,
			altText: "Remote Jobs Icon",
			captionText: "Remote Jobs",
		},
		{
			to: "/extra-income/money-making-apps",
			ariaLabel: "Make Money On Apps",
			imgSrc: compressedMoneyMakingAppsimg || MoneyMakingAppsimg,
			altText: "Money Making Apps Icon",
			captionText: "Make Money On Apps",
		},
	];

	return (
		<div>
			{/* Main Heading */}
			<h1>Explore Extra Income Opportunities</h1>

			{/* Category Links */}
			<div
				className='category-links-container'
				aria-label='Main navigation links'
			>
				{linkBoxes.map((linkBox, index) => (
					<Link
						className='link-box'
						key={index}
						to={linkBox.to}
						aria-label={linkBox.ariaLabel}
					>
						<img src={linkBox.imgSrc} alt={linkBox.altText} loading='lazy' />
						<figcaption className='extraincome-figcaption'>
							{linkBox.captionText}
						</figcaption>
					</Link>
				))}
			</div>
		</div>
	);
};

export default ExtraIncome;
