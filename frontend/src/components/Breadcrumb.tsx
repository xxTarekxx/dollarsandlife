import React from "react";
import { Link } from "react-router-dom";
import breadcrumbseparator from "/images/favcons/breadcrumb-divider.webp";
import "./Breadcrumb.css";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	if (!paths || paths.length === 0) {
		return null;
	}

	return (
		<nav>
			<div className='breadcrumb-container'>
				<ol className='breadcrumb-list'>
					{paths.map((path, index) => (
						<React.Fragment key={index}>
							<li className='breadcrumb-item'>
								<Link to={path.url}>{path.title}</Link>
							</li>
							{index < paths.length - 1 && (
								<img
									src={breadcrumbseparator}
									alt='separator'
									className='breadcrumb-separator'
								/>
							)}
						</React.Fragment>
					))}
				</ol>
			</div>
		</nav>
	);
};

export default Breadcrumb;
