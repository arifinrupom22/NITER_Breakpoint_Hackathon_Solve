// Small input-validation helpers shared by all route modules.

export const ok = (res, data) => res.json(data);
export const err = (res, status, message) => res.status(status).json({ error: message });
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
export const isPhone = (v) => /^(\+?88)?0?1[3-9]\d{8}$/.test(String(v || '').replace(/[\s-]/g, ''));
export const nonEmpty = (v) => String(v || '').trim().length > 0;

export function requireFields(body, fields) {
  const missing = fields.filter((f) => !nonEmpty(body?.[f]));
  return missing;
}

// Convert a thrown error with { status } into an HTTP response.
export function handleError(res, e) {
  if (e && e.status) return err(res, e.status, e.message);
  console.error('[api]', e);
  return err(res, 500, 'Internal server error');
}
