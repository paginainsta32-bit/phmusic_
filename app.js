// Client ID público do Jamendo
const JAMENDO_CLIENT_ID = '56b49278';

const audioPlayer = document.getElementById('audioPlayer');

document.getElementById('searchBtn').addEventListener('click', searchMusic);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMusic();
});

async function searchMusic() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  // Busca mais abrangente usando fuzzysearch (busca aproximada em títulos, tags e artistas)
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&fuzzysearch=${encodeURIComponent(query)}&audioformat=mp32`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      renderResults(data.results);
    } else {
      alert('Nenhuma música encontrada. Tente buscar por um gênero em inglês como "rock", "pop", "jazz", "acoustic" ou "ambient".');
    }
  } catch (err) {
    console.error('Erro ao buscar músicas no Jamendo:', err);
  }
}

function renderResults(tracks) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${track.image || 'https://via.placeholder.com/150'}" alt="Capa">
      <h3>${track.name}</h3>
      <p style="font-size:12px; color:#aaa;">${track.artist_name}</p>
    `;
    
    card.onclick = () => playSong(track.audio, track.name, track.artist_name, track.image);
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

// Ao abrir, faz a busca por músicas populares em destaque
window.addEventListener('DOMContentLoaded', async () => {
  const popularUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&order=popularity_week&audioformat=mp32`;
  try {
    const res = await fetch(popularUrl);
    const data = await res.json();
    if (data.results) renderResults(data.results);
  } catch (e) {
    console.error(e);
  }
});
