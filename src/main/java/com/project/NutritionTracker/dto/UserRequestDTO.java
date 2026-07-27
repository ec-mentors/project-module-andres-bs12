package com.project.NutritionTracker.dto;

// This is just a POJO

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
// For safety reasons the server don't need any kind of id or date, it will be assign within the server
public class UserRequestDTO {
private String firstName;
private String lastName;
private String email;
private String password;
}

