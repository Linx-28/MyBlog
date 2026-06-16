package com.myblog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title = "";

    @Column(columnDefinition = "TEXT")
    private String content = "";

    private String category = "";
    private String tags = "";
    private String summary = "";
    @Column(name = "image_url")
    private String imageUrl = "";

    @Column(name = "publish_time")
    private String publishTime;

    @Column(nullable = false)
    private Long views = 0L;

    @Column(name = "created_at")
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    public Long getViews() { return views; }
    public void setViews(Long views) { this.views = views; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}