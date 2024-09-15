import React from "react";
import "./TermsOfService.css";
import AdComponent from "../components/AdComponent";

const TermsOfService: React.FC = () => {
	return (
		<main className='terms-of-service-content' role='main'>
			<h1 tabIndex={0}>Terms of Service</h1>

			<section className='content-section'>
				<p>
					Welcome to “Dollars And Life”, owned and operated by Texas Connect LLC
					("we," "us," or "our"). By accessing or using our website, you agree
					to comply with and be bound by the following Terms of Use. Please read
					them carefully.
				</p>

				<h2 tabIndex={0}>Acceptance of Terms</h2>
				<p>
					By using “www.dollarsandlife.com”, you agree to these Terms of Use and
					our Privacy Policy. If you do not agree, please do not use our site.
				</p>

				<h2 tabIndex={0}>Changes to Terms</h2>
				<p>
					We reserve the right to modify these Terms of Use at any time. Changes
					will be effective immediately upon posting on this page, and your
					continued use of the site will constitute your acceptance of the
					revised terms.
				</p>

				<h2 tabIndex={0}>Use of the Site</h2>
				<p>
					You agree to use “www.dollarsandlife.com” for lawful purposes only.
					You must not use the site in any way that causes, or may cause, damage
					to the site or impairment of the availability or accessibility of the
					site.
				</p>

				<h2 tabIndex={0}>FTC Disclosure and Affiliate Marketing</h2>
				<p>
					In compliance with the Federal Trade Commission (FTC) guidelines,
					please be aware of the following:
				</p>

				<p>
					<strong>Affiliate Links:</strong> www.dollarsandlife.com contains
					links to affiliate websites. If you choose to use these links, we may
					earn a commission at no additional cost to you. We only recommend
					products or services we believe will add value to our readers.
				</p>
				<p>
					<strong>Amazon Associate Program:</strong> Texas Connect LLC is a
					participant in the Amazon Services LLC Associates Program, an
					affiliate advertising program designed to provide a means for sites to
					earn advertising fees by advertising and linking to Amazon.com.
				</p>

				<h2 tabIndex={0}>Disclaimer</h2>
				<p>
					All information provided on “www.dollarsandlife.com” is for
					informational purposes only. We make no representations as to the
					accuracy, completeness, or validity of any information on this site
					and will not be liable for any errors, omissions, or delays in this
					information or any losses, injuries, or damages arising from its use.
				</p>

				<h2 tabIndex={0}>Limitation of Liability</h2>
				<p>
					To the fullest extent permitted by law, Texas Connect LLC disclaims
					all warranties, express or implied, regarding “www.dollarsandlife.com”
					and any services or products provided through our affiliate links. We
					will not be liable for any damages of any kind arising from the use of
					this site or from any information, content, materials, products
					(including software), or services included on or otherwise made
					available to you through this site.
				</p>

				<h2 tabIndex={0}>Indemnification</h2>
				<p>
					You agree to indemnify, defend, and hold harmless Texas Connect LLC,
					its officers, directors, employees, agents, licensors, and suppliers
					from and against all losses, expenses, damages, and costs, including
					reasonable attorneys' fees, resulting from any violation of these
					terms or any activity related to your account by you or any other
					person accessing the site using your account.
				</p>

				<h2 tabIndex={0}>Governing Law</h2>
				<p>
					These Terms of Use are governed by and construed in accordance with
					the laws of the State of Texas, without regard to its conflict of law
					principles. You agree to submit to the exclusive jurisdiction of the
					courts located in Texas for the resolution of any disputes.
				</p>

				<h2 tabIndex={0}>Contact Information</h2>
				<p>
					If you have any questions about these Terms of Use, please contact us
					at:
				</p>
				<p>
					<a href='mailto:contact@dollarsandlife.com'>
						Email: contact@dollarsandlife.com
					</a>
				</p>
				<p>
					Mail: Texas Connect LLC, 4364 Western Center Blvd, #2296 , Fort Worth,
					TX 76137
				</p>

				<p>
					By using “www.dollarsandlife.com”, you acknowledge that you have read,
					understood, and agree to be bound by these Terms of Use.
				</p>
			</section>
		</main>
	);
};

export default TermsOfService;
