package com.project.NutritionTracker.service;

import com.project.NutritionTracker.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.audio.transcription.AudioTranscription;
import org.springframework.ai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.audio.transcription.AudioTranscriptionResponse;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiAudioServiceTest {

    private AiAudioService service;

    @Mock
    private OpenAiAudioTranscriptionModel transcriptionModel;

    @BeforeEach
    void setUp() {
        service = new AiAudioService(transcriptionModel);
    }

    private final MockMultipartFile audioFile = new MockMultipartFile(
            "audio",
            "nota_voz.mp3",
            "audio/mpeg",
            "fake_bytes".getBytes()
    );

    private final java.util.UUID sampleUserId = java.util.UUID.randomUUID();

    @Test
    void transcribe_WithValidAudio_ReturnsTranscribedText() {
        AudioTranscription transcription = new AudioTranscription("I ate half chicken");
        AudioTranscriptionResponse mockResponse = new AudioTranscriptionResponse(transcription);

        when(transcriptionModel.call(any(AudioTranscriptionPrompt.class))).thenReturn(mockResponse);

        String result = service.transcribe(sampleUserId, audioFile);

        assertEquals("I ate half chicken", result);
    }

    @Test
    void transcribe_WithNullAudio_ThrowsIAE() {
        assertThrows(IllegalArgumentException.class, () -> service.transcribe(sampleUserId, null));
    }

    @Test
    void transcribe_WithEmptyAudio_ThrowsIAE() {
        MockMultipartFile emptyFile = new MockMultipartFile("audio", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> service.transcribe(sampleUserId, emptyFile));
    }

}
