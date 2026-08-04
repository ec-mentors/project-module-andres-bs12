package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.model.Entry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntryMapper {


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "source", ignore = true)
    @Mapping(target = "createdOn", ignore = true)
    Entry toEntity(EntryRequestDTO dto);

    EntryResponseDTO toResponseDTO(Entry entry);
}
