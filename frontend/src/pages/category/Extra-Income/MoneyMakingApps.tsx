import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import BlogPostCard from "../../../components/BlogPostCard";
import Breadcrumb from "../../../components/Breadcrumb";

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 1rem;
`;

const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 0px;
`;

const BlogPostWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
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

const AdRowContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	max-width: 660px;
	margin: 20px 0;
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
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 800px;
	align-items: center;
	margin-bottom: 20px;
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20px 0;
`;

const PaginationButton = styled.button`
	padding: 10px 20px;
	margin: 0 5px;
	background-color: #333;
	color: white;
	border: none;
	cursor: pointer;

	&:disabled {
		background-color: #ddd;
		color: #666;
		cursor: not-allowed;
	}
`;

const PageNumber = styled.span`
	display: inline-block;
	padding: 10px;
	margin: 0 5px;
	background-color: #333;
	color: white;
	cursor: pointer;

	&.active {
		background-color: #666;
	}
`;

const SectionHeading = styled.h2`
	font-size: 2rem;
	color: #333;
	margin: 20px 0;
	text-align: center;
`;

const MoneyMakingApps: React.FC = () => {
	const [moneyMakingApps, setMoneyMakingApps] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Money Making Apps";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/moneymakingapps.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				console.log("Fetched Data:", data);
				setMoneyMakingApps(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	const totalPages = Math.ceil(moneyMakingApps.length / postsPerPage);

	const handlePrevPage = () => {
		setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
	};

	const handlePageNumberClick = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const currentPosts = moneyMakingApps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income", url: "/category/extra-income" },
		{
			title: "Money Making Apps",
			url: "/category/extra-income/money-making-apps",
		},
	];

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<SectionHeading>Money Making Apps</SectionHeading>
			<BlogPostWrapper>
				{currentPosts.map((appData, index) => (
					<React.Fragment key={appData.id}>
						<RowContainer>
							<Link
								to={`/category/extra-income/money-making-apps/${appData.id}`}
							>
								<BlogPostCard
									id={appData.id}
									title={appData.title}
									imageUrl={appData.imageUrl}
									content={appData.content}
									author={appData.author}
									datePosted={appData.datePosted}
								/>
							</Link>
						</RowContainer>
						{index > 0 && index % 2 === 0 && (
							<AdRowContainer>
								<AdComponent width={660} height={440} />
							</AdRowContainer>
						)}
						{(index + 1) % 2 === 0 && (
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
			<PaginationContainer>
				<PaginationButton onClick={handlePrevPage} disabled={currentPage === 1}>
					Previous
				</PaginationButton>
				{Array.from({ length: totalPages }).map((_, index) => (
					<PageNumber
						key={index}
						className={currentPage === index + 1 ? "active" : ""}
						onClick={() => handlePageNumberClick(index + 1)}
					>
						{index + 1}
					</PageNumber>
				))}
				<PaginationButton
					onClick={handleNextPage}
					disabled={currentPage === totalPages}
				>
					Next
				</PaginationButton>
			</PaginationContainer>
		</PageContainer>
	);
};

export default MoneyMakingApps;
