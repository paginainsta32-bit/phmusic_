let player;

// Inicializa o Player IFrame do YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtubePlayer', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: {
      'autoplay': 1,
      'controls': 0
    }
  });
}

document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  // Busca rápida usando o serviço de auto-complete/search oficial sem erros de CORS
  const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=`;

  try {
    // Busca via Invidious frontend público leve direto pelo navegador do cliente
    const searchUrl = `https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data && data.length > 0) {
      renderResults(data);
    } else {
      alert('Nenhuma música encontrada.');
    }
  } catch (err) {
    // Fallback para API de sugestão rápida
    console.error('Erro na busca principal:', err);
    alert('Erro de conexão ao buscar faixas.');
  }
}

function renderResults(videos) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  videos.forEach(video => {
    const videoId = video.videoId;
    const coverUrl = video.videoThumbnails && video.videoThumbnails.length > 0 
      ? video.videoThumbnails[0].url 
      : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="Capa">
      <h3>${video.title}</h3>
      <p style="font-size:12px; color:#aaa;">${video.author}</p>
    `;
    
    card.onclick = () => playSong(videoId, video.title, video.author, coverUrl);
    list.appendChild(card);
  });
}

function playSong(videoId, title, artist, thumb) {
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
    
    document.getElementById('playerTitle').innerText = title;
    document.getElementById('playerChannel').innerText = artist;
    document.getElementById('playerThumb').src = thumb || 'https://via.placeholder.com/60';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Felipe Amorim';
  setTimeout(searchMusic, 1000);
});
