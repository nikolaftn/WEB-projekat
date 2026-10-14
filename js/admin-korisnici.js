const firebaseConfig = {
  databaseURL: "https://web-dizajn-nikola-default-rtdb.europe-west1.firebasedatabase.app/",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let sviKorisnici = {};

function ucitajKorisnike() {
  const tabela = document.getElementById("tabelaKorisnika");

  db.ref("korisnici").once("value", function (snapshot) {
    sviKorisnici = snapshot.val() || {};
    tabela.innerHTML = "";

    if (Object.keys(sviKorisnici).length === 0) {
      tabela.innerHTML =
        '<tr><td colspan="8" class="p-3 text-center text-gray-500">Nema korisnika u sistemu.</td></tr>';
      return;
    }

    for (const id in sviKorisnici) {
      const k = sviKorisnici[id];
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50"; 

      row.innerHTML = `
        <td class="border p-2 whitespace-nowrap">${k.ime || ""}</td>
        <td class="border p-2 whitespace-nowrap">${k.prezime || ""}</td>
        <td class="border p-2 whitespace-nowrap">${k.korisnickoIme || ""}</td>
        <td class="border p-2 break-all">${k.email || ""}</td>
        <td class="border p-2">${k.telefon || ""}</td>
        <td class="border p-2">${k.adresa || ""}</td>
        <td class="border p-2">${k.zanimanje || ""}</td>
        <td class="border p-2 text-center">
          <div class="flex flex-col sm:flex-row justify-center gap-2">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    onclick="prikaziFormuZaIzmenu('${id}')">Izmeni</button>
            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    onclick="obrisiKorisnika('${id}')">Obriši</button>
          </div>
        </td>
      `;
      tabela.appendChild(row);
    }
  });
}

function prikaziFormuZaIzmenu(id) {
  const k = sviKorisnici[id];
  if (!k) return;

  document.getElementById("formaIzmena").classList.remove("hidden");
  document.getElementById("korisnikId").value = id;

  document.getElementById("izmenaIme").value = k.ime || "";
  document.getElementById("izmenaPrezime").value = k.prezime || "";
  document.getElementById("izmenaKorisnickoIme").value = k.korisnickoIme || "";
  document.getElementById("izmenaEmail").value = k.email || "";
  document.getElementById("izmenaTelefon").value = k.telefon || "";
  document.getElementById("izmenaAdresa").value = k.adresa || "";
  document.getElementById("izmenaDatumRodjenja").value = k.datumRodjenja || "";
  document.getElementById("izmenaZanimanje").value = k.zanimanje || "";
}

function obrisiKorisnika(id) {
  const popup = document.getElementById("confirmDeletePopup");
  popup.classList.remove("hidden");

  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  yesBtn.onclick = null;
  noBtn.onclick = null;

  yesBtn.onclick = async () => {
    popup.classList.add("hidden");
    try {
      await db.ref("korisnici/" + id).remove();

      const okMsg = document.getElementById("obrisanKorisnikMessage");
      if (okMsg) {
        okMsg.classList.remove("hidden");
        setTimeout(() => okMsg.classList.add("hidden"), 3000);
      }

      if (typeof ucitajKorisnike === "function") ucitajKorisnike();
      const forma = document.getElementById("formaIzmena");
      if (forma) forma.classList.add("hidden");
    } catch (e) {
      console.error("obrisiKorisnika error:", e?.code, e?.message);
      const errMsg = document.getElementById("brisanjeErrorMessage");
      if (errMsg) {
        errMsg.classList.remove("hidden");
        setTimeout(() => errMsg.classList.add("hidden"), 3000);
      }
    }
  };

  noBtn.onclick = () => popup.classList.add("hidden");
}

document.getElementById("formaIzmeniKorisnika").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("korisnikId").value;
  const noviPodaci = {
    ime: document.getElementById("izmenaIme").value.trim(),
    prezime: document.getElementById("izmenaPrezime").value.trim(),
    korisnickoIme: document.getElementById("izmenaKorisnickoIme").value.trim(),
    email: document.getElementById("izmenaEmail").value.trim(),
    telefon: document.getElementById("izmenaTelefon").value.trim(),
    adresa: document.getElementById("izmenaAdresa").value.trim(),
    datumRodjenja: document.getElementById("izmenaDatumRodjenja").value,
    zanimanje: document.getElementById("izmenaZanimanje").value.trim(),
    lozinka: sviKorisnici[id]?.lozinka || "",
  };

  db.ref("korisnici/" + id).set(noviPodaci, function (error) {
    if (error) {
      const msg = document.getElementById("izmenaErrorMessage");
      msg.classList.remove("hidden");
      setTimeout(() => msg.classList.add("hidden"), 3000);
      console.error(error);
    } else {
      const msg = document.getElementById("izmenjenKorisnikMessage");
      msg.classList.remove("hidden");
      setTimeout(() => msg.classList.add("hidden"), 3000);
      ucitajKorisnike();
      document.getElementById("formaIzmena").classList.add("hidden");
    }
  });
});

document.getElementById("otkaziIzmenu").addEventListener("click", () => {
  document.getElementById("formaIzmena").classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", ucitajKorisnike);