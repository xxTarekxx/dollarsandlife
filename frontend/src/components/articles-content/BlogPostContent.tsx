import parse from "html-react-parser";
import Image from "next/image";
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
    images?: { url: string; caption?: string }[];
}

const BlogPostContent: React.FC<BlogPostContentProps> = memo(({ postData }) => {
    const parseString = useCallback(
        (str: string | undefined): React.ReactNode => {
            if (!str) return null;
            // Use a more efficient parsing approach for better performance
            try {
                return parse(str);
            } catch {
                // Fallback to plain text if parsing fails
                return <span dangerouslySetInnerHTML={{ __html: str }} />;
            }
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
                <div key={`${className}-${index}`} className={className}>
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
                    <Image
                        src={postData.image.url}
                        alt={postData.image.caption}
                        className='main-image'
                        width={450}
                        height={354}
                        priority
                        sizes='(max-width: 768px) 100vw, 450px'
                        style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                        unoptimized
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
                        <Image
                            src='/images/Lyca-Mobile-728x90.webp'
                            alt='Lyca Mobile Banner'
                            className='TopBannerImage'
                            width={730}
                            height={90}
                            loading='lazy'
                            sizes='(max-width: 768px) 100vw, 730px'
                            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                            unoptimized
                        />
                    </a>
                </div>

                {postData.content.map((section, index) => (
                    <div key={`section-${index}`} className='content-section'>
                        {section.subtitle && <h2>{section.subtitle}</h2>}
                        {section.text && <>{parseString(section.text)}</>}

                        {section.details && (
                            <p className='details'>{parseString(section.details)}</p>
                        )}
                        {section.image && (
                            <Image
                                src={section.image}
                                alt='Section visual'
                                className='section-image'
                                width={600}
                                height={400}
                                loading='lazy'
                                sizes='(max-width: 768px) 100vw, 600px'
                                style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                            />
                        )}
                        {/* Render images array if present */}
                        {Array.isArray(section.images) &&
                            section.images.map((img, i) => (
                                <figure key={i} className='section-image-figure'>
                                    <Image
                                        src={img.url}
                                        alt={img.caption || `Section image ${i + 1}`}
                                        className='section-image'
                                        width={600}
                                        height={400}
                                        loading='lazy'
                                        sizes='(max-width: 768px) 100vw, 600px'
                                        style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                                    />
                                    {img.caption && <figcaption>{img.caption}</figcaption>}
                                </figure>
                            ))}

                        {section.bulletPoints && (
                            <ul>
                                {section.bulletPoints.map((point, i) => (
                                    <li key={`bullet-${i}`}>{parseString(point)}</li>
                                ))}
                            </ul>
                        )}

                        {section.expertQuotes &&
                            Array.isArray(section.expertQuotes) &&
                            section.expertQuotes.map((quote, i) => (
                                <p key={`quote-${i}`} className='expert-quote'>
                                    {parseString(quote)}
                                </p>
                            ))}

                        {section.caseStudies &&
                            renderArrayOrString(section.caseStudies, "case-study")}
                        {section.authorityLinks && (
                            <div className='authority-link'>
                                {Array.isArray(section.authorityLinks)
                                    ? section.authorityLinks.map((link, i) => (
                                        <div key={`link-${i}`}>{parseString(link)}</div>
                                    ))
                                    : parseString(section.authorityLinks)}
                            </div>
                        )}

                        {section.stats && (
                            <div className='stats'>
                                {Array.isArray(section.stats)
                                    ? section.stats.map((item, i) => (
                                        <div key={`stat-${i}`}>{parseString(item)}</div>
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
                                        <li key={`tip-${i}`}>{parseString(tip)}</li>
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
