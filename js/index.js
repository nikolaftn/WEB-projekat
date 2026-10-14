const firebaseConfig = {databaseURL: "https://web-dizajn-nikola-default-rtdb.europe-west1.firebasedatabase.app/"};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let sveKnjizare = {};
let trenutniKorisnik = localStorage.getItem('ulogovanKorisnik') || null;

function sakrijSvePopupe() {
  document.getElementById('loginPopup')?.classList.add('hidden');
  document.getElementById('logoutPopup')?.classList.add('hidden');
  document.getElementById('kontaktPopup')?.classList.add('hidden');
}

function otvoriLogin() { sakrijSvePopupe(); document.getElementById('loginPopup').classList.remove('hidden'); }
function zatvoriLogin() { document.getElementById('loginPopup').classList.add('hidden'); }

function otvoriLogout() {
  sakrijSvePopupe();
  const logoutPopup = document.getElementById('logoutPopup');
  const msg = document.getElementById('logoutMsg');
  msg.innerText = `Da li ste sigurni da želite da se odjavite sa naloga "${trenutniKorisnik}"?`;
  logoutPopup.classList.remove('hidden');
}
function zatvoriLogout() { document.getElementById('logoutPopup').classList.add('hidden'); }

function otvoriKontakt() { sakrijSvePopupe(); document.getElementById('kontaktPopup').classList.remove('hidden'); }
function zatvoriKontakt() { document.getElementById('kontaktPopup').classList.add('hidden'); }

function prikaziError(msg) {
  document.getElementById('globalErrorMsg').innerText = msg;
  document.getElementById('globalError').classList.remove('hidden');
}
function hideError() { document.getElementById('globalError').classList.add('hidden'); }

// login/out
function updateLoginButton() {
  const loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) return;
  if (trenutniKorisnik) {
    loginBtn.innerText = `Odjava (${trenutniKorisnik})`;
    loginBtn.onclick = otvoriLogout;
  } else {
    loginBtn.innerText = 'Prijava';
    loginBtn.onclick = otvoriLogin;
  }
}

function potvrdiOdjavu() {
  localStorage.removeItem('ulogovanKorisnik');
  trenutniKorisnik = null;
  zatvoriLogout();
  updateLoginButton();
  const msg = document.getElementById('logoutMessage');
  msg.classList.remove('hidden');

  setTimeout(() => {
    msg.classList.add('hidden');
  }, 2000);
}

function prikaziKnjizare() {
  const grid = document.getElementById('knjizareGrid');
  if (!grid) return;
  grid.innerHTML = '';

  db.ref('knjizare').once('value')
    .then(snapshot => {
      sveKnjizare = snapshot.val() || {};
      if (Object.keys(sveKnjizare).length === 0) {
        prikaziError('Nema podataka o knjižarama u bazi!');
        return;
      }
      prikaziFiltriraneKnjizare(Object.entries(sveKnjizare));
    })
    .catch(err => {
      console.error(err);
      prikaziError('Greška prilikom učitavanja podataka.');
    });
}

function prikaziFiltriraneKnjizareDodajCard(grid, id, knjizara) {
  const card = document.createElement('div');
  card.className = "bg-white p-4 rounded shadow hover:shadow-lg transition";
  card.innerHTML = `
    <img src="${knjizara.logo}"
         alt="${knjizara.naziv}"
         class="w-full h-48 object-cover rounded mb-4">
    <h3 class="text-xl font-semibold mb-2">${knjizara.naziv}</h3>
    <p class="text-gray-600 mb-1"><strong>Adresa:</strong> ${knjizara.adresa}</p>
    <p class="text-gray-600 mb-2"><strong>Kontakt:</strong> ${knjizara.kontaktTelefon}</p>
    <a href="bookstore.html?id=${id}"
       class="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
       Otvori
    </a>
  `;
  grid.appendChild(card);
}

function prikaziFiltriraneKnjizare(lista) {
  const grid = document.getElementById('knjizareGrid');
  if (!grid) return;
  grid.innerHTML = '';
  lista.forEach(([id, knjizara]) => {
    prikaziFiltriraneKnjizareDodajCard(grid, id, knjizara);
  });
}

// pretraga knjiz
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    const q = (e.target.value || '').toLowerCase();
    const filtrirane = Object.entries(sveKnjizare).filter(([id, knjizara]) =>
      (knjizara.naziv || '').toLowerCase().includes(q)
    );
    prikaziFiltriraneKnjizare(filtrirane);
  });
}

