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

  const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>' +
    '<title>ميزانية علي - ' + getMonthLabel(month) + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet"/>' +
    '<style>body{font-family:Cairo,sans-serif;padding:24px;direction:rtl}h1{color:#D4A017;text-align:center}' +
    '.summary{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}.card{flex:1;min-width:100px;padding:10px 14px;border-radius:8px;text-align:center;border:1px solid #ddd}' +
    '.card-label{font-size:11px;color:#666}.card-value{font-size:17px;font-weight:700;margin-top:4px}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#020617;color:#D4A017;padding:10px;font-size:13px}' +
    'td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px}tr:nth-child(even){background:#f9f9f9}</style></head><body>' +
    '<h1>ميزانية علي الذكية</h1><h2 style="color:#555;text-align:center;font-weight:400">' + getMonthLabel(month) + '</h2>' +
    '<div class="summary">' +
    '<div class="card"><div class="card-label">الدخل</div><div class="card-value" style="color:#00C45F">' + totals.income.toLocaleString('ar-IQ') + ' ' + symbol + '</div></div>' +
    '<div class="card"><div class="card-label">المصاريف</div><div class="card-value" style="color:#EF4444">' + totals.expenses.toLocaleString('ar-IQ') + ' ' + symbol + '</div></div>' +
    '<div class="card"><div class="card-label">المدخرات</div><div class="card-value" style="color:#D4A017">' + totals.savings.toLocaleString('ar-IQ') + ' ' + symbol + '</div></div>' +
    '<div class="card"><div class="card-label">الرصيد الصافي</div><div class="card-value" style="color:#3B82F6">' + totals.net.toLocaleString('ar-IQ') + ' ' + symbol + '</div></div>' +
    '</div>' +
    '<h3 style="color:#D4A017">الشهر الحالي</h3>' +
    '<table><thead><tr><th>التاريخ</th><th>النوع</th><th>الفئة</th><th>المبلغ</th><th>ملاحظة</th></tr></thead><tbody>' + txRows(txns) + '</tbody></table>' +
    archiveSections + '</body></html>';

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
};
