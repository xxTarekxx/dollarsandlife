import React, { useEffect } from "react";

const FiverrWidget: React.FC = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://www.fiverr.com/gig_widgets/sdk";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return (
		<div
			dangerouslySetInnerHTML={{
				__html: `<iframe src="https://www.fiverr.com/gig_widgets?id=U2FsdGVkX18GS2Tp28i4y4I3OSAit3pWmG/l7846qBwZ5vQXSst4ZCcp2TD/zvxaipDQiFFdM0ciMsnFGdXkkt7iNKZyBM9TuFCMfQpcuH3vEDabiTHZ4NHXlSQxaR5lVYX7vvbUn/awMeArDvl779hjU+mF+g4tgMbWCIaE5WLHiBznQSa4h/GQ5m+9hFERdPpsxg2zqFwvHHkSrZzkch0MbfGfPJbA0Fd0ErJ8c6tKoh8K5WHJ0BCd3Q3FLLnMYJ8s8y1KNitCQZiAqKVQgPbLduEqqKoXgZtuhHDnfUUNYXfUQf5809YGcdXn5ggxBpH/P3STGSGio4blzYYmG5urdjBRNmL7XeipDj4T0TNCZqLX0cBSBxG2eURDd6/Ngknzl2rBLfHcgIDZtAuRjDza4p6kgTRFmxjG+N3vuja9aHyrbYMXzEAhQrsvhsQT4+3ZWOdtWBPjdB6fVPdGjw==&affiliate_id=1034557&strip_google_tagmanager=true" loading="lazy" data-with-title="true" class="fiverr_nga_frame" frameborder="0" height="350" width="100%" referrerpolicy="no-referrer-when-downgrade" data-mode="random_gigs" onload=" var frame = this; var script = document.createElement('script'); script.addEventListener('load', function() { window.FW_SDK.register(frame); }); script.setAttribute('src', 'https://www.fiverr.com/gig_widgets/sdk'); document.body.appendChild(script); " ></iframe>`,
			}}
		/>
	);
};

export default FiverrWidget;