function prijaviSe() {
  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');
  const errorMsg = document.getElementById('loginErrorMsg');

  const user = userInput.value.trim();
  const pass = passInput.value.trim();

  errorMsg.classList.add('hidden');
  errorMsg.innerText = '';

  if (user === '' || pass === '') {
    errorMsg.innerText = 'Unesite korisničko ime i lozinku.';
    errorMsg.classList.remove('hidden');
    return;
  }

  const korisniciRef = db.ref('korisnici');

  korisniciRef.once('value', function(snapshot) {
    const korisnici = snapshot.val() || {};
    let validan = false;

    for (const uid in korisnici) {
      const k = korisnici[uid];
      if ((k.korisnickoIme || '') === user && (k.lozinka || '') === pass) {
        validan = true;
        break;
      }
    }

    if (validan) {
      trenutniKorisnik = user;
      localStorage.setItem('ulogovanKorisnik', trenutniKorisnik);
      zatvoriLogin();
      updateLoginButton();
      const msg = document.getElementById('loginMessage');
      msg.classList.remove('hidden');
      setTimeout(() => {
        msg.classList.add('hidden');
      }, 2000);

      userInput.value = '';
      passInput.value = '';
    } else {
      errorMsg.innerText = 'Netačno korisničko ime ili lozinka.';
      errorMsg.classList.remove('hidden');

      userInput.value = '';
      passInput.value = '';
    }
  }, function(error) {
    console.error(error);
    errorMsg.innerText = 'Greška prilikom provere korisnika.';
    errorMsg.classList.remove('hidden');
  });
}

function registrujSe() {
  const ime = document.getElementById('regIme').value.trim();
  const prezime = document.getElementById('regPrezime').value.trim();
  const korisnickoIme = document.getElementById('regKorisnickoIme').value.trim();
  const lozinka = document.getElementById('regLozinka').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const telefon = document.getElementById('regTelefon').value.trim();
  const adresa = document.getElementById('regAdresa').value.trim();
  const datumRodjenja = document.getElementById('regDatumRodjenja').value.trim();
  const zanimanje = document.getElementById('regZanimanje').value.trim();
  const errorMsg = document.getElementById('registerErrorMsg');

  errorMsg.classList.add('hidden');
  errorMsg.innerText = '';

  if (
    ime === '' || prezime === '' || korisnickoIme === '' ||
    lozinka === '' || email === '' || telefon === '' ||
    adresa === '' || datumRodjenja === '' || zanimanje === ''
  ) {
    errorMsg.innerText = 'Popunite sva polja.';
    errorMsg.classList.remove('hidden');
    return;
  }

  if (lozinka.length < 8) {
    errorMsg.innerText = 'Lozinka mora imati najmanje 8 karaktera.';
    errorMsg.classList.remove('hidden');
    return;
  }

  const korisniciRef = db.ref('korisnici');

  korisniciRef.once('value', function(snapshot) {
    const korisnici = snapshot.val() || {};

    for (const uid in korisnici) {
      const k = korisnici[uid];
      if ((k.korisnickoIme || '') === korisnickoIme) {
        errorMsg.innerText = 'Korisničko ime je već zauzeto.';
        errorMsg.classList.remove('hidden');
        return;
      }
    }

    const noviKorisnikRef = db.ref('korisnici').push();
    noviKorisnikRef.set({
      ime: ime,
      prezime: prezime,
      korisnickoIme: korisnickoIme,
      lozinka: lozinka,
      email: email,
      telefon: telefon,
      adresa: adresa,
      datumRodjenja: datumRodjenja,
      zanimanje: zanimanje
    }, function(error) {
      if (error) {
        console.error(error);
        errorMsg.innerText = 'Greška prilikom registracije.';
        errorMsg.classList.remove('hidden');
      } else {
        const msg = document.getElementById('registerMessage');
        msg.classList.remove('hidden');
        setTimeout(() => {
          msg.classList.add('hidden');
        }, 3000);

        document.getElementById('regIme').value = '';
        document.getElementById('regPrezime').value = '';
        document.getElementById('regKorisnickoIme').value = '';
        document.getElementById('regLozinka').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regTelefon').value = '';
        document.getElementById('regAdresa').value = '';
        document.getElementById('regDatumRodjenja').value = '';
        document.getElementById('regZanimanje').value = '';
        zatvoriRegister();
      }
    });
  }, function(error) {
    console.error(error);
    errorMsg.innerText = 'Greška prilikom provere korisnika.';
    errorMsg.classList.remove('hidden');
  });
}

