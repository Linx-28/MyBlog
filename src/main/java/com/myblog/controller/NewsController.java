package com.myblog.controller;

import com.myblog.dto.PageResponse;
import com.myblog.service.NewsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/latest")
    public List<Map<String, Object>> getLatest(@RequestParam(defaultValue = "10") int limit) {
        return newsService.getLatestNews(limit);
    }

    @GetMapping("/hot")
    public List<Map<String, Object>> getHot(@RequestParam(defaultValue = "5") int limit) {
        return newsService.getHotNews(limit);
    }

    @GetMapping("/list")
    public PageResponse<Map<String, Object>> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return newsService.getNewsList(page, size);
    }

    @GetMapping("/category/{category}")
    public PageResponse<Map<String, Object>> getByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return newsService.getNewsByCategory(category, page, size);
    }

    @GetMapping("/source/{source}")
    public PageResponse<Map<String, Object>> getBySource(
            @PathVariable String source,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return newsService.getNewsBySource(source, page, size);
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return newsService.getNewsCategories();
    }

    @GetMapping("/sources")
    public List<Map<String, Object>> getSources() {
        return newsService.getNewsSources();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return newsService.getNewsStats();
    }
}