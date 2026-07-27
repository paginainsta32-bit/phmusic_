// Substitua pela URL gerada no seu Cloudflare Worker
const WORKER_URL = 'https://patient-violet-d9a6music-proxy.paginainsta32.workers.dev/'; 

const audioPlayer = document.getElementById('audioPlayer');

document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const res = await fetch(`${WORKER_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      renderResults(data.items);
    } else {
      alert('Nenhuma música encontrada.');
    }
  } catch (err) {
    console.error('Erro ao conectar ao Worker:', err);
    alert('Erro ao conectar ao servidor de músicas.');
  }
}

function renderResults(items) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  items.forEach(item => {
    if (item.type !== 'stream') return;

    const videoId = item.url.replace('/watch?v=', '');
    const coverUrl = item.thumbnail || 'https://via.placeholder.com/150';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="Capa">
      <h3>${item.title}</h3>
      <p style="font-size:12px; color:#aaa;">${item.uploaderName}</p>
    `;
    
    card.onclick = () => playSong(videoId, item.title, item.uploaderName, coverUrl);
    list.appendChild(card);
  });
}

async function playSong(videoId, title, artist, thumb) {
  document.getElementById('playerTitle').innerText = 'Carregando áudio...';
  document.getElementById('playerChannel').innerText = artist;
  document.getElementById('playerThumb').src = thumb || 'https://via.placeholder.com/60';

  try {
    const res = await fetch(`${WORKER_URL}/stream?id=${videoId}`);
    const data = await res.json();

    if (data.audioStreams && data.audioStreams.length > 0) {
      const audioStream = data.audioStreams.find(s => s.mimeType.includes('audio/mp4')) || data.audioStreams[0];
      
      audioPlayer.src = audioStream.url;
      audioPlayer.play();

      document.getElementById('playerTitle').innerText = title;
    } else {
      alert('Faixa de áudio indisponível.');
    }
  } catch (err) {
    console.error('Erro ao obter áudio:', err);
    alert('Não foi possível carregar o áudio.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Felipe Amorim';
  searchMusic();
});
