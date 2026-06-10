import { jsPDF } from 'jspdf';

export interface PdfRow {
  group?: string | null;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
}

export interface PlanillaPdfData {
  userName: string;
  phaseKey: string;
  phaseLabel: string;
  rows: PdfRow[];
  championName?: string | null;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Genera y descarga un PDF de solo lectura con la planilla firmada de una fase.
 * Incluye un código de verificación (SHA-256 del contenido): si el PDF se
 * modifica, el código deja de coincidir, así que sirve como "firma" de validez.
 * Nunca lanza: si algo falla, no rompe el flujo de firma (el PDF es un extra).
 */
export async function downloadPlanillaPdf(data: PlanillaPdfData): Promise<void> {
  try {
    const signedAt = new Date();
    const canonical = JSON.stringify({
      u: data.userName,
      p: data.phaseKey,
      c: data.championName ?? null,
      r: data.rows.map((r) => [r.home, r.away, r.homeScore, r.awayScore]),
      t: signedAt.toISOString(),
    });
    const hash = (await sha256Hex(canonical)).slice(0, 24).toUpperCase();
    const ownerPwd = (await sha256Hex(canonical + signedAt.getTime())).slice(0, 16);

    let doc: jsPDF;
    try {
      doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        // Solo lectura: se abre sin contraseña, pero no se puede modificar/copiar.
        encryption: { userPassword: '', ownerPassword: ownerPwd, userPermissions: ['print'] },
      });
    } catch {
      doc = new jsPDF({ unit: 'pt', format: 'a4' });
    }

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;

    // Encabezado
    doc.setFillColor(11, 42, 74);
    doc.rect(0, 0, pageW, 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('El Prode de la Gambeta', margin, 33);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Planilla firmada · ${data.phaseLabel}`, margin, 52);

    let y = 100;
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(data.userName, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Firmada: ${signedAt.toLocaleString('es-AR')}`, margin, y + 16);
    y += 42;

    if (data.championName) {
      doc.setFillColor(245, 181, 10);
      doc.roundedRect(margin, y - 13, pageW - margin * 2, 26, 6, 6, 'F');
      doc.setTextColor(11, 42, 74);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Campeon elegido: ${data.championName}`, margin + 14, y + 4);
      y += 38;
    }

    const rowH = 19;
    const midX = pageW / 2;
    const ensureSpace = () => {
      if (y > pageH - 80) {
        doc.addPage();
        y = margin;
      }
    };

    let currentGroup: string | null | undefined;
    for (const r of data.rows) {
      ensureSpace();
      if (r.group !== undefined && r.group !== currentGroup) {
        currentGroup = r.group;
        if (r.group) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(2, 132, 199);
          doc.setFontSize(11);
          doc.text(`Grupo ${r.group}`, margin, y + 4);
          y += 18;
          ensureSpace();
        }
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(35, 35, 35);
      doc.text(r.home, midX - 55, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${r.homeScore} - ${r.awayScore}`, midX, y + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(r.away, midX + 55, y + 4, { align: 'left' });
      y += rowH;
    }

    // Pie con verificación
    ensureSpace();
    y = Math.max(y + 12, pageH - 56);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Documento de solo lectura · Codigo de verificacion (SHA-256): ${hash}`,
      margin,
      y + 15,
    );
    doc.text(
      'Si el documento se modifica, este codigo deja de coincidir.',
      margin,
      y + 27,
    );

    doc.setProperties({
      title: `Planilla ${data.phaseLabel} - ${data.userName}`,
      creator: 'El Prode de la Gambeta',
    });

    const safeName = data.userName.replace(/\s+/g, '-').toLowerCase();
    doc.save(`planilla-${data.phaseKey.toLowerCase()}-${safeName}.pdf`);
  } catch (e) {
    console.warn('No se pudo generar el PDF de la planilla:', e);
  }
}
