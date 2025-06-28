const API_BASE = 'http://localhost:3000';

(() => {
  const token = localStorage.getItem('token');
  const name  = localStorage.getItem('name');

  if (!token || !name) {
    window.location.href = 'login.html';
    return;
  }

  const usernameEl      = document.getElementById('username');
  const logoutEl        = document.getElementById('logoutOption');
  const deleteUserEl    = document.getElementById('deleteUserOption');
  const fileInput       = document.getElementById('photoInput');
  const gallerySection  = document.querySelector('.gallery');
  const headingEl       = document.querySelector('main h2');

  usernameEl.textContent = name;
  logoutEl.style.display = 'block';
  deleteUserEl.style.display = 'block';

  logoutEl.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    window.location.href = '../index.html';
  });

  deleteUserEl.addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja EXCLUIR sua conta? Essa ação é irreversível.')) return;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userId  = decoded.id;

      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      alert('Conta excluída com sucesso.');
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      window.location.href = '../index.html';
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir conta.');
    }
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'Foto');
    formData.append('description', '');

    try {
      const res = await fetch(`${API_BASE}/api/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const { message } = await res.json();
        alert(message || 'Erro ao enviar foto.');
        return;
      }

      loadGallery();
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  });

  const modal = document.createElement('div');
  modal.id = 'photo-modal';
  Object.assign(modal.style, {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'none',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 1000
  });
  modal.innerHTML = `
    <img id="modal-image" style="max-width:80%; max-height:70%; margin-bottom:20px;" />
    <div style="display:flex; gap:10px;">
      <button id="delete-photo-btn">🗑️ Deletar Foto</button>
      <button id="add-to-album-btn">📁 Adicionar ao Álbum</button>
    </div>
    <div id="albumList" style="display:none; flex-direction:column; gap:.5rem; margin-top:1rem;"></div>
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector('#modal-image');
  const deleteBtn  = modal.querySelector('#delete-photo-btn');
  const addBtn     = modal.querySelector('#add-to-album-btn');
  const albumList  = modal.querySelector('#albumList');

  let currentPhotoId = null;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      albumList.style.display = 'none';
      albumList.innerHTML = '';
    }
  });


  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && e.target.dataset.id) {
      currentPhotoId   = e.target.dataset.id;
      modalImage.src   = e.target.src;
      modal.style.display = 'flex';
      albumList.style.display = 'none';
      albumList.innerHTML = '';
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!currentPhotoId) return;
    if (!confirm('Tem certeza que deseja excluir a foto?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/photos/${currentPhotoId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      modal.style.display = 'none';
      loadGallery();
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar foto.');
    }
  });

  addBtn.addEventListener('click', async () => {
    if (!currentPhotoId) return;
    albumList.innerHTML = 'Carregando álbuns...';
    albumList.style.display = 'flex';

    try {
      const res = await fetch(`${API_BASE}/api/albums`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const albums = await res.json();

      if (!albums.length) {
        albumList.innerHTML = '<p>Nenhum álbum encontrado.</p>';
        return;
      }

      albumList.innerHTML = '';
      albums.forEach(album => {
        const btn = document.createElement('button');
        btn.textContent = album.title;
        Object.assign(btn.style, {
          padding: '8px 12px', margin: '4px 0', cursor: 'pointer',
          border: '1px solid #aaa', background: '#fff'
        });
        btn.addEventListener('click', async () => {
          try {
            const result = await fetch(`${API_BASE}/api/albums/add-photo`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ albumId: album._id, photoId: currentPhotoId })
            });
            if (!result.ok) throw new Error();
            alert(`Foto adicionada ao álbum "${album.title}"`);
            modal.style.display = 'none';
          } catch (err) {
            console.error(err);
            alert('Erro ao adicionar ao álbum.');
          }
        });
        albumList.appendChild(btn);
      });
    } catch (err) {
      console.error(err);
      albumList.innerHTML = '<p>Erro ao carregar álbuns.</p>';
    }
  });

  async function loadGallery() {
    gallerySection.innerHTML = '';

    const params      = new URLSearchParams(window.location.search);
    const albumId     = params.get('albumId');
    const albumTitle  = params.get('title');

    try {
      let photos = [];
      let res;
      const headers = { Authorization: `Bearer ${token}` };

      if (albumId) {
        headingEl.textContent = albumTitle || 'Álbum';
        res    = await fetch(`${API_BASE}/api/albums/${albumId}`, { headers });
        if (!res.ok) throw new Error();
        const album = await res.json();
        photos = album.photos || [];
      } else {
        headingEl.textContent = 'Galeria';
        res    = await fetch(`${API_BASE}/api/photos`, { headers });
        if (!res.ok) throw new Error();
        photos = await res.json();
      }

      photos.forEach(photo => {
        const cell = document.createElement('div');
        cell.className = 'photo';
        const img = document.createElement('img');
        img.src = `${API_BASE}/uploads/${photo.filename}`;
        img.alt = photo.description || 'foto';
        img.dataset.id = photo._id;
        Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover' });
        cell.appendChild(img);
        gallerySection.appendChild(cell);
      });

    } catch (err) {
      console.error(err);
      gallerySection.textContent = 'Erro ao carregar fotos.';
    }
  }

  // ==================== INICIALIZA ====================
  document.addEventListener('DOMContentLoaded', loadGallery);
})();
