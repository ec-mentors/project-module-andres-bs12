package com.project.NutritionTracker.service;

import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.util.MultipartFileConvertor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TelegramBotServiceTest {

    @Mock
    private UserRepository uRepository;

    @Mock
    private TelegramBotService service;

    private MultipartFileConvertor convertor;

    @BeforeEach
    void setSUp() throws IOException {
        File tempFile = File.createTempFile("test-file", ".jpg");
        Files.write(tempFile.toPath(), "hi".getBytes());
        convertor = new MultipartFileConvertor("image/jpeg", tempFile);
    }


    @Test
    void returnsContentType() {
        var result = convertor.getContentType();
        assertEquals("JPEG", result);
    }

    @Test
    void returnsSize() {
        var result = convertor.getSize();
        assertEquals(2L, result);
    }

    @Test
    void returnsBytes() throws IOException {
        assertArrayEquals("hi".getBytes(), convertor.getBytes());
    }

}
