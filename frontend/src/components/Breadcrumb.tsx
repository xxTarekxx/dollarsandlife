import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const BreadcrumbContainer = styled.nav`
	background: transparent;
	padding: 10px 20px;
	border-radius: 4px;
`;

const BreadcrumbList = styled.ol`
	list-style-type: none;
	padding: 0;
	margin: 0;
	display: flex;
`;

const BreadcrumbItem = styled.li`
	font-size: 14px;
	margin-right: 10px;

	&:last-child {
		margin-right: 0;
	}

	a {
		text-decoration: none;
		color: #7212e0;
		transition: color 0.3s;

		&:hover {
			color: #00a60b;
		}
	}
`;

const BreadcrumbSeparator = styled.span`
	margin: 0 5px;
	color: #7212e0;
`;

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	if (!paths || paths.length === 0) {
		return null; // Return null if paths is undefined or empty
	}

	return (
		<BreadcrumbContainer>
			<BreadcrumbList>
				{paths.map((path, index) => (
					<React.Fragment key={index}>
						<BreadcrumbItem>
							<Link to={path.url}>{path.title}</Link>
						</BreadcrumbItem>
						{index < paths.length - 1 && (
							<BreadcrumbSeparator>/</BreadcrumbSeparator>
						)}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</BreadcrumbContainer>
	);
};

export default Breadcrumb;
