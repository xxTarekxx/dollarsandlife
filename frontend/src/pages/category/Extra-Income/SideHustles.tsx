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

const SideHustles: React.FC = () => {
	const [sideHustles, setSideHustles] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Side Hustles";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/sidehustles.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				console.log("Fetched Data:", data);
				setSideHustles(data);
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

	const currentPosts = sideHustles.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income", url: "/category/extra-income" },
		{ title: "Side Hustles", url: "/category/extra-income/side-hustles" },
	];

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<SectionHeading>Side Hustles</SectionHeading>
			<ContentWrapper>
				{currentPosts.map((sideHustleData, index) => (
					<React.Fragment key={sideHustleData.id}>
						<RowContainer>
							<Link
								to={`/category/extra-income/side-hustles/${sideHustleData.id}`}
							>
								<BlogPostCard
									id={sideHustleData.id}
									title={sideHustleData.title}
									imageUrl={sideHustleData.imageUrl}
									content={sideHustleData.content}
									author={sideHustleData.author}
									datePosted={sideHustleData.datePosted}
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
				totalItems={sideHustles.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</PageContainer>
	);
};

export default SideHustles;
