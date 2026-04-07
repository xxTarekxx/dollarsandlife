export const LEGAL_LANGS = [
	"en",
	"zh",
	"es",
	"ar",
	"pt",
	"id",
	"fr",
	"ja",
	"ru",
	"de",
] as const;

export type LegalLang = (typeof LEGAL_LANGS)[number];

export function resolveLegalLang(lang: string): LegalLang {
	return (LEGAL_LANGS as readonly string[]).includes(lang)
		? (lang as LegalLang)
		: "en";
}

export type PrivacyContent = {
	title: string;
	seoTitle: string;
	seoDescription: string;
	intro: string;
	sections: Array<{ heading: string; text: string }>;
	contact: string;
};

export type TermsContent = {
	title: string;
	seoTitle: string;
	seoDescription: string;
	intro: string;
	acceptanceHeading: string;
	acceptanceTextBeforeLink: string;
	acceptanceTextAfterLink: string;
	sections: Array<{ heading: string; text: string }>;
	contactHeading: string;
	contactText: string;
	address: string;
};

export const PRIVACY_PAGE_CONTENT: Record<LegalLang, PrivacyContent> = {
	en: {
		title: "Privacy Policy",
		seoTitle: "Privacy Policy | Dollars And Life - Your Data Rights",
		seoDescription:
			"Read our Privacy Policy, including information on data collection, usage, advertisements, and user rights.",
		intro:
			'Dollars And Life ("we," "us," "our") is committed to protecting your privacy. By using www.dollarsandlife.com, you agree to this Privacy Policy.',
		sections: [
			{
				heading: "Information We Collect",
				text: "We may collect personal information and usage data through cookies, Google Analytics, and AdSense to improve user experience and advertising relevance.",
			},
			{
				heading: "How We Use Your Information",
				text: "Your information helps us improve site functionality, provide relevant ads, and analyze how users interact with our content.",
			},
			{
				heading: "Advertising and Cookies",
				text: "We use cookies and similar technologies. You can manage ad personalization settings in Google Ads Settings.",
			},
			{
				heading: "User Rights",
				text: "Depending on your location, you may have rights under privacy laws such as GDPR or CCPA to request access, correction, or deletion of your data.",
			},
			{
				heading: "Changes to This Policy",
				text: "We may update this Privacy Policy from time to time. Please review this page periodically for changes.",
			},
		],
		contact:
			"For privacy-related questions, contact us at contact@dollarsandlife.com or by mail via Texas Connect LLC.",
	},
	zh: {
		title: "隐私政策",
		seoTitle: "隐私政策 | Dollars And Life - 您的数据权利",
		seoDescription: "阅读我们的隐私政策，了解数据收集、使用、广告以及您的用户权利。",
		intro:
			'Dollars And Life（"我们"）致力于保护您的隐私。使用 www.dollarsandlife.com 即表示您同意本隐私政策。',
		sections: [
			{ heading: "我们收集的信息", text: "我们可能通过 Cookie、Google Analytics 和 AdSense 收集个人信息与使用数据，以改进体验和广告相关性。" },
			{ heading: "我们如何使用信息", text: "这些信息用于优化网站功能、提供更相关的广告，并分析用户与内容的互动方式。" },
			{ heading: "广告与 Cookie", text: "我们使用 Cookie 和类似技术。您可在 Google Ads 设置中管理个性化广告选项。" },
			{ heading: "用户权利", text: "根据您所在地区，您可能拥有 GDPR 或 CCPA 等法规下的数据访问、更正或删除权利。" },
			{ heading: "政策更新", text: "我们可能会不时更新本隐私政策。请定期查看本页面以了解最新内容。" },
		],
		contact: "如有隐私相关问题，请发送邮件至 contact@dollarsandlife.com，或邮寄联系 Texas Connect LLC。",
	},
	es: {
		title: "Política de Privacidad",
		seoTitle: "Política de Privacidad | Dollars And Life - Tus derechos de datos",
		seoDescription:
			"Lee nuestra Política de Privacidad sobre recopilación de datos, uso, publicidad y derechos del usuario.",
		intro:
			'Dollars And Life ("nosotros") se compromete a proteger tu privacidad. Al usar www.dollarsandlife.com, aceptas esta Política de Privacidad.',
		sections: [
			{ heading: "Información que recopilamos", text: "Podemos recopilar información personal y datos de uso mediante cookies, Google Analytics y AdSense para mejorar la experiencia y la publicidad." },
			{ heading: "Cómo usamos tu información", text: "Usamos tus datos para mejorar el sitio, mostrar anuncios relevantes y analizar la interacción de los usuarios." },
			{ heading: "Publicidad y cookies", text: "Usamos cookies y tecnologías similares. Puedes gestionar la personalización de anuncios en la configuración de Google Ads." },
			{ heading: "Derechos del usuario", text: "Según tu ubicación, puedes tener derechos bajo leyes como GDPR o CCPA para acceder, corregir o eliminar tus datos." },
			{ heading: "Cambios en esta política", text: "Podemos actualizar esta política periódicamente. Revisa esta página de forma regular." },
		],
		contact:
			"Para consultas de privacidad, escríbenos a contact@dollarsandlife.com o por correo postal a Texas Connect LLC.",
	},
	ar: {
		title: "سياسة الخصوصية",
		seoTitle: "سياسة الخصوصية | Dollars And Life - حقوق بياناتك",
		seoDescription: "اطلع على سياسة الخصوصية الخاصة بنا حول جمع البيانات واستخدامها والإعلانات وحقوق المستخدم.",
		intro:
			'Dollars And Life ("نحن") ملتزم بحماية خصوصيتك. باستخدام www.dollarsandlife.com فإنك توافق على سياسة الخصوصية هذه.',
		sections: [
			{ heading: "المعلومات التي نجمعها", text: "قد نجمع معلومات شخصية وبيانات استخدام عبر ملفات تعريف الارتباط وGoogle Analytics وAdSense لتحسين التجربة والإعلانات." },
			{ heading: "كيف نستخدم معلوماتك", text: "نستخدم المعلومات لتحسين وظائف الموقع، وتقديم إعلانات ذات صلة، وتحليل تفاعل المستخدمين مع المحتوى." },
			{ heading: "الإعلانات وملفات تعريف الارتباط", text: "نستخدم ملفات تعريف الارتباط وتقنيات مشابهة. يمكنك إدارة تخصيص الإعلانات من إعدادات Google Ads." },
			{ heading: "حقوق المستخدم", text: "حسب موقعك، قد تكون لديك حقوق بموجب قوانين مثل GDPR أو CCPA لطلب الوصول إلى بياناتك أو تصحيحها أو حذفها." },
			{ heading: "تحديثات السياسة", text: "قد نقوم بتحديث هذه السياسة من وقت لآخر. يرجى مراجعة هذه الصفحة بشكل دوري." },
		],
		contact: "للاستفسارات المتعلقة بالخصوصية، تواصل معنا عبر contact@dollarsandlife.com أو عبر البريد إلى Texas Connect LLC.",
	},
	pt: {
		title: "Política de Privacidade",
		seoTitle: "Política de Privacidade | Dollars And Life - Seus direitos de dados",
		seoDescription: "Leia nossa Política de Privacidade sobre coleta de dados, uso, publicidade e direitos do usuário.",
		intro:
			'Dollars And Life ("nós") está comprometido em proteger sua privacidade. Ao usar www.dollarsandlife.com, você concorda com esta Política de Privacidade.',
		sections: [
			{ heading: "Informações que coletamos", text: "Podemos coletar dados pessoais e de uso por cookies, Google Analytics e AdSense para melhorar a experiência e a publicidade." },
			{ heading: "Como usamos suas informações", text: "Usamos os dados para melhorar o site, exibir anúncios relevantes e analisar a interação dos usuários." },
			{ heading: "Publicidade e cookies", text: "Usamos cookies e tecnologias semelhantes. Você pode gerenciar personalização de anúncios nas configurações do Google Ads." },
			{ heading: "Direitos do usuário", text: "Dependendo da sua localização, você pode ter direitos sob GDPR ou CCPA para acessar, corrigir ou excluir seus dados." },
			{ heading: "Alterações nesta política", text: "Podemos atualizar esta política periodicamente. Revise esta página com frequência." },
		],
		contact:
			"Para dúvidas de privacidade, fale conosco em contact@dollarsandlife.com ou por correio via Texas Connect LLC.",
	},
	id: {
		title: "Kebijakan Privasi",
		seoTitle: "Kebijakan Privasi | Dollars And Life - Hak data Anda",
		seoDescription: "Baca Kebijakan Privasi kami tentang pengumpulan data, penggunaan, iklan, dan hak pengguna.",
		intro:
			'Dollars And Life ("kami") berkomitmen melindungi privasi Anda. Dengan menggunakan www.dollarsandlife.com, Anda menyetujui Kebijakan Privasi ini.',
		sections: [
			{ heading: "Informasi yang kami kumpulkan", text: "Kami dapat mengumpulkan informasi pribadi dan data penggunaan melalui cookie, Google Analytics, dan AdSense untuk meningkatkan pengalaman pengguna." },
			{ heading: "Cara kami menggunakan informasi", text: "Informasi digunakan untuk meningkatkan fungsi situs, menampilkan iklan yang relevan, dan menganalisis interaksi pengguna." },
			{ heading: "Iklan dan cookie", text: "Kami menggunakan cookie dan teknologi serupa. Anda dapat mengelola personalisasi iklan di pengaturan Google Ads." },
			{ heading: "Hak pengguna", text: "Bergantung lokasi Anda, Anda mungkin memiliki hak berdasarkan GDPR atau CCPA untuk mengakses, memperbaiki, atau menghapus data." },
			{ heading: "Perubahan kebijakan", text: "Kami dapat memperbarui kebijakan ini secara berkala. Silakan tinjau halaman ini secara rutin." },
		],
		contact:
			"Untuk pertanyaan privasi, hubungi kami di contact@dollarsandlife.com atau melalui surat ke Texas Connect LLC.",
	},
	fr: {
		title: "Politique de confidentialité",
		seoTitle: "Politique de confidentialité | Dollars And Life - Vos droits sur les données",
		seoDescription:
			"Consultez notre politique de confidentialité concernant la collecte des données, leur usage, la publicité et vos droits.",
		intro:
			'Dollars And Life ("nous") s’engage à protéger votre vie privée. En utilisant www.dollarsandlife.com, vous acceptez cette politique.',
		sections: [
			{ heading: "Informations collectées", text: "Nous pouvons collecter des informations personnelles et des données d’usage via cookies, Google Analytics et AdSense." },
			{ heading: "Utilisation des informations", text: "Ces données servent à améliorer le site, proposer des publicités pertinentes et analyser les interactions des utilisateurs." },
			{ heading: "Publicité et cookies", text: "Nous utilisons des cookies et technologies similaires. Vous pouvez gérer la personnalisation publicitaire via Google Ads." },
			{ heading: "Droits des utilisateurs", text: "Selon votre région, vous pouvez disposer de droits (GDPR, CCPA) pour accéder, corriger ou supprimer vos données." },
			{ heading: "Mises à jour", text: "Cette politique peut être modifiée périodiquement. Veuillez consulter cette page régulièrement." },
		],
		contact:
			"Pour toute question liée à la confidentialité, contactez-nous à contact@dollarsandlife.com ou par courrier via Texas Connect LLC.",
	},
	ja: {
		title: "プライバシーポリシー",
		seoTitle: "プライバシーポリシー | Dollars And Life - データに関する権利",
		seoDescription: "データ収集、利用、広告、ユーザーの権利に関する当社のプライバシーポリシーをご確認ください。",
		intro:
			'Dollars And Life（「当社」）はお客様のプライバシー保護に努めます。www.dollarsandlife.com を利用することで本ポリシーに同意したものとみなされます。',
		sections: [
			{ heading: "収集する情報", text: "Cookie、Google Analytics、AdSense を通じて個人情報および利用データを収集する場合があります。" },
			{ heading: "情報の利用目的", text: "サイト機能の改善、関連性の高い広告表示、ユーザー行動の分析に利用します。" },
			{ heading: "広告とCookie", text: "当社はCookie等を使用します。広告のパーソナライズは Google Ads 設定で管理できます。" },
			{ heading: "ユーザーの権利", text: "地域により、GDPR や CCPA などに基づくデータの開示・訂正・削除請求権がある場合があります。" },
			{ heading: "ポリシーの変更", text: "本ポリシーは随時更新される場合があります。定期的にご確認ください。" },
		],
		contact: "プライバシーに関するお問い合わせは contact@dollarsandlife.com までご連絡ください。",
	},
	ru: {
		title: "Политика конфиденциальности",
		seoTitle: "Политика конфиденциальности | Dollars And Life - Ваши права на данные",
		seoDescription:
			"Ознакомьтесь с нашей политикой конфиденциальности: сбор данных, использование, реклама и права пользователей.",
		intro:
			'Dollars And Life («мы») обязуется защищать вашу конфиденциальность. Используя www.dollarsandlife.com, вы соглашаетесь с этой политикой.',
		sections: [
			{ heading: "Какие данные мы собираем", text: "Мы можем собирать персональные и поведенческие данные через cookie, Google Analytics и AdSense." },
			{ heading: "Как мы используем данные", text: "Данные помогают улучшать сайт, показывать релевантную рекламу и анализировать взаимодействие пользователей." },
			{ heading: "Реклама и cookie", text: "Мы используем cookie и похожие технологии. Персонализацию рекламы можно настроить в Google Ads." },
			{ heading: "Права пользователей", text: "В зависимости от вашей юрисдикции у вас могут быть права по GDPR/CCPA на доступ, исправление и удаление данных." },
			{ heading: "Изменения политики", text: "Мы можем периодически обновлять эту политику. Пожалуйста, проверяйте страницу регулярно." },
		],
		contact:
			"По вопросам конфиденциальности пишите на contact@dollarsandlife.com или по почте в Texas Connect LLC.",
	},
	de: {
		title: "Datenschutzerklärung",
		seoTitle: "Datenschutzerklärung | Dollars And Life - Ihre Datenrechte",
		seoDescription:
			"Lesen Sie unsere Datenschutzerklärung zu Datenerhebung, Nutzung, Werbung und Ihren Nutzerrechten.",
		intro:
			'Dollars And Life („wir“) verpflichtet sich zum Schutz Ihrer Privatsphäre. Mit der Nutzung von www.dollarsandlife.com stimmen Sie dieser Erklärung zu.',
		sections: [
			{ heading: "Welche Daten wir erfassen", text: "Wir können personenbezogene Informationen und Nutzungsdaten über Cookies, Google Analytics und AdSense erfassen." },
			{ heading: "Wie wir Ihre Daten nutzen", text: "Die Daten helfen uns, die Website zu verbessern, relevante Werbung anzuzeigen und Nutzerinteraktionen zu analysieren." },
			{ heading: "Werbung und Cookies", text: "Wir verwenden Cookies und ähnliche Technologien. Die Anzeigenpersonalisierung können Sie in Google Ads verwalten." },
			{ heading: "Nutzerrechte", text: "Je nach Standort haben Sie ggf. Rechte nach DSGVO oder CCPA auf Auskunft, Berichtigung oder Löschung Ihrer Daten." },
			{ heading: "Änderungen dieser Richtlinie", text: "Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Bitte prüfen Sie diese Seite regelmäßig." },
		],
		contact:
			"Bei Fragen zum Datenschutz kontaktieren Sie uns unter contact@dollarsandlife.com oder per Post über Texas Connect LLC.",
	},
};

