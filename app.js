// Lista de instâncias públicas de alta disponibilidade
const INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://invidious.flokinet.to',
  'https://inv.riverside.rocks',
  'https://invidious.drgns.space'
];

let currentInstanceIndex = 0;
const audioPlayer = document.getElementById('audioPlayer');

document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

// Função para buscar tentando servidores alternativos caso um falhe
async function fetchWithFallback(endpoint) {
  for (let i = 0; i < INSTANCES.length; i++) {
    const instance = INSTANCES[(currentInstanceIndex + i) % INSTANCES.length];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // Timeout de 4s por servidor

      const res = await fetch(`${instance}${endpoint}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        currentInstanceIndex = (currentInstanceIndex + i) % INSTANCES.length; // Guarda o servidor que funcionou
        return { data: await res.json(), activeInstance: instance };
      }
    } catch (err) {
      console.warn(`Instância ${instance} falhou, tentando próxima...`);
    }
  }
  throw new Error('Todas as instâncias falharam.');
}

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const { data, activeInstance } = await fetchWithFallback(`/api/v1/search?q=${encodeURIComponent(query)}&type=video`);

    if (data && data.length > 0) {
      renderResults(data, activeInstance);
    } else {
      alert('Nenhuma música encontrada com esse termo.');
    }
  } catch (err) {
    console.error('Erro de conexão:', err);
    alert('Erro de conexão ao buscar faixas. Verifique sua rede e tente novamente.');
  }
}

function renderResults(videos, activeInstance) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  videos.forEach(video => {
    const coverUrl = video.videoThumbnails && video.videoThumbnails.length > 0
      ? video.videoThumbnails.find(t => t.quality === 'medium' || t.quality === 'high')?.url || video.videoThumbnails[0].url
      : 'https://via.placeholder.com/150';

    // Stream direto da instância que está ativa no momento
    const streamUrl = `${activeInstance}/latest_version?id=${video.videoId}&italic=1`;

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

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Felipe Amorim';
  searchMusic();
});
