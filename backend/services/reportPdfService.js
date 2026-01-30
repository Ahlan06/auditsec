import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Configuration des couleurs et styles
 */
const COLORS = {
  primary: '#0066CC',
  secondary: '#00CC66',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  success: '#28A745',
  dark: '#212529',
  light: '#F8F9FA',
  gray: '#6C757D',
};

const SEVERITY_COLORS = {
  critical: COLORS.danger,
  high: '#FF6B6B',
  medium: COLORS.warning,
  low: COLORS.info,
};

/**
 * Générer un buffer PDF à partir d'un stream
 */
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Ajouter un en-tête de page
 */
function addHeader(doc, auditData) {
  doc
    .fontSize(24)
    .fillColor(COLORS.primary)
    .text('AuditSec', 50, 50, { continued: true })
    .fontSize(14)
    .fillColor(COLORS.gray)
    .text(' Security Audit Report', { align: 'left' });

  doc
    .fontSize(10)
    .fillColor(COLORS.gray)
    .text(`Report ID: ${auditData.auditId || 'N/A'}`, 50, 80, { align: 'left' });

  // Ligne de séparation
  doc
    .moveTo(50, 100)
    .lineTo(550, 100)
    .strokeColor(COLORS.light)
    .lineWidth(2)
    .stroke();
}

/**
 * Ajouter un pied de page
 */
