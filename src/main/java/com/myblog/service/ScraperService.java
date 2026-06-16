package com.myblog.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ScraperService {

    private static final Logger log = LoggerFactory.getLogger(ScraperService.class);
    private final NewsService newsService;

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int TIMEOUT = 15000;

    public ScraperService(NewsService newsService) {
        this.newsService = newsService;
    }

    @Scheduled(cron = "0 0 */2 * * *")
    public void scheduledScrape() {
        scrapeAll();
    }

    public int scrapeAll() {
        log.info("========== 开始新闻爬取 ==========");
        long start = System.currentTimeMillis();
        int total = 0;
        total += scrapeSource("网易新闻", "https://news.163.com/", this::scrapeNetEase);
        total += scrapeSource("澎湃新闻", "https://www.thepaper.cn/", this::scrapeThePaper);
        total += scrapeSource("新华日报", "https://www.xhby.net/", this::scrapeXinhua);
        total += scrapeSource("红星新闻", "https://www.hxnews.com/", this::scrapeHongxing);
        double elapsed = (System.currentTimeMillis() - start) / 1000.0;
        log.info("[爬虫] 爬取完成, 共新增 {} 条, 耗时 {}s", total, String.format("%.1f", elapsed));
        return total;
    }

    private int scrapeSource(String name, String url, Scraper scraper) {
        try {
            log.info("[爬虫] 开始爬取: {}", name);
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT)
                    .get();
            List<Map<String, String>> items = scraper.scrape(doc);
            if (items.isEmpty()) {
                log.info("[爬虫] {}: 未找到内容", name);
                return 0;
            }
            newsService.insertNewsBatch(items);
            log.info("[爬虫] {}: 发现 {} 条", name, items.size());
            return items.size();
        } catch (Exception e) {
            log.error("[爬虫] {} 失败: {}", name, e.getMessage());
            return 0;
        }
    }

    private List<Map<String, String>> scrapeNetEase(Document doc) {
        List<Map<String, String>> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        Elements links = doc.select(".news_title h3 a, .hot_news a, .ndi_main a, .news-item, .mod_main a, .js_n_news a");
        for (Element el : links) {
            if (items.size() >= 30) break;
            processLink(el, "网易新闻", "news.163.com", "https://news.163.com", seen, items);
        }
        if (items.size() < 5) {
            for (Element el : doc.select("a")) {
                if (items.size() >= 30) break;
                processLink(el, "网易新闻", "163.com", "https://news.163.com", seen, items);
            }
        }
        return items;
    }

    private List<Map<String, String>> scrapeThePaper(Document doc) {
        List<Map<String, String>> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        Elements links = doc.select(".list_news li a, .news_item a, .index-news-list .news-item a, .news_li a, a[target=\"_blank\"]");
        for (Element el : links) {
            if (items.size() >= 30) break;
            processLink(el, "澎湃新闻", "thepaper.cn", "https://www.thepaper.cn", seen, items);
        }
        if (items.size() < 5) {
            for (Element el : doc.select("a")) {
                if (items.size() >= 30) break;
                processLink(el, "澎湃新闻", "thepaper.cn", "https://www.thepaper.cn", seen, items);
            }
        }
        return items;
    }

    private List<Map<String, String>> scrapeXinhua(Document doc) {
        List<Map<String, String>> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Element el : doc.select("a")) {
            if (items.size() >= 30) break;
            processLink(el, "新华日报", "xhby.net", "https://www.xhby.net", seen, items);
        }
        return items;
    }

    private List<Map<String, String>> scrapeHongxing(Document doc) {
        List<Map<String, String>> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Element el : doc.select("a")) {
            if (items.size() >= 30) break;
            processLink(el, "红星新闻", "hxnews.com", "https://www.hxnews.com", seen, items);
        }
        return items;
    }

    private void processLink(Element el, String source, String domain, String baseUrl, Set<String> seen, List<Map<String, String>> items) {
        String title = el.text() != null ? el.text().trim() : "";
        if (title.isEmpty()) title = el.attr("title");
        String href = el.attr("href");
        if (title.length() < 6 || href.isEmpty()) return;

        String url = normalizeUrl(href, baseUrl);
        if (url == null || !url.contains(domain) || seen.contains(url)) return;
        seen.add(url);

        Element parent = el.closest("li, div, h2, h3");
        if (parent == null) parent = el.parent();

        String imgUrl = "";
        if (parent != null) {
            Element img = parent.select("img").first();
            if (img == null) img = el.select("img").first();
            if (img != null) imgUrl = normalizeUrl(img.attr("src"), baseUrl);
        }
        if (imgUrl == null) imgUrl = "";

        String summary = "";
        if (parent != null) {
            Element p = parent.select("p, .desc, .abstract").first();
            if (p != null) summary = p.text().trim();
        }
        if (summary.isEmpty()) summary = title;

        Map<String, String> item = new HashMap<>();
        item.put("title", title.substring(0, Math.min(title.length(), 100)));
        item.put("url", url);
        item.put("source", source);
        item.put("category", detectCategory(title + " " + summary));
        item.put("summary", summary.substring(0, Math.min(summary.length(), 200)));
        item.put("image_url", imgUrl);
        item.put("publish_time", LocalDateTime.now().toString());
        items.add(item);
    }

    private String normalizeUrl(String href, String baseUrl) {
        if (href == null || href.isEmpty()) return null;
        if (href.startsWith("http")) return href;
        if (href.startsWith("//")) return "https:" + href;
        if (href.startsWith("/")) {
            try {
                java.net.URI uri = new java.net.URI(baseUrl);
                return uri.getScheme() + "://" + uri.getHost() + href;
            } catch (Exception e) {
                return baseUrl + href;
            }
        }
        return null;
    }

    private String detectCategory(String text) {
        String t = text.toLowerCase();
        if (Pattern.compile("国内|中国|政治|外交|政策|习近平|政府").matcher(t).find()) return "国内";
        if (Pattern.compile("国际|美国|特朗普|拜登|欧洲|俄罗斯|日本|韩国|朝鲜|联合国").matcher(t).find()) return "国际";
        if (Pattern.compile("财经|经济|金融|股市|基金|银行|人民币|GDP|贸易").matcher(t).find()) return "财经";
        if (Pattern.compile("科技|互联网|AI|人工智能|手机|华为|苹果|芯片|5G|数码|电脑").matcher(t).find()) return "科技";
        if (Pattern.compile("教育|高考|学校|大学|考试|招生").matcher(t).find()) return "教育";
        if (Pattern.compile("健康|医疗|疫情|疫苗|疾病|养生").matcher(t).find()) return "健康";
        if (Pattern.compile("体育|NBA|足球|篮球|奥运|世界杯|冠军").matcher(t).find()) return "体育";
        if (Pattern.compile("娱乐|明星|电影|音乐|综艺|演员|歌手|影视").matcher(t).find()) return "娱乐";
        if (Pattern.compile("社会|民生|热点|法治|事故|案件").matcher(t).find()) return "社会";
        return "综合";
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("sources", List.of("网易新闻", "澎湃新闻", "新华日报", "红星新闻"));
        status.put("schedule", "每2小时执行一次");
        return status;
    }

    @FunctionalInterface
    private interface Scraper {
        List<Map<String, String>> scrape(Document doc);
    }
}