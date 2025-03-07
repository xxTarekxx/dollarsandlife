import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumb.css";

interface BreadcrumbProps {
	paths: { title: string; url: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
	if (!paths || paths.length === 0) {
		return null;
	}

	return (
		<nav aria-label='Breadcrumb Navigation'>
			<div
				className='breadcrumb-container'
				itemScope
				itemType='https://schema.org/BreadcrumbList'
			>
				<ol className='breadcrumb-list'>
					{paths.map((path, index) => (
						<li
							key={index}
							className='breadcrumb-item'
							itemProp='itemListElement'
							itemScope
							itemType='https://schema.org/ListItem'
						>
							<Link to={path.url} itemProp='item'>
								<span itemProp='name'>{path.title}</span>
							</Link>
							<meta itemProp='position' content={(index + 1).toString()} />
							{index < paths.length - 1 && (
								<span className='breadcrumb-separator'>››</span>
							)}
						</li>
					))}
				</ol>
			</div>
		</nav>
	);
};

export default Breadcrumb;
