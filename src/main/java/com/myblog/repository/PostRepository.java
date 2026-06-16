package com.myblog.repository;

import com.myblog.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByPublishTimeDesc(Pageable pageable);

    Page<Post> findByCategoryOrderByPublishTimeDesc(String category, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Post p WHERE p.category != '' ORDER BY p.category")
    List<String> findDistinctCategories();

    @Query(value = "SELECT * FROM posts WHERE publish_time < ?1 ORDER BY publish_time DESC LIMIT 1", nativeQuery = true)
    Post findPrevPost(String publishTime);

    @Query(value = "SELECT * FROM posts WHERE publish_time > ?1 ORDER BY publish_time ASC LIMIT 1", nativeQuery = true)
    Post findNextPost(String publishTime);

    long countByCategory(String category);
}