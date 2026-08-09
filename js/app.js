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
        
        if (results.length === 0) {
            showErrorState('no_results');
            return;
        }
        
        tracks = results;
        currentTrackIndex = 0;
        displayTracks();
    } catch (error) {
        console.error('Search error:', error);
        
        // Determine error type
        let errorType = 'api_error';
        if (error.message.includes('network') || error.message.includes('fetch')) {
            errorType = 'network_error';
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            errorType = 'rate_limit';
        } else if (error.message.includes('auth') || error.message.includes('401') || error.message.includes('403')) {
            errorType = 'auth_error';
        }
        
        showErrorState(errorType, error.message);
    }
}

async function searchAllSources(query) {
    const searchPromises = [];
    const sources = [];
    
    // Search sources that have API keys configured
    if (API_CONFIG.audius.apiKey) {
        searchPromises.push(searchAudius(query));
        sources.push('Audius');
    }
    if (API_CONFIG.youtube.apiKey) {
        searchPromises.push(searchYouTube(query));
        sources.push('YouTube');
    }
    if (API_CONFIG.jamendo.clientId) {
        searchPromises.push(searchJamendo(query));
        sources.push('Jamendo');
    }
    if (API_CONFIG.spotify.clientId && API_CONFIG.spotify.clientSecret) {
        searchPromises.push(searchSpotify(query));
        sources.push('Spotify');
    }

    // If no sources configured, return mock data for demo
    if (searchPromises.length === 0) {
        console.log('No API keys configured, using demo data');
        return getMockSearchResults(query);
    }

    try {
        const results = await Promise.allSettled(searchPromises);
        const allTracks = [];
        let successCount = 0;
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                allTracks.push(...result.value);
                successCount++;
                console.log(`${sources[index]}: Found ${result.value.length} tracks`);
            } else if (result.status === 'rejected') {
                console.error(`${sources[index]} search failed:`, result.reason.message);
            } else {
                console.log(`${sources[index]}: No results found`);
            }
        });

        // If no results from APIs, fall back to demo data
        if (allTracks.length === 0) {
            console.log('No results from APIs, using demo data');
            return getMockSearchResults(query);
        }

        console.log(`Total tracks found: ${allTracks.length} from ${successCount} sources`);
        return allTracks;
    } catch (error) {
        console.error('Search all sources error:', error);
        throw new Error('Failed to search music sources');
    }
}

// API Search Functions
async function searchAudius(query) {
    try {
        // Audius API requires specific format
        const response = await fetch(`https://audius.co/search?query=${encodeURIComponent(query)}&type=tracks`, {
            headers: {
                'Authorization': `Bearer ${API_CONFIG.audius.apiKey}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) throw new Error('Audius authentication failed');
            if (response.status === 429) throw new Error('Audius rate limit exceeded');
            if (response.status === 404) throw new Error('Audius service unavailable');
            throw new Error(`Audius API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || !Array.isArray(data.data)) {
            console.warn('Audius returned unexpected data format');
            return [];
        }
        
        return data.data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.user?.name || 'Unknown Artist',
            album: track.album || 'Unknown',
            duration: track.duration || 0,
            artwork: track.artwork?.['150x150'] || track.artwork?.['480x480'] || null,
            source: 'audius',
            audioUrl: track.stream_url || track.mp3 || null
        })).filter(track => track.audioUrl); // Only return tracks with playable URLs
    } catch (error) {
        console.error('Audius search error:', error);
        if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error('Network error connecting to Audius');
        }
        throw error;
    }
}

