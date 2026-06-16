package com.myblog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "news")
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title = "";

    @Column(nullable = false)
    private String url = "";

    private String source = "";
    private String category = "";
    private String summary = "";
    @Column(name = "image_url")
    private String imageUrl = "";

    @Column(name = "publish_time")
    private String publishTime;

    @Column(name = "created_at")
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}