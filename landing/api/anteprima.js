const { callScript, send, readBody } = require('./_lib');

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i;

// Anteprima gratuita per la campagna Meta: salva il contatto nello stesso foglio dei bonus
// (colonna Fonte = "meta-…") e restituisce subito il link del PDF del libro.
// La copia è gratuita e NON è legata a nessuna recensione.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' });
  const b = await readBody(req);

  if (b.website) return send(res, 400, { ok: false, error: 'rejected' });

  const nome = String(b.nome || '').trim().slice(0, 60);
  const cognome = String(b.cognome || '').trim().slice(0, 60);
  const email = String(b.email || '').trim().toLowerCase();
  if (!nome) return send(res, 400, { ok: false, error: 'nome_required' });
  if (!cognome) return send(res, 400, { ok: false, error: 'cognome_required' });
  if (email.length > 254 || !EMAIL.test(email)) return send(res, 400, { ok: false, error: 'email_invalid' });
  if (b.formato !== true) return send(res, 400, { ok: false, error: 'formato_required' });
  if (b.privacy !== true) return send(res, 400, { ok: false, error: 'privacy_required' });

  const pdfUrl = (process.env.PDF_ANTEPRIMA_URL || '').trim();
  if (!pdfUrl) return send(res, 502, { ok: false, error: 'pdf_url_missing' });

  const fonte = 'meta-' + String(b.source || 'anteprima').replace(/[^a-z0-9_-]/gi, '').slice(0, 30);
  const out = await callScript({
    action: 'subscribe',
    nome,
    cognome,
    email,
    privacy: true,
    newsletter: b.newsletter === true,
    source: fonte
  });
  if (!out.ok) return send(res, 502, { ok: false, error: out.error || 'error' });
  return send(res, 200, { ok: true, nome: out.nome || nome, pdfUrl });
};
