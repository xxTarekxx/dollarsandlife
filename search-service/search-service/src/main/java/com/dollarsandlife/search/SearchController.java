package com.dollarsandlife.search;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
@Validated
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("ok"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchResultDto>> search(
            @RequestParam(value = "q", required = true) @Size(min = 2, max = 60, message = "Search term must be between 2 and 60 characters") String query,
            @RequestParam(value = "limit", required = false, defaultValue = "10") @Min(value = 1, message = "Limit must be at least 1") Integer limit) {

        // Sanitize and validate query (trim + collapse whitespace)
        String sanitizedQuery = query.trim().replaceAll("\\s+", " ");
        if (sanitizedQuery.length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        // Truncate query if longer than 60 characters
        if (sanitizedQuery.length() > 60) {
            sanitizedQuery = sanitizedQuery.substring(0, 60);
        }

        // Cap limit at 20
        int cappedLimit = Math.min(limit != null ? limit : 10, 20);

        // Perform search
        List<SearchResultDto> results = searchService.search(sanitizedQuery, cappedLimit);

        return ResponseEntity.ok(results);
    }

    // Simple health response class
    private static class HealthResponse {
        private String status;

        public HealthResponse(String status) {
            this.status = status;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
