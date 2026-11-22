package com.musiclms.dto;

public class StartRoutineRequest {
    private String instrumentSlug = "piano";
    private String routineId;
    private String routineTitle;
    private Integer targetBpm;
    private String timeSignature;
    private Integer totalExercises;

    public StartRoutineRequest() {}

    public String getInstrumentSlug() { return instrumentSlug; }
    public void setInstrumentSlug(String instrumentSlug) { this.instrumentSlug = instrumentSlug; }

    public String getRoutineId() { return routineId; }
    public void setRoutineId(String routineId) { this.routineId = routineId; }

    public String getRoutineTitle() { return routineTitle; }
    public void setRoutineTitle(String routineTitle) { this.routineTitle = routineTitle; }

    public Integer getTargetBpm() { return targetBpm; }
    public void setTargetBpm(Integer targetBpm) { this.targetBpm = targetBpm; }

    public String getTimeSignature() { return timeSignature; }
    public void setTimeSignature(String timeSignature) { this.timeSignature = timeSignature; }

    public Integer getTotalExercises() { return totalExercises; }
    public void setTotalExercises(Integer totalExercises) { this.totalExercises = totalExercises; }
}
