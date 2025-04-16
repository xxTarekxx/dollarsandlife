import React from "react";
import "./ReturnPolicy.css";
import { Helmet } from "react-helmet-async";

const ReturnPolicy: React.FC = () => {
	return (
		<div className='return-policy-wrapper'>
			<Helmet>
				<title>Return Policy | Dollars & Life</title>
				<meta
					name='description'
					content='We accept returns only for defective products purchased through our affiliate partners. Exchanges are not accepted. See our policy for full guidance.'
				/>
			</Helmet>

			<section className='return-policy'>
				<h1>Return & Exchange Policy</h1>
				<p className='intro'>
					Dollars & Life participates in affiliate programs such as Amazon
					Associates. We do not sell or ship products directly. Therefore, all
					returns and support must be handled by the original retailer.
				</p>

				<div className='policy-box'>
					<h2>🔧 Returns for Defective Products Only</h2>
					<p>
						We only accept returns in cases where the product is defective. If
						you purchased an item through one of our affiliate links, please
						follow the return policy of the specific retailer.
					</p>
					<p>
						For Amazon purchases, visit their official{" "}
						<a
							href='https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7'
							target='_blank'
							rel='noopener noreferrer'
						>
							Returns Center
						</a>{" "}
						to initiate a return.
					</p>
				</div>

				<div className='policy-box'>
					<h2>🔁 Exchanges Not Accepted</h2>
					<p>
						We do not accept exchanges through our site. For any product
						replacement or size changes, please refer to the seller’s website
						where the item was originally purchased.
					</p>
				</div>

				<div className='help-box'>
					<p>
						Need help understanding a retailer’s return or exchange process?{" "}
						<a href='/contact-us'>Contact us</a>, and we’ll do our best to guide
						you.
					</p>
				</div>
			</section>
		</div>
	);
};

export default ReturnPolicy;