export const TERMS_PAGE_CONTENT: Record<LegalLang, TermsContent> = {
	en: {
		title: "Terms of Service",
		seoTitle: "Terms of Service | Dollars And Life - Legal Agreements",
		seoDescription:
			"Read the terms of service for Dollars And Life, including information on affiliate links, disclaimers, and legal agreements.",
		intro:
			'Dollars And Life is owned and operated by Texas Connect LLC ("we," "us," or "our"). By using this website, you agree to these Terms of Use.',
		acceptanceHeading: "Acceptance of Terms",
		acceptanceTextBeforeLink: "By using www.dollarsandlife.com, you agree to these Terms of Use and our",
		acceptanceTextAfterLink: "If you do not agree, please discontinue use.",
		sections: [
			{ heading: "Changes to Terms", text: "We may modify these Terms at any time. Changes become effective once posted on this page." },
			{ heading: "Use of the Site", text: "You must use this website lawfully and must not perform actions that harm the site, systems, or other users." },
			{ heading: "FTC Disclosure and Affiliate Marketing", text: "We may participate in affiliate programs. Some links can generate commissions at no additional cost to you." },
			{ heading: "Disclaimer", text: "Content is provided for informational purposes only. We do not guarantee completeness, reliability, or fitness for a specific purpose." },
			{ heading: "Limitation of Liability", text: "To the maximum extent allowed by law, Texas Connect LLC disclaims liability for damages arising from site use." },
			{ heading: "Governing Law", text: "These Terms are governed by the laws of the State of Texas." },
		],
		contactHeading: "Contact Information",
		contactText: "For questions, contact us at contact@dollarsandlife.com or mail us at:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	zh: {
		title: "服务条款",
		seoTitle: "服务条款 | Dollars And Life - 法律协议",
		seoDescription: "阅读 Dollars And Life 的服务条款，包括联盟链接、免责声明和法律协议。",
		intro: "Dollars And Life 由 Texas Connect LLC 运营。使用本网站即表示您同意本使用条款。",
		acceptanceHeading: "条款接受",
		acceptanceTextBeforeLink: "使用 www.dollarsandlife.com 即表示您同意本条款以及我们的",
		acceptanceTextAfterLink: "若您不同意，请停止使用。",
		sections: [
			{ heading: "条款变更", text: "我们可随时修改条款，发布后立即生效。" },
			{ heading: "网站使用", text: "您必须合法使用本网站，不得从事损害网站或其他用户的行为。" },
			{ heading: "联盟营销披露", text: "我们可能参与联盟营销计划。部分链接可能为我们带来佣金，且不会增加您的费用。" },
			{ heading: "免责声明", text: "本网站信息仅供参考。我们不保证信息完整性或适用性。" },
			{ heading: "责任限制", text: "在法律允许范围内，Texas Connect LLC 对因使用本网站产生的损失不承担责任。" },
			{ heading: "适用法律", text: "本条款受美国德克萨斯州法律管辖。" },
		],
		contactHeading: "联系方式",
		contactText: "如有疑问，请联系 contact@dollarsandlife.com，或邮寄至：",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	es: {
		title: "Términos de Servicio",
		seoTitle: "Términos de Servicio | Dollars And Life - Acuerdos legales",
		seoDescription:
			"Lee los términos de servicio de Dollars And Life, incluyendo enlaces de afiliados, avisos legales y acuerdos.",
		intro: "Dollars And Life es operado por Texas Connect LLC. Al usar este sitio, aceptas estos Términos de Uso.",
		acceptanceHeading: "Aceptación de los términos",
		acceptanceTextBeforeLink: "Al usar www.dollarsandlife.com, aceptas estos Términos de Uso y nuestra",
		acceptanceTextAfterLink: "Si no estás de acuerdo, deja de usar el sitio.",
		sections: [
			{ heading: "Cambios en los términos", text: "Podemos modificar estos términos en cualquier momento. Los cambios entran en vigor al publicarse." },
			{ heading: "Uso del sitio", text: "Debes usar el sitio de forma legal y no realizar actividades que dañen el sitio o a otros usuarios." },
			{ heading: "Divulgación FTC y afiliados", text: "Podemos participar en programas de afiliados. Algunos enlaces pueden generar comisión sin costo extra para ti." },
			{ heading: "Descargo de responsabilidad", text: "La información es solo informativa. No garantizamos exactitud o integridad total." },
			{ heading: "Limitación de responsabilidad", text: "En la máxima medida permitida por la ley, Texas Connect LLC limita su responsabilidad por daños derivados del uso del sitio." },
			{ heading: "Ley aplicable", text: "Estos términos se rigen por las leyes del Estado de Texas." },
		],
		contactHeading: "Información de contacto",
		contactText: "Para preguntas, contáctanos en contact@dollarsandlife.com o por correo a:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	ar: {
		title: "شروط الخدمة",
		seoTitle: "شروط الخدمة | Dollars And Life - اتفاقيات قانونية",
		seoDescription: "اقرأ شروط خدمة Dollars And Life بما في ذلك روابط التسويق بالعمولة وإخلاءات المسؤولية.",
		intro: "يتم تشغيل Dollars And Life بواسطة Texas Connect LLC. باستخدامك للموقع فإنك توافق على هذه الشروط.",
		acceptanceHeading: "قبول الشروط",
		acceptanceTextBeforeLink: "باستخدام www.dollarsandlife.com فإنك توافق على شروط الاستخدام هذه وعلى",
		acceptanceTextAfterLink: "إذا لم توافق، يرجى التوقف عن الاستخدام.",
		sections: [
			{ heading: "تغييرات الشروط", text: "يجوز لنا تعديل هذه الشروط في أي وقت، وتصبح سارية فور نشرها." },
			{ heading: "استخدام الموقع", text: "يجب استخدام الموقع بشكل قانوني وعدم القيام بأي نشاط يضر بالموقع أو بالمستخدمين الآخرين." },
			{ heading: "إفصاح العمولة", text: "قد نشارك في برامج تسويق بالعمولة. بعض الروابط قد تمنحنا عمولة دون تكلفة إضافية عليك." },
			{ heading: "إخلاء المسؤولية", text: "المعلومات لأغراض توعوية فقط ولا نضمن الكمال أو الملاءمة المطلقة." },
			{ heading: "تحديد المسؤولية", text: "إلى أقصى حد يسمح به القانون، تخلي Texas Connect LLC مسؤوليتها عن الأضرار الناتجة عن استخدام الموقع." },
			{ heading: "القانون الحاكم", text: "تخضع هذه الشروط لقوانين ولاية تكساس." },
		],
		contactHeading: "معلومات التواصل",
		contactText: "للاستفسارات، تواصل معنا عبر contact@dollarsandlife.com أو عبر البريد إلى:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	pt: {
		title: "Termos de Serviço",
		seoTitle: "Termos de Serviço | Dollars And Life - Acordos legais",
		seoDescription: "Leia os termos de serviço da Dollars And Life, incluindo links de afiliados e avisos legais.",
		intro: "Dollars And Life é operado pela Texas Connect LLC. Ao usar este site, você concorda com estes Termos de Uso.",
		acceptanceHeading: "Aceitação dos termos",
		acceptanceTextBeforeLink: "Ao usar www.dollarsandlife.com, você concorda com estes Termos de Uso e com nossa",
		acceptanceTextAfterLink: "Se não concordar, interrompa o uso.",
		sections: [
			{ heading: "Alterações nos termos", text: "Podemos alterar estes termos a qualquer momento. As mudanças entram em vigor ao serem publicadas." },
			{ heading: "Uso do site", text: "Você deve usar o site de forma legal e não praticar ações que prejudiquem o site ou outros usuários." },
			{ heading: "Divulgação FTC e afiliados", text: "Podemos participar de programas de afiliados. Alguns links podem gerar comissão sem custo extra para você." },
			{ heading: "Isenção de responsabilidade", text: "As informações são apenas informativas. Não garantimos total precisão ou completude." },
			{ heading: "Limitação de responsabilidade", text: "No limite permitido por lei, a Texas Connect LLC limita sua responsabilidade por danos decorrentes do uso do site." },
			{ heading: "Lei aplicável", text: "Estes termos são regidos pelas leis do Estado do Texas." },
		],
		contactHeading: "Informações de contato",
		contactText: "Para dúvidas, contate-nos em contact@dollarsandlife.com ou por correio em:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	id: {
		title: "Ketentuan Layanan",
		seoTitle: "Ketentuan Layanan | Dollars And Life - Perjanjian hukum",
		seoDescription: "Baca ketentuan layanan Dollars And Life, termasuk tautan afiliasi dan penafian hukum.",
		intro: "Dollars And Life dioperasikan oleh Texas Connect LLC. Dengan menggunakan situs ini, Anda menyetujui Ketentuan Penggunaan ini.",
		acceptanceHeading: "Penerimaan ketentuan",
		acceptanceTextBeforeLink: "Dengan menggunakan www.dollarsandlife.com, Anda menyetujui ketentuan ini dan",
		acceptanceTextAfterLink: "Jika tidak setuju, harap hentikan penggunaan.",
		sections: [
			{ heading: "Perubahan ketentuan", text: "Kami dapat mengubah ketentuan ini kapan saja. Perubahan berlaku saat dipublikasikan." },
			{ heading: "Penggunaan situs", text: "Anda wajib menggunakan situs secara sah dan tidak melakukan aktivitas yang merugikan situs atau pengguna lain." },
			{ heading: "Pengungkapan afiliasi", text: "Kami dapat ikut program afiliasi. Beberapa tautan dapat memberi komisi tanpa biaya tambahan bagi Anda." },
			{ heading: "Penafian", text: "Informasi di situs ini hanya untuk tujuan informasi. Kami tidak menjamin kelengkapan atau kecocokan untuk tujuan tertentu." },
			{ heading: "Batas tanggung jawab", text: "Sejauh diizinkan hukum, Texas Connect LLC membatasi tanggung jawab atas kerugian akibat penggunaan situs." },
			{ heading: "Hukum yang berlaku", text: "Ketentuan ini diatur oleh hukum Negara Bagian Texas." },
		],
		contactHeading: "Informasi kontak",
		contactText: "Untuk pertanyaan, hubungi contact@dollarsandlife.com atau kirim surat ke:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	fr: {
		title: "Conditions d'utilisation",
		seoTitle: "Conditions d'utilisation | Dollars And Life - Accords juridiques",
		seoDescription:
			"Consultez les conditions d'utilisation de Dollars And Life, y compris les liens affiliés et les clauses de non-responsabilité.",
		intro: "Dollars And Life est exploité par Texas Connect LLC. En utilisant ce site, vous acceptez ces conditions.",
		acceptanceHeading: "Acceptation des conditions",
		acceptanceTextBeforeLink: "En utilisant www.dollarsandlife.com, vous acceptez ces conditions ainsi que notre",
		acceptanceTextAfterLink: "Si vous n'êtes pas d'accord, veuillez cesser d'utiliser le site.",
		sections: [
			{ heading: "Modification des conditions", text: "Nous pouvons modifier ces conditions à tout moment. Les changements prennent effet dès leur publication." },
			{ heading: "Utilisation du site", text: "Le site doit être utilisé légalement. Toute action nuisible au site ou aux utilisateurs est interdite." },
			{ heading: "Divulgation affiliation", text: "Nous pouvons participer à des programmes d'affiliation. Certains liens peuvent générer une commission sans coût supplémentaire." },
			{ heading: "Avertissement", text: "Le contenu est fourni à titre informatif. Nous ne garantissons pas l'exactitude ou l'exhaustivité absolue." },
			{ heading: "Limitation de responsabilité", text: "Dans la limite autorisée par la loi, Texas Connect LLC limite sa responsabilité pour les dommages liés à l'utilisation du site." },
			{ heading: "Droit applicable", text: "Ces conditions sont régies par les lois de l'État du Texas." },
		],
		contactHeading: "Contact",
		contactText: "Pour toute question, contactez-nous à contact@dollarsandlife.com ou par courrier à :",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	ja: {
		title: "利用規約",
		seoTitle: "利用規約 | Dollars And Life - 法的契約",
		seoDescription: "Dollars And Life の利用規約（アフィリエイトリンク、免責事項、法的条件）をご確認ください。",
		intro: "Dollars And Life は Texas Connect LLC により運営されています。本サイトの利用により本規約に同意したものとみなされます。",
		acceptanceHeading: "規約への同意",
		acceptanceTextBeforeLink: "www.dollarsandlife.com を利用することで、本規約および当社の",
		acceptanceTextAfterLink: "に同意したものとみなされます。同意できない場合は利用を中止してください。",
		sections: [
			{ heading: "規約の変更", text: "当社は本規約を随時変更でき、掲載時点で効力を持ちます。" },
			{ heading: "サイト利用", text: "本サイトは法令に従って利用し、サイトや他ユーザーに害を与える行為をしてはなりません。" },
			{ heading: "アフィリエイト開示", text: "当社はアフィリエイトプログラムに参加する場合があります。一部リンク経由で手数料を受け取ることがあります。" },
			{ heading: "免責事項", text: "本サイトの情報は参考目的です。完全性や特定目的への適合性を保証しません。" },
			{ heading: "責任の制限", text: "法令で許される範囲で、Texas Connect LLC はサイト利用による損害責任を制限します。" },
			{ heading: "準拠法", text: "本規約はテキサス州法に準拠します。" },
		],
		contactHeading: "お問い合わせ",
		contactText: "ご質問は contact@dollarsandlife.com までご連絡ください。郵送先：",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	ru: {
		title: "Условия использования",
		seoTitle: "Условия использования | Dollars And Life - Юридические соглашения",
		seoDescription:
			"Ознакомьтесь с условиями использования Dollars And Life, включая партнерские ссылки и юридические оговорки.",
		intro: "Dollars And Life управляется Texas Connect LLC. Используя сайт, вы соглашаетесь с данными условиями.",
		acceptanceHeading: "Принятие условий",
		acceptanceTextBeforeLink: "Используя www.dollarsandlife.com, вы принимаете эти условия и нашу",
		acceptanceTextAfterLink: "Если вы не согласны, прекратите использование сайта.",
		sections: [
			{ heading: "Изменения условий", text: "Мы можем изменять условия в любое время. Изменения вступают в силу после публикации." },
			{ heading: "Использование сайта", text: "Сайт должен использоваться законно. Запрещены действия, наносящие вред сайту или другим пользователям." },
			{ heading: "Партнерское раскрытие", text: "Мы можем участвовать в партнерских программах. Некоторые ссылки могут приносить нам комиссию без дополнительных затрат для вас." },
			{ heading: "Отказ от гарантий", text: "Информация предоставляется только в ознакомительных целях. Мы не гарантируем полную точность и полноту." },
			{ heading: "Ограничение ответственности", text: "В пределах, разрешенных законом, Texas Connect LLC ограничивает ответственность за ущерб от использования сайта." },
			{ heading: "Применимое право", text: "Эти условия регулируются законами штата Техас." },
		],
		contactHeading: "Контакты",
		contactText: "По вопросам пишите на contact@dollarsandlife.com или отправляйте почту по адресу:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
	de: {
		title: "Nutzungsbedingungen",
		seoTitle: "Nutzungsbedingungen | Dollars And Life - Rechtliche Vereinbarungen",
		seoDescription:
			"Lesen Sie die Nutzungsbedingungen von Dollars And Life einschließlich Affiliate-Hinweisen und Haftungsausschlüssen.",
		intro: "Dollars And Life wird von Texas Connect LLC betrieben. Mit der Nutzung der Website stimmen Sie diesen Bedingungen zu.",
		acceptanceHeading: "Annahme der Bedingungen",
		acceptanceTextBeforeLink: "Durch die Nutzung von www.dollarsandlife.com stimmen Sie diesen Bedingungen und unserer",
		acceptanceTextAfterLink: "zu. Wenn Sie nicht zustimmen, beenden Sie bitte die Nutzung.",
		sections: [
			{ heading: "Änderungen der Bedingungen", text: "Wir können diese Bedingungen jederzeit ändern. Änderungen gelten mit Veröffentlichung." },
			{ heading: "Nutzung der Website", text: "Die Website darf nur rechtmäßig genutzt werden. Schädigende Aktivitäten gegenüber Website oder Nutzern sind untersagt." },
			{ heading: "Affiliate-Hinweis", text: "Wir können an Affiliate-Programmen teilnehmen. Einige Links können Provisionen erzeugen, ohne Mehrkosten für Sie." },
			{ heading: "Haftungsausschluss", text: "Alle Inhalte dienen nur Informationszwecken. Wir garantieren keine vollständige Richtigkeit oder Eignung für einen bestimmten Zweck." },
			{ heading: "Haftungsbegrenzung", text: "Soweit gesetzlich zulässig, begrenzt Texas Connect LLC die Haftung für Schäden aus der Nutzung der Website." },
			{ heading: "Geltendes Recht", text: "Diese Bedingungen unterliegen dem Recht des US-Bundesstaats Texas." },
		],
		contactHeading: "Kontaktinformationen",
		contactText: "Bei Fragen kontaktieren Sie uns unter contact@dollarsandlife.com oder per Post an:",
		address: "Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX 76137",
	},
};
