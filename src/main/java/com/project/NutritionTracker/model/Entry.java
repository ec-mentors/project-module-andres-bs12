package com.project.NutritionTracker.model;

import com.project.NutritionTracker.enums.MealType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "entry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Entry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @JoinColumn(name = "user_id", nullable=false) // Use User in the table user_id to connect it
    @ManyToOne
    private User user;

    private String mealName;
    private String source;
    private LocalDateTime createdOn;
    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
    private MealType mealType;
}
