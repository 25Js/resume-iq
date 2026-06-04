package com.resumeiq.backend.service;

import com.resumeiq.backend.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class PdfParserService {

    public String extractText(byte[] fileBytes) {
        log.info("Extracting text from PDF file...");
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.trim().isEmpty()) {
                throw new InvalidFileException("Could not extract any text from the PDF file. It might be scanned or empty.");
            }
            return text;
        } catch (IOException e) {
            log.error("Failed to parse PDF file", e);
            throw new InvalidFileException("Failed to read the PDF file: " + e.getMessage());
        }
    }
}
