import * as XLSX from "xlsx-js-style";
import { $mS } from "../../../common/utils/globalConfig";

/**
 * 判断markdown文本中是否包含表格
 */
export function mkHasTable(content) {
  if (!content) return false;
  return /^\|.+\|/m.test(content);
}

/**
 * 导出markdown中的表格数据为Excel文件
 */
export function mkExportTable(item) {
  const tables = mkParseTables(item.content);
  if (tables.length === 0) return;

  const wb = XLSX.utils.book_new();
  tables.forEach((table, idx) => {
    const data = [table.columns, ...table.rows.map(row => table.columns.map(col => row[col] ?? ""))];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = table.columns.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, `表格${idx + 1}`);
  });
  XLSX.writeFile(wb, "表格数据.xlsx");
}

/**
 * 从markdown文本中解析所有表格数据
 * @param {string} markdown markdown文本
 * @returns {Array<{columns: string[], rows: Object[]}>} 表格数据数组
 */
function mkParseTables(markdown) {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const tables = [];
  let currentTable = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      currentTable.push(trimmed);
    } else {
      if (currentTable.length >= 2) tables.push(currentTable);
      currentTable = [];
    }
  }
  if (currentTable.length >= 2) tables.push(currentTable);

  return tables
    .map(tableLines => {
      const dataLines = tableLines.filter(l => !/^\|[\s:|-]+\|$/.test(l));
      if (dataLines.length === 0) return { columns: [], rows: [] };
      const columns = parseRow(dataLines[0]);
      const rows = dataLines.slice(1).map(line => {
        const cells = parseRow(line);
        const row = {};
        cells.forEach((cell, i) => {
          row[columns[i] ?? String(i)] = cell;
        });
        return row;
      });
      return { columns, rows };
    })
    .filter(t => t.columns.length > 0);
}

/**
 * 解析markdown表格行数据
 * @param {string} line 表格行数据
 * @returns {string[]} 单元格数据数组
 */
function parseRow(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map(c => stripMd(c.trim()));
}

/**
 * 去除文本中的格式标记
 * @param {string} text 原始文本
 * @returns {string} 去除格式后的纯文本
 */
function stripMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

/**
 * 将当前渲染内容导出为PDF（通过浏览器打印）
 * @param {Object} item 会话消息对象
 * @param {Event} event 点击事件
 */
