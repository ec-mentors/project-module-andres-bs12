package com.project.NutritionTracker.exception;

public class AiQuotaExceededException extends RuntimeException {

    public AiQuotaExceededException(String message) {
        super(message);
    }
}
