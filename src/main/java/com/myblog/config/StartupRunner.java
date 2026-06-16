package com.myblog.config;

import com.myblog.service.ScraperService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupRunner implements CommandLineRunner {

    private final ScraperService scraperService;

    public StartupRunner(ScraperService scraperService) {
        this.scraperService = scraperService;
    }

    @Override
    public void run(String... args) {
        System.out.println();
        System.out.println("  🚀 博客服务已启动: http://localhost:8080");
        System.out.println("  📝 管理后台: http://localhost:8080/admin/posts.html");
        System.out.println("  📰 新闻列表: http://localhost:8080/news-list.html");
        System.out.println("  ℹ️  关于页: http://localhost:8080/about.html");
        System.out.println("  🔑 管理密码: admin123");
        System.out.println();

        // 首次爬取
        new Thread(() -> scraperService.scrapeAll()).start();
    }
}