package com.dollarsandlife.search;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    private final MongoTemplate mongoTemplate;

    // Collection to category mapping
    private static final Map<String, String> COLLECTION_TO_CATEGORY = Map.of(
            "budget_data", "budget-data",
            "freelance_jobs", "freelance-jobs",
            "money_making_apps", "money-making-apps",
            "products_list", "shopping-deals",
            "remote_jobs", "remote-jobs",
            "start_a_blog", "start-blog",
            "breaking_news", "breaking-news"
    );

    // Category to URL pattern mapping
    private static final Map<String, String> CATEGORY_TO_URL_PATTERN = Map.of(
            "budget-data", "/extra-income/budget/",
            "freelance-jobs", "/extra-income/freelance-jobs/",
            "money-making-apps", "/extra-income/money-making-apps/",
            "shopping-deals", "/shopping-deals/",
            "remote-jobs", "/extra-income/remote-online-jobs/",
            "start-blog", "/start-a-blog/",
            "breaking-news", "/breaking-news/"
    );

    public SearchService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<SearchResultDto> search(String query, int limit) {
        // Sanitize query
        String sanitizedQuery = sanitizeQuery(query);
        if (sanitizedQuery.length() < 2) {
            return Collections.emptyList();
        }

        // Cap limit at 20
        int cappedLimit = Math.min(limit, 20);
        int perCollectionLimit = cappedLimit;

        // Query each collection and collect results with scores
        List<ScoredDocument> allResults = new ArrayList<>();

        for (Map.Entry<String, String> entry : COLLECTION_TO_CATEGORY.entrySet()) {
            String collectionName = entry.getKey();
            String category = entry.getValue();

            List<ScoredDocument> collectionResults = searchCollection(
                    collectionName, category, sanitizedQuery, perCollectionLimit);
            allResults.addAll(collectionResults);
        }

        // Sort by score descending and take top results
        return allResults.stream()
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(cappedLimit)
                .map(this::toSearchResultDto)
                .collect(Collectors.toList());
    }

    private List<ScoredDocument> searchCollection(String collectionName, String category,
                                                   String query, int limit) {
        try {
            // Use native MongoDB aggregation to get textScore
            // Build aggregation pipeline manually using Document API
            List<Document> pipeline = new ArrayList<>();
            
            // Match stage with $text search
            Document matchStage = new Document("$match", 
                new Document("$text", new Document("$search", query)));
            pipeline.add(matchStage);
            
            // Project stage to include score
            Document projectStage = new Document("$project",
                new Document("score", new Document("$meta", "textScore"))
                    .append("id", 1)
                    .append("headline", 1)
                    .append("description", 1)
                    .append("content", 1)
                    .append("canonicalUrl", 1)
                    .append("shortName", 1)
                    .append("_id", 0));
            pipeline.add(projectStage);
            
            // Sort by score descending
            Document sortStage = new Document("$sort", new Document("score", -1));
            pipeline.add(sortStage);
            
            // Limit
            Document limitStage = new Document("$limit", limit);
            pipeline.add(limitStage);
            
            // Execute aggregation
            List<Document> results = mongoTemplate.getCollection(collectionName)
                    .aggregate(pipeline)
                    .into(new ArrayList<>());

            List<ScoredDocument> scoredDocs = new ArrayList<>();
            for (Document doc : results) {
                Double score = doc.getDouble("score");
                if (score == null) {
                    score = 0.0;
                }
                // Remove score from document before storing (we don't want it in final JSON)
                Document docWithoutScore = new Document(doc);
                docWithoutScore.remove("score");
                scoredDocs.add(new ScoredDocument(docWithoutScore, category, score));
            }

            return scoredDocs;
        } catch (Exception e) {
            // Log error and return empty list for this collection
            logger.error("Error searching collection '{}' with query '{}': {}", 
                    collectionName, query, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private SearchResultDto toSearchResultDto(ScoredDocument scoredDoc) {
        Document doc = scoredDoc.document;
        String category = scoredDoc.category;

        String id = doc.getString("id");
        String headline = doc.getString("headline");
        String url = generateUrl(doc, category);
        String snippet = generateSnippet(doc, category);

        return new SearchResultDto(id, headline, url, category, snippet);
    }

    private String generateUrl(Document doc, String category) {
        // Priority: canonicalUrl if exists
        String canonicalUrl = doc.getString("canonicalUrl");
        if (canonicalUrl != null && !canonicalUrl.isEmpty()) {
            // Normalize canonical URL
            if (canonicalUrl.startsWith("http://") || canonicalUrl.startsWith("https://")) {
                // Extract path from absolute URL
                try {
                    java.net.URL url = new java.net.URL(canonicalUrl);
                    return url.getPath();
                } catch (Exception e) {
                    // If parsing fails, use as-is if it starts with /
                    if (canonicalUrl.startsWith("/")) {
                        return canonicalUrl;
                    }
                }
            } else if (canonicalUrl.startsWith("/")) {
                return canonicalUrl;
            }
        }

        // Generate URL from pattern
        String urlPattern = CATEGORY_TO_URL_PATTERN.get(category);
        if (urlPattern != null) {
            String id = doc.getString("id");
            return urlPattern + id;
        }

        // Fallback
        return "/" + doc.getString("id");
    }

    private String generateSnippet(Document doc, String category) {
        String snippet = null;

        // Special handling for products_list (shopping-deals)
        if ("shopping-deals".equals(category)) {
            snippet = getNonEmptyString(doc, "description");
            if (snippet == null) {
                snippet = getNonEmptyString(doc, "shortName");
            }
            if (snippet == null) {
                snippet = getNonEmptyString(doc, "headline");
            }
        } else {
            // Standard priority: description -> content[0].text -> headline
            snippet = getNonEmptyString(doc, "description");
            if (snippet == null) {
                // Try content[0].text with defensive parsing
                snippet = extractContentText(doc);
            }
            if (snippet == null) {
                snippet = getNonEmptyString(doc, "headline");
            }
        }

        // Fallback
        if (snippet == null || snippet.isEmpty()) {
            snippet = "No description available";
        }

        // Strip HTML tags and truncate to 160 characters (safely)
        try {
            snippet = stripHtml(snippet);
            if (snippet != null && snippet.length() > 160) {
                snippet = truncateSnippet(snippet, 160);
            }
        } catch (Exception e) {
            logger.warn("Error processing snippet, using fallback: {}", e.getMessage());
            snippet = "No description available";
        }

        // Ensure we always return a non-null string
        return snippet != null ? snippet : "No description available";
    }

    /**
     * Safely extracts text from content[0].text with full defensive checks.
     * Returns null if any step fails (never throws).
     */
    private String extractContentText(Document doc) {
        try {
            // If content is null -> skip
            Object contentObj = doc.get("content");
            if (contentObj == null) {
                return null;
            }

            // If content is not a List -> skip
            if (!(contentObj instanceof List)) {
                return null;
            }

            @SuppressWarnings("unchecked")
            List<Object> contentList = (List<Object>) contentObj;

            // If list is empty -> skip
            if (contentList.isEmpty()) {
                return null;
            }

            // Get first element
            Object firstContent = contentList.get(0);
            if (firstContent == null) {
                return null;
            }

            // If first element is not a Map/Document -> skip
            String textValue = null;
            if (firstContent instanceof Document) {
                Document contentDoc = (Document) firstContent;
                textValue = contentDoc.getString("text");
            } else if (firstContent instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> contentMap = (Map<String, Object>) firstContent;
                Object textObj = contentMap.get("text");
                // If map.get("text") is not a String -> skip
                if (textObj instanceof String) {
                    textValue = (String) textObj;
                }
            }

            // Return non-empty string or null
            return getNonEmptyString(textValue);
        } catch (Exception e) {
            // Never throw - just log and return null
            logger.debug("Error extracting content text: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gets a non-empty string from document field, treating empty strings as missing.
     * Returns null if field is missing or empty.
     */
    private String getNonEmptyString(Document doc, String fieldName) {
        String value = doc.getString(fieldName);
        return getNonEmptyString(value);
    }

    /**
     * Returns the string if it's non-null and non-empty, otherwise null.
     * Treats empty strings as missing.
     */
    private String getNonEmptyString(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return value;
    }

    private String stripHtml(String text) {
        if (text == null) {
            return "";
        }
        // Simple HTML tag removal
        return text.replaceAll("<[^>]*>", "").trim();
    }

    /**
     * Truncates text to max length, trimming trailing whitespace and appending "..."
     * Ensures no double periods (e.g., "....").
     */
    private String truncateSnippet(String text, int maxLength) {
        if (text == null) {
            return "";
        }

        // Trim trailing whitespace before truncation
        String trimmed = text.trim();

        // If text fits within max length, return as-is
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }

        // Truncate at max length (accounting for "..." which is 3 chars)
        int truncateAt = maxLength - 3;
        if (truncateAt < 0) {
            truncateAt = 0;
        }
        
        String truncated = trimmed.substring(0, truncateAt).trim();
        
        // Remove trailing periods to avoid "...."
        while (truncated.endsWith(".")) {
            truncated = truncated.substring(0, truncated.length() - 1).trim();
        }
        
        return truncated + "...";
    }

    private String sanitizeQuery(String query) {
        if (query == null) {
            return "";
        }
        // Trim and collapse whitespace
        return query.trim().replaceAll("\\s+", " ");
    }

    // Inner class to hold document with score
    private static class ScoredDocument {
        final Document document;
        final String category;
        final double score;

        ScoredDocument(Document document, String category, double score) {
            this.document = document;
            this.category = category;
            this.score = score;
        }
    }
}
