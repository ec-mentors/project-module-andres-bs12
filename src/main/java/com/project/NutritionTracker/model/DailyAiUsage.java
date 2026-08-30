package com.project.NutritionTracker.model;

import com.google.api.client.util.DateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "daily_ai_usage")
public class DailyAiUsage {


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @JoinColumn(name = "user_id", nullable = false)
    @ManyToOne
    private User user;

    private LocalDate usageDate;
    private Integer goalsUsed;
    private Integer favoritesUsed;
    private int entriesUsed;
}
