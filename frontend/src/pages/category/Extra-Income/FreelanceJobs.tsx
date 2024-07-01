import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import BlogPostCard from "../../../components/BlogPostCard";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer"; // Import the Pagination component
import { Link } from "react-router-dom";

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

const SectionHeading = styled.h2`
	font-size: 2rem;
	color: #333;
	margin: 20px 0;
	text-align: center;
`;

const FreeLanceJobs: React.FC = () => {
	const [freelanceJobs, setFreelanceJobs] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Freelance Jobs";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/freelancejobs.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				console.log("Fetched Data:", data);
				setFreelanceJobs(data);
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

	const currentPosts = freelanceJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income", url: "/category/extra-income" },
		{ title: "Freelance Jobs", url: "/category/extra-income/freelancers" },
	];

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<SectionHeading>Freelance Job Opportunities</SectionHeading>
			<BlogPostWrapper>
				{currentPosts.map((freelancedata, index) => (
					<React.Fragment key={freelancedata.id}>
						<RowContainer>
							<Link
								to={`/category/extra-income/Freelancers/${freelancedata.id}`}
							>
								<BlogPostCard
									id={freelancedata.id}
									title={freelancedata.title}
									imageUrl={freelancedata.imageUrl}
									content={freelancedata.content}
									author={freelancedata.author}
									datePosted={freelancedata.datePosted}
								/>
							</Link>
						</RowContainer>
						{index > 0 && index % 2 === 0 && (
							<AdRowContainer>
								<AdComponent width={660} height={440} />
							</AdRowContainer>
						)}
						{index % 2 === 0 && (
							<MobileBoxAdContainer>
								<AdComponent width={250} height={250} />
							</MobileBoxAdContainer>
						)}
						{index % 4 === 0 && (
							<MobileAdContainer>
								<AdComponent width={320} height={100} />
							</MobileAdContainer>
						)}
					</React.Fragment>
				))}
			</BlogPostWrapper>
			<PaginationContainer
				totalItems={freelanceJobs.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</PageContainer>
	);
};

export default FreeLanceJobs;
