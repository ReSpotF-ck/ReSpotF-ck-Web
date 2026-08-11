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

// DOM Elements (will be initialized after DOM is loaded)
let audioPlayer, playPauseBtn, playPauseIcon, prevBtn, nextBtn, shuffleBtn, repeatBtn;
let progressBar, progressFill, currentTimeEl, durationEl;
let volumeSlider, volumeBtn, volumeIcon;
let trackTitle, trackArtist, trackArt, likeBtn, likeIcon;
let searchInput, searchBtn, trackList, sourceTabs;

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
    if (settings.defaultVolume && volumeSlider && audioPlayer) {
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
    if (settings.defaultVolume && volumeSlider && audioPlayer) {
        volumeSlider.value = settings.defaultVolume;
        audioPlayer.volume = settings.defaultVolume / 100;
    }
};

// Initialize DOM Elements
function initializeDOMElements() {
    audioPlayer = document.getElementById('audioPlayer');
    playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseIcon = playPauseBtn.querySelector('i');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    shuffleBtn = document.getElementById('shuffleBtn');
    repeatBtn = document.getElementById('repeatBtn');
    progressBar = document.getElementById('progressBar');
    progressFill = document.getElementById('progressFill');
    currentTimeEl = document.getElementById('currentTime');
    durationEl = document.getElementById('duration');
    volumeSlider = document.getElementById('volumeSlider');
    volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) volumeIcon = volumeBtn.querySelector('i');
    trackTitle = document.getElementById('trackTitle');
    trackArtist = document.getElementById('trackArtist');
    trackArt = document.getElementById('trackArt');
    likeBtn = document.getElementById('likeBtn');
    if (likeBtn) likeIcon = likeBtn.querySelector('i');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    trackList = document.getElementById('trackList');
    sourceTabs = document.querySelectorAll('.source-tab');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    loadSettingsToAPIConfig();
    setupSecurityMeasures();
    // Don't show security modal here - N3K0.html handles it
    // Don't load recommendations yet - wait for app to be shown after PIN entry
    setupEventListeners();
    setupKeyboardShortcuts();
});

// Show Security Modal - handled by N3K0.html
function showSecurityModal() {
    // Security modal is now handled directly in N3K0.html
    // This function is kept for compatibility but does nothing
    console.log('Security modal handling delegated to N3K0.html');
}

// Basic security measures (minimal, non-intrusive)
function setupSecurityMeasures() {
    // Prevent drag and drop on entire document (for UX consistency)
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.effectAllowed = 'none';
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.dataTransfer.effectAllowed = 'none';
    });
    
    // Prevent audio element controls for custom player consistency
    if (audioPlayer) {
        audioPlayer.removeAttribute('controls');
        audioPlayer.removeAttribute('download');
    }
}

