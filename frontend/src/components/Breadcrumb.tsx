import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumb.css";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	if (!paths || paths.length === 0) {
		return null; // Return null if paths is undefined or empty
	}

	return (
		<nav className='breadcrumb-container'>
			<ol className='breadcrumb-list'>
				{paths.map((path, index) => (
					<React.Fragment key={index}>
						<li className='breadcrumb-item'>
							<Link to={path.url}>{path.title}</Link>
						</li>
						{index < paths.length - 1 && (
							<span className='breadcrumb-separator'>/</span>
						)}
					</React.Fragment>
				))}
			</ol>
		</nav>
	);
};

export default Breadcrumb;
