import React, { useEffect } from "react";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import BlogPost from "../../../components/BlogPost";
import Breadcrumb from "../../../components/Breadcrumb";

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 1rem;
`;

const TopNav = styled.nav`
	width: 50%;
	background-color: #333;
	color: white;
	padding: 10px;
	text-align: center;
`;

const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 0px;
	// background-color: #f9f9f9;
	// padding: 10px 20px;
	// margin-bottom: 20px;
`;

const BlogPostWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 1rem;
	justify-items: center;
	margin-top: 6%;
	width: 100%;
`;

const TopAdContainer = styled.div`
	display: flex;
	justify-content: center;
	background-color: white;
	margin-top: 2px;
	width: 100%;
	max-width: 728px;
	padding: 0rem 0;

	@media (max-width: 806px) {
		width: 360px;
		height: 120px;
		padding: 0;
	}
`;

const SideAdContainer = styled.div`
	max-width: 300px;
	height: 602px;
	margin: 20px 10px;
	background-color: white;

	@media (max-width: 806px) {
		display: none;
	}
`;

const MobileAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 320px;
	height: 100px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

const MobileBoxAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 250px;
	height: 250px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

const RowContainer = styled.div`
	display: grid;
	grid-template-columns: auto 1fr auto;
	width: 100%;
	max-width: 1600px;
	column-gap: 10px;
	align-items: start;

	@media (max-width: 806px) {
		grid-template-columns: 1fr;
	}
`;

const MoneyMakingApps: React.FC = () => {
	useEffect(() => {
		document.title = "Money Making Apps";
	}, []);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income ", url: "/category/extra-income" },
		{ title: "Money Apps", url: "/category/extra-income/money-making-apps" },
	];

	const moneyapps = [
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300?random=1",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 2,
			title: "Amazing Travel",
			imageUrl: "https://picsum.photos/400/300?random=2",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jane Doe",
			datePosted: "Two days ago",
		},
		{
			id: 3,
			title: "Tech Innovations",
			imageUrl: "https://picsum.photos/400/300?random=3",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "John Smith",
			datePosted: "Last week",
		},
		{
			id: 4,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300?random=1",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 5,
			title: "Amazing Travel",
			imageUrl: "https://picsum.photos/400/300?random=2",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jane Doe",
			datePosted: "Two days ago",
		},
		{
			id: 6,
			title: "Tech Innovations",
			imageUrl: "https://picsum.photos/400/300?random=3",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "John Smith",
			datePosted: "Last week",
		},
		{
			id: 4,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300?random=1",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 5,
			title: "Amazing Travel",
			imageUrl: "https://picsum.photos/400/300?random=2",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jane Doe",
			datePosted: "Two days ago",
		},
		{
			id: 6,
			title: "Tech Innovations",
			imageUrl: "https://picsum.photos/400/300?random=3",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "John Smith",
			datePosted: "Last week",
		},
	];

	// Group blog posts into rows
	const blogPostRows = [];
	for (let i = 0; i < moneyapps.length; i += 3) {
		blogPostRows.push(moneyapps.slice(i, i + 3));
	}

	return (
		<PageContainer>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			{blogPostRows.map((row, rowIndex) => (
				<RowContainer key={rowIndex}>
					<SideAdContainer>
						<AdComponent width={300} height={600} />
					</SideAdContainer>
					<BlogPostWrapper>
						{row.map((moneyapps, index) => (
							<React.Fragment key={moneyapps.id}>
								<BlogPost
									id={moneyapps.id}
									title={moneyapps.title}
									imageUrl={moneyapps.imageUrl}
									content={moneyapps.content}
									author={moneyapps.author}
									datePosted={moneyapps.datePosted}
								/>
								{(index + 1) % 3 === 0 && (
									<MobileBoxAdContainer>
										<AdComponent width={250} height={250} />
									</MobileBoxAdContainer>
								)}
								{(index + 1) % 4 === 0 && (
									<MobileAdContainer>
										<AdComponent width={320} height={100} />
									</MobileAdContainer>
								)}
							</React.Fragment>
						))}
					</BlogPostWrapper>
					<SideAdContainer>
						<AdComponent width={300} height={600} />
					</SideAdContainer>
				</RowContainer>
			))}
		</PageContainer>
	);
};

export default MoneyMakingApps;
