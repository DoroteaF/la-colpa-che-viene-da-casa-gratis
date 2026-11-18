# Copia gratuita in PDF · «La Colpa che Viene da Casa»

Pagina per la campagna Meta. La lettrice lascia nome, cognome ed email, conferma di aver capito che riceve un **PDF** e preme **Scarica il tuo libro**: il contatto viene salvato nel **foglio Google dei bonus** (scheda Lead, colonna Fonte = `meta-fb`, `meta-ig` o `meta-anteprima`) e subito compare il pulsante per scaricare il PDF. Nessuna email automatica. La copia non dipende mai da una recensione.

Usa lo **stesso script Google** della landing dei bonus: non devi rifare niente nel foglio.

## Contenuto

| File | A cosa serve |
|---|---|
| `index.html` | La pagina |
| `copertina.jpg`, `spine.jpg`, `rametto.png` | Immagini del libro 3D e decorazioni |
| `api/anteprima.js` | Riceve il modulo, salva il contatto e restituisce il link del PDF |
| `api/info.js`, `api/_lib.js` | Dati per l'informativa privacy e funzioni comuni |
| `tests/` | Controlli automatici (`npm test`) |

## 1. PDF su Google Drive
Carica `La_Colpa_che_Viene_da_Casa_stampa_6x9.pdf` › tasto destro › **Condividi** › Accesso generale: **Chiunque abbia il link**, ruolo **Visualizzatore** › **Copia link**.

## 2. GitHub
1. **Repositories › New** › Repository name: `la-colpa-che-viene-da-casa-gratis` › **Create repository**.
2. Clicca **uploading an existing file** (oppure Add file › Upload files).
3. **Trascina la cartella `landing`** dalla finestra dei file alla pagina di GitHub (con «choose your files» non si possono scegliere cartelle).
4. **Commit changes**.

## 3. Vercel
1. **Add New › Project** › Import del repository `la-colpa-che-viene-da-casa-gratis`.
2. Framework Preset: **Other** · Root Directory: **Edit › `landing`**.
3. Apri **Environment Variables** e aggiungi:

| Nome (Key) | Valore (Value) |
|---|---|
| `GOOGLE_SCRIPT_URL` | lo stesso valore del progetto dei bonus (l'URL dello script che finisce con `/exec`) |
| `APPS_SCRIPT_SECRET` | lo stesso valore del progetto dei bonus |
| `PDF_ANTEPRIMA_URL` | il link del PDF copiato al punto 1 |

   I primi due li trovi nel progetto Vercel dei bonus › Settings › Environment Variables › occhio per vederli › copia.
4. **Deploy**. Se aggiungi le variabili dopo: Deployments › tre puntini › **Redeploy**.

## 4. Prova
Apri l'indirizzo dal telefono, compila con la tua email, controlla che il PDF si apra e che nel foglio compaia la riga con Fonte `meta-anteprima`. Nelle inserzioni usa l'indirizzo con `?fonte=fb` o `?fonte=ig`.

## Se qualcosa non va
Il messaggio d'errore mostra un codice:
- `pdf_url_missing` → manca `PDF_ANTEPRIMA_URL` o non hai fatto Redeploy;
- `server_not_configured` → mancano `GOOGLE_SCRIPT_URL` o `APPS_SCRIPT_SECRET`;
- `unauthorized` → `APPS_SCRIPT_SECRET` non è identico a quello dello script.
