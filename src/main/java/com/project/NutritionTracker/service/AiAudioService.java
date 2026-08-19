package com.project.NutritionTracker.service;

import org.springframework.ai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiAudioService {

    private final OpenAiAudioTranscriptionModel transcriptionModel;

    public AiAudioService(OpenAiAudioTranscriptionModel transcriptionModel) {
        this.transcriptionModel = transcriptionModel;
    }

    public String transcribe(MultipartFile audioFile) {
        if (audioFile == null || audioFile.isEmpty()) {
            throw new IllegalArgumentException("Audio file cannot be empty");
        }

        try {
            Resource audioResource = audioFile.getResource();
            AudioTranscriptionPrompt prompt = new AudioTranscriptionPrompt(audioResource);

            return this.transcriptionModel.call(prompt).getResult().getOutput();

        } catch (Exception e) {
            throw new RuntimeException("Failed to transcribe audio with Whisper: " + e.getMessage(), e);
        }
    }
}