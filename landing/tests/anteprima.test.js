const test = require('node:test');
const assert = require('node:assert');
const { fakeReq, fakeRes, mockScript } = require('./helpers');

process.env.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TEST/exec';
process.env.APPS_SCRIPT_SECRET = 'segreto-di-prova';
process.env.PDF_ANTEPRIMA_URL = 'https://drive.google.com/file/d/PDF/view';

const anteprima = require('../api/anteprima');
const OK = { ok: true, nome: 'Anna', bonusUrl: 'https://drive.google.com/drive/folders/X' };
const valid = { nome: ' Anna ', cognome: ' Rossi ', email: 'Anna@Example.IT ', privacy: true, formato: true, source: 'fb' };

test('anteprima: salva nel foglio con Fonte meta-… e restituisce il link del PDF, non quello dei bonus', async () => {
  const calls = mockScript(() => OK);
  const res = fakeRes();
  await anteprima(fakeReq({ method: 'POST', body: valid }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { ok: true, nome: 'Anna', pdfUrl: 'https://drive.google.com/file/d/PDF/view' });
  const p = calls[0].payload;
  assert.equal(p.action, 'subscribe');
  assert.equal(p.secret, 'segreto-di-prova');
  assert.equal(p.email, 'anna@example.it');
  assert.equal(p.source, 'meta-fb');
  assert.equal(p.newsletter, false);
});

test('anteprima: senza conferma del formato PDF o senza privacy non salva niente', async () => {
  const calls = mockScript(() => OK);
  for (const [patch, err] of [
    [{ formato: false }, 'formato_required'],
    [{ privacy: false }, 'privacy_required'],
    [{ nome: '' }, 'nome_required'],
    [{ cognome: '' }, 'cognome_required'],
    [{ email: 'x@' }, 'email_invalid']
  ]) {
    const res = fakeRes();
    await anteprima(fakeReq({ method: 'POST', body: { ...valid, ...patch } }), res);
    assert.equal(res.statusCode, 400, err);
    assert.equal(res.json().error, err);
  }
  assert.equal(calls.length, 0);
});

test('anteprima: campo trappola, solo POST, fonte ripulita', async () => {
  let calls = mockScript(() => OK);
  let res = fakeRes();
  await anteprima(fakeReq({ method: 'POST', body: { ...valid, website: 'spam' } }), res);
  assert.equal(res.statusCode, 400); assert.equal(calls.length, 0);
  res = fakeRes();
  await anteprima(fakeReq({ method: 'GET' }), res);
  assert.equal(res.statusCode, 405);
  calls = mockScript(() => OK);
  res = fakeRes();
  await anteprima(fakeReq({ method: 'POST', body: { ...valid, source: '<script>=x' } }), res);
  assert.equal(calls[0].payload.source, 'meta-scriptx');
});

test('anteprima: nessun link se manca la variabile del PDF o se lo script dà errore', async () => {
  const saved = process.env.PDF_ANTEPRIMA_URL; delete process.env.PDF_ANTEPRIMA_URL;
  let calls = mockScript(() => OK);
  let res = fakeRes();
  await anteprima(fakeReq({ method: 'POST', body: valid }), res);
  assert.equal(res.json().error, 'pdf_url_missing'); assert.equal(calls.length, 0);
  process.env.PDF_ANTEPRIMA_URL = saved;
  calls = mockScript(() => ({ ok: false, error: 'unauthorized' }));
  res = fakeRes();
  await anteprima(fakeReq({ method: 'POST', body: valid }), res);
  assert.equal(res.statusCode, 502); assert.equal(res.json().pdfUrl, undefined);
});
