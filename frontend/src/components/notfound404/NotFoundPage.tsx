import React from "react"; // Added to potentially fix "React is not defined" error
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./NotFoundPage.css"; // Ensure this CSS file exists and is correctly imported

const NotFoundPage: React.FC = () => {
	return (
		<div className='not-found-page'>
			<Helmet>
				<title>404 - Page Not Found | Dollars & Life</title>
				<meta name='robots' content='noindex, follow' />
			</Helmet>
			<div className='not-found-content'>
				<h1>404 - Page Not Found</h1>
				<p>Oops! The page you're looking for doesn't exist.</p>
				<Link to='/' className='back-home-btn'>
					Go Back Home
				</Link>
				<div className='suggested-links'>
					<h2>Explore Other Pages:</h2>
					<ul>
						<li>
							<Link to='/extra-income'>Extra Income</Link>
						</li>
						<li>
							<Link to='/shopping-deals'>Shopping Deals</Link>
						</li>
						<li>
							<Link to='/start-a-blog'>Start A Blog</Link>
						</li>
						<li>
							<Link to='/breaking-news'>Breaking News</Link>
						</li>
						<li>
							<Link to='/financial-calculators'>Financial Calculators</Link>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
