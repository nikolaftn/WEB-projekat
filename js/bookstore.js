const firebaseConfig = {
  databaseURL: "https://web-dizajn-nikola-default-rtdb.europe-west1.firebasedatabase.app/",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// id knjizare uzimam
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const container = document.getElementById('bookstoreDetails');
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('bookSearchInput');

let sveKnjige = [];

db.ref('knjizare/' + id).once('value').then(snapshot => {
  const data = snapshot.val();

  if (!data) {
    container.innerHTML = `<h1 class="text-2xl text-red-600">Knjižara nije pronađena!</h1>`;
    return;
  }

  container.innerHTML = `
    <img src="${data.logo || '-'}" 
         alt="${data.naziv}" 
         class="w-full h-64 object-cover rounded mb-6">
    <h1 class="text-3xl font-bold mb-2 text-blue-700">${data.naziv}</h1>
    <p class="text-gray-700 mb-2"><strong>Adresa:</strong> ${data.adresa || '-'}</p>
    <p class="text-gray-700 mb-2"><strong>Kontakt:</strong> ${data.kontaktTelefon || '-'}</p>
    <p class="text-gray-700 mb-2"><strong>Email:</strong> ${data.email || '-'}</p>
    <p class="text-gray-700 mb-2"><strong>Godina osnivanja:</strong> ${data.godinaOsnivanja || '-'}</p>
    <p class="text-gray-700 italic">${data.opis || 'Nema dodatnog opisa.'}</p>
  `;

  let kolekcije = data.knjige;
  if (!kolekcije) {
    prikaziKnjige([]);
    return;
  }

  if (typeof kolekcije === 'string') kolekcije = [kolekcije];

  kolekcije.forEach(kolekcijaId => {
    db.ref('knjige/' + kolekcijaId).once('value').then(booksSnap => {
      const booksCollection = booksSnap.val();
      if (!booksCollection) return;

      Object.keys(booksCollection).forEach(bookId => {
        const knjiga = booksCollection[bookId];
        knjiga.id = bookId;
        knjiga.knjizaraId = id;
        sveKnjige.push(knjiga);
      });

      prikaziKnjige(sveKnjige);
    });
  });
});

function prikaziKnjige(lista, keywords = []) {
  booksContainer.innerHTML = '';

  booksContainer.classList.add('min-h-[400px]');

  if (!lista.length) {
    booksContainer.innerHTML = `
      <div class="w-full h-[300px] flex justify-center items-center bg-white rounded shadow">
        <p class="text-gray-500 text-lg">Nema rezultata koji se poklapaju sa pretragom.</p>
      </div>
    `;
    return;
  }

  lista.forEach(knjiga => {
    const div = document.createElement('div');
    div.className = 'border p-4 rounded shadow-sm bg-white hover:shadow-md transition flex flex-col justify-between';

    let slikeHtml = '';
    if (knjiga.slike && Array.isArray(knjiga.slike)) {
      slikeHtml = '<div class="grid grid-cols-2 gap-2 mb-2">';
      knjiga.slike.forEach(src => {
        slikeHtml += `<img src="${src}" alt="${knjiga.naziv}" class="w-full h-32 object-cover rounded">`;
      });
      slikeHtml += '</div>';
    }

    function highlight(text) {
      let result = text;
      keywords.forEach(k => {
        const regex = new RegExp(`(${k})`, 'gi');
        result = result.replace(regex, '<span class="bg-yellow-300">$1</span>');
      });
      return result;
    }

    div.innerHTML = `
      <div>
        <h3 class="text-lg font-semibold mb-1 text-blue-700">
          ${keywords.length ? highlight(knjiga.naziv || 'Nepoznat naslov') : (knjiga.naziv || 'Nepoznat naslov')}
        </h3>
        ${slikeHtml}
        <p class="text-gray-700"><strong>Autor:</strong> ${keywords.length ? highlight(knjiga.autor || '-') : (knjiga.autor || '-')}</p>
        <p class="text-gray-700"><strong>Žanr:</strong> ${keywords.length ? highlight(knjiga.zanr || '-') : (knjiga.zanr || '-')}</p>
        <p class="text-gray-700"><strong>Br. strana:</strong> ${knjiga.brStrana || '-'}</p>
        <p class="text-gray-700"><strong>Format:</strong> ${knjiga.format || '-'}</p>
        <p class="text-gray-700"><strong>Cena:</strong> ${knjiga.cena || 'N/A'} RSD</p>
        <p class="text-gray-700 italic"><strong>Opis:</strong> ${knjiga.opis || 'Nema opisa.'}</p>
      </div>
      <div class="flex justify-end mt-4">
        <a href="book.html?id=${knjiga.id}&knjizara=${knjiga.knjizaraId}"
           class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Otvori</a>
      </div>
    `;
    booksContainer.appendChild(div);
  });
}

// pretraga s heighlightom
searchInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase().trim();

  if (!query) {
    prikaziKnjige(sveKnjige);
    return;
  }

  const keywords = query.split(/\s+/);
  const filtrirane = sveKnjige.filter(knjiga => {
    const tekst = `${knjiga.naziv} ${knjiga.autor} ${knjiga.zanr}`.toLowerCase();
    return keywords.every(k => tekst.includes(k));
  });

  prikaziKnjige(filtrirane, keywords);
});