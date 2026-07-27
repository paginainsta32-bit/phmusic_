// Instância pública e estável da API do Invidious
const INVIDIOUS_INSTANCE = 'https://inv.tux.pizza';

const audioPlayer = document.getElementById('audioPlayer');

// Eventos de Busca
document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  // Busca de vídeos/músicas filtrando por tipo de áudio/vídeo
  const url = `${INVIDIOUS_INSTANCE}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
      renderResults(data);
    } else {
      alert('Nenhuma música encontrada com esse termo.');
    }
  } catch (err) {
    console.error('Erro ao buscar músicas:', err);
    alert('Erro de conexão ao buscar faixas.');
  }
}

function renderResults(videos) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  videos.forEach(video => {
    // Capa do vídeo/música em boa qualidade
    const coverUrl = video.videoThumbnails && video.videoThumbnails.length > 0
      ? video.videoThumbnails.find(t => t.quality === 'medium' || t.quality === 'high')?.url || video.videoThumbnails[0].url
      : 'https://via.placeholder.com/150';

    // Link do stream de áudio completo (formato m4a/mp3 direto)
    const streamUrl = `${INVIDIOUS_INSTANCE}/latest_version?id=${video.videoId}&italic=1`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="Capa">
      <h3>${video.title}</h3>
      <p style="font-size:12px; color:#aaa;">${video.author}</p>
    `;
    
    card.onclick = () => playSong(streamUrl, video.title, video.author, coverUrl);
    list.appendChild(card);
  });
}

function playSong(audioUrl, title, artist, thumb) {
  audioPlayer.src = audioUrl;
  audioPlayer.play();

  document.getElementById('playerTitle').innerText = title;
  document.getElementById('playerChannel').innerText = artist;
  document.getElementById('playerThumb').src = thumb || 'https://via.placeholder.com/60';
}

// Ao abrir a página, faz uma busca inicial automática por músicas nacionais populares
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Músicas Nacionais Mais Tocadas';
  searchMusic();
});
