package com.project.NutritionTracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "goal",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_goal_date",
                        columnNames = {"user_id", "start_date"}
                )
        }
)
// This is already into the sql but is good practice to put it here so everyone that reads it, knows about this constrain
// This says basically that the combination between user_id and start_date must be unique. A user can have just 1 goal per date
// If I change twice the goal the same day, instead of make an insert I will just update the date goal.

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
}
