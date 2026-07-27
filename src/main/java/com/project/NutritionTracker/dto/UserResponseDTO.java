package com.project.NutritionTracker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
// The response does not include any password
public class UserResponseDTO {
   private UUID id;
   private String firstName;
   private String lastName;
   private String email;
   private LocalDateTime createdAt;
}
