# Java Spring Boot Search Service - API Design & Contract

## 1. API Contract

### Request
```
GET /search?q=<term>&limit=10
```

**Query Parameters:**
- `q` (required): Search term (string, min length: 2, max length: 60)
- `limit` (optional): Maximum results to return (integer, default: 10, max: 20)

**Validation:**
- If `q` is missing or length < 2: return `400 Bad Request` with error message
- If `q` length > 60: truncate to 60 characters
- If `limit` is missing or invalid: default to 10
- If `limit` > 20: cap at 20

### Response
**Success (200 OK):**
```json
[
  {
    "id": "string",
    "headline": "string",
    "url": "string",
    "category": "string",
    "snippet": "string"
  }
]
```

**Error (400 Bad Request):**
```json
{
  "error": "Search term must be at least 2 characters"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

---

## 2. MongoDB Collection → Category Mapping

| MongoDB Collection | Category (API Response) |
|-------------------|------------------------|
| `budget_data` | `"budget-data"` |
| `freelance_jobs` | `"freelance-jobs"` |
| `money_making_apps` | `"money-making-apps"` |
| `products_list` | `"shopping-deals"` |
| `remote_jobs` | `"remote-jobs"` |
| `start_a_blog` | `"start-blog"` |
| `breaking_news` | `"breaking-news"` |

---

## 3. URL Generation Rules

**Priority Order:**
1. **If `canonicalUrl` exists in document:** Use it as-is (absolute or relative)
2. **Else, generate based on category:**

| Category | URL Pattern |
|----------|-------------|
| `shopping-deals` | `/shopping-deals/<id>` |
| `remote-jobs` | `/extra-income/remote-online-jobs/<id>` ⚠️ (bug fix) |
| `budget-data` | `/extra-income/budget/<id>` |
| `freelance-jobs` | `/extra-income/freelance-jobs/<id>` |
| `money-making-apps` | `/extra-income/money-making-apps/<id>` |
| `start-blog` | `/start-a-blog/<id>` |
| `breaking-news` | `/breaking-news/<id>` |

**URL Normalization:**
- If `canonicalUrl` is relative (starts with `/`), keep as-is
- If `canonicalUrl` is absolute (starts with `http://` or `https://`), extract path component
- Ensure generated URLs start with `/`

---

## 4. Query Strategy

### MongoDB $text Search (Always Used)

**Text indexes are guaranteed to exist on all collections. Implementation always uses $text search.**

```javascript
// Pseudocode
db.collection.find({
  $text: { $search: sanitizedQuery }
})
.sort({ score: { $meta: "textScore" } })
.limit(limit)
```

**Fields indexed:**
- `headline` (required, weight: 10)
- `description` (if exists, weight: 5)
- `content.text` (if exists, array field, weight: 1)
- `keywords` (if exists, array field, weight: 3 - primarily for products_list)

**Note:** Regex fallback intentionally omitted in v1 because text indexes are guaranteed. Future versions may include regex fallback as an optional enhancement if needed.

### Query Constraints
- `q` minimum length: **2 characters**
- `q` maximum length: **60 characters** (truncate if longer)
- `limit` default: **10**
- `limit` maximum: **20** (cap if higher)

---

## 5. Snippet Generation

**Snippet Source Priority:**
1. `description` (if exists)
2. First 160 characters from `content[0].text` (if exists)
3. First 160 characters from `headline`
4. Fallback: `"No description available"`

**Note:** `metaDescription` is not used for snippet generation in v1. It may be considered as an optional field if present in documents, but is not part of the primary snippet priority.

**Snippet Formatting:**
- Strip HTML tags
- Truncate to 160 characters
- Add ellipsis (`...`) if truncated
- Highlight query terms (optional enhancement)

---

## 6. MongoDB Index Recommendations

### Text Index (Required for All Collections)

**All collections must have text indexes created before the search service is deployed. Text indexes are guaranteed to exist.**

```javascript
// For each collection, create a compound text index
// budget_data
db.budget_data.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});

// freelance_jobs
db.freelance_jobs.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});

// money_making_apps
db.money_making_apps.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});

// products_list (shopping-deals)
db.products_list.createIndex({
  headline: "text",
  description: "text",
  keywords: "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    keywords: 3
  }
});

// remote_jobs
db.remote_jobs.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});

// start_a_blog
db.start_a_blog.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});

// breaking_news
db.breaking_news.createIndex({
  headline: "text",
  description: "text",
  "content.text": "text"
}, {
  name: "search_text_index",
  weights: {
    headline: 10,
    description: 5,
    "content.text": 1
  }
});
```

**Note:** If a field (e.g., `description` or `content.text`) does not exist in a collection, MongoDB will ignore it in the index creation. The index will still be created successfully with only the fields that exist.

### Supporting Indexes (for sorting/performance)