async function searchYouTube(query) {
    try {
        const response = await fetch(
            `${API_CONFIG.youtube.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_CONFIG.youtube.apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || !Array.isArray(data.items)) {
            console.warn('YouTube returned unexpected data format');
            return [];
        }
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
            artist: item.snippet.channelTitle,
            album: 'YouTube',
            duration: 0, // YouTube duration needs additional API call
            artwork: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
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
            `${API_CONFIG.jamendo.baseUrl}/tracks/search?name=${encodeURIComponent(query)}&client_id=${API_CONFIG.jamendo.clientId}&limit=10&format=jsonpretty&include=musicinfo`
        );
        
        if (!response.ok) {
            throw new Error(`Jamendo API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
            console.warn('Jamendo returned unexpected data format');
            return [];
        }
        
        return data.results.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name || 'Unknown Artist',
            album: track.album_name || 'Unknown',
            duration: track.duration || 0,
            artwork: track.image || `https://img.jamendo.com/?track=${track.id}&width=300&height=300`,
            source: 'jamendo',
            audioUrl: track.audio || `https://mp3l.jamendo.com/?track=${track.id}&format=mp31`
        })).filter(track => track.audioUrl); // Only return tracks with playable URLs
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
        
        if (!tokenResponse.ok) {
            throw new Error(`Spotify token error: ${tokenResponse.status}`);
        }
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            throw new Error('No access token received from Spotify');
        }
        
        const response = await fetch(
            `${API_CONFIG.spotify.baseUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Spotify search error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.tracks || !data.tracks.items || !Array.isArray(data.tracks.items)) {
            console.warn('Spotify returned unexpected data format');
            return [];
        }
        
        return data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album?.name || 'Unknown',
            duration: track.duration_ms / 1000,
            artwork: track.album?.images?.[0]?.url || null,
            source: 'spotify',
            previewUrl: track.preview_url
        })).filter(track => track.previewUrl); // Only return tracks with preview URLs
    } catch (error) {
        console.error('Spotify search error:', error);
        return [];
    }
}

// Mock Data for Demo - Using reliable free audio sources
function getMockSearchResults(query) {
    // Using free, reliable audio sources for demo
    const demoTracks = [
        {
            id: 'demo1',
            title: 'Electronic Vibes',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 184,
            artwork: 'https://picsum.photos/seed/music1/300/300',
            source: 'audius',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav'
        },
        {
            id: 'demo2', 
            title: 'Chill Beats',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 212,
            artwork: 'https://picsum.photos/seed/music2/300/300',
            source: 'jamendo',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
        },
        {
            id: 'demo3',
            title: 'Up Tempo',
            artist: 'Demo Artist', 
            album: 'Demo Collection',
            duration: 195,
            artwork: 'https://picsum.photos/seed/music3/300/300',
            source: 'audius',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav'
        },
        {
            id: 'demo4',
            title: 'Ambient Sounds',
            artist: 'Demo Artist',
            album: 'Demo Collection', 
            duration: 240,
            artwork: 'https://picsum.photos/seed/music4/300/300',
            source: 'jamendo',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav'
        },
        {
            id: 'demo5',
            title: 'Rock Energy',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 178,
            artwork: 'https://picsum.photos/seed/music5/300/300', 
            source: 'audius',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav'
        },
        {
            id: 'demo6',
            title: 'Jazz Cafe',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 267,
            artwork: 'https://picsum.photos/seed/music6/300/300',
            source: 'jamendo', 
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav'
        },
        {
            id: 'demo7',
            title: 'Pop Hit',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 198,
            artwork: 'https://picsum.photos/seed/music7/300/300',
            source: 'audius',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/antarctica10.wav'
        },
        {
            id: 'demo8',
            title: 'Classical Moment',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 312,
            artwork: 'https://picsum.photos/seed/music8/300/300',
            source: 'jamendo',
            audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/hawaii10.wav'
        }
    ];
    
    // If query is provided, filter tracks (otherwise return all)
    if (query && query.trim() !== '') {
        const lowerQuery = query.toLowerCase();
        const filtered = demoTracks.filter(track => 
            track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery) ||
            track.album.toLowerCase().includes(lowerQuery)
        );
        return filtered.length > 0 ? filtered : demoTracks.slice(0, 3); // Return some matches or first 3
    }
    
    return demoTracks;
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
        <div class="loading-state">
            <div class="loading-animation">
                <div class="loading-circle"></div>
                <div class="loading-circle"></div>
                <div class="loading-circle"></div>
            </div>
            <h3 class="loading-title">Searching Music Sources</h3>
            <p class="loading-text">Scanning Audius, YouTube, Jamendo, and Spotify...</p>
            <div class="loading-progress">
                <div class="loading-bar"></div>
            </div>
        </div>
    `;
}