// Event Listeners
function setupEventListeners() {
    // Search
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        // Basic input paste handling (no restriction)
        searchInput.addEventListener('paste', (e) => {
            // Allow normal paste behavior
        });
        
        // Prevent drag and drop on search input (for UX consistency)
        searchInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.effectAllowed = 'none';
        });
        
        searchInput.addEventListener('drop', (e) => {
            e.preventDefault();
            e.dataTransfer.effectAllowed = 'none';
        });
    }

    // Source tabs
    if (sourceTabs && sourceTabs.length > 0) {
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
    }

    // Player controls
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (prevBtn) prevBtn.addEventListener('click', playPrevious);
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);

    // Progress bar
    if (progressBar) progressBar.addEventListener('click', handleProgressClick);

    // Volume
    if (volumeSlider) volumeSlider.addEventListener('input', handleVolumeChange);
    if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);

    // Audio events
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', handleTrackEnd);
        audioPlayer.addEventListener('loadedmetadata', handleMetadataLoaded);
        audioPlayer.addEventListener('error', handleAudioError);
    }

    // Sidebar navigation
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) homeBtn.addEventListener('click', () => {
        setActiveSidebar('homeBtn');
        currentSource = 'all';
        updateSourceTabs('all');
        loadRecommendations();
    });

    const likedSongsBtn = document.getElementById('likedSongsBtn');
    if (likedSongsBtn) likedSongsBtn.addEventListener('click', () => {
        setActiveSidebar('likedSongsBtn');
        currentSource = 'all';
        updateSourceTabs('all');
        if (likedSongs.length > 0) {
            tracks = likedSongs;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });

    const recentlyPlayedBtn = document.getElementById('recentlyPlayedBtn');
    if (recentlyPlayedBtn) recentlyPlayedBtn.addEventListener('click', () => {
        setActiveSidebar('recentlyPlayedBtn');
        currentSource = 'all';
        updateSourceTabs('all');
        if (recentlyPlayed.length > 0) {
            tracks = recentlyPlayed;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });

    const queueBtn = document.getElementById('queueBtn');
    if (queueBtn) queueBtn.addEventListener('click', () => {
        setActiveSidebar('queueBtn');
        currentSource = 'all';
        updateSourceTabs('all');
        if (queue.length > 0) {
            tracks = queue;
            currentTrackIndex = 0;
            displayTracks();
        } else {
            showEmptyState();
        }
    });
    
    // Music source buttons
    const audiusBtn = document.getElementById('audiusBtn');
    if (audiusBtn) audiusBtn.addEventListener('click', () => {
        setActiveSidebar('audiusBtn');
        currentSource = 'audius';
        updateSourceTabs('audius');
        if (tracks.length > 0) {
            displayTracks();
        } else {
            loadRecommendations();
        }
    });
    
    const youtubeBtn = document.getElementById('youtubeBtn');
    if (youtubeBtn) youtubeBtn.addEventListener('click', () => {
        setActiveSidebar('youtubeBtn');
        currentSource = 'youtube';
        updateSourceTabs('youtube');
        if (tracks.length > 0) {
            displayTracks();
        } else {
            loadRecommendations();
        }
    });
    
    const jamendoBtn = document.getElementById('jamendoBtn');
    if (jamendoBtn) jamendoBtn.addEventListener('click', () => {
        setActiveSidebar('jamendoBtn');
        currentSource = 'jamendo';
        updateSourceTabs('jamendo');
        if (tracks.length > 0) {
            displayTracks();
        } else {
            loadRecommendations();
        }
    });
    
    const spotifyBtn = document.getElementById('spotifyBtn');
    if (spotifyBtn) spotifyBtn.addEventListener('click', () => {
        setActiveSidebar('spotifyBtn');
        currentSource = 'spotify';
        updateSourceTabs('spotify');
        if (tracks.length > 0) {
            displayTracks();
        } else {
            loadRecommendations();
        }
    });
    
    // Discover buttons
    const trendingBtn = document.getElementById('trendingBtn');
    const newReleasesBtn = document.getElementById('newReleasesBtn');
    const genresBtn = document.getElementById('genresBtn');
    
    if (trendingBtn) {
        trendingBtn.addEventListener('click', () => {
            setActiveSidebar('trendingBtn');
            currentSource = 'all';
            updateSourceTabs('all');
            loadTrendingTracks();
        });
    }
    
    if (newReleasesBtn) {
        newReleasesBtn.addEventListener('click', () => {
            setActiveSidebar('newReleasesBtn');
            currentSource = 'all';
            updateSourceTabs('all');
            loadNewReleases();
        });
    }
    
    if (genresBtn) {
        genresBtn.addEventListener('click', () => {
            setActiveSidebar('genresBtn');
            currentSource = 'all';
            updateSourceTabs('all');
            loadGenres();
        });
    }
}

function setActiveSidebar(activeId) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeElement = document.getElementById(activeId);
    if (activeElement) activeElement.classList.add('active');
}

