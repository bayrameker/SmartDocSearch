import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { OCR_LANGUAGE } from '../../config';

/**
 * Process a PDF file with OCR
 * 
 * @param filePath Path to the input PDF file
 * @returns Path to the OCR processed PDF file
 */
export async function processPdfWithOcr(filePath: string): Promise<string> {
  try {
    // Create a temporary output file
    const tempDir = os.tmpdir();
    const outputFilePath = path.join(tempDir, `ocr-${Date.now()}-${path.basename(filePath)}`);
    
    // Set OCR language options
    const languageOption = OCR_LANGUAGE || 'eng';
    
    // Create OCRmyPDF command
    return new Promise((resolve, reject) => {
      const ocrmypdf = spawn('ocrmypdf', [
        '--language', languageOption,
        '--force-ocr',
        '--skip-text',
        '--deskew',
        filePath,
        outputFilePath
      ]);
      
      let errorOutput = '';
      
      ocrmypdf.stdout.on('data', (data) => {
        console.log(`OCR stdout: ${data}`);
      });
      
      ocrmypdf.stderr.on('data', (data) => {
        console.error(`OCR stderr: ${data}`);
        errorOutput += data;
      });
      
      ocrmypdf.on('close', (code) => {
        if (code !== 0) {
          console.error(`OCRmyPDF process exited with code ${code}`);
          return reject(new Error(`OCR process failed: ${errorOutput}`));
        }
        
        console.log(`OCR process completed successfully: ${outputFilePath}`);
        resolve(outputFilePath);
      });
    });
  } catch (error) {
    console.error('Error processing PDF with OCR:', error);
    throw error;
  }
}

/**
 * Extract text from a PDF file
 * 
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    // Create pdftotext command
    return new Promise((resolve, reject) => {
      const pdftotext = spawn('pdftotext', [
        '-layout',
        '-nopgbrk',
        '-enc', 'UTF-8',
        filePath,
        '-'
      ]);
      
      let textOutput = '';
      let errorOutput = '';
      
      pdftotext.stdout.on('data', (data) => {
        textOutput += data;
      });
      
      pdftotext.stderr.on('data', (data) => {
        console.error(`pdftotext stderr: ${data}`);
        errorOutput += data;
      });
      
      pdftotext.on('close', (code) => {
        if (code !== 0) {
          console.error(`pdftotext process exited with code ${code}`);
          return reject(new Error(`Text extraction failed: ${errorOutput}`));
        }
        
        console.log(`Text extraction completed: ${textOutput.length} characters`);
        resolve(textOutput);
      });
    });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Process a PDF file with OCR and extract text
 * 
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export async function processAndExtractText(filePath: string): Promise<string> {
  try {
    // Process the PDF with OCR
    const ocrFilePath = await processPdfWithOcr(filePath);
    
    // Extract text from the OCR processed file
    const text = await extractTextFromPdf(ocrFilePath);
    
    // Clean up temporary file
    fs.unlinkSync(ocrFilePath);
    
    return text;
  } catch (error) {
    console.error('Error processing and extracting text:', error);
    throw error;
  }
}

/**
 * Extract text from a document based on file type
 * 
 * @param filePath Path to the document file
 * @param mimeType MIME type of the document
 * @returns Extracted text content
 */
export async function extractTextFromDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    // Handle different file types
    if (mimeType === 'application/pdf') {
      return await processAndExtractText(filePath);
    } else if (mimeType === 'text/plain') {
      // For plain text files, just read the content
      return fs.readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      // TODO: Implement text extraction for DOCX/DOC files
      throw new Error('DOCX/DOC text extraction not implemented yet');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw error;
  }
}