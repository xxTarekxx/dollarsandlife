type ListingCardLabels = {
	ariaLabel: string;
	altText: string;
	captionText: string;
};

type ListingCommonCopy = {
	articlesLabel: string;
	readMore: string;
	readMoreAriaPrefix: string;
};

type ListingPageCopy = {
	title: string;
	description: string;
	ogTitle: string;
	ogDescription: string;
	eyebrow: string;
	headingLead: string;
	headingAccent: string;
	subtitle: string;
	intro: string;
	introAriaLabel: string;
	loadingLabel: string;
	errorPrefix: string;
	emptyLabel: string;
};

type ExtraIncomeCopy = ListingPageCopy & {
	categoryLinksAriaLabel: string;
	cards: {
		freelanceJobs: ListingCardLabels;
		budget: ListingCardLabels;
		remoteOnlineJobs: ListingCardLabels;
		moneyMakingApps: ListingCardLabels;
	};
};

type ListingPageTranslations = {
	common: ListingCommonCopy;
	extraIncome: ExtraIncomeCopy;
	freelanceJobs: ListingPageCopy;
	budget: ListingPageCopy;
	remoteOnlineJobs: ListingPageCopy;
	moneyMakingApps: ListingPageCopy;
	breakingNews: ListingPageCopy;
};

const en: ListingPageTranslations = {
	common: {
		articlesLabel: "articles",
		readMore: "Read more",
		readMoreAriaPrefix: "Read more about",
	},
	extraIncome: {
		title: "Extra Income Hub | Dollars & Life",
		description:
			"Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.",
		ogTitle: "Extra Income Hub | Dollars & Life",
		ogDescription:
			"Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.",
		eyebrow: "Extra Income",
		headingLead: "Extra",
		headingAccent: "Income",
		subtitle:
			"Practical strategies to earn more money, on your own schedule, from anywhere.",
		intro:
			"Explore practical guides on freelancing, remote jobs, money-making apps, and smart budgeting so you can earn more and keep more of what you make.",
		introAriaLabel: "About Extra Income",
		loadingLabel: "",
		errorPrefix: "",
		emptyLabel: "",
		categoryLinksAriaLabel: "Extra income categories",
		cards: {
			freelanceJobs: {
				ariaLabel: "Explore freelance opportunities",
				altText: "Freelance job opportunities",
				captionText: "Freelance Opportunities",
			},
			budget: {
				ariaLabel: "Learn budgeting strategies",
				altText: "Budgeting and financial planning",
				captionText: "Budgeting",
			},
			remoteOnlineJobs: {
				ariaLabel: "Find remote job opportunities",
				altText: "Remote jobs and online work",
				captionText: "Remote Jobs",
			},
			moneyMakingApps: {
				ariaLabel: "Earn money using apps",
				altText: "Apps to earn money online",
				captionText: "Make Money On Apps",
			},
		},
	},
	freelanceJobs: {
		title: "Freelance Jobs | Find Your Next Remote or Gig Opportunity",
		description:
			"Explore freelance jobs and opportunities in writing, design, development, and more.",
		ogTitle: "Freelance Jobs | Find Your Next Remote or Gig Opportunity",
		ogDescription:
			"Explore freelance jobs and opportunities in writing, design, development, and more.",
		eyebrow: "Extra Income",
		headingLead: "Freelance",
		headingAccent: "Jobs",
		subtitle:
			"Discover remote gigs and freelance opportunities in writing, design, development, and more.",
		intro:
			"Browse guides on the best freelance platforms, winning proposals, competitive rates, and turning side projects into steady freelance income.",
		introAriaLabel: "About Freelance Jobs",
		loadingLabel: "Loading freelance jobs...",
		errorPrefix: "Error loading jobs:",
		emptyLabel: "No freelance jobs found at the moment.",
	},
	budget: {
		title: "Budget Guides | Smart Financial Planning Tips & Strategies",
		description:
			"Discover budgeting tips, financial planning strategies, and money-saving techniques.",
		ogTitle: "Budget Guides | Smart Financial Planning Tips & Strategies",
		ogDescription:
			"Discover budgeting tips, financial planning strategies, and money-saving techniques.",
		eyebrow: "Extra Income",
		headingLead: "Budget",
		headingAccent: "Guides",
		subtitle:
			"Smart budgeting tips and financial planning strategies to help you save more, spend less, and build lasting wealth.",
		intro:
			"Explore practical budgeting guides that help you plan ahead, reduce waste, and make your money go further.",
		introAriaLabel: "About Budget Guides",
		loadingLabel: "Loading budget posts...",
		errorPrefix: "Error loading posts:",
		emptyLabel: "No budget posts found at the moment.",
	},
	remoteOnlineJobs: {
		title: "Remote & Online Jobs | Work-From-Home Opportunities",
		description:
			"Find the best remote and online jobs across customer service, data entry, virtual assistance, and more.",
		ogTitle: "Remote & Online Jobs | Work-From-Home Opportunities",
		ogDescription:
			"Find the best remote and online jobs across customer service, data entry, virtual assistance, and more.",
		eyebrow: "Extra Income",
		headingLead: "Remote & Online",
		headingAccent: "Jobs",
		subtitle:
			"Find the best work-from-home and remote opportunities across customer service, data entry, virtual assistance, and more.",
		intro:
			"Explore legitimate remote and online jobs, from full-time roles with benefits to flexible part-time opportunities.",
		introAriaLabel: "About Remote Online Jobs",
		loadingLabel: "Loading remote jobs...",
		errorPrefix: "Error loading jobs:",
		emptyLabel: "No remote jobs found at the moment.",
	},
	moneyMakingApps: {
		title: "Money Making Apps | Best Apps to Earn Cash",
		description:
			"Discover the best money-making apps to earn cash, gift cards, and rewards from your smartphone.",
		ogTitle: "Money Making Apps | Best Apps to Earn Cash",
		ogDescription:
			"Discover the best money-making apps to earn cash, gift cards, and rewards from your smartphone.",
		eyebrow: "Extra Income",
		headingLead: "Money Making",
		headingAccent: "Apps",
		subtitle:
			"Discover the best apps to earn cash, gift cards, and rewards directly from your smartphone.",
		intro:
			"Compare real money-making apps, understand how they pay, and find the best options for your time and goals.",
		introAriaLabel: "About Money Making Apps",
		loadingLabel: "Loading apps...",
		errorPrefix: "Error loading apps:",
		emptyLabel: "No money making apps found at the moment.",
	},
	breakingNews: {
		title: "Breaking News | Latest Financial and Economic Updates",
		description:
			"Stay updated with the latest financial, business, and economic breaking news.",
		ogTitle: "Breaking News | Latest Financial and Economic Updates",
		ogDescription:
			"Stay updated with the latest financial, business, and economic breaking news.",
		eyebrow: "Latest News",
		headingLead: "Breaking",
		headingAccent: "News",
		subtitle:
			"Stay updated with the latest financial, business, and economic news with real-time insights on the stories that matter most.",
		intro:
			"Follow fast-moving finance and business coverage, with headlines and explainers that help you keep up.",
		introAriaLabel: "About Breaking News",
		loadingLabel: "Loading breaking news...",
		errorPrefix: "Error loading news:",
		emptyLabel: "No breaking news found at the moment.",
	},
};

