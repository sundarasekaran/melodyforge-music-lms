package com.musiclms.dto;

import java.util.List;

public class AssessmentQuestionDto {
    private String id;
    private Integer level;
    private String type; // multiple-choice, true-false, identify-key, play-sequence
    private String topic;
    private String prompt;
    private String instructionHint;
    private List<String> options;
    private Integer targetMidi;
    private Boolean allowAnyOctave;
    private Integer sequenceLength;

    public AssessmentQuestionDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getInstructionHint() { return instructionHint; }
    public void setInstructionHint(String instructionHint) { this.instructionHint = instructionHint; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Integer getTargetMidi() { return targetMidi; }
    public void setTargetMidi(Integer targetMidi) { this.targetMidi = targetMidi; }

    public Boolean getAllowAnyOctave() { return allowAnyOctave; }
    public void setAllowAnyOctave(Boolean allowAnyOctave) { this.allowAnyOctave = allowAnyOctave; }

    public Integer getSequenceLength() { return sequenceLength; }
    public void setSequenceLength(Integer sequenceLength) { this.sequenceLength = sequenceLength; }
}
