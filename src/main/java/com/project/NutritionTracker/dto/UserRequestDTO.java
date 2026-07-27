package com.project.NutritionTracker.dto;

// This is just a POJO

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// For safety reasons the server don't need any kind of id or date, it will be assign within the server
public class UserRequestDTO {
private String firstName;
private String lastName;
private String email;
private String password;
}

