import parse from "html-react-parser";
import React, { memo, useCallback, useMemo } from "react"; // Removed useEffect, useState, useParams, useNavigate
// import { Helmet } from "react-helmet-async"; // Removed Helmet

interface BlogPost {
    // Assuming this interface is comprehensive enough
    id: string;
    headline: string;
    author: { name: string };
    datePublished: string;
    dateModified?: string;
    image: { url: string; caption: string };
    content: PostContent[];
    canonicalUrl?: string; // Keep for potential use, though Head is in page
}

interface BlogPostContentProps {
    postData: BlogPost | null; // Changed props
}

interface CaseStudy {
    title: string;
    content: string;
    stats: string;
}

interface PostContent {
    subtitle?: string;
    text?: string;
    details?: string;
    image?: string;
    bulletPoints?: string[];
    stats?: string | string[];
    expertQuotes?: string | string[];
    caseStudies?: string | CaseStudy;
    authorityLinks?: string | string[];
    additionalInsights?: string;
    personalTips?: string[] | string;
    conclusion?: {
        title: string;
        text: string;
        additionalInsights?: string;
    };
}

const BlogPostContent: React.FC<BlogPostContentProps> = memo(({ postData }) => {
    // const { id: postId } = useParams<{ id: string }>(); // Removed
    // const navigate = useNavigate(); // Removed
    // const [post, setPost] = useState<BlogPost | null>(null); // Removed

    const parseString = useCallback(
        (str: string | undefined): React.ReactNode => {
            return typeof str === "string" ? parse(str) : null;
        },
        [],
    );

    // Consistent date formatting function
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }, []);

    const renderArrayOrString = useCallback(
        (data: string | string[] | undefined | CaseStudy, className: string) => {
            if (!data) return null;

            if (typeof data === "object" && "title" in data) {
                return (
                    <div className={className}>
                        <h4>{data.title}</h4>
                        <p>{parseString(data.content)}</p>
                        {data.stats && <p className='stats'>{parseString(data.stats)}</p>}
                    </div>
                );
            }

            const items = Array.isArray(data) ? data : [data];
            return items.map((item, index) => (
                <div key={index} className={className}>
                    {parseString(item)}
                </div>
            ));
        },
        [parseString],
    );

    // const fetchPost = useCallback ... useEffect // Removed

    // cleanDescription is removed as metadata handling moves to the page component
    // const cleanDescription = useMemo(() => { ... }, [props.postData]);

    const postContentMemo = useMemo(() => {
        if (!postData) return null;

        return (
            <div className='blog-post-content'>
                <h1>{postData.headline}</h1>
                <div className='image-box'>
                    <img
                        src={postData.image.url}
                        alt={postData.image.caption}
                        className='main-image'
                        loading='lazy'
                        width='450px'
                        height='354px'
                    />
                </div>
                <div className='author-date'>
                    <p className='author'>By: {postData.author.name}</p>
                    <p className='published-updated-date'>
                        Published: {formatDate(postData.datePublished)}
                        {postData.dateModified &&
                            ` | Updated: ${formatDate(postData.dateModified)}`}
                    </p>
                </div>
                <div className='top-banner-container'>
                    <a
                        href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='TopBanner'
                    >
                        <img
                            src='/images/Lyca-Mobile-728x90.webp'
                            alt='Lyca Mobile Banner'
                            className='TopBannerImage'
                            width='730px'
                            height='90px'
                            loading='lazy'
                        />
                    </a>
                </div>

                {postData.content.map((section, index) => (
                    <div key={index} className='content-section'>
                        {section.subtitle && <h2>{section.subtitle}</h2>}
                        {section.text && <>{parseString(section.text)}</>}

                        {section.details && (
                            <p className='details'>{parseString(section.details)}</p>
                        )}
                        {section.image && (
                            <img
                                src={section.image}
                                alt='Section visual'
                                className='section-image'
                                loading='lazy'
                            />
                        )}
                        {section.bulletPoints && (
                            <ul>
                                {section.bulletPoints.map((point, i) => (
                                    <li key={i}>{parseString(point)}</li>
                                ))}
                            </ul>
                        )}

                        {section.expertQuotes &&
                            Array.isArray(section.expertQuotes) &&
                            section.expertQuotes.map((quote, i) => (
                                <p key={i} className='expert-quote'>
                                    {parseString(quote)}
                                </p>
                            ))}

                        {section.caseStudies &&
                            renderArrayOrString(section.caseStudies, "case-study")}

                        {section.authorityLinks && (
                            <div className='authority-link'>
                                {Array.isArray(section.authorityLinks)
                                    ? section.authorityLinks.map((link, i) => (
                                            <div key={i}>{parseString(link)}</div>
                                      ))
                                    : parseString(section.authorityLinks)}
                            </div>
                        )}

                        {section.stats && (
                            <div className='stats'>
                                {Array.isArray(section.stats)
                                    ? section.stats.map((item, i) => (
                                            <div key={i}>{parseString(item)}</div>
                                      ))
                                    : parseString(section.stats)}
                            </div>
                        )}

                        {section.personalTips && (
                            <div className='personal-tips-section'>
                                <h3>Pro Tips</h3>
                                <ul>
                                    {(Array.isArray(section.personalTips)
                                        ? section.personalTips
                                        : [section.personalTips]
                                    ).map((tip, i) => (
                                        <li key={i}>{parseString(tip)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {section.conclusion && (
                            <div className='conclusion-section'>
                                <h3>{section.conclusion.title}</h3>
                                <p>{parseString(section.conclusion.text)}</p>
                                {section.conclusion.additionalInsights && (
                                    <div className='additional-insights'>
                                        {parseString(section.conclusion.additionalInsights)}
                                    </div>
                                )}
                            </div>
                        )}

                        {!section.conclusion?.additionalInsights &&
                            section.additionalInsights && (
                                <div className='additional-insights'>
                                    {parseString(section.additionalInsights)}
                                </div>
                            )}
                    </div>
                ))}
            </div>
        );
    }, [postData, parseString, renderArrayOrString, formatDate]);

    if (!postData) {
        // This case should ideally be handled by the parent page (e.g., show 404 or loading)
        // For robustness, BlogPostContent can also have a fallback.
        return <div>Post data is not available.</div>;
    }

    return (
        // Removed Helmet, page-container class might be redundant if parent page handles it
        // <div className='page-container'>
        <>
            {/* Helmet removed, metadata handled by the page component */}
            {postContentMemo}
        </>
        // </div>
    );
});

export default BlogPostContent;
