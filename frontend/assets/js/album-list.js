const API_BASE = "http://localhost:3000";
const token = localStorage.getItem("token");
const name = localStorage.getItem("name");

if (!token || !name) {
  window.location.href = "login.html";
}

// Preencher nome
document.getElementById("username").textContent = name;

// Logout
document.getElementById("logoutOption").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "../index.html";
});

// Modal
const modal = document.getElementById("albumModal");
const backdrop = document.getElementById("modalBackdrop");
const btnOpen = document.getElementById("createAlbumBtn");
const btnCancel = document.getElementById("cancelModal");
const btnSubmit = document.getElementById("submitAlbum");

btnOpen.addEventListener("click", () => modal.classList.remove("hidden"));
btnCancel.addEventListener("click", () => modal.classList.add("hidden"));
backdrop.addEventListener("click", () => modal.classList.add("hidden"));

// Criar álbum
btnSubmit.addEventListener("click", async () => {
  const title = document.getElementById("albumTitle").value.trim();
  const description = document.getElementById("albumDescription").value.trim();

  if (!title) return alert("Informe um título para o álbum.");

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    const res = await fetch(`${API_BASE}/api/albums`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, userId })
    });

    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || "Erro ao criar álbum.");
    }

    alert("Álbum criado com sucesso!");
    modal.classList.add("hidden");
    loadAlbums();
  } catch (err) {
    console.error("Erro ao criar álbum:", err);
    alert("Erro na criação do álbum.");
  }
});

// Carregar álbuns existentes
async function loadAlbums() {
  const grid = document.getElementById("albumGrid");
  grid.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/api/albums`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const albums = await res.json();

    albums.forEach(album => {
      const card = document.createElement("a");
      card.className = "album-card";
      card.href = `../views/album.html?albumId=${album._id}&title=${encodeURIComponent(album.title)}`;

      const preview = document.createElement("div");
      preview.className = "album-preview";

      const previewImgs = album.photos.slice(0, 4);
      for (let i = 0; i < 4; i++) {
        const img = document.createElement("img");
        img.src = previewImgs[i] ? `${API_BASE}/uploads/${previewImgs[i].filename}` : "../assets/img/placeholder.png";
        preview.appendChild(img);
      }

      const title = document.createElement("div");
      title.className = "album-title";
      title.textContent = album.title;

      card.appendChild(preview);
      card.appendChild(title);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar álbuns:", err);
    grid.textContent = "Erro ao carregar álbuns.";
  }
}

document.addEventListener("DOMContentLoaded", loadAlbums);
