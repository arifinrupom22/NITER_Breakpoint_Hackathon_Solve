import { ReactNode, useMemo, useState } from 'react';
import { Search, Download, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { cls } from '../../lib/format';
import { EmptyState } from '../ui';

export type Column<T> = { key: string; label: string; render?: (row: T) => ReactNode };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns, rows, searchKeys = [], title,
}: {
  columns: Column<T>[]; rows: T[]; searchKeys?: string[]; title?: string;
}) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
      out = rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q.toLowerCase())));
    }
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const va = String(a[sortKey] ?? '').toLowerCase();
        const vb = String(b[sortKey] ?? '').toLowerCase();
        return asc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return out;
  }, [rows, q, sortKey, asc, searchKeys, columns]);

  const exportCsv = () => {
    const head = columns.map((c) => c.label).join(',');
    const body = rows.map((r) => columns.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title || 'export'}.csv`;
    a.click();
  };

  const print = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const table = `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px"><thead><tr>${columns.map((c) => `<th bgcolor="#eee">${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${columns.map((c) => `<td>${String(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    win.document.write(`<title>${title || 'Report'}</title><h2>${title || 'Report'}</h2>${table}`);
    win.document.close();
    win.print();
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input !py-2 !pl-8 text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn btn-outline btn-sm"><Download size={13} /> CSV</button>
          <button onClick={print} className="btn btn-outline btn-sm"><Printer size={13} /> Print</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="cursor-pointer select-none" onClick={() => { setSortKey(c.key); setAsc(!(sortKey === c.key && asc)); }}>
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortKey === c.key && (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? '—')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-6"><EmptyState title="No records found" hint="Adjust your search or add a new record." /></div>}
      </div>
      <div className="border-t border-ink-100 px-4 py-2.5 text-xs text-ink-400">{filtered.length} of {rows.length} records</div>
    </div>
  );
}

export { cls };
