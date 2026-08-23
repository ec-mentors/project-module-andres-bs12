package com.project.NutritionTracker.model;

import com.project.NutritionTracker.enums.MealType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    private String mealName;
    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
    private MealType mealType;
    private LocalDate createdAt;
}
