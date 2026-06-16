package com.myblog.service;

import com.myblog.dto.PageResponse;
import com.myblog.entity.News;
import com.myblog.repository.NewsRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public List<Map<String, Object>> getLatestNews(int limit) {
        List<News> news = newsRepository.findAllByOrderByPublishTimeDesc();
        return news.stream()
                .limit(limit)
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getHotNews(int limit) {
        List<News> all = newsRepository.findAllByOrderByPublishTimeDesc();
        return all.stream()
                .filter(n -> n.getImageUrl() != null && !n.getImageUrl().isEmpty())
                .limit(limit)
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public PageResponse<Map<String, Object>> getNewsList(int page, int size) {
        Page<News> newsPage = newsRepository.findAllByOrderByPublishTimeDesc(PageRequest.of(page - 1, size));
        List<Map<String, Object>> rows = newsPage.getContent().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return new PageResponse<>(rows, newsPage.getTotalElements(), page, size, newsPage.getTotalPages());
    }

    public PageResponse<Map<String, Object>> getNewsByCategory(String category, int page, int size) {
        Page<News> newsPage = newsRepository.findByCategoryOrderByPublishTimeDesc(category, PageRequest.of(page - 1, size));
        List<Map<String, Object>> rows = newsPage.getContent().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return new PageResponse<>(rows, newsPage.getTotalElements(), page, size, newsPage.getTotalPages());
    }

    public PageResponse<Map<String, Object>> getNewsBySource(String source, int page, int size) {
        Page<News> newsPage = newsRepository.findBySourceOrderByPublishTimeDesc(source, PageRequest.of(page - 1, size));
        List<Map<String, Object>> rows = newsPage.getContent().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return new PageResponse<>(rows, newsPage.getTotalElements(), page, size, newsPage.getTotalPages());
    }

    public List<Map<String, Object>> getNewsCategories() {
        return newsRepository.findDistinctCategories().stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", c);
                    return m;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getNewsSources() {
        return newsRepository.findDistinctSources().stream()
                .map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("source", s);
                    return m;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getNewsStats() {
        long total = newsRepository.countAll();
        List<Object[]> sourceCounts = newsRepository.countBySource();
        List<Map<String, Object>> sources = new ArrayList<>();
        for (Object[] row : sourceCounts) {
            Map<String, Object> m = new HashMap<>();
            m.put("source", row[0]);
            m.put("count", row[1]);
            sources.add(m);
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("sources", sources);
        return stats;
    }

    public void insertNewsBatch(List<Map<String, String>> items) {
        for (Map<String, String> item : items) {
            String url = item.getOrDefault("url", "");
            if (url.isEmpty() || newsRepository.existsByUrl(url)) continue;

            News news = new News();
            news.setTitle(item.getOrDefault("title", ""));
            news.setUrl(url);
            news.setSource(item.getOrDefault("source", ""));
            news.setCategory(item.getOrDefault("category", ""));
            news.setSummary(item.getOrDefault("summary", ""));
            news.setImageUrl(item.getOrDefault("image_url", ""));
            news.setPublishTime(item.getOrDefault("publish_time", nowStr()));
            news.setCreatedAt(nowStr());
            newsRepository.save(news);
        }
    }

    private Map<String, Object> toMap(News news) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", news.getId());
        m.put("title", news.getTitle());
        m.put("url", news.getUrl());
        m.put("source", news.getSource());
        m.put("category", news.getCategory());
        m.put("summary", news.getSummary());
        m.put("image_url", news.getImageUrl());
        m.put("publish_time", news.getPublishTime());
        return m;
    }

    private String nowStr() {
        return java.time.LocalDateTime.now().toString();
    }
}