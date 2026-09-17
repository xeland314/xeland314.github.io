import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { isZipBytes, isPdfBytes, extractPdfsFromZip, createZipFromPdfs, processZipPdfs } from "./zipPdf";

async function makePdfBytes(text = "hola"): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const p = doc.addPage([400, 600]);
  p.drawText(text, { x: 20, y: 300, size: 18 });
  return await doc.save();
}

describe("zipPdf", () => {
  it("isZipBytes / isPdfBytes", async () => {
    const pdf = await makePdfBytes();
    expect(isPdfBytes(pdf)).toBe(true);
    expect(isZipBytes(pdf)).toBe(false);
    const zip = new JSZip();
    zip.file("a.txt", "hola");
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    expect(isZipBytes(zipBytes)).toBe(true);
    expect(isPdfBytes(zipBytes)).toBe(false);
  });

  it("extractPdfsFromZip solo .pdf y orden", async () => {
    const pdf1 = await makePdfBytes("1");
    const pdf2 = await makePdfBytes("2");
    const zip = new JSZip();
    zip.file("b.pdf", pdf1);
    zip.file("a.pdf", pdf2);
    zip.file("readme.txt", "no");
    zip.file("carpeta/c.pdf", pdf1);
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    const entries = await extractPdfsFromZip(zipBytes);
    expect(entries.map((e) => e.name)).toEqual(["a.pdf", "b.pdf", "carpeta/c.pdf"]);
    expect(entries.every((e) => isPdfBytes(e.bytes))).toBe(true);
  });

  it("createZipFromPdfs y processZipPdfs", async () => {
    const pdf1 = await makePdfBytes("one");
    const pdf2 = await makePdfBytes("two");
    const zipBytes = await createZipFromPdfs([
      { name: "one.pdf", bytes: pdf1 },
      { name: "sub/two.pdf", bytes: pdf2 },
    ]);
    expect(isZipBytes(zipBytes)).toBe(true);
    const processed = await processZipPdfs(zipBytes, async (b) => {
      // simple processor: re-save via pdf-lib (lossless)
      const doc = await PDFDocument.load(b);
      return await doc.save();
    });
    expect(isZipBytes(processed.zipBytes)).toBe(true);
    const re = await extractPdfsFromZip(processed.zipBytes);
    expect(re.length).toBe(2);
    expect(processed.stats.length).toBe(2);
  });

  it("processZipPdfs lanza si sin PDFs", async () => {
    const zip = new JSZip();
    zip.file("a.txt", "no pdf");
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    await expect(processZipPdfs(zipBytes, async (b) => b)).rejects.toThrow(/sin PDFs/i);
  });

  it("ZIP con varios PDFs respeta nombres tras procesar", async () => {
    const pdf = await makePdfBytes("x");
    const zip = new JSZip();
    zip.file("doc1.pdf", pdf);
    zip.file("doc2.PDF", pdf); // mayúsculas
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    const entries = await extractPdfsFromZip(zipBytes);
    expect(entries.length).toBe(2);
  });
});
