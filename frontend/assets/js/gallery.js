const API_BASE = "http://localhost:3000";

async function loadGallery() {
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get("albumId");
  const albumTitle = params.get("title");

  const h2 = document.querySelector("main h2");
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // limpa qualquer markup estático

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    let photos = [];
    let res;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (albumId) {
      // — modo álbum —
      h2.textContent = albumTitle || "Álbum";
      res = await fetch(`${API_BASE}/api/albums/${albumId}`, { headers });
      if (!res.ok) throw new Error("Erro ao carregar álbum.");
      const album = await res.json();
      photos = album.photos || [];
    } else {
      // — galeria completa —
      h2.textContent = "Galeria";
      res = await fetch(`${API_BASE}/api/photos`, { headers });
      if (!res.ok) throw new Error("Erro ao carregar galeria.");
      photos = await res.json();
    }

    // renderiza as fotos
    photos.forEach((photo) => {
      const cell = document.createElement("div");
      cell.className = "photo";

      const img = document.createElement("img");
      img.src = `${API_BASE}/uploads/${photo.filename}`;
      img.alt = photo.description || "foto";
      img.dataset.id = photo._id; // <-- necessário para abrir o modal
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";

      cell.appendChild(img);
      gallery.appendChild(cell);
    });

  } catch (err) {
    console.error("Erro ao carregar fotos:", err);
    gallery.textContent = "Erro ao carregar fotos.";
  }
}

export { loadGallery }; // <-- exporta para uso em home.js
