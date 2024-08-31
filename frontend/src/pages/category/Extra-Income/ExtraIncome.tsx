import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import Budgettingimg from "../../../assets/images/icons/img-budgetting.webp";
import FreeLancerimg from "../../../assets/images/icons/img-freelancer.webp";
import RemoteJobimg from "../../../assets/images/icons/img-remotejobs.webp";
import SideHustlesimg from "../../../assets/images/icons/img-sidehustles.webp";
import MoneyMakingAppsimg from "../../../assets/images/icons/img-moneymakingapps.webp";
import AdComponent from "../../../components/AdComponent";
import "./ExtraIncome.css";

const ExtraIncome: React.FC = () => {
	useEffect(() => {
		document.title = "Extra Income";
	}, []);

	const compressedFreeLancerimg = useCompressedImage(FreeLancerimg);
	const compressedSideHustlesimg = useCompressedImage(SideHustlesimg);
	const compressedRemoteJobimg = useCompressedImage(RemoteJobimg);
	const compressedMoneyMakingAppsimg = useCompressedImage(MoneyMakingAppsimg);
	const compressedBudgettingimg = useCompressedImage(Budgettingimg);

	const linkBoxes = [
		{
			to: "/extra-income/Freelancers",
			ariaLabel: "Become A Freelancer",
			imgSrc: compressedFreeLancerimg || FreeLancerimg,
			altText: "Freelancer Icon",
			captionText: "Freelance Oppurtunities",
		},
		{
			to: "/extra-income/Budget/",
			ariaLabel: "Budgetting Guides",
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
		// {
		// 	to: "/extra-income/Side-Hustles",
		// 	ariaLabel: "Side Hustles",
		// 	imgSrc: compressedSideHustlesimg || SideHustlesimg,
		// 	altText: "Side Hustles Icon",
		// 	captionText: "Side Hustles",
		// },
		{
			to: "/extra-income/money-making-apps",
			ariaLabel: "Make Money On Apps",
			imgSrc: compressedMoneyMakingAppsimg || MoneyMakingAppsimg,
			altText: "Money Making Apps Icon",
			captionText: "Make Money On Apps",
		},
	];

	return (
		<>
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
		</>
	);
};

export default ExtraIncome;