function showErrorState(errorType, details = '') {
    let icon, title, message, suggestion;
    
    switch(errorType) {
        case 'no_results':
            icon = 'fa-search';
            title = 'No Results Found';
            message = 'We couldn\'t find any tracks matching your search.';
            suggestion = 'Try different keywords or check your spelling';
            break;
        case 'api_error':
            icon = 'fa-server';
            title = 'API Connection Error';
            message = 'Unable to connect to music services.';
            suggestion = 'Using demo tracks instead. Check your API keys in Settings.';
            break;
        case 'network_error':
            icon = 'fa-wifi';
            title = 'Network Error';
            message = 'Connection to music services failed.';
            suggestion = 'Check your internet connection and try again.';
            break;
        case 'rate_limit':
            icon = 'fa-clock';
            title = 'Rate Limit Exceeded';
            message = 'Too many requests to music services.';
            suggestion = 'Please wait a moment and try again.';
            break;
        case 'auth_error':
            icon = 'fa-key';
            title = 'Authentication Error';
            message = 'Invalid API credentials.';
            suggestion = 'Update your API keys in Settings.';
            break;
        default:
            icon = 'fa-exclamation-triangle';
            title = 'Search Failed';
            message = details || 'An unexpected error occurred.';
            suggestion = 'Please try again or contact support.';
    }
    
    trackList.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3 class="error-title">${title}</h3>
            <p class="error-message">${message}</p>
            <div class="error-suggestion">
                <i class="fas fa-lightbulb"></i>
                <span>${suggestion}</span>
            </div>
            ${details ? `<div class="error-details"><small>${details}</small></div>` : ''}
            <button class="error-retry-btn" id="errorRetryBtn">
                <i class="fas fa-redo"></i> Try Again
            </button>
    `;
    
    // Add event listener to retry button
    setTimeout(() => {
        const retryBtn = document.getElementById('errorRetryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', handleSearch);
        }
    }, 0);
        </div>
    `;
}

function loadRecommendations() {
    // Load demo recommendations (all tracks since no query)
    console.log('Loading demo recommendations...');
    tracks = getMockSearchResults('');
    currentTrackIndex = 0;
    displayTracks();
    console.log('Loaded', tracks.length, 'demo tracks');
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
    const audioUrl = track.audioUrl || track.previewUrl;
    
    if (!audioUrl) {
        console.error('No audio URL available for track:', track);
        alert('No playable audio available for this track.');
        return;
    }
    
    audioPlayer.src = audioUrl;
    audioPlayer.play().then(() => {
        isPlaying = true;
        playPauseIcon.className = 'fas fa-pause';
    }).catch(error => {
        console.error('Play error:', error);
        isPlaying = false;
        playPauseIcon.className = 'fas fa-play';
        alert('Error playing audio. The source may be unavailable.');
    });
}

function playYouTubeTrack(track) {
    if (!track.videoId) {
        console.error('No video ID available for YouTube track:', track);
        alert('No playable video available for this track.');
        return;
    }
    
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
                'disablekb': 1,
                'origin': window.location.origin
            },
            events: {
                'onStateChange': onYouTubePlayerStateChange,
                'onError': onYouTubePlayerError
            }
        });
    }
    isPlaying = true;
    playPauseIcon.className = 'fas fa-pause';
}

function onYouTubePlayerError(event) {
    console.error('YouTube player error:', event.data);
    let errorMessage = 'Error playing YouTube video.';
    
    switch (event.data) {
        case 2:
            errorMessage = 'Invalid YouTube video ID.';
            break;
        case 5:
            errorMessage = 'HTML5 player error.';
            break;
        case 100:
            errorMessage = 'Video not found.';
            break;
        case 101:
        case 150:
            errorMessage = 'Video not embeddable.';
            break;
    }
    
    alert(errorMessage);
    isPlaying = false;
    playPauseIcon.className = 'fas fa-play';
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