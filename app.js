// Sua Chave da YouTube Data API v3 do Google Cloud
const API_KEY = 'AIzaSyDL50wL4YCySX2UFmvA5CEct5AhNDwAlmI';

let player;

// Inicializa o Player IFrame do YouTube (oculto)
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

  // Busca oficial na API do YouTube (categoria 10 = Músicas)
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      renderResults(data.items);
    } else if (data.error) {
      console.error('Erro na API do Google:', data.error.message);
      alert('Erro na chave de API do Google: ' + data.error.message);
    } else {
      alert('Nenhuma música encontrada.');
    }
  } catch (err) {
    console.error('Erro na requisição:', err);
    alert('Erro de conexão ao buscar músicas.');
  }
}

function renderResults(items) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  items.forEach(item => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const channelTitle = item.snippet.channelTitle;
    const coverUrl = item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="Capa">
      <h3>${title}</h3>
      <p style="font-size:12px; color:#aaa;">${channelTitle}</p>
    `;
    
    card.onclick = () => playSong(videoId, title, channelTitle, coverUrl);
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

// Busca inicial automática ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Felipe Amorim';
  setTimeout(searchMusic, 500);
});
