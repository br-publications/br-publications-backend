import PDFDocument from 'pdfkit';
import TextBookFile from '../models/textBookFile';

export interface BookPdfData {
    title: string;
    author: string;
    isbn: string;
    publisher?: string | null;
    releaseDate?: string | null;
    edition?: string | null;
    description: string;
    coverImage: string | null;
}

/**
 * Resolves the cover image path/URL to a Buffer.
 * Supports:
 * - base64 data URLs
 * - internal /api/textbooks/... download URLs (queries the database directly)
 * - external http/https URLs (fetches via network)
 */
async function resolveCoverImage(coverImage: string | null): Promise<Buffer | null> {
    if (!coverImage) return null;

    try {
        // 1. Handle base64 Data URL
        if (coverImage.startsWith('data:image')) {
            const base64Data = coverImage.replace(/^data:image\/\w+;base64,/, '');
            return Buffer.from(base64Data, 'base64');
        }

        // 2. Handle internal API endpoint (fetches directly from DB)
        if (coverImage.startsWith('/api/textbooks/')) {
            const parts = coverImage.split('/');
            const fileId = parseInt(parts[parts.length - 1]);
            if (!isNaN(fileId)) {
                const file = await TextBookFile.findByPk(fileId);
                if (file && file.fileData) {
                    return file.fileData;
                }
            }
        }

        // 3. Handle external URL (network fetch)
        if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
            const res = await fetch(coverImage);
            if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                return Buffer.from(arrayBuffer);
            }
        }
    } catch (error) {
        console.error('[PDFGenerator] Error resolving cover image:', error);
    }

    return null;
}

/**
 * Dynamically generates a 3-page description PDF for a published book:
 * - Page 1: Cover Image (stretched to A4 size)
 * - Page 2: Book Details (title, author, ISBN, publisher, release date, edition)
 * - Page 3: Description / Abstract
 */
export const generateBookDescriptionPdf = async (data: BookPdfData): Promise<Buffer> => {
    const coverBuffer = await resolveCoverImage(data.coverImage);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(err));

            // ==========================================
            // PAGE 1: Cover Image (Full Page)
            // ==========================================
            if (coverBuffer) {
                // A4 dimensions: 595.28 x 841.89 points
                doc.image(coverBuffer, 0, 0, { width: 595.28, height: 841.89 });
            } else {
                // Fallback elegant cover if image is missing
                doc.rect(0, 0, 595.28, 841.89).fill('#1a202c');
                doc.fillColor('#ffffff')
                   .font('Helvetica-Bold')
                   .fontSize(28)
                   .text(data.title, 50, 300, { align: 'center', width: 495.28 })
                   .moveDown(1)
                   .fontSize(18)
                   .font('Helvetica')
                   .text(`By ${data.author}`, { align: 'center' });
            }

            // ==========================================
            // PAGE 2: Book Details
            // ==========================================
            doc.addPage();
            
            // Header
            doc.fillColor('#2d3748')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('Book Details', { align: 'center' });
            
            doc.moveDown(1);
            doc.strokeColor('#e2e8f0')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(545.28, doc.y)
               .stroke();
            
            doc.moveDown(2);

            const details = [
                { label: 'Title', value: data.title },
                { label: 'Authors', value: data.author },
                { label: 'ISBN', value: data.isbn },
                { label: 'Publisher', value: data.publisher || 'BR Publications' },
                { label: 'Release Date', value: data.releaseDate || 'N/A' },
                { label: 'Edition', value: data.edition || '1st Edition' },
            ];

            details.forEach(detail => {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#1a202c')
                   .text(`${detail.label}: `, { continued: true })
                   .font('Helvetica')
                   .fillColor('#4a5568')
                   .text(detail.value || 'N/A');
                
                doc.moveDown(1.5);
            });

            // ==========================================
            // PAGE 3: Description
            // ==========================================
            doc.addPage();

            // Header
            doc.fillColor('#2d3748')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('Description', { align: 'center' });
            
            doc.moveDown(1);
            doc.strokeColor('#e2e8f0')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(545.28, doc.y)
               .stroke();
            
            doc.moveDown(2);

            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#4a5568')
               .text(data.description || 'No description provided.', {
                   align: 'justify',
                   lineGap: 5
               });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
