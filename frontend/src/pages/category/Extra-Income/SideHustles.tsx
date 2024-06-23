import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center; /* Align vertically */
	// height: 100vh; /* Full height of the viewport */
	max-width: 1280px;
	margin: auto;
`;

// Styled components for the card layout
const StyledLink = styled(Link)`
	margin: 1%;
	// display: flex;
	// justify-content: space-between;
	text-decoration: none;
	color: inherit; /* Inherit the text color from the parent */
`;

const Card = styled.div`
	background: #7f7fd5;
	border-radius: 10px;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
	transition: 0.3s;
	width: 300px;
	margin: 1rem auto;
`;

const CardHeader = styled.div`
	img {
		width: 100%;
		border-radius: 10px 10px 0 0;
	}
`;

const CardBody = styled.div`
	padding: 2px 16px;
`;

const CardFooter = styled.div`
	padding: 2px 16px;
`;

const UserImage = styled.img`
	border-radius: 50%;
	width: 40px;
`;

const UserInfo = styled.div`
	display: inline-block;
	vertical-align: middle;
	margin-left: 8px;
`;

const Tag = styled.span`
	display: inline-block;
	background-color: #d1913c;
	color: white;
	border-radius: 10px;
	padding: 5px;
	margin-right: 5px;
	font-size: 12px;
`;

const SideHustles: React.FC = () => {
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
		// <Container>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// 	<StyledLink to='/path-to-your-post'>
		// 		<Card>
		// 			<CardHeader>
		// 				<img
		// 					src='https://source.unsplash.com/600x400/?food'
		// 					alt='card__image'
		// 				/>
		// 			</CardHeader>
		// 			<CardBody>
		// 				<Tag className='tag-brown'>Food</Tag>
		// 				<h4>Delicious Food</h4>
		// 				<p>
		// 					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
		// 					perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea
		// 					atque quidem!
		// 				</p>
		// 			</CardBody>
		// 			<CardFooter>
		// 				<div className='user'>
		// 					<UserImage src='./' alt='user__image' />
		// 					<UserInfo>
		// 						<h5>Jony Doe</h5>
		// 						<small>Yesterday</small>
		// 					</UserInfo>
		// 				</div>
		// 			</CardFooter>
		// 		</Card>
		// 	</StyledLink>
		// </Container>
	);
};

export default SideHustles;