const API_BASE = 'http://localhost:3000';

(() => {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');

  if (!token || !name) {
    window.location.href = 'login.html';
    return;
  }

  const usernameEl = document.getElementById('username');
  const logoutEl = document.getElementById('logoutOption');
  const albumGrid = document.getElementById('albumGrid');

  usernameEl.textContent = name;
  logoutEl.style.display = 'block';

  logoutEl.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    window.location.href = '../index.html';
  });

  const createModal = document.getElementById('createAlbumModal');
  const createAlbumBtn = document.getElementById('createAlbumBtn');
  const cancelModalBtn = document.getElementById('cancelModal');
  const submitAlbumBtn = document.getElementById('submitAlbum');
  const albumTitleInput = document.getElementById('albumTitle');
  const albumDescriptionInput = document.getElementById('albumDescription');
  const modalBackdrop = document.getElementById('modalBackdrop');

  createAlbumBtn.addEventListener('click', e => {
    e.preventDefault();
    createModal.classList.remove('hidden');
    albumTitleInput.value = '';
    albumDescriptionInput.value = '';
  });

  const closeCreateModal = () => createModal.classList.add('hidden');
  cancelModalBtn.addEventListener('click', closeCreateModal);
  modalBackdrop.addEventListener('click', closeCreateModal);

  submitAlbumBtn.addEventListener('click', async () => {
    const title = albumTitleInput.value.trim();
    const description = albumDescriptionInput.value.trim();

    if (!title) {
      alert('Por favor, preencha o título do álbum.');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userId = decoded.id;

      const res = await fetch(`${API_BASE}/api/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, userId })
      });

      if (!res.ok) throw new Error();
      closeCreateModal();
      await loadAlbums();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar álbum.');
    }
  });

  const viewModal = document.getElementById('viewAlbumModal');
  const modalTitle = document.getElementById('modalAlbumTitle');
  const modalPhotos = document.getElementById('modalPhotos');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const deleteAlbumBtn = document.getElementById('deleteAlbumBtn');

  let currentAlbumId = null;
  let currentAlbumData = null;

  closeModalBtn.addEventListener('click', () => {
    viewModal.classList.add('hidden');
  });

  deleteAlbumBtn.addEventListener('click', async () => {
    if (!confirm('Deseja mesmo excluir este álbum?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/albums/${currentAlbumId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      viewModal.classList.add('hidden');
      await loadAlbums();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir álbum.');
    }
  });

  const updateBtn = document.createElement('button');
  updateBtn.textContent = 'Editar Informações';
  updateBtn.className = 'btn-primary';
  updateBtn.addEventListener('click', () => {
    const newTitle = prompt('Novo título do álbum:', currentAlbumData.title);
    const newDescription = prompt('Nova descrição do álbum:', currentAlbumData.description || '');

    if (!newTitle) return alert('O título não pode ser vazio.');

    fetch(`${API_BASE}/api/albums/${currentAlbumId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle, description: newDescription })
    })
      .then(res => res.json())
      .then(data => {
        alert('Álbum atualizado com sucesso.');
        openAlbum(data.album);
        loadAlbums();
      })
      .catch(() => alert('Erro ao atualizar álbum.'));
  });

  function openAlbum(album) {
    currentAlbumId = album._id;
    currentAlbumData = album;
    modalTitle.textContent = album.title;
    modalPhotos.innerHTML = '';

    album.photos.forEach(photo => {
      const container = document.createElement('div');
      container.className = 'photo';
      container.innerHTML = `
        <img src='${API_BASE}/uploads/${photo.filename}' alt='' />
        <button class='btn-outline' style='margin-top:.5rem'>Remover</button>
      `;
      container.querySelector('button').addEventListener('click', () => removePhotoFromAlbum(photo._id));
      modalPhotos.appendChild(container);
    });

    if (!document.getElementById('updateAlbumBtn')) {
      const actions = document.querySelector('.modal-actions');
      updateBtn.id = 'updateAlbumBtn';
      actions.insertBefore(updateBtn, actions.firstChild);
    }

    viewModal.classList.remove('hidden');
  }

  async function removePhotoFromAlbum(photoId) {
    try {
      const res = await fetch(`${API_BASE}/api/albums/${currentAlbumId}/remove-photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ photoId })
      });

      if (!res.ok) throw new Error();
      const { album } = await res.json();
      openAlbum(album);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover foto.');
    }
  }

  async function loadAlbums() {
    albumGrid.innerHTML = '';
    try {
      const res = await fetch(`${API_BASE}/api/albums`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const albums = await res.json();

      albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
          <div class='album-preview'>
            ${album.photos.slice(0,4).map(p => `<img src='${API_BASE}/uploads/${p.filename}' alt='' />`).join('')}
          </div>
          <div class='album-title'>${album.title}</div>
        `;
        card.addEventListener('click', () => openAlbum(album));
        albumGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      albumGrid.textContent = 'Erro ao carregar álbuns.';
    }
  }

  document.addEventListener('DOMContentLoaded', loadAlbums);
})();
