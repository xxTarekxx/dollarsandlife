import Head from "next/head";
import Link from "next/link";
import React from "react"; // Added to potentially fix "React is not defined" error
import "./NotFoundPage.css"; // Ensure this CSS file exists and is correctly imported

const NotFoundPage: React.FC = () => {
	return (
		<div className='not-found-page'>
			<Head>
				<title>404 - Page Not Found | Dollars & Life</title>
				<meta name='robots' content='noindex, follow' />
			</Head>
			<div className='not-found-content'>
				<h1>404 - Page Not Found</h1>
				<p>Oops! The page you're looking for doesn't exist.</p>
				<Link href='/' className='back-home-btn'>
					Go Back Home
				</Link>
				<div className='suggested-links'>
					<h2>Explore Other Pages:</h2>
					<ul>
						<li>
							<Link href='/extra-income'>Extra Income</Link>
						</li>
						<li>
							<Link href='/shopping-deals'>Shopping Deals</Link>
						</li>
						<li>
							<Link href='/start-a-blog'>Start A Blog</Link>
						</li>
						<li>
							<Link href='/breaking-news'>Breaking News</Link>
						</li>
						<li>
							<Link href='/financial-calculators'>Financial Calculators</Link>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
