package com.project.NutritionTracker.service;

import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.util.MultipartFileConvertor;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class MultiPartConvertorTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFileConvertor convertor;



}