function addFooter(doc, pageNumber, totalPages) {
  doc
    .fontSize(8)
    .fillColor(COLORS.gray)
    .text(
      `AuditSec © ${new Date().getFullYear()} | Page ${pageNumber} of ${totalPages}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: 500 }
    );
}

/**
 * Ajouter la section Executive Summary
 */
function addExecutiveSummary(doc, auditData, statistics) {
  doc
    .fontSize(18)
    .fillColor(COLORS.dark)
    .text('Executive Summary', 50, 130);

  doc
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text(`Target: ${auditData.targetType.toUpperCase()} - ${auditData.targetValue}`, 50, 160);

  doc.text(`Status: ${auditData.status.toUpperCase()}`, 50, 180);
  doc.text(`Scan Duration: ${auditData.duration || 'N/A'}`, 50, 200);
  doc.text(`Risk Score: ${auditData.riskScore || 'N/A'}/100`, 50, 220);

  // Statistiques en blocs colorés
  const stats = [
    { label: 'Critical', value: statistics.criticalFindings, color: SEVERITY_COLORS.critical },
    { label: 'High', value: statistics.highFindings, color: SEVERITY_COLORS.high },
    { label: 'Medium', value: statistics.mediumFindings, color: SEVERITY_COLORS.medium },
    { label: 'Low', value: statistics.lowFindings, color: SEVERITY_COLORS.low },
  ];

  let xPos = 50;
  const yPos = 250;

  stats.forEach((stat) => {
    // Carré de couleur
    doc
      .rect(xPos, yPos, 100, 60)
      .fillAndStroke(stat.color, stat.color)
      .fillOpacity(0.1);

    // Valeur
    doc
      .fontSize(24)
      .fillColor(stat.color)
      .fillOpacity(1)
      .text(stat.value.toString(), xPos, yPos + 10, { width: 100, align: 'center' });

    // Label
    doc
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(stat.label, xPos, yPos + 40, { width: 100, align: 'center' });

    xPos += 110;
  });

  doc.moveDown(5);
}

/**
 * Ajouter une table de findings
 */
function addFindingsTable(doc, findings) {
  doc
    .fontSize(16)
    .fillColor(COLORS.dark)
    .text('Security Findings', 50, doc.y + 20);

  doc.moveDown(1);

  if (!findings || findings.length === 0) {
    doc
      .fontSize(11)
      .fillColor(COLORS.success)
      .text('✓ No vulnerabilities detected', 50, doc.y);
    return;
  }

  const tableTop = doc.y + 10;
  const rowHeight = 40;
  const columnWidths = {
    severity: 80,
    type: 150,
    description: 270,
  };

  // En-têtes de table
  doc
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text('Severity', 50, tableTop, { width: columnWidths.severity })
    .text('Type', 50 + columnWidths.severity, tableTop, { width: columnWidths.type })
    .text('Description', 50 + columnWidths.severity + columnWidths.type, tableTop, {
      width: columnWidths.description,
    });

  // Ligne sous les en-têtes
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .strokeColor(COLORS.gray)
    .lineWidth(1)
    .stroke();

  let yPos = tableTop + 25;

  findings.forEach((finding, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 100;
    }

    const severityColor = SEVERITY_COLORS[finding.severity] || COLORS.gray;

    // Badge de sévérité
    doc
      .fontSize(9)
      .fillColor(severityColor)
      .text(finding.severity.toUpperCase(), 50, yPos, {
        width: columnWidths.severity,
        align: 'center',
      });

    // Type
    doc
      .fontSize(9)
      .fillColor(COLORS.dark)
      .text(finding.type || 'N/A', 50 + columnWidths.severity, yPos, {
        width: columnWidths.type,
        align: 'left',
      });

    // Description
    doc
      .fontSize(8)
      .fillColor(COLORS.dark)
      .text(
        finding.description || 'No description available',
        50 + columnWidths.severity + columnWidths.type,
        yPos,
        {
          width: columnWidths.description,
          align: 'left',
        }
      );

    yPos += rowHeight;

    // Ligne de séparation
    if (index < findings.length - 1) {
      doc
        .moveTo(50, yPos - 5)
        .lineTo(550, yPos - 5)
        .strokeColor(COLORS.light)
        .lineWidth(0.5)
        .stroke();
    }
  });
}

/**
 * Ajouter la section de recommandations
 */
function addRecommendations(doc) {
  doc.addPage();

  doc
    .fontSize(16)
    .fillColor(COLORS.dark)
    .text('Recommendations', 50, 100);

  doc.moveDown(1);

  const recommendations = [
    {
      title: 'Immediate Actions',
      items: [
        'Address all critical and high severity findings',
        'Implement security patches for identified vulnerabilities',
        'Review and update access controls',
      ],
    },
    {
      title: 'Short-term Improvements',
      items: [
        'Enhance monitoring and logging capabilities',
        'Conduct security awareness training',
        'Implement multi-factor authentication',
      ],
    },
    {
      title: 'Long-term Strategy',
      items: [
        'Establish regular security audit schedule',
        'Develop incident response plan',
        'Implement continuous security testing',
      ],
    },
  ];

  recommendations.forEach((section) => {
    doc
      .fontSize(12)
      .fillColor(COLORS.primary)
      .text(section.title, 50, doc.y + 10);

    doc.moveDown(0.5);

    section.items.forEach((item) => {
      doc
        .fontSize(10)
        .fillColor(COLORS.dark)
        .text(`• ${item}`, 70, doc.y + 5);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  });
}

/**
 * Générer un rapport PDF professionnel
 * @param {Object} auditData - Données de l'audit
 * @param {Object} auditData.auditId - ID de l'audit
 * @param {string} auditData.targetType - Type de cible (domain, ip, email)
 * @param {string} auditData.targetValue - Valeur de la cible
 * @param {string} auditData.status - Statut de l'audit
 * @param {Array} auditData.findings - Résultats de l'audit
 * @param {Object} auditData.statistics - Statistiques des findings
 * @param {Date} auditData.startedAt - Date de début
 * @param {Date} auditData.finishedAt - Date de fin
 * @param {number} auditData.riskScore - Score de risque
 * @returns {Promise<{buffer: Buffer, metadata: Object}>}
 */
export async function generateAuditPDF(auditData) {
  return new Promise((resolve, reject) => {
    try {
      // Créer le document PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: 'Security Audit Report',
          Author: 'AuditSec',
          Subject: `Audit for ${auditData.targetValue}`,
          Keywords: 'security, audit, pentest, vulnerability',
        },
      });

      const chunks = [];

      // Capturer les chunks du stream
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        resolve({
          buffer,
          metadata: {
            size: buffer.length,
            pages: doc.bufferedPageRange().count,
            format: 'application/pdf',
            generatedAt: new Date(),
            auditId: auditData.auditId,
          },
        });
      });
      doc.on('error', reject);

      // Préparer les statistiques
      const statistics = auditData.statistics || {
        totalFindings: auditData.findings?.length || 0,
        criticalFindings: auditData.findings?.filter((f) => f.severity === 'critical').length || 0,
        highFindings: auditData.findings?.filter((f) => f.severity === 'high').length || 0,
        mediumFindings: auditData.findings?.filter((f) => f.severity === 'medium').length || 0,
        lowFindings: auditData.findings?.filter((f) => f.severity === 'low').length || 0,
      };

      // Page 1: En-tête et Executive Summary
      addHeader(doc, auditData);
      addExecutiveSummary(doc, auditData, statistics);

      // Page 2+: Findings
      doc.addPage();
      addHeader(doc, auditData);
      addFindingsTable(doc, auditData.findings || []);

      // Page finale: Recommandations
      addRecommendations(doc);

      // Ajouter les pieds de page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        addFooter(doc, i + 1, pageCount);
      }

      // Finaliser le PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Générer un PDF simple (pour tests rapides)
 */
export async function generateSimplePDF(title, content) {
  const doc = new PDFDocument();
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({
        buffer,
        metadata: {
          size: buffer.length,
          format: 'application/pdf',
        },
      });
    });
    doc.on('error', reject);

    doc.fontSize(20).text(title, 100, 100);
    doc.fontSize(12).text(content, 100, 150);
    doc.end();
  });
}

export default {
  generateAuditPDF,
  generateSimplePDF,
};