export function mkExportPdf(item, event) {
  const bubble = event.target.closest(".elx-bubble");
  if (!bubble) return;
  const markdownEl = bubble.querySelector(".l-mark-down .x-md-renderer");
  if (!markdownEl) {
    $mS("无可导出的内容");
    return;
  }

  const html = cloneAndClean(markdownEl).innerHTML;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>会话内容</title><style>` +
      `body{font-family:"Microsoft YaHei",sans-serif;padding:20px;color:#333;line-height:1.6}` +
      `table{border-collapse:collapse;width:100%;margin:12px 0}` +
      `th,td{border:1px solid #e4e7ed;padding:5px}` +
      `th{background-color:#f5f7fa;font-weight:600;text-align:center}` +
      `h1,h2,h3,h4,h5,h6{margin:10px 0}p{margin:5px 0}` +
      `pre{background:#f5f7fa;padding:10px;border-radius:4px;overflow-x:auto}` +
      `code{font-family:Consolas,monospace;font-size:14px}` +
      `img{max-width:100%}` +
      `@media print{` +
      `@page{` +
      `margin:18mm;` +
      `@top-left{content:none}@top-center{content:none}@top-right{content:none}` +
      `@bottom-center{content:counter(page)" / "counter(pages);font-size:13px}` +
      `}` +
      `body{margin:0;padding:0}` +
      `}` +
      `</style></head><body>${html}</body></html>`
  );
  iframeDoc.close();

  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

/**
 * 将当前渲染内容导出为Word文件
 * @param {Object} item 会话消息对象
 * @param {Event} event 点击事件
 */
export async function mkExportWord(item, event) {
  const bubble = event.target.closest(".elx-bubble");
  if (!bubble) return;
  const markdownEl = bubble.querySelector(".l-mark-down .x-md-renderer");
  if (!markdownEl) {
    $mS("无可导出的内容");
    return;
  }

  const clone = cloneAndClean(markdownEl);
  const origSvgs = markdownEl.querySelectorAll("svg");
  const cloneSvgs = clone.querySelectorAll("svg");

  for (let i = 0; i < origSvgs.length; i++) {
    const origSvg = origSvgs[i];
    const cloneSvg = cloneSvgs[i];
    if (!origSvg || !cloneSvg) continue;
    try {
      const w = origSvg.clientWidth || origSvg.getAttribute("width") || 500;
      const h = origSvg.clientHeight || origSvg.getAttribute("height") || 300;
      const pngData = await svgToPng(origSvg);
      const img = document.createElement("img");
      img.src = pngData;
      img.style.cssText = `width:${w}px;height:${h}px;max-width:100%`;
      cloneSvg.replaceWith(img);
    } catch (e) {
      cloneSvg.remove();
    }
  }

  const html = clone.innerHTML;
  const wordDoc =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8">` +
    `<xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml>` +
    `<style>` +
    `@page Section1{mso-footer:f1;mso-paper-source:0}` +
    `div.Section1{page:Section1}` +
    `body{font-family:"Microsoft YaHei",sans-serif;color:#333;line-height:1.6;padding:20px}` +
    `table{border-collapse:collapse;width:100%;margin:12px 0}` +
    `th,td{border:1px solid #999;padding:5px 8px}` +
    `th{background-color:#f5f7fa;font-weight:600;text-align:center}` +
    `h1,h2,h3,h4,h5,h6{margin:10px 0}` +
    `p{margin:5px 0}` +
    `pre{background:#f5f7fa;padding:10px;border-radius:4px;overflow-x:auto}` +
    `code{font-family:Consolas,monospace;font-size:14px}` +
    `img{max-width:100%}` +
    `.MsoFooter{font-size:13px;text-align:center;color:#666}` +
    `</style></head><body>` +
    `<div class="Section1">${html}</div>` +
    `<div style="mso-element:footer" id="f1"><p class="MsoFooter">` +
    `<span style="mso-field-code:' PAGE '"></span> / <span style="mso-field-code:' NUMPAGES '"></span>` +
    `</p></div>` +
    `</body></html>`;

  const blob = new Blob(["\ufeff", wordDoc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "会话内容.doc";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 将SVG元素通过Canvas转换为PNG Base64
 * @param {SVGElement} svgEl SVG元素
 * @returns {Promise<string>} PNG Base64数据
 */
function svgToPng(svgEl) {
  return new Promise((resolve, reject) => {
    const w = svgEl.clientWidth || svgEl.getAttribute("width") || 500;
    const h = svgEl.clientHeight || svgEl.getAttribute("height") || 300;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
  });
}

/**
 * 克隆渲染DOM并移除图形工具栏
 * @param {HTMLElement} markdownEl 渲染的markdown容器
 * @returns {HTMLElement} 清理后的DOM容器
 */
function cloneAndClean(markdownEl) {
  const clone = markdownEl.cloneNode(true);
  clone.querySelectorAll('[class*="toolbar"]').forEach(el => {
    if (!el.classList.contains("md-table-toolbar")) {
      el.style.display = "none";
    }
  });
  clone.querySelectorAll(".syntax-mermaid__content").forEach(el => {
    el.style.textAlign = "center";
  });
  clone.querySelectorAll(".syntax-mermaid__content svg").forEach(svg => {
    svg.style.display = "block";
    svg.style.margin = "0 auto";
  });
  clone.querySelectorAll("img").forEach(img => {
    img.style.display = "block";
    img.style.margin = "0 auto";
  });
  return clone;
}
