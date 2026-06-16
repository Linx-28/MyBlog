package com.myblog.dto;

import java.util.List;

public class PageResponse<T> {
    private List<T> rows;
    private long total;
    private int page;
    private int size;
    private int totalPages;

    public PageResponse() {}

    public PageResponse(List<T> rows, long total, int page, int size, int totalPages) {
        this.rows = rows;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
    }

    public List<T> getRows() { return rows; }
    public void setRows(List<T> rows) { this.rows = rows; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}