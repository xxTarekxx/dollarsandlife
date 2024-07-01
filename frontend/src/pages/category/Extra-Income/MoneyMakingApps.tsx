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

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<any[]>([]);
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
				setApps(data);
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

	const currentPosts = apps.slice(
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
			<ContentWrapper>
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
				totalItems={apps.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</PageContainer>
	);
};

export default MoneyMakingApps;
