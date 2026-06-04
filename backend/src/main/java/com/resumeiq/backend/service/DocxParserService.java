package com.resumeiq.backend.service;

import com.resumeiq.backend.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@Slf4j
public class DocxParserService {

    public String extractText(byte[] fileBytes) {
        log.info("Extracting text from DOCX file...");
        try (ByteArrayInputStream bais = new ByteArrayInputStream(fileBytes);
             XWPFDocument document = new XWPFDocument(bais);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            
            String text = extractor.getText();
            if (text == null || text.trim().isEmpty()) {
                throw new InvalidFileException("Could not extract any text from the DOCX file. It might be empty.");
            }
            return text;
        } catch (IOException e) {
            log.error("Failed to parse DOCX file", e);
            throw new InvalidFileException("Failed to read the DOCX file: " + e.getMessage());
        }
    }
}
