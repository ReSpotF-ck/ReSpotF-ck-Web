// State Management
let tracks = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
let queue = JSON.parse(localStorage.getItem('queue')) || [];
let currentSource = 'all';

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = playPauseBtn.querySelector('i');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const volumeIcon = volumeBtn.querySelector('i');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const trackArt = document.getElementById('trackArt');
const likeBtn = document.getElementById('likeBtn');
const likeIcon = likeBtn.querySelector('i');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const trackList = document.getElementById('trackList');
const sourceTabs = document.querySelectorAll('.source-tab');

// API Configuration
const API_CONFIG = {
    audius: {
        baseUrl: 'https://audius.co',
        apiKey: '' // Users can add their own API key
    },
    youtube: {
        apiKey: '', // Users can add their own API key
        baseUrl: 'https://www.googleapis.com/youtube/v3'
    },
    jamendo: {
        clientId: '', // Users can add their own client ID
        baseUrl: 'https://api.jamendo.com/v3.0'
    },
    spotify: {
        clientId: '', // Users can add their own client ID
        clientSecret: '', // Users can add their own client secret
        baseUrl: 'https://api.spotify.com/v1'
    }
};

// Load settings from localStorage
function loadSettingsToAPIConfig() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    
    if (settings.audiusApiKey) API_CONFIG.audius.apiKey = settings.audiusApiKey;
    if (settings.youtubeApiKey) API_CONFIG.youtube.apiKey = settings.youtubeApiKey;
    if (settings.jamendoClientId) API_CONFIG.jamendo.clientId = settings.jamendoClientId;
    if (settings.spotifyClientId) API_CONFIG.spotify.clientId = settings.spotifyClientId;
    if (settings.spotifyClientSecret) API_CONFIG.spotify.clientSecret = settings.spotifyClientSecret;
    
    // Apply volume settings
    if (settings.defaultVolume && volumeSlider) {
        volumeSlider.value = settings.defaultVolume;
        audioPlayer.volume = settings.defaultVolume / 100;
    }
}

// Global function to update API config from settings modal
window.updateAPIConfig = function(settings) {
    if (settings.audiusApiKey) API_CONFIG.audius.apiKey = settings.audiusApiKey;
    if (settings.youtubeApiKey) API_CONFIG.youtube.apiKey = settings.youtubeApiKey;
    if (settings.jamendoClientId) API_CONFIG.jamendo.clientId = settings.jamendoClientId;
    if (settings.spotifyClientId) API_CONFIG.spotify.clientId = settings.spotifyClientId;
    if (settings.spotifyClientSecret) API_CONFIG.spotify.clientSecret = settings.spotifyClientSecret;
    if (settings.defaultVolume && volumeSlider) {
        volumeSlider.value = settings.defaultVolume;
        audioPlayer.volume = settings.defaultVolume / 100;
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadSettingsToAPIConfig();
    loadRecommendations();
    setupEventListeners();
    setupKeyboardShortcuts();
});

// Event Listeners
function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Source tabs
    sourceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sourceTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSource = tab.dataset.source;
            if (tracks.length > 0) {
                displayTracks();
            }
        });
    });

    // Player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    likeBtn.addEventListener('click', toggleLike);

    // Progress bar
    progressBar.addEventListener('click', handleProgressClick);

    // Volume
    volumeSlider.addEventListener('input', handleVolumeChange);
    volumeBtn.addEventListener('click', toggleMute);

    // Audio events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.addEventListener('loadedmetadata', handleMetadataLoaded);
    audioPlayer.addEventListener('error', handleAudioError);

    // Sidebar navigation
    document.getElementById('homeBtn').addEventListener('click', () => {
        setActiveSidebar('homeBtn');
        loadRecommendations();
    });

    document.getElementById('likedSongsBtn').addEventListener('click', () => {
        setActiveSidebar('likedSongsBtn');
        if (likedSongs.length > 0) {
            tracks = likedSongs;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });

    document.getElementById('recentlyPlayedBtn').addEventListener('click', () => {
        setActiveSidebar('recentlyPlayedBtn');
        if (recentlyPlayed.length > 0) {
            tracks = recentlyPlayed;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });

    document.getElementById('queueBtn').addEventListener('click', () => {
        setActiveSidebar('queueBtn');
        if (queue.length > 0) {
            tracks = queue;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });
}

function setActiveSidebar(activeId) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(activeId).classList.add('active');
}

// Search Functionality
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoadingState();
    
    try {
        const results = await searchAllSources(query);
        tracks = results;
        currentTrackIndex = 0;
        displayTracks();
    } catch (error) {
        console.error('Search error:', error);
        showErrorState('Search failed. Please try again.');
    }
}

