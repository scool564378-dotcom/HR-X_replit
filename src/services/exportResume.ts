import { saveAs } from "file-saver";

export function downloadTxt(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

export function downloadPdf(text: string, _filename: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Браузер заблокировал открытие окна. Разрешите всплывающие окна для этого сайта и попробуйте снова.");
    return;
  }

  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  printWindow.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Резюме</title>
<style>
  @page { margin: 20mm; size: A4; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #222;
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
  }
  @media print {
    body { padding: 0; }
  }
</style>
</head><body>
<div>${escaped}</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
</script>
</body></html>`);
  printWindow.document.close();
}

export function downloadDocx(text: string, filename: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const paragraphs = escaped.split("\n").map((line) => {
    const trimmed = line.trim();
    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /^[А-ЯA-Z\s()&;]+$/.test(trimmed);

    if (isHeader) {
      return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="26"/></w:rPr><w:t xml:space="preserve">${trimmed}</w:t></w:r></w:p>`;
    }
    return `<w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${line}</w:t></w:r></w:p>`;
  }).join("");

  const docxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            mc:Ignorable="w14 wp14">
<w:body>${paragraphs}</w:body></w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  import("jszip").catch(() => null).then(async (mod) => {
    if (!mod) {
      downloadTxt(text, filename.replace(".docx", ".txt"));
      return;
    }
    const JSZip = mod.default;
    const zip = new JSZip();
    zip.file("[Content_Types].xml", contentTypes);
    zip.file("_rels/.rels", rels);
    zip.file("word/document.xml", docxml);
    zip.file("word/_rels/document.xml.rels", wordRels);

    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    saveAs(blob, filename);
  });
}

export function exportJobsCsv(jobs: { title: string; company: string; salary: string; url?: string; source: string; schedule?: string; scoringTotal?: number; scoringLevel?: string }[], filename: string) {
  const header = "Должность;Компания;Зарплата;Источник;Формат;Надёжность (балл);Надёжность (уровень);Ссылка";
  const levelLabels: Record<string, string> = {
    trusted: "Надёжная",
    normal: "Обычная",
    suspicious: "Сомнительная",
    risky: "Рискованная",
  };
  const rows = jobs.map((j) =>
    [j.title, j.company, j.salary, j.source, j.schedule || "", j.scoringTotal != null ? String(j.scoringTotal) : "", j.scoringLevel ? (levelLabels[j.scoringLevel] || j.scoringLevel) : "", j.url || ""]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(";")
  );
  const csv = "\uFEFF" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
}
