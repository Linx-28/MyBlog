package com.myblog.controller;

import com.myblog.service.ScraperService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scrape")
public class ScraperController {

    private final ScraperService scraperService;

    public ScraperController(ScraperService scraperService) {
        this.scraperService = scraperService;
    }

    @PostMapping
    public Map<String, Object> scrape() {
        try {
            int count = scraperService.scrapeAll();
            return Map.of("success", true, "count", count);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return scraperService.getStatus();
    }
}