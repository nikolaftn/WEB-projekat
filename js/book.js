const firebaseConfig = {
    databaseURL: "https://web-dizajn-nikola-default-rtdb.europe-west1.firebasedatabase.app/",
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("bookDetails");
  
  db.ref("knjige").once("value").then(snapshot => {
    const sveKnjige = snapshot.val();
    let knjiga = null;
  
    // nadji knjigu po id
    for (const kolekcijaId in sveKnjige) {
      if (sveKnjige[kolekcijaId][id]) {
        knjiga = sveKnjige[kolekcijaId][id];
        break;
      }
    }
  
    if (!knjiga) {
      container.innerHTML = `<h1 class="text-2xl text-red-600">Knjiga nije pronađena!</h1>`;
      return;
    }
  
    let slikeHtml = "";
    if (knjiga.slike && knjiga.slike.length > 0) {
      slikeHtml = `
        <div class="flex flex-wrap justify-center gap-3 mb-6">
          ${knjiga.slike
            .map(src => `<img src="${src}" class="w-32 h-48 object-cover rounded cursor-pointer shadow hover:scale-105 transition" alt="slika">`)
            .join("")}
        </div>
      `;
    }
  
    container.innerHTML = `
      <h1 class="text-3xl font-bold mb-4 text-blue-700">${knjiga.naziv}</h1>
      ${slikeHtml}
      <p class="text-gray-700"><strong>Autor:</strong> ${knjiga.autor || "-"}</p>
      <p class="text-gray-700"><strong>Broj strana:</strong> ${knjiga.brStrana || "-"}</p>
      <p class="text-gray-700"><strong>Format:</strong> ${knjiga.format || "-"}</p>
      <p class="text-gray-700"><strong>Cena:</strong> ${knjiga.cena || "N/A"} RSD</p>
      <p class="text-gray-700 italic"><strong>Opis:</strong> ${knjiga.opis || "Nema opisa."}</p>
      <p class="text-gray-700"><strong>Žanr:</strong> ${knjiga.zanr || "-"}</p>
  
      <button class="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Dodaj u korpu</button>
  
      <!-- modal -->
      <div id="imgModal" class="fixed inset-0 bg-black bg-opacity-80 hidden items-center justify-center z-50">
        <img id="modalImage" src="" class="max-h-[90vh] max-w-[90vw] rounded shadow-lg">
        <button id="closeModal" class="absolute top-6 right-6 text-white text-3xl font-bold">&times;</button>
      </div>
    `;
  
    // otvaranje sl
    const thumbs = container.querySelectorAll("img.cursor-pointer");
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.getElementById("closeModal");
  
    thumbs.forEach(img => {
      img.addEventListener("click", () => {
        modalImg.src = img.src;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      });
    });
  
    closeModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  });