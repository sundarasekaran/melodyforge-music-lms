package com.musiclms.dto;

import java.util.List;

public class AssessmentResultResponse {
    private Long attemptId;
    private Integer level;
    private Integer score;
    private Integer maxScore;
    private Integer scorePercent;
    private Integer passingThreshold;
    private Boolean passed;
    private Integer xpAwarded;
    private Boolean graduationEligible;
    private List<QuestionResultDto> questionResults;

    public static class QuestionResultDto {
        private String questionId;
        private Boolean correct;
        private String userAnswer;
        private String correctAnswer;
        private String explanation;

        public QuestionResultDto() {}

        public QuestionResultDto(String questionId, Boolean correct, String userAnswer, String correctAnswer, String explanation) {
            this.questionId = questionId;
            this.correct = correct;
            this.userAnswer = userAnswer;
            this.correctAnswer = correctAnswer;
            this.explanation = explanation;
        }

        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }

        public Boolean getCorrect() { return correct; }
        public void setCorrect(Boolean correct) { this.correct = correct; }

        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }

        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public AssessmentResultResponse() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public Integer getScorePercent() { return scorePercent; }
    public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }

    public Integer getPassingThreshold() { return passingThreshold; }
    public void setPassingThreshold(Integer passingThreshold) { this.passingThreshold = passingThreshold; }

    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }

    public Integer getXpAwarded() { return xpAwarded; }
    public void setXpAwarded(Integer xpAwarded) { this.xpAwarded = xpAwarded; }

    public Boolean getGraduationEligible() { return graduationEligible; }
    public void setGraduationEligible(Boolean graduationEligible) { this.graduationEligible = graduationEligible; }

    public List<QuestionResultDto> getQuestionResults() { return questionResults; }
    public void setQuestionResults(List<QuestionResultDto> questionResults) { this.questionResults = questionResults; }
}
