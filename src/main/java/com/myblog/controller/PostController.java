package com.myblog.controller;

import com.myblog.dto.PageResponse;
import com.myblog.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/categories/list")
    public List<Map<String, Object>> getCategories() {
        return postService.getCategories();
    }

    @GetMapping("/category/{category}")
    public PageResponse<Map<String, Object>> getByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return postService.getPostsByCategory(category, page, size);
    }

    @GetMapping
    public PageResponse<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getAllPosts(page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Map<String, Object> post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.status(404).body(Map.of("error", "文章不存在"));
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        if (body.get("title") == null || body.get("title").isEmpty() ||
            body.get("content") == null || body.get("content").isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "标题和内容不能为空"));
        }
        return ResponseEntity.ok(postService.createPost(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, Object> post = postService.updatePost(id, body);
        if (post == null) {
            return ResponseEntity.status(404).body(Map.of("error", "文章不存在"));
        }
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}