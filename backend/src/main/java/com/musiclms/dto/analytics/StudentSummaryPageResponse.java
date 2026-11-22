package com.musiclms.dto.analytics;

import java.util.List;

public class StudentSummaryPageResponse {
    private List<StudentSummaryDto> students;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;

    public StudentSummaryPageResponse() {}

    public StudentSummaryPageResponse(List<StudentSummaryDto> students, int page, int size, long totalElements, int totalPages, boolean hasNext) {
        this.students = students;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
    }

    public List<StudentSummaryDto> getStudents() { return students; }
    public void setStudents(List<StudentSummaryDto> students) { this.students = students; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public boolean isHasNext() { return hasNext; }
    public void setHasNext(boolean hasNext) { this.hasNext = hasNext; }
}