// Update Source Tabs
function updateSourceTabs(source) {
    if (sourceTabs && sourceTabs.length > 0) {
        sourceTabs.forEach(tab => {
            if (tab.dataset.source === source) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
}

// Search Functionality
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Simplified security: Only block obvious URLs
    if (query.startsWith('http://') || query.startsWith('https://') || query.startsWith('ftp://')) {
        showErrorState('security', 'Direct URLs are not allowed. Please search for music by title, artist, or album name.');
        return;
    }

    showLoadingState();
    
    try {
        const results = await searchAllSources(query);
        
        if (results.length === 0) {
            showErrorState('no_results');
            return;
        }
        
        // Check if we only got demo tracks due to API failures
        if (window.lastSearchErrors && Object.keys(window.lastSearchErrors).length > 0) {
            const apiSources = Object.keys(window.lastSearchErrors);
            console.log('API sources failed:', apiSources);
            
            // Show warning if all APIs failed
            if (apiSources.length >= 2 || (apiSources.includes('Audius') && apiSources.includes('Jamendo'))) {
                // Most APIs failed, show warning but still display demo tracks
                const warningDiv = document.createElement('div');
                warningDiv.className = 'api-warning';
                warningDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Music services unavailable. Using demo tracks. Check your API keys in Settings.</span>
                    <button class="warning-close" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                trackList.prepend(warningDiv);
            }
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
    const sourceErrors = {};
    
    // Always try Audius (no API key needed for public search)
    searchPromises.push(searchAudius(query));
    sources.push('Audius');
    
    // Always try Jamendo with default client ID (works without API key)
    searchPromises.push(searchJamendo(query));
    sources.push('Jamendo');
    
    // Search sources that have API keys configured
    if (API_CONFIG.youtube.apiKey) {
        searchPromises.push(searchYouTube(query));
        sources.push('YouTube');
    }
    if (API_CONFIG.spotify.clientId && API_CONFIG.spotify.clientSecret) {
        searchPromises.push(searchSpotify(query));
        sources.push('Spotify');
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
                sourceErrors[sources[index]] = result.reason.message;
            } else {
                console.log(`${sources[index]}: No results found`);
                sourceErrors[sources[index]] = 'No results found';
            }
        });

        // If we got API results, prioritize them and add demo as backup
        if (allTracks.length > 0) {
            console.log(`Using ${allTracks.length} tracks from ${successCount} API sources`);
            
            // Log any source errors for debugging
            if (Object.keys(sourceErrors).length > 0) {
                console.log('Source errors:', sourceErrors);
            }
            
            // Add a few demo tracks for variety if API results are limited
            if (allTracks.length < 10) {
                const demoTracks = getMockSearchResults(query).slice(0, 5);
                allTracks.push(...demoTracks);
                console.log(`Added ${demoTracks.length} demo tracks for variety`);
            }
            return allTracks;
        }

        // If no results from APIs, fall back to demo data with error information
        console.log('No results from APIs, using demo data');
        console.log('Source errors:', sourceErrors);
        
        // Store source errors for display
        window.lastSearchErrors = sourceErrors;
        
        return getMockSearchResults(query);
    } catch (error) {
        console.error('Search all sources error:', error);
        // Always return demo tracks as fallback
        console.log('Error occurred, using demo data as fallback');
        window.lastSearchErrors = { 'General': error.message };
        return getMockSearchResults(query);
    }
}

// API Search Functions
async function searchAudius(query) {
    try {
        // Use Audius Discovery API with fallback host
        const hosts = ['https://discovery-auditius.co', 'https://discoveryprovider.audius.co', 'https://api.audius.co'];
        let data = null;
        
        for (const host of hosts) {
            try {
                const response = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=Spotfuck&limit=15`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Failed with ${host}:`, e);
                continue;
            }
        }
        
        if (!data || !data.data || !Array.isArray(data.data)) {
            console.warn('Audius returned no data');
            return [];
        }
        
        return data.data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.user?.name || 'Unknown Artist',
            album: track.album?.name || 'Unknown',
            duration: track.duration || 0,
            artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || track.artwork?.['1000x1000'] || null,
            source: 'audius',
            audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=Spotfuck`
        }));
    } catch (error) {
        console.error('Audius search error:', error);
        return [];
    }
}

async function searchYouTube(query) {
    try {
        // If no API key, return empty and let demo tracks handle it
        if (!API_CONFIG.youtube.apiKey) {
            console.log('YouTube API key not configured, skipping YouTube search');
            return [];
        }
        
        // Search for music-related videos
        const response = await fetch(
            `${API_CONFIG.youtube.baseUrl}/search?part=snippet&q=${encodeURIComponent(query + ' music')}+music&type=video&maxResults=15&key=${API_CONFIG.youtube.apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || !Array.isArray(data.items)) {
            console.warn('YouTube returned unexpected data format');
            return [];
        }
        
        // Get video IDs for duration information
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const durationResponse = await fetch(
            `${API_CONFIG.youtube.baseUrl}/videos?part=contentDetails&id=${videoIds}&key=${API_CONFIG.youtube.apiKey}`
        );
        
        const durationData = await durationResponse.json();
        const durationMap = {};
        
        if (durationData.items && Array.isArray(durationData.items)) {
            durationData.items.forEach(item => {
                const duration = item.contentDetails.duration;
                durationMap[item.id] = parseYouTubeDuration(duration);
            });
        }
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
            artist: item.snippet.channelTitle,
            album: 'YouTube',
            duration: durationMap[item.id.videoId] || 0,
            artwork: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            source: 'youtube',
            videoId: item.id.videoId
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
}

// Parse YouTube duration format (PT4M30S -> 270 seconds)
function parseYouTubeDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
}

