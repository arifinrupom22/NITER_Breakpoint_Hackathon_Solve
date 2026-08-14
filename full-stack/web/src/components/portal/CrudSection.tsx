import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Modal, Spinner, useToast } from '../ui';
import { DataTable, Column } from './DataTable';

export type FieldDef = {
  key: string; label: string; type?: 'text' | 'number' | 'select' | 'date' | 'email' | 'tel';
  options?: string[]; required?: boolean; placeholder?: string; colSpan?: 2;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CrudSection<T extends Record<string, any>>({
  title, subtitle, url, columns, fields, rowId, onChanged,
}: {
  title: string; subtitle?: string; url: string; columns: Column<T>[]; fields: FieldDef[]; rowId: string;
  onChanged?: () => void;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { mode: 'add' } | { mode: 'edit'; row: T }>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.get<T[]>(url).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [url]);

  useEffect(load, [load]);

  const openAdd = () => {
    setForm({});
    setError('');
    setModal({ mode: 'add' });
  };
  const openEdit = (row: T) => {
    const f: Record<string, string> = {};
    fields.forEach((fd) => { f[fd.key] = String(row[fd.key] ?? ''); });
    setForm(f);
    setError('');
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (modal?.mode === 'add') {
        await api.post(url, form);
        toast('success', `${title.slice(0, -1) || 'Record'} created.`);
      } else if (modal?.mode === 'edit') {
        await api.put(`${url}/${modal.row[rowId]}`, form);
        toast('success', 'Record updated.');
      }
      setModal(null);
      load();
      onChanged?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Save failed. Check the input values.');
    }
    setSaving(false);
  };

  const remove = async (row: T) => {
    if (!window.confirm(`Delete this record (${row[rowId]})? This cannot be undone.`)) return;
    try {
      await api.del(`${url}/${row[rowId]}`);
      toast('info', 'Record deleted.');
      load();
      onChanged?.();
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Delete failed.');
    }
  };

  const actionCol: Column<T> = {
    key: '__actions', label: 'Actions',
    render: (row) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(row)} aria-label="Edit" className="rounded-lg border border-ink-100 p-1.5 text-ink-500 transition hover:border-niter-300 hover:text-niter-600"><Pencil size={13} /></button>
        <button onClick={() => remove(row)} aria-label="Delete" className="rounded-lg border border-ink-100 p-1.5 text-ink-500 transition hover:border-red-300 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    ),
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
          {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-outline btn-sm"><RefreshCw size={13} /> Refresh</button>
          <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add New</button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-niter-500" /></div>
      ) : (
        <DataTable columns={[...columns, actionCol]} rows={rows} title={title} />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? `Add ${title.slice(0, -1) || 'Record'}` : `Edit ${title.slice(0, -1) || 'Record'}`}>
        <div className="grid grid-cols-2 gap-4">
          {fields.map((fd) => (
            <div key={fd.key} className={fd.colSpan === 2 ? 'col-span-2' : ''}>
              <label className="label">{fd.label}{fd.required && <span className="text-red-500"> *</span>}</label>
              {fd.type === 'select' ? (
                <select className="input" value={form[fd.key] ?? ''} onChange={(e) => setForm({ ...form, [fd.key]: e.target.value })}>
                  <option value="">Select…</option>
                  {fd.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={fd.type || 'text'}
                  className="input"
                  placeholder={fd.placeholder}
                  value={form[fd.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [fd.key]: e.target.value })}
                  required={fd.required}
                />
              )}
            </div>
          ))}
        </div>
        {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setModal(null)} className="btn btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? <Spinner /> : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
