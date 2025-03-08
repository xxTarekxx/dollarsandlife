import React from "react";
import { Helmet } from "react-helmet-async"; // SEO Optimization
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faYoutube,
	faFacebook,
	faTwitter,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";

// Styled Components
const SocialContainer = styled.div`
	width: 100%;
	background: #eee;
	padding: 25px 50px;
	text-align: center;
`;

const SocialLink = styled.a`
	margin: 0 1rem;
	transition: transform 250ms;
	display: inline-block;

	&:hover {
		transform: translateY(-2px);
	}
`;

const Youtube = styled(SocialLink)`
	color: #eb3223;
`;

const Facebook = styled(SocialLink)`
	color: #4968ad;
`;

const Twitter = styled(SocialLink)`
	color: #49a1eb;
`;

const Instagram = styled(SocialLink)`
	color: black;
`;

const SocialFlaw: React.FC = () => {
	const schemaData = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Dollars And Life",
		url: "https://www.dollarsandlife.com/",
		logo: "https://www.dollarsandlife.com/path-to-logo.jpg",
		sameAs: [
			"https://www.youtube.com/c/dollarsandlife",
			"https://www.facebook.com/dollarsandlife",
			"https://www.instagram.com/dollarsnlife/",
			"https://twitter.com/dollarsnlife",
		],
	};

	return (
		<>
			{/* SEO Optimization */}
			<Helmet>
				<title>Follow Us on Social Media - Dollars And Life</title>
				<meta
					name='description'
					content='Stay connected with Dollars And Life on YouTube, Facebook, Twitter, and Instagram for the latest updates on personal finance and earning strategies.'
				/>
				<meta property='og:title' content='Follow Us on Social Media' />
				<meta
					property='og:description'
					content='Stay connected with Dollars And Life on YouTube, Facebook, Twitter, and Instagram for the latest updates on personal finance and earning strategies.'
				/>
				<meta property='og:url' content='https://www.dollarsandlife.com/' />
				{/* Structured Data for Social Media Links */}
				<script type='application/ld+json'>{JSON.stringify(schemaData)}</script>
			</Helmet>

			{/* Social Media Links */}
			<SocialContainer>
				<div className='social-container'>
					<Youtube
						href='https://www.youtube.com/c/dollarsandlife'
						className='youtube social'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='Follow us on YouTube'
						title='Follow us on YouTube'
					>
						<FontAwesomeIcon
							icon={faYoutube as IconDefinition}
							style={{ fontSize: "30px" }}
						/>
					</Youtube>

					<Facebook
						href='https://www.facebook.com/dollarsandlife'
						className='facebook social'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='Follow us on Facebook'
						title='Follow us on Facebook'
					>
						<FontAwesomeIcon
							icon={faFacebook as IconDefinition}
							style={{ fontSize: "30px" }}
						/>
					</Facebook>

					<Instagram
						href='https://www.instagram.com/dollarsnlife/'
						className='instagram social'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='Follow us on Instagram'
						title='Follow us on Instagram'
					>
						<FontAwesomeIcon
							icon={faInstagram as IconDefinition}
							style={{ fontSize: "30px" }}
						/>
					</Instagram>

					<Twitter
						href='https://twitter.com/dollarsnlife'
						className='twitter social'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='Follow us on Twitter'
						title='Follow us on Twitter'
					>
						<FontAwesomeIcon
							icon={faTwitter as IconDefinition}
							style={{ width: "30px", height: "30px" }}
						/>
					</Twitter>
				</div>
			</SocialContainer>
		</>
	);
};

export default SocialFlaw;
