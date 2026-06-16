package com.myblog.repository;

import com.myblog.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {

    List<News> findAllByOrderByPublishTimeDesc();

    Page<News> findAllByOrderByPublishTimeDesc(Pageable pageable);

    Page<News> findByCategoryOrderByPublishTimeDesc(String category, Pageable pageable);

    Page<News> findBySourceOrderByPublishTimeDesc(String source, Pageable pageable);

    @Query("SELECT DISTINCT n.source FROM News n WHERE n.source != '' ORDER BY n.source")
    List<String> findDistinctSources();

    @Query("SELECT DISTINCT n.category FROM News n WHERE n.category != '' ORDER BY n.category")
    List<String> findDistinctCategories();

    @Query("SELECT COUNT(n) FROM News n")
    long countAll();

    @Query(value = "SELECT source, COUNT(*) as cnt FROM news GROUP BY source ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> countBySource();

    boolean existsByUrl(String url);
}