function popuniEditProfileForm() {
  if (!trenutniKorisnik) {
    document.getElementById('editIme').value = '';
    document.getElementById('editPrezime').value = '';
    document.getElementById('editKorisnickoIme').value = '';
    document.getElementById('editLozinka').value = '';
    document.getElementById('editEmail').value = '';
    document.getElementById('editTelefon').value = '';
    document.getElementById('editAdresa').value = '';
    document.getElementById('editDatumRodjenja').value = '';
    document.getElementById('editZanimanje').value = '';
    return;
  }

  db.ref('korisnici').once('value').then(snapshot => {
    const korisnici = snapshot.val() || {};
    for (const uid in korisnici) {
      const k = korisnici[uid];
      if ((k.korisnickoIme || '') === trenutniKorisnik) {
        document.getElementById('editIme').value = k.ime || '';
        document.getElementById('editPrezime').value = k.prezime || '';
        document.getElementById('editKorisnickoIme').value = k.korisnickoIme || '';
        document.getElementById('editLozinka').value = k.lozinka || '';
        document.getElementById('editEmail').value = k.email || '';
        document.getElementById('editTelefon').value = k.telefon || '';
        document.getElementById('editAdresa').value = k.adresa || '';
        document.getElementById('editDatumRodjenja').value = k.datumRodjenja || '';
        document.getElementById('editZanimanje').value = k.zanimanje || '';
        break;
      }
    }
  });
}

function sacuvajProfil() {
  const ime = document.getElementById('editIme').value.trim();
  const prezime = document.getElementById('editPrezime').value.trim();
  const korisnickoIme = document.getElementById('editKorisnickoIme').value.trim();
  const lozinka = document.getElementById('editLozinka').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const telefon = document.getElementById('editTelefon').value.trim();
  const adresa = document.getElementById('editAdresa').value.trim();
  const datumRodjenja = document.getElementById('editDatumRodjenja').value.trim();
  const zanimanje = document.getElementById('editZanimanje').value.trim();
  const errorMsg = document.getElementById('editProfileErrorMsg');
  errorMsg.classList.add('hidden');
  errorMsg.innerText = '';

  if (!ime || !prezime || !korisnickoIme || !lozinka || !email || !telefon || !adresa || !datumRodjenja || !zanimanje) {
    errorMsg.innerText = 'Popunite sva polja.';
    errorMsg.classList.remove('hidden');
    return;
  }

  if (lozinka.length < 8) {
    errorMsg.innerText = 'Lozinka mora imati najmanje 8 karaktera.';
    errorMsg.classList.remove('hidden');
    return;
  }

  // nadji id korisnika
  db.ref('korisnici').once('value').then(snapshot => {
    const korisnici = snapshot.val() || {};
    let uidKorisnika = null;
    for (const uid in korisnici) {
      if ((korisnici[uid].korisnickoIme || '') === trenutniKorisnik) {
        uidKorisnika = uid;
        break;
      }
    }

    if (!uidKorisnika) {
      errorMsg.innerText = 'Korisnik nije pronađen u bazi.';
      errorMsg.classList.remove('hidden');
      return;
    }

    // update korisnika
    db.ref(`korisnici/${uidKorisnika}`).set({
      ime,
      prezime,
      korisnickoIme,
      lozinka,
      email,
      telefon,
      adresa,
      datumRodjenja,
      zanimanje
    })
    .then(() => {
      const msg = document.getElementById('updateProfileMessage');
      msg.classList.remove('hidden');
      setTimeout(() => {
        msg.classList.add('hidden');
      }, 3000);
      trenutniKorisnik = korisnickoIme;
      localStorage.setItem('ulogovanKorisnik', trenutniKorisnik);
      zatvoriEditProfile();
      updateLoginButton();
    })
    .catch(err => {
      console.error(err);
      errorMsg.innerText = 'Greška prilikom čuvanja profila.';
      errorMsg.classList.remove('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updateLoginButton();
  prikaziKnjizare();
});