const simpleOverrides: Partial<Record<string, Partial<ListingPageTranslations>>> = {
	fr: {
		common: {
			articlesLabel: "articles",
			readMore: "Lire la suite",
			readMoreAriaPrefix: "Lire la suite sur",
		},
		extraIncome: {
			title: "Centre de Revenus Supplémentaires | Dollars & Life",
			description:
				"Découvrez des moyens de gagner un revenu supplémentaire grâce au freelancing, aux emplois à distance, au budget et aux applications rémunératrices.",
			ogTitle: "Centre de Revenus Supplémentaires | Dollars & Life",
			ogDescription:
				"Découvrez des moyens de gagner un revenu supplémentaire grâce au freelancing, aux emplois à distance, au budget et aux applications rémunératrices.",
			eyebrow: "Revenus Supplémentaires",
			headingLead: "Revenus",
			headingAccent: "Supplémentaires",
			subtitle:
				"Des stratégies concrètes pour gagner plus d'argent, à votre rythme et depuis n'importe où.",
			intro:
				"Explorez des guides pratiques sur le freelancing, les emplois à distance, les applications rémunératrices et le budget malin.",
			introAriaLabel: "À propos des revenus supplémentaires",
			loadingLabel: "",
			errorPrefix: "",
			emptyLabel: "",
			categoryLinksAriaLabel: "Catégories de revenus supplémentaires",
			cards: {
				freelanceJobs: {
					ariaLabel: "Explorer les opportunités freelance",
					altText: "Opportunités d'emploi freelance",
					captionText: "Opportunités Freelance",
				},
				budget: {
					ariaLabel: "Découvrir des stratégies budgétaires",
					altText: "Budget et planification financière",
					captionText: "Budget",
				},
				remoteOnlineJobs: {
					ariaLabel: "Trouver des emplois à distance",
					altText: "Emplois à distance et travail en ligne",
					captionText: "Emplois à Distance",
				},
				moneyMakingApps: {
					ariaLabel: "Gagner de l'argent avec des applications",
					altText: "Applications pour gagner de l'argent en ligne",
					captionText: "Applications Rémunératrices",
				},
			},
		},
		freelanceJobs: {
			title: "Emplois Freelance | Trouvez votre prochaine mission",
			description:
				"Découvrez des missions freelance en rédaction, design, développement et bien plus.",
			ogTitle: "Emplois Freelance | Trouvez votre prochaine mission",
			ogDescription:
				"Découvrez des missions freelance en rédaction, design, développement et bien plus.",
			eyebrow: "Revenus Supplémentaires",
			headingLead: "Emplois",
			headingAccent: "Freelance",
			subtitle:
				"Découvrez des missions à distance et des opportunités freelance en rédaction, design, développement et plus encore.",
			intro:
				"Parcourez des guides sur les meilleures plateformes freelance, les propositions gagnantes et les tarifs compétitifs.",
			introAriaLabel: "À propos des emplois freelance",
			loadingLabel: "Chargement des emplois freelance...",
			errorPrefix: "Erreur lors du chargement :",
			emptyLabel: "Aucun emploi freelance trouvé pour le moment.",
		},
		budget: {
			title: "Guides Budget | Conseils et stratégies financières",
			description:
				"Découvrez des conseils de budget, des stratégies financières et des techniques pour économiser.",
			ogTitle: "Guides Budget | Conseils et stratégies financières",
			ogDescription:
				"Découvrez des conseils de budget, des stratégies financières et des techniques pour économiser.",
			eyebrow: "Revenus Supplémentaires",
			headingLead: "Guides",
			headingAccent: "Budget",
			subtitle:
				"Des conseils budgétaires et des stratégies financières pour épargner davantage et mieux dépenser.",
			intro:
				"Explorez des guides pratiques pour planifier à l'avance, réduire les dépenses inutiles et mieux utiliser votre argent.",
			introAriaLabel: "À propos des guides budget",
			loadingLabel: "Chargement des articles budget...",
			errorPrefix: "Erreur lors du chargement :",
			emptyLabel: "Aucun article budget trouvé pour le moment.",
		},
		remoteOnlineJobs: {
			title: "Emplois à Distance et en Ligne | Opportunités à domicile",
			description:
				"Trouvez les meilleurs emplois à distance et en ligne dans le service client, la saisie de données, l'assistance virtuelle et plus encore.",
			ogTitle: "Emplois à Distance et en Ligne | Opportunités à domicile",
			ogDescription:
				"Trouvez les meilleurs emplois à distance et en ligne dans le service client, la saisie de données, l'assistance virtuelle et plus encore.",
			eyebrow: "Revenus Supplémentaires",
			headingLead: "Emplois à Distance",
			headingAccent: "et en Ligne",
			subtitle:
				"Trouvez les meilleures opportunités de travail à domicile en service client, saisie de données, assistance virtuelle et plus encore.",
			intro:
				"Explorez des emplois à distance légitimes, des postes à temps plein aux opportunités flexibles à temps partiel.",
			introAriaLabel: "À propos des emplois à distance et en ligne",
			loadingLabel: "Chargement des emplois à distance...",
			errorPrefix: "Erreur lors du chargement :",
			emptyLabel: "Aucun emploi à distance trouvé pour le moment.",
		},
		moneyMakingApps: {
			title: "Applications pour Gagner de l'Argent | Meilleures applis",
			description:
				"Découvrez les meilleures applications pour gagner de l'argent, des cartes-cadeaux et des récompenses depuis votre smartphone.",
			ogTitle: "Applications pour Gagner de l'Argent | Meilleures applis",
			ogDescription:
				"Découvrez les meilleures applications pour gagner de l'argent, des cartes-cadeaux et des récompenses depuis votre smartphone.",
			eyebrow: "Revenus Supplémentaires",
			headingLead: "Applications pour",
			headingAccent: "Gagner de l'Argent",
			subtitle:
				"Découvrez les meilleures applications pour gagner de l'argent, des cartes-cadeaux et des récompenses directement depuis votre smartphone.",
			intro:
				"Comparez de vraies applications rémunératrices, comprenez leur fonctionnement et trouvez celles qui correspondent à votre temps et à vos objectifs.",
			introAriaLabel: "À propos des applications rémunératrices",
			loadingLabel: "Chargement des applications...",
			errorPrefix: "Erreur lors du chargement :",
			emptyLabel: "Aucune application rémunératrice trouvée pour le moment.",
		},
		breakingNews: {
			title: "Dernières Nouvelles | Actualités financières et économiques",
			description:
				"Restez informé des dernières actualités financières, économiques et business.",
			ogTitle: "Dernières Nouvelles | Actualités financières et économiques",
			ogDescription:
				"Restez informé des dernières actualités financières, économiques et business.",
			eyebrow: "Dernières Nouvelles",
			headingLead: "Dernières",
			headingAccent: "Nouvelles",
			subtitle:
				"Suivez les dernières actualités financières, économiques et business avec des informations en temps réel.",
			intro:
				"Suivez l'actualité rapide de la finance et du business avec des titres et des explications claires.",
			introAriaLabel: "À propos des dernières nouvelles",
			loadingLabel: "Chargement des dernières nouvelles...",
			errorPrefix: "Erreur lors du chargement :",
			emptyLabel: "Aucune actualité trouvée pour le moment.",
		},
	},
	es: {
		common: {
			articlesLabel: "artículos",
			readMore: "Leer más",
			readMoreAriaPrefix: "Leer más sobre",
		},
	},
	zh: {
		common: {
			articlesLabel: "篇文章",
			readMore: "阅读更多",
			readMoreAriaPrefix: "阅读更多关于",
		},
		extraIncome: {
			title: "额外收入中心 | Dollars & Life",
			description:
				"探索自由职业、远程工作、预算规划和赚钱应用等多种额外收入方式。",
			ogTitle: "额外收入中心 | Dollars & Life",
			ogDescription:
				"探索自由职业、远程工作、预算规划和赚钱应用等多种额外收入方式。",
			eyebrow: "额外收入",
			headingLead: "额外",
			headingAccent: "收入",
			subtitle: "实用策略，帮助你随时随地按自己的节奏赚更多钱。",
			intro: "浏览关于自由职业、远程工作、赚钱应用和聪明预算的实用指南。",
			introAriaLabel: "关于额外收入",
			loadingLabel: "",
			errorPrefix: "",
			emptyLabel: "",
			categoryLinksAriaLabel: "额外收入分类",
			cards: {
				freelanceJobs: {
					ariaLabel: "查看自由职业机会",
					altText: "自由职业机会",
					captionText: "自由职业机会",
				},
				budget: {
					ariaLabel: "了解预算策略",
					altText: "预算与财务规划",
					captionText: "预算规划",
				},
				remoteOnlineJobs: {
					ariaLabel: "查找远程工作机会",
					altText: "远程与在线工作",
					captionText: "远程工作",
				},
				moneyMakingApps: {
					ariaLabel: "通过应用赚钱",
					altText: "在线赚钱应用",
					captionText: "赚钱应用",
				},
			},
		},
		freelanceJobs: {
			title: "自由职业工作 | 找到你的下一份机会",
			description: "探索写作、设计、开发等领域的自由职业机会。",
			ogTitle: "自由职业工作 | 找到你的下一份机会",
			ogDescription: "探索写作、设计、开发等领域的自由职业机会。",
			eyebrow: "额外收入",
			headingLead: "自由职业",
			headingAccent: "工作",
			subtitle: "发现写作、设计、开发等领域的远程项目和自由职业机会。",
			intro: "查看最佳自由职业平台、提案技巧和定价策略指南。",
			introAriaLabel: "关于自由职业工作",
			loadingLabel: "正在加载自由职业工作...",
			errorPrefix: "加载工作时出错：",
			emptyLabel: "目前没有找到自由职业工作。",
		},
		budget: {
			title: "预算指南 | 更聪明的财务规划技巧",
			description: "了解预算技巧、财务规划策略和省钱方法。",
			ogTitle: "预算指南 | 更聪明的财务规划技巧",
			ogDescription: "了解预算技巧、财务规划策略和省钱方法。",
			eyebrow: "额外收入",
			headingLead: "预算",
			headingAccent: "指南",
			subtitle: "用更聪明的预算和财务规划策略帮助你多存钱、少浪费。",
			intro: "探索实用预算指南，帮助你提前规划、减少浪费，让每一分钱更有价值。",
			introAriaLabel: "关于预算指南",
			loadingLabel: "正在加载预算文章...",
			errorPrefix: "加载文章时出错：",
			emptyLabel: "目前没有找到预算文章。",
		},
		remoteOnlineJobs: {
			title: "远程与在线工作 | 居家工作机会",
			description:
				"寻找客户服务、数据录入、虚拟助理等领域的优质远程和在线工作。",
			ogTitle: "远程与在线工作 | 居家工作机会",
			ogDescription:
				"寻找客户服务、数据录入、虚拟助理等领域的优质远程和在线工作。",
			eyebrow: "额外收入",
			headingLead: "远程与在线",
			headingAccent: "工作",
			subtitle: "寻找客户服务、数据录入、虚拟助理等领域最好的居家工作机会。",
			intro: "探索真实可靠的远程与在线工作，从全职岗位到灵活兼职机会。",
			introAriaLabel: "关于远程与在线工作",
			loadingLabel: "正在加载远程工作...",
			errorPrefix: "加载工作时出错：",
			emptyLabel: "目前没有找到远程工作。",
		},
		moneyMakingApps: {
			title: "赚钱应用 | 最佳手机赚钱应用",
			description: "发现可以通过手机赚取现金、礼品卡和奖励的最佳应用。",
			ogTitle: "赚钱应用 | 最佳手机赚钱应用",
			ogDescription: "发现可以通过手机赚取现金、礼品卡和奖励的最佳应用。",
			eyebrow: "额外收入",
			headingLead: "赚钱",
			headingAccent: "应用",
			subtitle: "发现可直接通过智能手机赚现金、礼品卡和奖励的最佳应用。",
			intro: "比较真实赚钱应用，了解它们的支付方式，并找到最适合你时间和目标的选择。",
			introAriaLabel: "关于赚钱应用",
			loadingLabel: "正在加载应用...",
			errorPrefix: "加载应用时出错：",
			emptyLabel: "目前没有找到赚钱应用。",
		},
		breakingNews: {
			title: "突发新闻 | 最新财经与经济动态",
			description: "及时了解最新金融、商业和经济突发新闻。",
			ogTitle: "突发新闻 | 最新财经与经济动态",
			ogDescription: "及时了解最新金融、商业和经济突发新闻。",
			eyebrow: "最新消息",
			headingLead: "突发",
			headingAccent: "新闻",
			subtitle: "通过实时洞察，及时掌握最重要的金融、商业和经济新闻。",
			intro: "关注快速变化的财经与商业报道，轻松掌握关键头条和解读。",
			introAriaLabel: "关于突发新闻",
			loadingLabel: "正在加载突发新闻...",
			errorPrefix: "加载新闻时出错：",
			emptyLabel: "目前没有找到新闻。",
		},
	},
	ar: {
		common: {
			articlesLabel: "مقالات",
			readMore: "اقرأ المزيد",
			readMoreAriaPrefix: "اقرأ المزيد عن",
		},
	},
	pt: {
		common: {
			articlesLabel: "artigos",
			readMore: "Leia mais",
			readMoreAriaPrefix: "Leia mais sobre",
		},
	},
	id: {
		common: {
			articlesLabel: "artikel",
			readMore: "Baca selengkapnya",
			readMoreAriaPrefix: "Baca selengkapnya tentang",
		},
	},
	ja: {
		common: {
			articlesLabel: "件の記事",
			readMore: "続きを読む",
			readMoreAriaPrefix: "詳しく読む",
		},
	},
	ru: {
		common: {
			articlesLabel: "статей",
			readMore: "Читать далее",
			readMoreAriaPrefix: "Подробнее о",
		},
	},
	de: {
		common: {
			articlesLabel: "Artikel",
			readMore: "Mehr lesen",
			readMoreAriaPrefix: "Mehr lesen über",
		},
	},
	ko: {
		common: {
			articlesLabel: "개 글",
			readMore: "더 읽기",
			readMoreAriaPrefix: "다음 내용 더 읽기",
		},
	},
};

function mergeTranslations(
	base: ListingPageTranslations,
	override?: Partial<ListingPageTranslations>,
): ListingPageTranslations {
	return {
		common: { ...base.common, ...override?.common },
		extraIncome: { ...base.extraIncome, ...override?.extraIncome },
		freelanceJobs: { ...base.freelanceJobs, ...override?.freelanceJobs },
		budget: { ...base.budget, ...override?.budget },
		remoteOnlineJobs: {
			...base.remoteOnlineJobs,
			...override?.remoteOnlineJobs,
		},
		moneyMakingApps: {
			...base.moneyMakingApps,
			...override?.moneyMakingApps,
		},
		breakingNews: { ...base.breakingNews, ...override?.breakingNews },
	};
}

export function getListingPageTranslations(lang: string): ListingPageTranslations {
	return mergeTranslations(en, simpleOverrides[lang]);
}
