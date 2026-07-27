package com.project.NutritionTracker.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
// The response does not include any password
public class UserResponseDTO {
   private UUID id;
   private String firstName;
   private String lastName;
   private String email;
   private LocalDateTime createdAt;
}
