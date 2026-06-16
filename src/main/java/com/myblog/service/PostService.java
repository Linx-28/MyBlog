package com.myblog.service;

import com.myblog.dto.PageResponse;
import com.myblog.entity.Post;
import com.myblog.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public PageResponse<Map<String, Object>> getAllPosts(int page, int size) {
        Page<Post> postPage = postRepository.findAllByOrderByPublishTimeDesc(PageRequest.of(page - 1, size));
        List<Map<String, Object>> rows = postPage.getContent().stream()
                .map(this::toSummaryMap)
                .collect(Collectors.toList());
        return new PageResponse<>(rows, postPage.getTotalElements(), page, size, postPage.getTotalPages());
    }

    public Map<String, Object> getPostById(Long id) {
        Optional<Post> opt = postRepository.findById(id);
        if (opt.isEmpty()) return null;
        Post post = opt.get();
        post.setViews(post.getViews() + 1);
        postRepository.save(post);
        return toDetailMap(post);
    }

    public PageResponse<Map<String, Object>> getPostsByCategory(String category, int page, int size) {
        Page<Post> postPage = postRepository.findByCategoryOrderByPublishTimeDesc(category, PageRequest.of(page - 1, size));
        List<Map<String, Object>> rows = postPage.getContent().stream()
                .map(this::toSummaryMap)
                .collect(Collectors.toList());
        return new PageResponse<>(rows, postPage.getTotalElements(), page, size, postPage.getTotalPages());
    }

    public List<Map<String, Object>> getCategories() {
        List<String> cats = postRepository.findDistinctCategories();
        return cats.stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", c);
                    return m;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> createPost(Map<String, String> body) {
        Post post = new Post();
        post.setTitle(body.getOrDefault("title", ""));
        post.setContent(body.getOrDefault("content", ""));
        post.setCategory(body.getOrDefault("category", ""));
        post.setTags(body.getOrDefault("tags", ""));
        post.setSummary(body.getOrDefault("summary", ""));
        post.setImageUrl(body.getOrDefault("image_url", ""));
        post.setPublishTime(nowStr());
        post.setCreatedAt(nowStr());
        postRepository.save(post);
        return toDetailMap(post);
    }

    public Map<String, Object> updatePost(Long id, Map<String, String> body) {
        Optional<Post> opt = postRepository.findById(id);
        if (opt.isEmpty()) return null;
        Post post = opt.get();
        post.setTitle(body.getOrDefault("title", post.getTitle()));
        post.setContent(body.getOrDefault("content", post.getContent()));
        post.setCategory(body.getOrDefault("category", post.getCategory()));
        post.setTags(body.getOrDefault("tags", post.getTags()));
        post.setSummary(body.getOrDefault("summary", post.getSummary()));
        post.setImageUrl(body.getOrDefault("image_url", post.getImageUrl()));
        postRepository.save(post);
        return toDetailMap(post);
    }

    public boolean deletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private Map<String, Object> toSummaryMap(Post post) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", post.getId());
        m.put("title", post.getTitle());
        m.put("category", post.getCategory());
        m.put("tags", post.getTags());
        m.put("summary", post.getSummary());
        m.put("image_url", post.getImageUrl());
        m.put("publish_time", post.getPublishTime());
        m.put("views", post.getViews());
        return m;
    }

    private Map<String, Object> toDetailMap(Post post) {
        Map<String, Object> m = toSummaryMap(post);
        m.put("content", post.getContent());

        Map<String, Object> prevMap = null;
        Map<String, Object> nextMap = null;

        Post prev = postRepository.findPrevPost(post.getPublishTime());
        Post next = postRepository.findNextPost(post.getPublishTime());

        if (prev != null) {
            prevMap = new LinkedHashMap<>();
            prevMap.put("id", prev.getId());
            prevMap.put("title", prev.getTitle());
        }
        if (next != null) {
            nextMap = new LinkedHashMap<>();
            nextMap.put("id", next.getId());
            nextMap.put("title", next.getTitle());
        }

        m.put("prev", prevMap);
        m.put("next", nextMap);
        return m;
    }

    private String nowStr() {
        return java.time.LocalDateTime.now().toString();
    }
}