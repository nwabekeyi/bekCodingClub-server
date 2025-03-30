import { jsPDF } from 'jspdf';
import { CustomLogger } from 'src/core/logger';
import cloudinary from 'src/config/cloudinary.config';

const logger = new CustomLogger('GenerateCertificate');

export async function generateCertificate(firstName: string, lastName: string): Promise<string> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 13.2;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(30).setTextColor('#0052cc');
  doc.text('Certificate of Completion', pageWidth / 2, 20 + margin, { align: 'center' });
  doc.setFontSize(20).setTextColor('#333');
  doc.text('Beks Coding Club Foundation Track', pageWidth / 2, 35 + margin, { align: 'center' });
  doc.setFontSize(18).text('Fundamentals of HTML and CSS', pageWidth / 2, 45 + margin, { align: 'center' });
  doc.setFontSize(16).text('This certifies that', pageWidth / 2, 75 + margin, { align: 'center' });
  doc.setFontSize(24).setTextColor('#2684FF');
  doc.text(`${firstName} ${lastName}`, pageWidth / 2, 85 + margin, { align: 'center' });
  doc.setFontSize(16).setTextColor('#333');
  doc.text('has successfully completed the course on', pageWidth / 2, 105 + margin, { align: 'center' });
  doc.setFontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 115 + margin, { align: 'center' });
  doc.setFontSize(12).setTextColor('#777');
  doc.text('Issued by Beks Coding Club', pageWidth / 2, 135 + margin, { align: 'center' });
  doc.setLineWidth(0.5).setDrawColor('#0052cc');
  doc.rect(margin, margin, pageWidth - 2 * margin, doc.internal.pageSize.getHeight() - 2 * margin);

  const pdfArray = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(pdfArray);

  logger.debug(`Generated PDF buffer size: ${pdfBuffer.length} bytes`);

  // Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'raw', // For PDFs
          public_id: `certificates/${firstName}_${lastName}_${Date.now()}`, // Unique ID
          format: 'pdf', // Ensure it’s stored as PDF
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(pdfBuffer);
  });

  const downloadLink = (uploadResult as any).secure_url; // Get the secure URL
  logger.debug(`Uploaded to Cloudinary: ${downloadLink}`);
  return downloadLink; // Return URL instead of Buffer
}