```javascript
// Sort order index (if sortOrder field exists)
db.budget_data.createIndex({ sortOrder: -1 });
db.freelance_jobs.createIndex({ sortOrder: -1 });
db.money_making_apps.createIndex({ sortOrder: -1 });
db.products_list.createIndex({ sortOrder: -1 });
db.remote_jobs.createIndex({ sortOrder: -1 });
db.start_a_blog.createIndex({ sortOrder: -1 });
db.breaking_news.createIndex({ sortOrder: -1 });

// Date index (for fallback sorting)
db.budget_data.createIndex({ datePublished: -1 });
db.freelance_jobs.createIndex({ datePublished: -1 });
db.money_making_apps.createIndex({ datePublished: -1 });
db.products_list.createIndex({ datePublished: -1 });
db.remote_jobs.createIndex({ datePublished: -1 });
db.start_a_blog.createIndex({ datePublished: -1 });
db.breaking_news.createIndex({ datePublished: -1 });
```

---

## 7. Example JSON Response

```json
[
  {
    "id": "budget-tips-2025",
    "headline": "10 Budget Tips to Save Money in 2025",
    "url": "/extra-income/budget/budget-tips-2025",
    "category": "budget-data",
    "snippet": "Discover practical budgeting strategies to maximize your savings this year. Learn how to track expenses, set financial goals, and build an emergency fund..."
  },
  {
    "id": "remote-job-guide-2025",
    "headline": "Complete Guide to Remote Jobs in 2025",
    "url": "/extra-income/remote-online-jobs/remote-job-guide-2025",
    "category": "remote-jobs",
    "snippet": "Everything you need to know about finding and landing remote work opportunities. Includes job boards, skills needed, and salary expectations..."
  },
  {
    "id": "product-12345",
    "headline": "Wireless Headphones - 50% Off",
    "url": "/shopping-deals/product-12345",
    "category": "shopping-deals",
    "snippet": "Premium wireless headphones with noise cancellation. Limited time offer with free shipping..."
  }
]
```

---

## 8. Pseudocode: MongoDB Query (Text Search Only)

```javascript
// Pseudocode for search logic
// Note: Text indexes are guaranteed to exist. No fallback logic needed.

function searchMongoDB(query, limit, collections) {
  const sanitizedQuery = sanitizeQuery(query); // min 2, max 60 chars
  const cappedLimit = Math.min(limit || 10, 20);
  const results = [];

  for (collection of collections) {
    // Always use $text search (text indexes are guaranteed)
    const docs = collection.find({
      $text: { $search: sanitizedQuery }
    })
    .sort({ score: { $meta: "textScore" } })
    .limit(cappedLimit)
    .toArray();

    // Transform documents to response format
    for (doc of docs) {
      results.push({
        id: doc.id,
        headline: doc.headline,
        url: generateUrl(doc, collection.category),
        category: collection.category,
        snippet: generateSnippet(doc, sanitizedQuery)
      });
    }
  }

  // Sort all results by textScore (relevance)
  return results.sort((a, b) => b.score - a.score).slice(0, cappedLimit);
}

function generateUrl(doc, category) {
  if (doc.canonicalUrl) {
    return normalizeCanonicalUrl(doc.canonicalUrl);
  }
  
  const urlMap = {
    "shopping-deals": `/shopping-deals/${doc.id}`,
    "remote-jobs": `/extra-income/remote-online-jobs/${doc.id}`,
    "budget-data": `/extra-income/budget/${doc.id}`,
    "freelance-jobs": `/extra-income/freelance-jobs/${doc.id}`,
    "money-making-apps": `/extra-income/money-making-apps/${doc.id}`,
    "start-blog": `/start-a-blog/${doc.id}`,
    "breaking-news": `/breaking-news/${doc.id}`
  };
  
  return urlMap[category] || `/${doc.id}`;
}

function generateSnippet(doc, query) {
  // Priority: description > content[0].text > headline > fallback
  let text = doc.description || 
             (doc.content && doc.content[0] && doc.content[0].text) || 
             doc.headline || 
             "No description available";
  
  // Strip HTML
  text = stripHtml(text);
  
  // Truncate to 160 chars
  if (text.length > 160) {
    text = text.substring(0, 160) + "...";
  }
  
  return text;
}
```

---

## 9. Implementation Notes

1. **Database Connection:**
   - Use Spring Data MongoDB or native MongoDB Java driver
   - Connect to `dollarsandlife_data` database
   - Connection string from environment variable: `MONGODB_URI`

2. **Collection Names:**
   - Use exact collection names as listed in mapping (e.g., `budget_data`, not `budget-data`)

3. **Error Handling:**
   - Handle MongoDB connection failures gracefully
   - Return appropriate HTTP status codes (400, 500)
   - Log errors for debugging

4. **Performance:**
   - Consider caching frequently searched terms (optional, future enhancement)
   - Use connection pooling
   - Limit query execution time

5. **Security:**
   - Sanitize all user input
   - Prevent NoSQL injection (use parameterized queries)
   - Validate query length and limit parameters

---

## Summary

- **API Endpoint:** `GET /search?q=<term>&limit=10`
- **Response:** JSON array of `{id, headline, url, category, snippet}`
- **7 Collections:** Mapped to 7 categories with URL generation rules
- **Query Strategy:** Always use `$text` search with `textScore` sorting (text indexes are guaranteed)
- **Indexes:** Text indexes on `headline`, `description`, `content.text`, `keywords` (required for all collections)
- **Snippet Priority:** `description` → `content[0].text` → `headline` → fallback
- **URL Bug Fix:** `remote-jobs` → `/extra-income/remote-online-jobs/<id>`
- **Note:** Regex fallback intentionally omitted in v1 because text indexes are guaranteed