async function searchJamendo(query) {
    try {
        // If no API key, try using Jamendo's public API with a default client ID
        const clientId = API_CONFIG.jamendo.clientId || '339c6fbc';
        
        // Try multiple endpoint variations for better compatibility
        const endpoints = [
            `${API_CONFIG.jamendo.baseUrl}/tracks/?client_id=${clientId}&format=jsonpretty&limit=10&search=${encodeURIComponent(query)}&include=musicinfo`,
            `${API_CONFIG.jamendo.baseUrl}/tracks/search?client_id=${clientId}&format=jsonpretty&limit=10&name=${encodeURIComponent(query)}&include=musicinfo`,
            `${API_CONFIG.jamendo.baseUrl}/tracks/?client_id=${clientId}&format=jsonpretty&limit=10&namesearch=${encodeURIComponent(query)}&include=musicinfo`
        ];
        
        let data = null;
        let lastError = null;
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                
                if (response.ok) {
                    data = await response.json();
                    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                        console.log('Jamendo search successful with endpoint:', endpoint);
                        break;
                    }
                } else {
                    lastError = `HTTP ${response.status}: ${response.statusText}`;
                }
            } catch (e) {
                lastError = e.message;
                console.warn('Jamendo endpoint failed:', endpoint, e);
                continue;
            }
        }
        
        if (!data || !data.results || !Array.isArray(data.results)) {
            console.warn('Jamendo returned no data or unexpected format:', data);
            throw new Error(`Jamendo search failed: ${lastError || 'No results found'}`);
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
        throw error; // Re-throw to allow error handling
    }
}

