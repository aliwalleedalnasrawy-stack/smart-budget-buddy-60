import { Transaction, Category, AppSettings, ArchivedMonth } from '../types';
import { getMonthLabel } from './storage';

const getSym = (s: AppSettings) =>
  s.currency === 'IQD' ? 'د.ع' : s.currency === 'USD' ? '$' : s.customSymbol;

const catName = (id: string, cats: Category[]) => cats.find(c => c.id === id)?.name ?? id;
const typeAr  = (t: string) => t === 'income' ? 'دخل' : t === 'expense' ? 'مصروف' : 'مدخرات';

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const exportToCSV = (
  txns: Transaction[], cats: Category[], s: AppSettings,
  month: string, archived: ArchivedMonth[] = []
) => {
  const symbol = getSym(s);
  const allTxns = [...txns, ...archived.flatMap(a => a.transactions)];
  const rows = [
    ['التاريخ', 'الشهر', 'النوع', 'الفئة', 'المبلغ (' + symbol + ')', 'ملاحظة'],
    ...allTxns.map(tx => [
      tx.date, getMonthLabel(tx.month), typeAr(tx.type),
      catName(tx.category, cats), tx.amount.toString(), tx.note ?? '',
    ]),
  ];
  const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = 'budget-ali-' + month + '.csv';
  a.click();
};

export const exportToPDF = (
  txns: Transaction[], cats: Category[], s: AppSettings, month: string,
  totals: { income: number; expenses: number; savings: number; net: number },
  archived: ArchivedMonth[] = []
) => {
  const symbol = getSym(s);
  const rowColor = (t: string) => t === 'income' ? '#00C45F' : t === 'expense' ? '#EF4444' : '#D4A017';

  const txRows = (list: Transaction[]) =>
    list.map(tx =>
      '<tr><td>' + esc(tx.date) + '</td>' +
      '<td style="color:' + rowColor(tx.type) + '">' + esc(typeAr(tx.type)) + '</td>' +
      '<td>' + esc(catName(tx.category, cats)) + '</td>' +
      '<td>' + esc(tx.amount.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</td>' +
      '<td>' + esc(tx.note ?? '') + '</td></tr>'
    ).join('');

  const archiveSections = archived.map(a =>
    '<h3 style="color:#D4A017;margin-top:24px">' + esc(a.label) + '</h3>' +
    '<p style="font-size:12px;color:#555">دخل: ' + esc(a.totalIncome.toLocaleString('ar-IQ')) + ' | مصاريف: ' + esc(a.totalExpenses.toLocaleString('ar-IQ')) + ' | مدخرات: ' + esc(a.totalSavings.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</p>' +
    '<table><thead><tr><th>التاريخ</th><th>النوع</th><th>الفئة</th><th>المبلغ</th><th>ملاحظة</th></tr></thead><tbody>' + txRows(a.transactions) + '</tbody></table>'
  ).join('');

  const bodyHtml =
    '<div class="actions no-print">' +
      '<button onclick="window.print()" class="btn btn-primary">🖨️ طباعة</button>' +
      '<button id="dl-pdf" class="btn btn-secondary">⬇️ تحميل PDF</button>' +
      '<button onclick="window.close()" class="btn btn-ghost">إغلاق</button>' +
    '</div>' +
    '<h1>ميزانية علي الذكية</h1><h2 style="color:#555;text-align:center;font-weight:400">' + getMonthLabel(month) + '</h2>' +
    '<div class="summary">' +
    '<div class="card"><div class="card-label">الدخل</div><div class="card-value" style="color:#00C45F">' + esc(totals.income.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</div></div>' +
    '<div class="card"><div class="card-label">المصاريف</div><div class="card-value" style="color:#EF4444">' + esc(totals.expenses.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</div></div>' +
    '<div class="card"><div class="card-label">المدخرات</div><div class="card-value" style="color:#D4A017">' + esc(totals.savings.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</div></div>' +
    '<div class="card"><div class="card-label">الرصيد الصافي</div><div class="card-value" style="color:#3B82F6">' + esc(totals.net.toLocaleString('ar-IQ')) + ' ' + esc(symbol) + '</div></div>' +
    '</div>' +
    '<h3 style="color:#D4A017">الشهر الحالي</h3>' +
    '<table><thead><tr><th>التاريخ</th><th>النوع</th><th>الفئة</th><th>المبلغ</th><th>ملاحظة</th></tr></thead><tbody>' + txRows(txns) + '</tbody></table>' +
    archiveSections;

  const filename = 'budget-ali-' + month + '.html';
  const downloadScript =
    '<script>(function(){' +
      'var btn=document.getElementById("dl-pdf");' +
      'if(!btn)return;' +
      'btn.addEventListener("click",function(){' +
        'var html="<!DOCTYPE html>"+document.documentElement.outerHTML;' +
        'var blob=new Blob([html],{type:"text/html;charset=utf-8"});' +
        'var a=document.createElement("a");' +
        'a.href=URL.createObjectURL(blob);' +
        'a.download=' + JSON.stringify(filename) + ';' +
        'document.body.appendChild(a);a.click();a.remove();' +
      '});' +
    '})();<\/script>';

  const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>' +
    '<title>ميزانية علي - ' + getMonthLabel(month) + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet"/>' +
    '<style>body{font-family:Cairo,sans-serif;padding:24px;direction:rtl;max-width:100%;overflow-x:hidden}h1{color:#D4A017;text-align:center}' +
    '.actions{position:sticky;top:0;background:#fff;padding:12px 0;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;border-bottom:1px solid #eee;margin-bottom:16px;z-index:10}' +
    '.btn{padding:10px 18px;border:none;border-radius:8px;font-family:inherit;font-weight:700;cursor:pointer;font-size:14px}' +
    '.btn-primary{background:#D4A017;color:#000}.btn-secondary{background:#3B82F6;color:#fff}.btn-ghost{background:#eee;color:#333}' +
    '.summary{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}.card{flex:1;min-width:120px;padding:10px 14px;border-radius:8px;text-align:center;border:1px solid #ddd}' +
    '.card-label{font-size:11px;color:#666}.card-value{font-size:17px;font-weight:700;margin-top:4px}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#020617;color:#D4A017;padding:10px;font-size:13px}' +
    'td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px}tr:nth-child(even){background:#f9f9f9}' +
    '@media print{.no-print{display:none !important}}</style></head><body>' +
    bodyHtml + downloadScript + '</body></html>';

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
};
