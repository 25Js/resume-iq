package com.resumeiq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.backend.exception.OpenRouterException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.model}")
    private String model;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OpenRouterService() {
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public String queryOpenRouter(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.error("OpenRouter API Key is not configured!");
            throw new OpenRouterException("OpenRouter API Key is missing. Please set the OPENROUTER_API_KEY environment variable in your system or backend configurations.");
        }

        log.info("Sending request to OpenRouter API using model: {}...", model);
        try {
            // Build the OpenAI-compatible chat completion request payload
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(message));

            String requestJson = objectMapper.writeValueAsString(requestBody);

            String responseBody = restClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:8080")
                    .header("X-Title", "ResumeIQ")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            // Parse response body to extract choices[0].message.content
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isMissingNode() || choices.isEmpty()) {
                log.error("OpenRouter API returned an empty choices block: {}", responseBody);
                throw new OpenRouterException("Invalid response received from OpenRouter API.");
            }

            JsonNode contentNode = choices.get(0)
                    .path("message")
                    .path("content");

            String rawText = contentNode.asText();
            if (rawText == null || rawText.trim().isEmpty()) {
                throw new OpenRouterException("Empty response content from OpenRouter.");
            }

            return cleanJsonResponse(rawText);

        } catch (OpenRouterException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling OpenRouter API", e);
            throw new OpenRouterException("Error communicating with OpenRouter AI service: " + e.getMessage(), e);
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null) {
            return "";
        }
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