async function searchAllSources(query) {
    const searchPromises = [];
    
    // Only search sources that have API keys configured
    if (API_CONFIG.audius.apiKey) {
        searchPromises.push(searchAudius(query));
    }
    if (API_CONFIG.youtube.apiKey) {
        searchPromises.push(searchYouTube(query));
    }
    if (API_CONFIG.jamendo.clientId) {
        searchPromises.push(searchJamendo(query));
    }
    if (API_CONFIG.spotify.clientId && API_CONFIG.spotify.clientSecret) {
        searchPromises.push(searchSpotify(query));
    }

    // If no sources configured, return mock data for demo
    if (searchPromises.length === 0) {
        return getMockSearchResults(query);
    }

    const results = await Promise.allSettled(searchPromises);
    const allTracks = [];
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            allTracks.push(...result.value);
        }
    });

    return allTracks;
}

// API Search Functions
async function searchAudius(query) {
    try {
        const response = await fetch(`${API_CONFIG.audius.baseUrl}/tracks/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${API_CONFIG.audius.apiKey}`
            }
        });
        const data = await response.json();
        
        return data.data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.user.name,
            album: track.album || 'Unknown',
            duration: track.duration,
            artwork: track.artwork ? track.artwork['150x150'] : null,
            source: 'audius',
            audioUrl: track.stream_url
        }));
    } catch (error) {
        console.error('Audius search error:', error);
        return [];
    }
}

async function searchYouTube(query) {
    try {
        const response = await fetch(
            `${API_CONFIG.youtube.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_CONFIG.youtube.apiKey}`
        );
        const data = await response.json();
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            album: 'YouTube',
            duration: '0', // YouTube duration needs additional API call
            artwork: item.snippet.thumbnails.medium?.url,
            source: 'youtube',
            videoId: item.id.videoId
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
}

async function searchJamendo(query) {
    try {
        const response = await fetch(
            `${API_CONFIG.jamendo.baseUrl}/tracks/search?name=${encodeURIComponent(query)}&client_id=${API_CONFIG.jamendo.clientId}&limit=10&format=jsonpretty`
        );
        const data = await response.json();
        
        return data.results.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            album: track.album_name || 'Unknown',
            duration: track.duration,
            artwork: track.image || null,
            source: 'jamendo',
            audioUrl: track.audio
        }));
    } catch (error) {
        console.error('Jamendo search error:', error);
        return [];
    }
}

async function searchSpotify(query) {
    try {
        // First get access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(API_CONFIG.spotify.clientId + ':' + API_CONFIG.spotify.clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenResponse.json();
        
        const response = await fetch(
            `${API_CONFIG.spotify.baseUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            }
        );
        const data = await response.json();
        
        return data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            duration: track.duration_ms / 1000,
            artwork: track.album.images[0]?.url,
            source: 'spotify',
            previewUrl: track.preview_url
        }));
    } catch (error) {
        console.error('Spotify search error:', error);
        return [];
    }
}

// Mock Data for Demo
function getMockSearchResults(query) {
    return [
        {
            id: '1',
            title: `${query} - Track 1`,
            artist: 'Demo Artist',
            album: 'Demo Album',
            duration: 180,
            artwork: null,
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
            id: '2',
            title: `${query} - Track 2`,
            artist: 'Demo Artist',
            album: 'Demo Album',
            duration: 210,
            artwork: null,
            source: 'youtube',
            videoId: 'dQw4w9WgXcQ'
        },
        {
            id: '3',
            title: `${query} - Track 3`,
            artist: 'Demo Artist',
            album: 'Demo Album',
            duration: 195,
            artwork: null,
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        }
    ];
}

// Display Functions
function displayTracks() {
    const filteredTracks = currentSource === 'all' 
        ? tracks 
        : tracks.filter(track => track.source === currentSource);

    if (filteredTracks.length === 0) {
        showEmptyState();
        return;
    }

    trackList.innerHTML = filteredTracks.map((track, index) => `
        <div class="track-item ${index === currentTrackIndex ? 'playing' : ''}" data-index="${index}">
            <div class="track-art">
                ${track.artwork 
                    ? `<img src="${track.artwork}" alt="${track.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <i class="fas fa-music" style="display: none;"></i>`
                    : '<i class="fas fa-music"></i>'
                }
            </div>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
                <div class="track-album">${track.album}</div>
            </div>
            <div class="track-source ${track.source}">${track.source}</div>
            <div class="track-duration">${formatTime(track.duration)}</div>
            <div class="track-actions">
                <button class="track-action-btn ${isLiked(track) ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeByIndex(${index})">
                    <i class="${isLiked(track) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="track-action-btn" onclick="event.stopPropagation(); addToQueueByIndex(${index})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add click listeners to track items
    document.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            playTrack(index);
        });
    });
}

