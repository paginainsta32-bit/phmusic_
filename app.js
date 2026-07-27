// Servidor público da rede descentralizada Audius
const AUDIUS_API = 'https://discoveryprovider.audius.co/v1';

const audioPlayer = document.getElementById('audioPlayer');

// Eventos de Busca (Clique no botão ou pressionar Enter)
document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  // Endpoint de busca por faixas, artistas ou gêneros
  const url = `${AUDIUS_API}/tracks/search?query=${encodeURIComponent(query)}&app_name=MEU_SPOTIFY_APP`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.data && data.data.length > 0) {
      renderResults(data.data);
    } else {
      alert('Nenhuma música encontrada. Tente outro termo de busca.');
    }
  } catch (err) {
    console.error('Erro ao buscar músicas no Audius:', err);
    alert('Erro de conexão com o servidor da Audius.');
  }
}

function renderResults(tracks) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  tracks.forEach(track => {
    // Busca thumbnail de 150x150 ou usa um placeholder
    const coverUrl = track.artwork ? track.artwork['150x150'] : 'https://via.placeholder.com/150';
    
    // Link direto do áudio streaming em MP3
    const streamUrl = `${AUDIUS_API}/tracks/${track.id}/stream?app_name=MEU_SPOTIFY_APP`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="Capa">
      <h3>${track.title}</h3>
      <p style="font-size:12px; color:#aaa;">${track.user.name}</p>
    `;
    
    card.onclick = () => playSong(streamUrl, track.title, track.user.name, coverUrl);
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

// Carrega automaticamente as faixas populares no momento em que abre o app
window.addEventListener('DOMContentLoaded', async () => {
  const trendingUrl = `${AUDIUS_API}/tracks/trending?app_name=MEU_SPOTIFY_APP`;
  try {
    const res = await fetch(trendingUrl);
    const data = await res.json();
    if (data.data) renderResults(data.data);
  } catch (e) {
    console.error('Erro ao carregar faixas em alta:', e);
  }
});
