// Instância estável do Piped API (CORS 100% liberado para navegadores)
const PIPED_API = 'https://pipedapi.kavin.rocks';

const audioPlayer = document.getElementById('audioPlayer');

document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  // Endpoint de busca do Piped
  const url = `${PIPED_API}/search?q=${encodeURIComponent(query)}&filter=music`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      renderResults(data.items);
    } else {
      alert('Nenhuma música encontrada.');
    }
  } catch (err) {
    console.error('Erro na busca Piped:', err);
    alert('Erro ao conectar ao servidor de músicas.');
  }
}

function renderResults(items) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  items.forEach(item => {
    // Filtra apenas vídeos/músicas (ignora canais/playlists soltas)
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
    // Obtém as URLs diretas de streaming de áudio
    const res = await fetch(`${PIPED_API}/streams/${videoId}`);
    const data = await res.json();

    // Filtra para pegar a melhor faixa de áudio direto sem vídeo (M4A/WebM)
    if (data.audioStreams && data.audioStreams.length > 0) {
      // Pega o áudio de boa qualidade e compatível com navegadores
      const audioStream = data.audioStreams.find(s => s.mimeType.includes('audio/mp4')) || data.audioStreams[0];
      
      audioPlayer.src = audioStream.url;
      audioPlayer.play();

      document.getElementById('playerTitle').innerText = title;
    } else {
      alert('Faixa de áudio indisponível para este vídeo.');
    }
  } catch (err) {
    console.error('Erro ao obter áudio:', err);
    alert('Não foi possível carregar o áudio desta música.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').value = 'Felipe Amorim';
  searchMusic();
});