function showEmptyState() {
    trackList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas fa-music"></i>
            </div>
            <h3 class="empty-state-title">Start Listening</h3>
            <p class="empty-state-text">Search for your favorite music or explore recommendations</p>
        </div>
    `;
}

function showLoadingState() {
    trackList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <h3 class="empty-state-title">Searching...</h3>
            <p class="empty-state-text">Finding the best tracks for you</p>
        </div>
    `;
}

function showErrorState(message) {
    trackList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3 class="empty-state-title">Error</h3>
            <p class="empty-state-text">${message}</p>
        </div>
    `;
}

function loadRecommendations() {
    // Load some demo recommendations
    tracks = getMockSearchResults('popular');
    currentTrackIndex = 0;
    displayTracks();
}

// Player Functions
function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    
    if (!track) return;

    // Update UI
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    
    if (track.artwork) {
        trackArt.innerHTML = `<img src="${track.artwork}" alt="${track.title}">`;
    } else {
        trackArt.innerHTML = '<i class="fas fa-music"></i>';
    }

    // Update like button
    likeIcon.className = isLiked(track) ? 'fas fa-heart' : 'far fa-heart';
    likeBtn.classList.toggle('liked', isLiked(track));

    // Play based on source
    if (track.source === 'youtube') {
        playYouTubeTrack(track);
    } else {
        playAudioTrack(track);
    }

    // Add to recently played
    recentlyPlayed = recentlyPlayed.filter(t => t.id !== track.id);
    recentlyPlayed.unshift(track);
    recentlyPlayed = recentlyPlayed.slice(0, 20);
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));

    // Show notification if enabled
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    const showNotifications = settings.showNotifications !== undefined ? settings.showNotifications : false;
    
    if (showNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Now Playing', {
                body: `${track.title} - ${track.artist}`,
                icon: track.artwork || null
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // Update display
    displayTracks();
}

function playAudioTrack(track) {
    audioPlayer.src = track.audioUrl || track.previewUrl;
    audioPlayer.play().then(() => {
        isPlaying = true;
        playPauseIcon.className = 'fas fa-pause';
    }).catch(error => {
        console.error('Play error:', error);
        isPlaying = false;
        playPauseIcon.className = 'fas fa-play';
    });
}

function playYouTubeTrack(track) {
    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = function() {
            createYouTubePlayer(track);
        };
    } else {
        createYouTubePlayer(track);
    }
}

function createYouTubePlayer(track) {
    if (window.youtubePlayer) {
        window.youtubePlayer.loadVideoById(track.videoId);
    } else {
        window.youtubePlayer = new YT.Player('youtubePlayer', {
            height: '0',
            width: '0',
            videoId: track.videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1
            },
            events: {
                'onStateChange': onYouTubePlayerStateChange
            }
        });
    }
    isPlaying = true;
    playPauseIcon.className = 'fas fa-pause';
}

function onYouTubePlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        playPauseIcon.className = 'fas fa-pause';
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        playPauseIcon.className = 'fas fa-play';
    }
}

function togglePlayPause() {
    if (tracks.length === 0) return;
    
    const currentTrack = tracks[currentTrackIndex];
    
    if (currentTrack && currentTrack.source === 'youtube' && window.youtubePlayer) {
        if (isPlaying) {
            window.youtubePlayer.pauseVideo();
            isPlaying = false;
        } else {
            window.youtubePlayer.playVideo();
            isPlaying = true;
        }
    } else {
        if (audioPlayer.paused) {
            audioPlayer.play().then(() => {
                isPlaying = true;
                playPauseIcon.className = 'fas fa-pause';
            }).catch(error => {
                console.error('Play error:', error);
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
            });
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
    }
    playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function playNext() {
    if (tracks.length === 0) return;
    
    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * tracks.length);
        playTrack(randomIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        playTrack(0);
    }
}

function playPrevious() {
    if (tracks.length === 0) return;
    
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        playTrack(tracks.length - 1);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
}

// Progress Functions
function updateProgress() {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        durationEl.textContent = formatTime(audioPlayer.duration);
    }
}

function handleProgressClick(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioPlayer.duration) {
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

function handleMetadataLoaded() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function handleTrackEnd() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    const autoPlayNext = settings.autoPlayNext !== undefined ? settings.autoPlayNext : true;
    
    if (isRepeat) {
        playTrack(currentTrackIndex);
    } else if (autoPlayNext) {
        playNext();
    }
}

function handleAudioError(error) {
    console.error('Audio player error:', error);
    // Try next track
    playNext();
}

// Volume Functions
function handleVolumeChange(e) {
    const volume = e.target.value / 100;
    audioPlayer.volume = volume;
    if (window.youtubePlayer) {
        window.youtubePlayer.setVolume(volume * 100);
    }
    updateVolumeIcon(volume);
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.dataset.previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        if (window.youtubePlayer) {
            window.youtubePlayer.setVolume(0);
        }
    } else {
        const previousVolume = audioPlayer.dataset.previousVolume || 1;
        audioPlayer.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        if (window.youtubePlayer) {
            window.youtubePlayer.setVolume(previousVolume * 100);
        }
    }
    updateVolumeIcon(audioPlayer.volume);
}

function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Like Functions
function isLiked(track) {
    return likedSongs.some(t => t.id === track.id);
}

function toggleLike() {
    if (tracks.length === 0) return;
    
    const track = tracks[currentTrackIndex];
    if (isLiked(track)) {
        likedSongs = likedSongs.filter(t => t.id !== track.id);
    } else {
        likedSongs.push(track);
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    
    likeIcon.className = isLiked(track) ? 'fas fa-heart' : 'far fa-heart';
    likeBtn.classList.toggle('liked', isLiked(track));
    displayTracks();
}

function toggleLikeByIndex(index) {
    const track = tracks[index];
    if (isLiked(track)) {
        likedSongs = likedSongs.filter(t => t.id !== track.id);
    } else {
        likedSongs.push(track);
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    displayTracks();
}

// Queue Functions
function addToQueueByIndex(index) {
    const track = tracks[index];
    if (!queue.some(t => t.id === track.id)) {
        queue.push(track);
        localStorage.setItem('queue', JSON.stringify(queue));
        alert('Added to queue');
    } else {
        alert('Already in queue');
    }
}

// Utility Functions
function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            if (tracks.length > 0) togglePlayPause();
        } else if (e.code === 'ArrowRight' && e.shiftKey) {
            playNext();
        } else if (e.code === 'ArrowLeft' && e.shiftKey) {
            playPrevious();
        } else if (e.code === 'KeyS' && e.shiftKey) {
            toggleShuffle();
        } else if (e.code === 'KeyR' && e.shiftKey) {
            toggleRepeat();
        }
    });
}

// Settings Management
function saveCredentials(source, credentials) {
    const config = JSON.parse(localStorage.getItem('apiConfig') || '{}');
    config[source] = credentials;
    localStorage.setItem('apiConfig', JSON.stringify(config));
    Object.assign(API_CONFIG[source], credentials);
}

function loadCredentials() {
    const config = JSON.parse(localStorage.getItem('apiConfig') || '{}');
    Object.keys(config).forEach(source => {
        if (API_CONFIG[source]) {
            Object.assign(API_CONFIG[source], config[source]);
        }
    });
}

// Load saved credentials on startup
loadCredentials();