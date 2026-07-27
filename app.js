const API_KEY = 'AIzaSyDL50wL4YCySX2UFmvA5CEct5AhNDwAlmI'; // Insira sua API Key do Google aqui

let player;

// Inicializa o Player IFrame do YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtubePlayer', {
    height: '60',
    width: '200',
    videoId: '',
    playerVars: { 'autoplay': 1, 'controls': 1 }
  });
}

// Evento de Busca
document.getElementById('searchBtn').addEventListener('click', searchMusic);

async function searchMusic() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    renderResults(data.items);
  } catch (err) {
    console.error('Erro ao buscar músicas:', err);
  }
}

function renderResults(items) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.snippet.thumbnails.high.url}" alt="Capa">
      <h3>${item.snippet.title}</h3>
      <p style="font-size:12px; color:#aaa;">${item.snippet.channelTitle}</p>
    `;
    card.onclick = () => playSong(item.id.videoId, item.snippet.title, item.snippet.channelTitle, item.snippet.thumbnails.high.url);
    list.appendChild(card);
  });
}

function playSong(videoId, title, channel, thumb) {
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
    document.getElementById('playerTitle').innerText = title;
    document.getElementById('playerChannel').innerText = channel;
    document.getElementById('playerThumb').src = thumb;
  }
}