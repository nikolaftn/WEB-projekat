const firebaseConfig = {
    databaseURL: "https://web-dizajn-nikola-default-rtdb.europe-west1.firebasedatabase.app/",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let sveKnjizare = {};
let sveKnjige = {};
let trenutnaKnjizaraId = null;

function ucitajKnjizare() {
    const tabela = document.getElementById("tabelaKnjizara");

    db.ref("knjizare").once("value").then(snapshot => {
        sveKnjizare = snapshot.val() || {};
        tabela.innerHTML = "";

        if (Object.keys(sveKnjizare).length === 0) {
            tabela.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Nema knjižara u sistemu.</td></tr>`;
            return;
        }

        for (const id in sveKnjizare) {
            const k = sveKnjizare[id];
            const row = document.createElement("tr");
            row.innerHTML = `
          <td class="border p-2">${k.naziv || ""}</td>
          <td class="border p-2">${k.adresa || ""}</td>
          <td class="border p-2">${k.godinaOsnivanja || ""}</td>
          <td class="border p-2">${k.kontaktTelefon || ""}</td>
          <td class="border p-2">${k.email || ""}</td>
          <td class="border p-2">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2" onclick="prikaziFormuZaIzmenu('${id}')">Izmeni</button>
            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onclick="obrisiKnjizaru('${id}')">Obriši</button>
          </td>
        `;
            tabela.appendChild(row);
        }
    });
}

function prikaziFormuZaIzmenu(id) {
    const k = sveKnjizare[id];

    trenutnaKnjizaraId = id;
    document.getElementById("formaIzmena").classList.remove("hidden");
    document.getElementById("sekcijaKnjiga").classList.add("hidden");

    document.getElementById("knjizaraId").value = id;
    document.getElementById("izmenaNaziv").value = k.naziv || "";
    document.getElementById("izmenaAdresa").value = k.adresa || "";
    document.getElementById("izmenaGodina").value = k.godinaOsnivanja || "";
    document.getElementById("izmenaTelefon").value = k.kontaktTelefon || "";
    document.getElementById("izmenaEmail").value = k.email || "";
}

function obrisiKnjizaru(id) {
    const popup = document.getElementById('confirmDeleteStorePopup');
    popup.classList.remove('hidden');
  
    const yesBtn = document.getElementById('confirmDeleteStoreYes');
    const noBtn = document.getElementById('confirmDeleteStoreNo');
  
    yesBtn.onclick = null;
    noBtn.onclick = null;
  
    yesBtn.onclick = async () => {
      popup.classList.add('hidden');
      try {
        await db.ref("knjizare/" + id).remove();
  
        const msg = document.getElementById('obrisanaKnjizaraMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
  
        ucitajKnjizare();
        document.getElementById("formaIzmena").classList.add("hidden");
        document.getElementById("sekcijaKnjiga").classList.add("hidden");
  
      } catch (error) {
        console.error('Greska pri brisanju knjizare:', error);
        const errMsg = document.getElementById('obrisanaKnjizaraError');
        errMsg.classList.remove('hidden');
        setTimeout(() => errMsg.classList.add('hidden'), 3000);
      }
    };
  
    noBtn.onclick = () => {
      popup.classList.add('hidden');
    };
  }

// cuvam izmene
document.getElementById("formaIzmeniKnjizaru").addEventListener("submit", e => {
    e.preventDefault();
  
    const id = document.getElementById("knjizaraId").value;
  
    const naziv = document.getElementById("izmenaNaziv").value.trim();
    const adresa = document.getElementById("izmenaAdresa").value.trim();
  
    if (!naziv || !adresa) {
      const msg = document.getElementById('praznaPoljaMessage');
      msg.classList.remove('hidden');
      setTimeout(() => {
        msg.classList.add('hidden');
      }, 3000);
      return;
    }

    db.ref("knjizare/" + id).once("value").then(snapshot => {
        const stariPodaci = snapshot.val() || {};

        const noviPodaci = {
            naziv,
            adresa,
            godinaOsnivanja: document.getElementById("izmenaGodina").value.trim(),
            kontaktTelefon: document.getElementById("izmenaTelefon").value.trim(),
            email: document.getElementById("izmenaEmail").value.trim(),
            knjige: sveKnjizare[id].knjige || null,
            logo: stariPodaci.logo || ""
        };

        db.ref("knjizare/" + id).set(noviPodaci).then(() => {
            const msg = document.getElementById('izmenjenaKnjizaraMessage');
            msg.classList.remove('hidden');
            setTimeout(() => {
            msg.classList.add('hidden');
            }, 3000);
            ucitajKnjizare();
            document.getElementById("formaIzmena").classList.add("hidden");
        });
    });
});

document.getElementById("otkaziIzmenu").addEventListener("click", () => {
    document.getElementById("formaIzmena").classList.add("hidden");
    document.getElementById("sekcijaKnjiga").classList.add("hidden");
});

document.getElementById("urediKnjigeBtn").addEventListener("click", () => {
    const knjigeId = sveKnjizare[trenutnaKnjizaraId].knjige;
    ucitajKnjige(knjigeId);
    document.getElementById("sekcijaKnjiga").classList.remove("hidden");
});

function ucitajKnjige(knjigeId) {
    const tabela = document.getElementById("tabelaKnjiga");
    tabela.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Učitavanje knjiga...</td></tr>`;

    db.ref("knjige/" + knjigeId).once("value").then(snapshot => {
        sveKnjige = snapshot.val() || {};
        tabela.innerHTML = "";

        if (Object.keys(sveKnjige).length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Nema knjiga.</td></tr>`;
            return;
        }

        for (const id in sveKnjige) {
            const k = sveKnjige[id];
            const row = document.createElement("tr");
            row.innerHTML = `
          <td class="border p-2">${k.naziv || ""}</td>
          <td class="border p-2">${k.autor || ""}</td>
          <td class="border p-2">${k.cena || ""}</td>
          <td class="border p-2">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2" onclick="izmeniKnjigu('${id}')">Izmeni</button>
            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onclick="obrisiKnjigu('${id}')">Obriši</button>
          </td>
        `;
            tabela.appendChild(row);
        }
    });
}

function obrisiKnjigu(id) {
    const popup = document.getElementById('confirmDeleteBookPopup');
    popup.classList.remove('hidden');
  
    const yesBtn = document.getElementById('confirmDeleteBookYes');
    const noBtn = document.getElementById('confirmDeleteBookNo');
  
    yesBtn.onclick = null;
    noBtn.onclick = null;
  
    yesBtn.onclick = async () => {
      popup.classList.add('hidden');
      try {
        const knjigeId = sveKnjizare[trenutnaKnjizaraId].knjige;
        await db.ref(`knjige/${knjigeId}/${id}`).remove();
  
        const msg = document.getElementById('obrisanaKnjigaMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
  
        ucitajKnjige(knjigeId);
  
      } catch (error) {
        console.error('Greska pri brisanju knjige:', error);
        const msg = document.getElementById('obrisanaKnjigaError');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
      }
    };
  
    noBtn.onclick = () => popup.classList.add('hidden');
  }

document.getElementById("dodajKnjiguBtn").addEventListener("click", () => {
    document.getElementById("formaKnjiga").classList.remove("hidden");
    document.getElementById("naslovKnjigaForme").innerText = "Dodavanje nove knjige";

    document.getElementById("knjigaId").value = "";
    document.getElementById("knjigaNaziv").value = "";
    document.getElementById("knjigaAutor").value = "";
    document.getElementById("knjigaCena").value = "";
    document.getElementById("knjigaZanr").value = "";
    document.getElementById("knjigaOpis").value = "";
    document.getElementById("knjigaBrojStrana").value = "";
});

function izmeniKnjigu(id) {
    const k = sveKnjige[id];
    if (!k) {
        const msg = document.getElementById('knjigaNijePronadjenaMessage');
        msg.classList.remove('hidden');
        setTimeout(() => {
          msg.classList.add('hidden');
        }, 3000);
        return;
    }

    document.getElementById("formaKnjiga").classList.remove("hidden");
    document.getElementById("naslovKnjigaForme").innerText = "Izmena knjige";

    document.getElementById("knjigaId").value = id;
    document.getElementById("knjigaNaziv").value = k.naziv || "";
    document.getElementById("knjigaAutor").value = k.autor || "";
    document.getElementById("knjigaCena").value = k.cena || "";
    document.getElementById("knjigaZanr").value = k.zanr || "";
    document.getElementById("knjigaOpis").value = k.opis || "";
    document.getElementById("knjigaBrojStrana").value = k.brojStrana || "";
}

document.getElementById("formaIzmeniKnjigu").addEventListener("submit", e => {
    e.preventDefault();
    const knjigeId = sveKnjizare[trenutnaKnjizaraId].knjige;

    const id = document.getElementById("knjigaId").value || db.ref().child("knjige").push().key;
    const naziv = document.getElementById("knjigaNaziv").value.trim();
    const autor = document.getElementById("knjigaAutor").value.trim();
    const cena = document.getElementById("knjigaCena").value.trim();
    if (!naziv || !autor || !cena) {
        const msg = document.getElementById('obaveznaPoljaMessage');
        msg.classList.remove('hidden');
        setTimeout(() => {
          msg.classList.add('hidden');
        }, 3000);
        return;
      }

    db.ref(`knjige/${knjigeId}/${id}`).once("value").then(snapshot => {
        const stariPodaci = snapshot.val() || {};

        // ostavi sl
        const stareSlike = Array.isArray(stariPodaci.slike) ? stariPodaci.slike : [];

        const novaKnjiga = {
            naziv,
            autor,
            cena,
            zanr: document.getElementById("knjigaZanr").value.trim(),
            opis: document.getElementById("knjigaOpis").value.trim(),
            brojStrana: document.getElementById("knjigaBrojStrana").value.trim(),
            slike: stareSlike
        };

        db.ref(`knjige/${knjigeId}/${id}`).set(novaKnjiga).then(() => {
            const msg = document.getElementById('knjigaSacuvanaMessage');
            msg.classList.remove('hidden');
            setTimeout(() => {
            msg.classList.add('hidden');
            }, 3000);
            ucitajKnjige(knjigeId);
            document.getElementById("formaKnjiga").classList.add("hidden");
        });
    });
});


document.getElementById("otkaziKnjigu").addEventListener("click", () => {
    document.getElementById("formaKnjiga").classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", ucitajKnjizare);