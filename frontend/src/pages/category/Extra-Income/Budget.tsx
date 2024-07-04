import React, { useEffect, useState, useRef } from "react";
import {
	PageContainer,
	BreadcrumbContainer,
	ContentWrapper,
	TopAdContainer,
	AdRowContainer,
	MobileAdContainer,
	MobileBoxAdContainer,
	RowContainer,
	SectionHeading,
} from "../../../components/CommonStyles";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import BlogPostCard from "../../../components/BlogPostCard";
import { Link } from "react-router-dom";

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Budget Guides";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/budgetdata.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setBudgetPosts(data);
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

	const currentPosts = budgetPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income", url: "/category/extra-income" },
		{ title: "Budget", url: "/category/extra-income/budget" },
	];

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<SectionHeading>Budget Guides</SectionHeading>
			<ContentWrapper>
				{currentPosts.map((budgetData, index) => (
					<React.Fragment key={budgetData.id}>
						<RowContainer>
							<Link to={`/category/extra-income/budget/${budgetData.id}`}>
								<BlogPostCard
									id={budgetData.id}
									title={budgetData.title}
									imageUrl={budgetData.imageUrl}
									content={budgetData.content}
									author={budgetData.author}
									datePosted={budgetData.datePosted}
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
			</ContentWrapper>
			<PaginationContainer
				totalItems={budgetPosts.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</PageContainer>
	);
};

export default Budget;
