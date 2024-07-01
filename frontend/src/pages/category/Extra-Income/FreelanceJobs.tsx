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
	ProductCard,
	ProductImage,
	ProductInfo,
	ProductTitle,
	ProductDescription,
	ProductPrice,
	OriginalPrice,
	DiscountedPrice,
	BuyNowButton,
} from "../../../components/CommonStyles";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import BlogPostCard from "../../../components/BlogPostCard";
import { Link } from "react-router-dom";

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
			<ContentWrapper>
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
			</ContentWrapper>
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
