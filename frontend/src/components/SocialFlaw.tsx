import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faYoutube,
	faFacebook,
	faTwitter,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";

const SocialContainer = styled.div`
	width: 100vh;
	background: #eee;
	padding: 25px 50px;
	display: block;
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
	return (
		<SocialContainer>
			<div className='social-container'>
				<Youtube
					href='https://www.youtube.com/c/jamesqquick'
					className='youtube social'
				>
					<FontAwesomeIcon
						icon={faYoutube as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Youtube>
				<Facebook
					href='https://www.facebook.com/learnbuildteach/'
					className='facebook social'
				>
					<FontAwesomeIcon
						icon={faFacebook as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Facebook>
				<Instagram
					href='http://www.instagram.com/larnbuildteach'
					className='instagram social'
				>
					<FontAwesomeIcon
						icon={faInstagram as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Instagram>
				<Twitter href='https://wwww.twitter.com' className='twitter social'>
					<FontAwesomeIcon
						icon={faTwitter as IconDefinition}
						style={{ width: "30px", height: "30px" }}
					/>
				</Twitter>
			</div>
		</SocialContainer>
	);
};

export default SocialFlaw;
