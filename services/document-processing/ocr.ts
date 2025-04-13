import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { OCR_LANGUAGE } from '../../config';

const execPromise = promisify(exec);
const writeFilePromise = promisify(fs.writeFile);
const readFilePromise = promisify(fs.readFile);
const unlinkPromise = promisify(fs.unlink);
const mkdirPromise = promisify(fs.mkdir);

/**
 * Process a document file, applying OCR if needed
 * 
 * @param file The uploaded file
 * @returns Extracted text and metadata
 */
export async function processDocument(file: any) {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure temp directory exists
    try {
      await mkdirPromise(tempDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    const originalFilePath = path.join(tempDir, `original_${Date.now()}_${file.name}`);
    const processedFilePath = path.join(tempDir, `processed_${Date.now()}_${file.name}`);
    
    // Write the uploaded file to disk
    await writeFilePromise(originalFilePath, Buffer.from(await file.arrayBuffer()));
    
    let text = '';
    let metadata = {};
    
    if (file.type === 'application/pdf') {
      // Apply OCR to the PDF
      try {
        await execPromise(`ocrmypdf --force-ocr --deskew --optimize 3 --skip-text --output-type pdf --language ${OCR_LANGUAGE} ${originalFilePath} ${processedFilePath}`);
        
        // Extract text from the OCR'd PDF
        const { stdout } = await execPromise(`pdftotext ${processedFilePath} -`);
        text = stdout;
        
        // Extract metadata
        const { stdout: metadataOutput } = await execPromise(`pdfinfo ${processedFilePath}`);
        metadata = parseMetadata(metadataOutput);
        
      } catch (error) {
        console.error('OCR process failed:', error);
        throw new Error('OCR processing failed: ' + error.message);
      }
    } else if (file.type === 'text/plain') {
      // If it's a text file, just read the content
      const buffer = await readFilePromise(originalFilePath);
      text = buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    // Clean up temporary files
    try {
      await unlinkPromise(originalFilePath);
      if (fs.existsSync(processedFilePath)) {
        await unlinkPromise(processedFilePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
    
    return { text, metadata };
    
  } catch (error) {
    console.error('Error in document processing:', error);
    throw error;
  }
}

/**
 * Parse metadata from pdfinfo output
 * 
 * @param metadataText The text output from pdfinfo
 * @returns Structured metadata object
 */
function parseMetadata(metadataText: string): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  const lines = metadataText.split('\n');
  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex > 0) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      metadata[key] = value;
    }
  }
  
  return metadata;
}