async function searchSpotify(query) {
    try {
        // If no API credentials, return empty and let demo tracks handle it
        if (!API_CONFIG.spotify.clientId || !API_CONFIG.spotify.clientSecret) {
            console.log('Spotify API credentials not configured, skipping Spotify search');
            return [];
        }
        
        // First get access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${encodeURIComponent(API_CONFIG.spotify.clientId)}&client_secret=${encodeURIComponent(API_CONFIG.spotify.clientSecret)}`
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            throw new Error(`Spotify token error: ${tokenResponse.status} - ${errorData.error_description || tokenResponse.statusText}`);
        }
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            throw new Error('No access token received from Spotify');
        }
        
        const response = await fetch(
            `${API_CONFIG.spotify.baseUrl}/search?q=${encodeURIComponent(query)}&type=track&limit=15&market=US`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Spotify search error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.tracks || !data.tracks.items || !Array.isArray(data.tracks.items)) {
            console.warn('Spotify returned unexpected data format:', data);
            return [];
        }
        
        return data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album?.name || 'Unknown',
            duration: track.duration_ms / 1000,
            artwork: track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || null,
            source: 'spotify',
            previewUrl: track.preview_url
        })).filter(track => track.previewUrl); // Only return tracks with preview URLs
    } catch (error) {
        console.error('Spotify search error:', error);
        throw error; // Re-throw to allow error handling
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
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
            id: 'demo2', 
            title: 'Chill Beats',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 212,
            artwork: 'https://picsum.photos/seed/music2/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        },
        {
            id: 'demo3',
            title: 'Up Tempo',
            artist: 'Demo Artist', 
            album: 'Demo Collection',
            duration: 195,
            artwork: 'https://picsum.photos/seed/music3/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        },
        {
            id: 'demo4',
            title: 'Ambient Sounds',
            artist: 'Demo Artist',
            album: 'Demo Collection', 
            duration: 240,
            artwork: 'https://picsum.photos/seed/music4/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
        },
        {
            id: 'demo5',
            title: 'Rock Energy',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 178,
            artwork: 'https://picsum.photos/seed/music5/300/300', 
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
        },
        {
            id: 'demo6',
            title: 'Jazz Cafe',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 267,
            artwork: 'https://picsum.photos/seed/music6/300/300',
            source: 'jamendo', 
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
        },
        {
            id: 'demo7',
            title: 'Pop Hit',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 198,
            artwork: 'https://picsum.photos/seed/music7/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
        },
        {
            id: 'demo8',
            title: 'Classical Moment',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 312,
            artwork: 'https://picsum.photos/seed/music8/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
        },
        {
            id: 'demo9',
            title: 'YouTube Demo',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 210,
            artwork: 'https://picsum.photos/seed/music9/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
        },
        {
            id: 'demo10',
            title: 'Indie Folk',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 225,
            artwork: 'https://picsum.photos/seed/music10/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
        },
        {
            id: 'demo11',
            title: 'Lo-Fi Hip Hop',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 189,
            artwork: 'https://picsum.photos/seed/music11/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
        },
        {
            id: 'demo12',
            title: 'Synthwave',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 203,
            artwork: 'https://picsum.photos/seed/music12/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'
        },
        {
            id: 'demo13',
            title: 'Deep House',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 256,
            artwork: 'https://picsum.photos/seed/music13/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
        },
        {
            id: 'demo14',
            title: 'Dance Pop',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 187,
            artwork: 'https://picsum.photos/seed/music14/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3'
        },
        {
            id: 'demo15',
            title: 'R&B Soul',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 278,
            artwork: 'https://picsum.photos/seed/music15/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3'
        },
        {
            id: 'demo16',
            title: 'Reggae Vibes',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 234,
            artwork: 'https://picsum.photos/seed/music16/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
        },
        {
            id: 'demo17',
            title: 'Country Roads',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 201,
            artwork: 'https://picsum.photos/seed/music17/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'
        },
        {
            id: 'demo18',
            title: 'Metal Core',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 186,
            artwork: 'https://picsum.photos/seed/music18/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3'
        },
        {
            id: 'demo19',
            title: 'World Music',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 267,
            artwork: 'https://picsum.photos/seed/music19/300/300',
            source: 'jamendo',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3'
        },
        {
            id: 'demo20',
            title: 'Latin Beats',
            artist: 'Demo Artist',
            album: 'Demo Collection',
            duration: 223,
            artwork: 'https://picsum.photos/seed/music20/300/300',
            source: 'audius',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3'
        }
    ];
    
    // If query is provided, filter tracks (otherwise return all)
    if (query && query.trim() !== '') {
        const lowerQuery = query.toLowerCase();
        const filtered = demoTracks.filter(track => 
            track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery) ||
            track.album.toLowerCase().includes(lowerQuery) ||
            track.source.toLowerCase().includes(lowerQuery)
        );
        return filtered.length > 0 ? filtered : demoTracks.slice(0, 3); // Return some matches or first 3
    }
    
    return demoTracks;
}

