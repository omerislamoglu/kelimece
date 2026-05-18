const REPORTS_KEY = 'kelimece-word-reports';
const MAX_REPORTS = 100;

export interface WordReport {
  word: string;
  context: 'rejected_but_valid' | 'accepted_but_invalid' | 'missing_definition';
  level: number;
  timestamp: number;
  userNote?: string;
}

/** Yeni kelime bildirimi kaydet (FIFO — max 100). */
export function reportWord(report: WordReport): void {
  const reports = getReports();
  reports.push(report);
  // FIFO: en eski kayıtları at
  while (reports.length > MAX_REPORTS) {
    reports.shift();
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

/** Tüm bildirimleri getir. */
export function getReports(): WordReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WordReport[];
  } catch {
    return [];
  }
}

/** Tüm bildirimleri temizle. */
export function clearReports(): void {
  localStorage.removeItem(REPORTS_KEY);
}

/** Bildirimleri mailto formatında string olarak döndür. */
export function reportsToMailBody(): string {
  const reports = getReports();
  if (reports.length === 0) return 'Henüz bildirim yok.';

  return reports.map(r => {
    const date = new Date(r.timestamp).toLocaleDateString('tr-TR');
    const ctx = r.context === 'rejected_but_valid'
      ? 'Reddedildi ama geçerli'
      : r.context === 'accepted_but_invalid'
        ? 'Kabul edildi ama geçersiz'
        : 'Tanım eksik';
    return `[${date}] "${r.word}" — ${ctx} (Seviye ${r.level})${r.userNote ? ` Not: ${r.userNote}` : ''}`;
  }).join('\n');
}
