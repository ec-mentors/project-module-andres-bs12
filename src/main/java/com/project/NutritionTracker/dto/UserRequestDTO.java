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
public class UserRequestDTO {

private String firstName;
private String lastName;
private String email;
private String password;
}

