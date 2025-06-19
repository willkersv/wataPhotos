import { loadGallery } from './gallery.js'; // importa a função da galeria

const usernameEl = document.getElementById("username");
const logoutEl   = document.getElementById("logoutOption");
const fileInput  = document.getElementById("photoInput");

const token = localStorage.getItem("token");
const name  = localStorage.getItem("name");

if (!token || !name) {
  window.location.href = "login.html";
} else {
  usernameEl.textContent = name;
  logoutEl.style.display = "block";
}

// logout
logoutEl.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "../index.html";
});

// upload da imagem
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", "Foto Teste");
  formData.append("description", "Descrição qualquer");

  try {
    const res = await fetch("http://localhost:3000/api/photos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const { message } = await res.json();
      alert(message || "Erro ao enviar foto.");
      return;
    }

    loadGallery(); // recarrega a galeria
  } catch (err) {
    console.error("Erro no upload:", err);
    alert("Erro de conexão.");
  }
});

// ==================== MODAL ====================
const modal = document.createElement("div");
modal.id = "photo-modal";
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.backgroundColor = "rgba(0,0,0,0.8)";
modal.style.display = "none";
modal.style.alignItems = "center";
modal.style.justifyContent = "center";
modal.style.flexDirection = "column";
modal.style.zIndex = "1000";

modal.innerHTML = `
  <img id="modal-image" style="max-width: 80%; max-height: 70%; margin-bottom: 20px;" />
  <div style="display: flex; gap: 10px;">
    <button id="delete-photo-btn">🗑️ Deletar Foto</button>
    <button id="add-to-album-btn">📁 Adicionar ao Álbum</button>
  </div>
  <div id="albumList" style="display: none; flex-direction: column; gap: 0.5rem; margin-top: 1rem;"></div>
`;

document.body.appendChild(modal);

const modalImage = document.getElementById("modal-image");
const deleteBtn  = document.getElementById("delete-photo-btn");
const addBtn     = document.getElementById("add-to-album-btn");
const albumList  = document.getElementById("albumList");

let currentPhotoId = null;

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    albumList.style.display = "none";
    albumList.innerHTML = "";
  }
});

// click na imagem da galeria
document.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG" && e.target.dataset.id) {
    currentPhotoId = e.target.dataset.id;
    modalImage.src = e.target.src;
    modal.style.display = "flex";
    albumList.style.display = "none";
    albumList.innerHTML = "";
  }
});

// excluir imagem
deleteBtn.addEventListener("click", async () => {
  if (!currentPhotoId) return;

  const confirmDelete = confirm("Tem certeza que deseja excluir a foto?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/api/photos/${currentPhotoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      alert("Erro ao deletar foto.");
      return;
    }

    modal.style.display = "none";
    loadGallery(); // atualiza a galeria
  } catch (err) {
    console.error(err);
    alert("Erro ao deletar foto.");
  }
});

// adicionar ao álbum — exibe lista de álbuns do usuário
addBtn.addEventListener("click", async () => {
  if (!currentPhotoId) return;

  albumList.innerHTML = "Carregando álbuns...";
  albumList.style.display = "flex";

  try {
    const res = await fetch("http://localhost:3000/api/albums", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar álbuns");
    const albums = await res.json();

    if (!albums.length) {
      albumList.innerHTML = "<p>Nenhum álbum encontrado.</p>";
      return;
    }

    albumList.innerHTML = "";
    albums.forEach(album => {
      const btn = document.createElement("button");
      btn.textContent = album.title;
      btn.style.padding = "8px 12px";
      btn.style.margin = "4px 0";
      btn.style.cursor = "pointer";
      btn.style.border = "1px solid #aaa";
      btn.style.background = "#fff";

      btn.addEventListener("click", async () => {
        try {
          const result = await fetch("http://localhost:3000/api/albums/add-photo", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              albumId: album._id,
              photoId: currentPhotoId
            })
          });

          if (!result.ok) throw new Error("Erro ao adicionar ao álbum");

          alert(`Foto adicionada ao álbum "${album.title}"`);
          modal.style.display = "none";
          albumList.style.display = "none";
        } catch (err) {
          console.error(err);
          alert("Erro ao adicionar ao álbum.");
        }
      });

      albumList.appendChild(btn);
    });

  } catch (err) {
    console.error(err);
    albumList.innerHTML = "<p>Erro ao carregar álbuns.</p>";
  }
});

// ==================== INICIALIZA ====================
loadGallery();