// Display Functions
function displayTracks() {
    if (!trackList) return;
    
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
    if (!trackList) return;
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
    let errorDetails = details;
    
    // Check for source-specific errors
    if (window.lastSearchErrors && Object.keys(window.lastSearchErrors).length > 0) {
        const errorSources = Object.keys(window.lastSearchErrors);
        errorDetails = `Source errors: ${errorSources.join(', ')}`;
        
        // Build detailed error message
        const errorMessages = Object.entries(window.lastSearchErrors)
            .map(([source, error]) => `${source}: ${error}`)
            .join('\n');
        
        errorDetails = errorMessages;
    }
    
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
        case 'security':
            icon = 'fa-shield-alt';
            title = 'Security Restriction';
            message = 'Direct URLs and file paths are not allowed.';
            suggestion = 'Please search for music by title, artist, or album name only.';
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
            ${errorDetails ? `<div class="error-details"><small>${errorDetails}</small></div>` : ''}
            <button class="error-retry-btn" id="errorRetryBtn">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
    
    // Add event listener to retry button
    setTimeout(() => {
        const retryBtn = document.getElementById('errorRetryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', handleSearch);
        }
    }, 0);
}

function loadRecommendations() {
    // Load demo recommendations (all tracks since no query)
    console.log('Loading demo recommendations...');
    const demoTracks = getMockSearchResults('');
    console.log('Demo tracks loaded:', demoTracks.length);
    
    if (demoTracks.length === 0) {
        console.error('No demo tracks available!');
        showErrorState('api_error', 'No tracks available to load.');
        return;
    }
    
    tracks = demoTracks;
    currentTrackIndex = 0;
    displayTracks();
    console.log('Displayed', tracks.length, 'demo tracks');
}

// Make loadRecommendations available globally
window.loadRecommendations = loadRecommendations;

