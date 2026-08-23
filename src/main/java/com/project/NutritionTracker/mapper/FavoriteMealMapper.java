package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.FavoriteMealRequestDTO;
import com.project.NutritionTracker.dto.FavoriteMealResponseDTO;
import com.project.NutritionTracker.model.FavoriteMeal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface FavoriteMealMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    FavoriteMeal toEntity(FavoriteMealRequestDTO dto);

    FavoriteMealResponseDTO toResponseDTO(FavoriteMeal favoriteMeal);
}
