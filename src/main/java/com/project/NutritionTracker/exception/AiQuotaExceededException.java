package com.project.NutritionTracker.exception;

public class AiQuotaExcededException extends RuntimeException {
  public AiQuotaExcededException(String message) {
    super(message);
  }
}