async function loadTrendingTracks() {
    showLoadingState();
    
    try {
        // Try to get trending from Audius (no API key needed)
        const trendingQuery = 'trending popular hits';
        const results = await searchAudius(trendingQuery);
        
        if (results.length > 0) {
            tracks = results;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        // Fallback to demo tracks
        console.log('No trending results, using demo tracks');
        tracks = getMockSearchResults('').slice(0, 10);
        currentTrackIndex = 0;
        displayTracks();
    } catch (error) {
        console.error('Error loading trending:', error);
        loadRecommendations();
    }
}

async function loadNewReleases() {
    showLoadingState();
    
    try {
        // Try to get new releases from Audius (no API key needed)
        const newReleasesQuery = 'new releases latest songs';
        const results = await searchAudius(newReleasesQuery);
        
        if (results.length > 0) {
            tracks = results;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        // Fallback to demo tracks
        console.log('No new releases, using demo tracks');
        tracks = getMockSearchResults('').slice(0, 10);
        currentTrackIndex = 0;
        displayTracks();
    } catch (error) {
        console.error('Error loading new releases:', error);
        loadRecommendations();
    }
}

function loadGenres() {
    // Show genre selection UI
    const genres = [
        { name: 'Electronic', icon: 'fa-bolt', query: 'electronic music' },
        { name: 'Rock', icon: 'fa-guitar', query: 'rock music' },
        { name: 'Pop', icon: 'fa-music', query: 'pop music' },
        { name: 'Hip-Hop', icon: 'fa-microphone', query: 'hip hop music' },
        { name: 'Jazz', icon: 'fa-saxophone', query: 'jazz music' },
        { name: 'Classical', icon: 'fa-violin', query: 'classical music' },
        { name: 'Ambient', icon: 'fa-cloud', query: 'ambient music' },
        { name: 'Indie', icon: 'fa-star', query: 'indie music' }
    ];
    
    trackList.innerHTML = `
        <div class="genres-grid">
            ${genres.map(genre => `
                <div class="genre-card" onclick="searchByGenre('${genre.query}')">
                    <div class="genre-icon">
                        <i class="fas ${genre.icon}"></i>
                    </div>
                    <div class="genre-name">${genre.name}</div>
                </div>
            `).join('')}
        </div>
    `;
}

async function searchByGenre(query) {
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
        console.error('Genre search error:', error);
        showErrorState('api_error');
    }
}

// Make searchByGenre available globally for the onclick handler
window.searchByGenre = searchByGenre;

// Player Functions
function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    
    if (!track) return;

    // Update UI
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    
    if (trackArt) {
        if (track.artwork) {
            trackArt.innerHTML = `<img src="${track.artwork}" alt="${track.title}">`;
        } else {
            trackArt.innerHTML = '<i class="fas fa-music"></i>';
        }
    }

    // Update like button
    if (likeIcon) likeIcon.className = isLiked(track) ? 'fas fa-heart' : 'far fa-heart';
    if (likeBtn) likeBtn.classList.toggle('liked', isLiked(track));

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
    
    console.log('Playing audio from:', audioUrl);
    
    if (!audioPlayer) {
        console.error('Audio player not initialized');
        alert('Audio player not available. Please refresh the page.');
        return;
    }
    
    audioPlayer.src = audioUrl;
    audioPlayer.play().then(() => {
        isPlaying = true;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
        console.log('Successfully playing:', track.title);
    }).catch(error => {
        console.error('Play error:', error);
        isPlaying = false;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
        alert('Error playing audio. The source may be unavailable or blocked by CORS policy.');
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
    if (tracks.length === 0 || !audioPlayer) return;
    
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
                if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
            }).catch(error => {
                console.error('Play error:', error);
                isPlaying = false;
                if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
            });
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
    }
    if (playPauseIcon) playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
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
    if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    if (repeatBtn) repeatBtn.classList.toggle('active', isRepeat);
}

// Progress Functions
function updateProgress() {
    if (audioPlayer && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (progressFill) progressFill.style.width = percent + '%';
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        if (durationEl) durationEl.textContent = formatTime(audioPlayer.duration);
    }
}

function handleProgressClick(e) {
    if (!progressBar || !audioPlayer) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioPlayer.duration) {
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

function handleMetadataLoaded() {
    if (durationEl && audioPlayer) durationEl.textContent = formatTime(audioPlayer.duration);
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
    // Show error to user and try next track
    const currentTrack = tracks[currentTrackIndex];
    console.error('Failed to play:', currentTrack);
    
    // Try next track
    if (currentTrackIndex < tracks.length - 1) {
        playNext();
    } else {
        // Show error state if no more tracks
        isPlaying = false;
        playPauseIcon.className = 'fas fa-play';
    }
}

// Volume Functions
function handleVolumeChange(e) {
    if (!audioPlayer) return;
    const volume = e.target.value / 100;
    audioPlayer.volume = volume;
    if (window.youtubePlayer) {
        window.youtubePlayer.setVolume(volume * 100);
    }
    updateVolumeIcon(volume);
}

function toggleMute() {
    if (!audioPlayer || !volumeSlider) return;
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
    if (!volumeIcon) return;
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
    if (tracks.length === 0 || !likeBtn || !likeIcon) return;
    
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

// Make functions available globally for onclick handlers
window.toggleLikeByIndex = toggleLikeByIndex;
window.addToQueueByIndex = addToQueueByIndex;

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
// This is now handled in loadSettingsToAPIConfig()