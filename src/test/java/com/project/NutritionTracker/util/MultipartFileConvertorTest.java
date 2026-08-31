package com.project.NutritionTracker.util;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

import static org.junit.jupiter.api.Assertions.*;

public class MultipartFileConvertorTest {

    private File tempFile;
    private MultipartFileConvertor convertor;

    @BeforeEach
    void setUp() throws IOException {
        tempFile = File.createTempFile("test-file", ".jpg");
        Files.write(tempFile.toPath(), "hi".getBytes());
        convertor = new MultipartFileConvertor("image/jpeg", tempFile);
    }

    @AfterEach
    void tearDown() {
        if (tempFile != null && tempFile.exists()) {
            tempFile.delete();
        }
    }

    @Test
    void returnsContentType() {
        var result = convertor.getContentType();
        assertEquals("image/jpeg", result);
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

    @Test
    void returnsNameAndOriginalFilename() {
        assertEquals(tempFile.getName(), convertor.getName());
        assertEquals(tempFile.getName(), convertor.getOriginalFilename());
    }

    @Test
    void isNotEmpty() {
        assertFalse(convertor.isEmpty());
    }

    @Test
    void returnsInputStream() throws IOException {
        try (InputStream is = convertor.getInputStream()) {
            assertNotNull(is);
            byte[] bytes = is.readAllBytes();
            assertArrayEquals("hi".getBytes(), bytes);
        }
    }
}
