# Hub Informațional - Biserica Unu Unu

🔴 **Vezi LIVE:** [unu-unu-ro.github.io](https://unu-unu-ro.github.io/)

Acest proiect web este hub-ul informațional oficial al Bisericii Unu Unu ([unu-unu.ro](https://www.unu-unu.ro/)), oferind comunității noastre acces rapid și ușor la informații esențiale, precum metodele de contact, evenimente viitoare, anunțuri, resurse spirituale și programe regulate ale bisericii.

## Funcționalități

- 📅 **Evenimente:** Detalii actualizate despre evenimente speciale și recurente, incluzând locația, ora și modalitățile de înscriere.
- 📢 **Anunțuri:** Informații actuale despre viața bisericii, activități și comunicări importante.
- 📞 **Contact:** Modalități clare și directe pentru a intra în contact cu echipa bisericii (telefon, email, social media).
- 🔗 **Resurse:** Materiale spirituale precum predici, cursuri biblice și articole utile comunității.
- 📖 **Programe:** Orarul întâlnirilor și serviciilor bisericii noastre.

## Structura proiectului

```
├── index.html          # Pagina principală cu lista evenimentelor
├── intalniri.html      # Programul săptămânal al întâlnirilor bisericii
├── event.html          # Pagina de detalii pentru un eveniment
├── styles.css          # Stilurile CSS pentru întregul site
├── script.js           # Logica pentru pagina principală
├── event.js            # Logica pentru pagina de eveniment
├── assets/
│   ├── data.json       # Datele evenimentelor și secțiunilor
│   └── ...             # Logo-uri și alte resurse
├── schedules/          # Fișiere JSON cu programele evenimentelor
├── calendars/          # Fișiere .ics generate (nu edita manual)
└── scripts/
    └── generate-ics.js # Script pentru generarea fișierelor .ics
```

## Pagini

| Pagină    | URL          | Descriere                            |
| --------- | ------------ | ------------------------------------ |
| Acasă     | `/`          | Lista evenimentelor curente          |
| Întâlniri | `/intalniri` | Programul săptămânal al bisericii    |
| Eveniment | `/event?...` | Detalii despre un eveniment specific |

## Tehnologii utilizate

- HTML, CSS și JavaScript (vanilla)
- Găzduire pe GitHub Pages ([unu-unu-ro.github.io](https://unu-unu-ro.github.io/))
- URL-uri curate (fără extensia .html)

## Cum folosești acest proiect?

### Instalare locală:

Clonează repository-ul:

```bash
git clone https://github.com/unu-unu-ro/unu-unu-ro.github.io.git
cd unu-unu-ro.github.io
```

### Dezvoltare:

Pentru dezvoltare locală, folosește un server local (de ex. Live Server în VS Code) pentru a testa URL-urile curate.

### Calendar ICS (adaugă în telefon):

Fiecare eveniment cu program (`schedulefile`) expune un buton **Calendar** care permite utilizatorilor să adauge activitățile direct în calendarul nativ al telefonului.

Fișierele `.ics` din `calendars/` sunt generate din `schedules/*.json` și trebuie regenerate ori de câte ori modifici un program.

**Cum regenerezi:**

```bash
node scripts/generate-ics.js
```

Scriptul procesează toate fișierele din `schedules/` și suprascrie fișierele corespunzătoare din `calendars/`. Commitează ambele fișiere împreună (`schedules/xxx.json` + `calendars/xxx.ics`).

> **Notă:** Fișierele `.ics` sunt servite de GitHub Pages cu `Content-Type: text/calendar`, ceea ce permite iOS/Android să deschidă automat aplicația Calendar la accesarea linkului.

### Publicare:

Proiectul este găzduit direct prin GitHub Pages la adresa: [unu-unu-ro.github.io](https://unu-unu-ro.github.io/)

## Contribuții

Sugestiile și contribuțiile tale sunt apreciate! Te invităm să creezi un issue sau un pull request pentru a participa activ la dezvoltarea acestui proiect.

---

© 2026 Biserica Unu Unu
