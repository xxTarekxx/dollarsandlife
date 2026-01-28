package com.dollarsandlife.search;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SearchResultDto {
    private String id;
    private String headline;
    private String url;
    private String category;
    private String snippet;

    public SearchResultDto() {
    }

    public SearchResultDto(String id, String headline, String url, String category, String snippet) {
        this.id = id;
        this.headline = headline;
        this.url = url;
        this.category = category;
        this.snippet = snippet;
    }

    @JsonProperty("id")
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("headline")
    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    @JsonProperty("url")
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @JsonProperty("category")
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @JsonProperty("snippet")
    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }
}
