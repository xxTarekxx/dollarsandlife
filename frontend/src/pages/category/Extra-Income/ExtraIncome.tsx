import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import Breadcrumb from "../../../components/Breadcrumb";
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

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income ", url: "/category/extra-income" },
	];

	const linkBoxes = [
		{
			to: "/category/extra-income/Freelancers",
			ariaLabel: "Become A Freelancer",
			imgSrc: compressedFreeLancerimg || FreeLancerimg,
			altText: "Manage Finance Photo",
			captionText: "Become A Freelancer",
		},
		{
			to: "/category/extra-income/Budgetting",
			ariaLabel: "Budgetting Guides",
			imgSrc: compressedBudgettingimg || Budgettingimg,
			altText: "Passive Income Icon",
			captionText: "Budgeting",
		},
		{
			to: "/category/extra-income/Remote-Jobs",
			ariaLabel: "Deals",
			imgSrc: compressedRemoteJobimg || RemoteJobimg,
			altText: "Deals And Saving Icon",
			captionText: "Remote Jobs",
		},
		{
			to: "/category/extra-income/Side-Hustles",
			ariaLabel: "Deals",
			imgSrc: compressedSideHustlesimg || SideHustlesimg,
			altText: "Deals And Saving Icon",
			captionText: "Side Hustles",
		},
		{
			to: "/category/extra-income/money-making-apps",
			ariaLabel: "Deals",
			imgSrc: compressedMoneyMakingAppsimg || MoneyMakingAppsimg,
			altText: "Deals And Saving Icon",
			captionText: "Make Money On Apps",
		},
	];

	return (
		<>
			<Breadcrumb paths={breadcrumbPaths} />
			<AdComponent width={728} height={90} />
			<div className='links-container' aria-label='Main navigation links'>
				{linkBoxes.map((linkBox, index) => (
					<Link
						className='link-box'
						key={index}
						to={linkBox.to}
						aria-label={linkBox.ariaLabel}
					>
						<img src={linkBox.imgSrc} alt={linkBox.altText} loading='lazy' />
						<figcaption className='figcaption'>
							{linkBox.captionText}
						</figcaption>
					</Link>
				))}
			</div>
		</>
	);
};

export default ExtraIncome;
