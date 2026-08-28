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
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
let audioContext = null;
let equalizer = null;
let debugLogs = [];
let apiStats = {
    audius: { requests: 0, errors: 0 },
    youtube: { requests: 0, errors: 0 },
    jamendo: { requests: 0, errors: 0 },
    spotify: { requests: 0, errors: 0 }
};

// Download Management
let downloadQueue = [];
let downloadSettings = {
    format: 'mp3',
    quality: 'medium',
    overwriteBehavior: 'ask',
    downloadMetadata: true,
    downloadCoverArt: true,
    autoOrganize: false
};

// Progress update interval for YouTube
let progressUpdateInterval = null;

function startProgressUpdate() {
    // Clear existing interval
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
    }
    
    // Start new interval for YouTube progress
    progressUpdateInterval = setInterval(() => {
        const currentTrack = tracks[currentTrackIndex];
        if (currentTrack && currentTrack.source === 'youtube' && window.youtubePlayer && isPlaying) {
            updateProgress();
        }
    }, 1000);
}

function stopProgressUpdate() {
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
        progressUpdateInterval = null;
    }
}

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
    
    // Load download settings
    loadDownloadSettings();
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
        audioPlayer.addEventListener('canplay', () => {
            addDebugLog('Player', 'Audio ready to play', 'info');
        });
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
    
    const playlistsBtn = document.getElementById('playlistsBtn');
    if (playlistsBtn) playlistsBtn.addEventListener('click', () => {
        setActiveSidebar('playlistsBtn');
        currentSource = 'all';
        updateSourceTabs('all');
        displayPlaylists();
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
    if (!query) {
        showErrorState('no_results', 'Please enter a search term');
        return;
    }

    // Validate search input
    if (query.length < 2) {
        showErrorState('no_results', 'Search term must be at least 2 characters');
        return;
    }

    // Simplified security: Only block obvious URLs
    if (query.startsWith('http://') || query.startsWith('https://') || query.startsWith('ftp://')) {
        showErrorState('security', 'Direct URLs are not allowed. Please search for music by title, artist, or album name.');
        return;
    }

    showLoadingState();
    addDebugLog('Search', `Searching for: "${query}"`, 'info');
    
    try {
        const results = await searchAllSources(query);
        
        if (results.length === 0) {
            showErrorState('no_results');
            return;
        }
        
        tracks = results;
        currentTrackIndex = 0;
        displayTracks();
        addDebugLog('Search', `Found ${results.length} tracks`, 'success');
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
        } else if (error.message.includes('No results found')) {
            errorType = 'no_results';
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
                addDebugLog(sources[index], `Found ${result.value.length} tracks`, 'success');
            } else if (result.status === 'rejected') {
                console.error(`${sources[index]} search failed:`, result.reason.message);
                sourceErrors[sources[index]] = result.reason.message;
                addDebugLog(sources[index], `Search failed: ${result.reason.message}`, 'error');
            } else {
                console.log(`${sources[index]}: No results found`);
                sourceErrors[sources[index]] = 'No results found';
                addDebugLog(sources[index], 'No results found', 'info');
            }
        });

        // If we got API results, return them
        if (allTracks.length > 0) {
            console.log(`Using ${allTracks.length} tracks from ${successCount} API sources`);
            addDebugLog('Search', `Total results: ${allTracks.length} from ${successCount} sources`, 'success');
            
            // Log any source errors for debugging
            if (Object.keys(sourceErrors).length > 0) {
                console.log('Source errors:', sourceErrors);
            }
            
            return allTracks;
        }

        // If no results from APIs, throw error with information
        console.log('No results from APIs');
        console.log('Source errors:', sourceErrors);
        addDebugLog('Search', 'No results from any API source', 'error');
        
        // Store source errors for display
        window.lastSearchErrors = sourceErrors;
        
        throw new Error('No results found from any music source. Please check your API keys in Settings or try a different search term.');
    } catch (error) {
        console.error('Search all sources error:', error);
        addDebugLog('Search', `Search error: ${error.message}`, 'error');
        // Store error for display
        window.lastSearchErrors = sourceErrors;
        throw error; // Re-throw to show error instead of silent fallback
    }
}

// API Search Functions
async function searchAudius(query) {
    addDebugLog('Audius', `Searching for: "${query}"`, 'info');
    
    try {
        // Use working Audius Discovery API endpoints
        const hosts = [
            'https://discoveryprovider.audius.co',
            'https://discovery-auditius.co',
            'https://api.audius.co'
        ];
        let data = null;
        let lastError = null;
        
        for (const host of hosts) {
            try {
                addDebugLog('Audius', `Trying host: ${host}`, 'info');
                const response = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=Spotfuck&limit=15`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                        addDebugLog('Audius', `Success with ${host}: found ${data.data.length} tracks`, 'success');
                        break;
                    }
                } else {
                    lastError = `HTTP ${response.status}: ${response.statusText}`;
                    addDebugLog('Audius', `${host} returned ${response.status}`, 'error');
                }
            } catch (e) {
                lastError = e.message;
                addDebugLog('Audius', `Failed with ${host}: ${e.message}`, 'error');
                continue;
            }
        }
        
        if (!data || !data.data || !Array.isArray(data.data)) {
            addDebugLog('Audius', 'No data returned', 'error');
            throw new Error(`Audius search failed: ${lastError || 'No data returned'}`);
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
        addDebugLog('Audius', `Search error: ${error.message}`, 'error');
        throw error; // Re-throw to allow proper error handling instead of silent fallback
    }
}

async function searchYouTube(query) {
    try {
        // If no API key, throw error instead of returning empty
        if (!API_CONFIG.youtube.apiKey) {
            throw new Error('YouTube API key not configured. Please add your YouTube Data API key in Settings.');
        }
        
        // Search for music-related videos
        const response = await fetch(
            `${API_CONFIG.youtube.baseUrl}/search?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&maxResults=15&key=${API_CONFIG.youtube.apiKey}`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
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
        throw error; // Re-throw to allow proper error handling
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
    addDebugLog('Jamendo', `Searching for: "${query}"`, 'info');
    
    try {
        // Use Jamendo's public API with a working client ID
        const clientId = API_CONFIG.jamendo.clientId || 'c2f8e5c0';
        
        // Use the correct Jamendo API endpoint
        const endpoint = `${API_CONFIG.jamendo.baseUrl}/tracks/?client_id=${clientId}&format=jsonpretty&limit=15&search=${encodeURIComponent(query)}&include=musicinfo+stats+artist`;
        
        addDebugLog('Jamendo', `Requesting: ${endpoint}`, 'info');
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            addDebugLog('Jamendo', `API error: ${response.status} - ${response.statusText}`, 'error');
            throw new Error(`Jamendo API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
            addDebugLog('Jamendo', 'Invalid data format returned', 'error');
            throw new Error('Jamendo returned invalid data format');
        }
        
        if (data.results.length === 0) {
            addDebugLog('Jamendo', 'No results found', 'info');
            return [];
        }
        
        addDebugLog('Jamendo', `Found ${data.results.length} tracks`, 'success');
        
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
        addDebugLog('Jamendo', `Search error: ${error.message}`, 'error');
        throw error; // Re-throw to allow proper error handling
    }
}

async function searchSpotify(query) {
    try {
        // If no API credentials, throw error instead of returning empty
        if (!API_CONFIG.spotify.clientId || !API_CONFIG.spotify.clientSecret) {
            throw new Error('Spotify API credentials not configured. Please add your Spotify Client ID and Secret in Settings.');
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
        throw error; // Re-throw to allow proper error handling
    }
}

// Mock Data for Demo - DISABLED to ensure only real content plays
function getMockSearchResults(query) {
    // This function is disabled to prevent demo content fallback
    // The app now only uses real API results from Audius, Jamendo, YouTube, and Spotify
    throw new Error('Demo content has been disabled. Please configure API keys in Settings to access real music content.');
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

    trackList.innerHTML = filteredTracks.map((track, filteredIndex) => {
        // Find the original index in the full tracks array
        const originalIndex = tracks.findIndex(t => t.id === track.id);
        
        // Validate track has required fields
        if (!track.title || !track.audioUrl && !track.videoId) {
            console.warn('Invalid track data:', track);
            return '';
        }
        
        return `
        <div class="track-item ${originalIndex === currentTrackIndex ? 'playing' : ''}" data-index="${originalIndex}" data-filtered-index="${filteredIndex}">
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
                <button class="track-action-btn ${isLiked(track) ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeByIndex(${originalIndex})">
                    <i class="${isLiked(track) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="track-action-btn" onclick="event.stopPropagation(); showPlaylistMenu(${originalIndex})">
                    <i class="fas fa-folder-plus"></i>
                </button>
                <button class="track-action-btn" onclick="event.stopPropagation(); addToQueueByIndex(${originalIndex})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    }).join('');

    // Add click listeners to track items
    document.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            console.log('Playing track at original index:', index, 'Track:', tracks[index]);
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

function displayPlaylists() {
    if (!trackList) return;
    
    if (playlists.length === 0) {
        trackList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <h3 class="empty-state-title">No Playlists</h3>
                <p class="empty-state-text">Create your first playlist in Settings</p>
                <button class="create-playlist-btn" onclick="window.openSettings()">
                    <i class="fas fa-plus"></i> Create Playlist
                </button>
            </div>
        `;
        return;
    }
    
    trackList.innerHTML = playlists.map(playlist => `
        <div class="playlist-item" onclick="playPlaylist('${playlist.id}')">
            <div class="playlist-art">
                <i class="fas fa-music"></i>
            </div>
            <div class="playlist-info">
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-meta">${playlist.tracks.length} tracks</div>
            </div>
            <div class="playlist-actions">
                <button class="track-action-btn" onclick="event.stopPropagation(); deletePlaylist('${playlist.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
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

async function loadRecommendations() {
    showLoadingState();
    
    try {
        // Try to get trending tracks from Audius as recommendations
        const trendingQuery = 'trending popular music';
        const results = await searchAudius(trendingQuery);
        
        if (results.length > 0) {
            tracks = results;
            currentTrackIndex = 0;
            displayTracks();
            console.log('Loaded recommendations from Audius:', results.length);
            return;
        }
        
        // Try Jamendo as backup
        const jamendoResults = await searchJamendo('popular');
        if (jamendoResults.length > 0) {
            tracks = jamendoResults;
            currentTrackIndex = 0;
            displayTracks();
            console.log('Loaded recommendations from Jamendo:', jamendoResults.length);
            return;
        }
        
        // If both fail, show error
        throw new Error('Unable to load recommendations. Please check your internet connection.');
    } catch (error) {
        console.error('Error loading recommendations:', error);
        showErrorState('api_error', 'Unable to load music recommendations. Please try searching for specific songs or artists.');
    }
}

// Make loadRecommendations available globally
window.loadRecommendations = loadRecommendations;

async function loadTrendingTracks() {
    showLoadingState();
    
    try {
        // Try to get trending from Audius (no API key needed)
        const trendingQuery = 'trending music';
        const results = await searchAudius(trendingQuery);
        
        if (results.length > 0) {
            tracks = results;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        // Try Jamendo as backup
        const jamendoResults = await searchJamendo('trending');
        if (jamendoResults.length > 0) {
            tracks = jamendoResults;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        throw new Error('No trending tracks found. Please try searching for specific songs.');
    } catch (error) {
        console.error('Error loading trending:', error);
        showErrorState('api_error', 'Unable to load trending tracks. Please try searching for specific songs or artists.');
    }
}

async function loadNewReleases() {
    showLoadingState();
    
    try {
        // Try to get new releases from Audius (no API key needed)
        const newReleasesQuery = 'new music';
        const results = await searchAudius(newReleasesQuery);
        
        if (results.length > 0) {
            tracks = results;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        // Try Jamendo as backup
        const jamendoResults = await searchJamendo('new');
        if (jamendoResults.length > 0) {
            tracks = jamendoResults;
            currentTrackIndex = 0;
            displayTracks();
            return;
        }
        
        throw new Error('No new releases found. Please try searching for specific songs.');
    } catch (error) {
        console.error('Error loading new releases:', error);
        showErrorState('api_error', 'Unable to load new releases. Please try searching for specific songs or artists.');
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
    // Validate index
    if (index < 0 || index >= tracks.length) {
        console.error('Invalid track index:', index, 'Total tracks:', tracks.length);
        addDebugLog('Player', `Invalid track index: ${index}`, 'error');
        return;
    }
    
    currentTrackIndex = index;
    const track = tracks[index];
    
    if (!track) {
        console.error('No track found at index:', index);
        addDebugLog('Player', `No track found at index: ${index}`, 'error');
        return;
    }

    // Validate track data
    const validation = validateTrack(track);
    if (!validation.valid) {
        console.error('Invalid track data:', validation.error);
        addDebugLog('Player', `Invalid track: ${validation.error}`, 'error');
        alert(`Cannot play this track: ${validation.error}`);
        return;
    }

    console.log('Playing track:', track.title, 'by', track.artist, 'from source:', track.source, 'at index:', index);
    addDebugLog('Player', `Playing: ${track.title} by ${track.artist}`, 'info');

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
    
    // Start progress update interval for YouTube
    startProgressUpdate();
}

function playAudioTrack(track) {
    console.log('playAudioTrack called with:', track);
    
    const audioUrl = track.audioUrl || track.previewUrl;
    
    if (!audioUrl) {
        console.error('No audio URL available for track:', track);
        addDebugLog('Player', 'No audio URL available for track', 'error');
        alert('No playable audio available for this track.');
        return;
    }
    
    // Validate URL
    try {
        new URL(audioUrl);
    } catch (e) {
        console.error('Invalid audio URL:', audioUrl);
        addDebugLog('Player', `Invalid audio URL: ${audioUrl}`, 'error');
        alert('Invalid audio URL. This track cannot be played.');
        return;
    }
    
    console.log('Playing audio from:', audioUrl, 'for track:', track.title);
    addDebugLog('Player', `Loading audio from: ${audioUrl}`, 'info');
    
    if (!audioPlayer) {
        console.error('Audio player not initialized');
        addDebugLog('Player', 'Audio player not initialized', 'error');
        alert('Audio player not available. Please refresh the page.');
        return;
    }
    
    // Initialize audio context for visualization and equalizer
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    if ((settings.enableVisualizer || settings.equalizerPreset !== 'flat') && !audioContext) {
        initAudioContext();
    }
    
    // Set the audio source
    audioPlayer.src = audioUrl;
    
    // Log the current track info for debugging
    console.log('Current audio player source:', audioPlayer.src);
    console.log('Expected track:', track.title, 'by', track.artist);
    
    audioPlayer.play().then(() => {
        isPlaying = true;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
        console.log('Successfully playing:', track.title);
        addDebugLog('Player', `Successfully playing: ${track.title}`, 'success');
        
        // Activate visualizer if enabled
        if (settings.enableVisualizer) {
            const canvas = document.getElementById('audioVisualizer');
            if (canvas) canvas.classList.add('active');
            if (!animationId && analyser) {
                visualize();
            }
        }
    }).catch(error => {
        console.error('Play error:', error);
        isPlaying = false;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
        addDebugLog('Player', `Play error: ${error.message}`, 'error');
        
        // Provide user-friendly error message
        let errorMessage = 'Error playing audio. ';
        if (error.message.includes('CORS')) {
            errorMessage += 'The source may be blocked by CORS policy. Try a different track or add API keys.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else if (error.message.includes('404')) {
            errorMessage += 'The audio file is not available (404 error).';
        } else {
            errorMessage += 'The source may be unavailable.';
        }
        
        alert(errorMessage);
    });
}

function playYouTubeTrack(track) {
    if (!track.videoId) {
        console.error('No video ID available for YouTube track:', track);
        alert('No playable video available for this track.');
        return;
    }
    
    // Use the IFrame API for YouTube playback
    loadYouTubeIFrame(track);
}

function playYouTubeURL(url) {
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
        alert('Invalid YouTube URL. Please enter a valid YouTube video URL.');
        return;
    }
    
    const track = {
        id: videoId,
        title: 'YouTube Video',
        artist: 'YouTube',
        album: 'YouTube',
        duration: 0,
        artwork: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        source: 'youtube',
        videoId: videoId
    };
    
    loadYouTubeIFrame(track);
}

function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /youtube\.com\/embed\/([^"&?\/\s]{11})/,
        /youtube\.com\/v\/([^"&?\/\s]{11})/,
        /youtube\.com\/watch\?v=([^"&?\/\s]{11})/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

function loadYouTubeIFrame(track) {
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
    try {
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
                    'origin': window.location.origin,
                    'playsinline': 1
                },
                events: {
                    'onReady': function(event) {
                        console.log('YouTube player ready');
                        event.target.playVideo();
                    },
                    'onStateChange': onYouTubePlayerStateChange,
                    'onError': onYouTubePlayerError
                }
            });
        }
        
        // Update UI
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
        if (trackArt) {
            if (track.artwork) {
                trackArt.innerHTML = `<img src="${track.artwork}" alt="${track.title}">`;
            } else {
                trackArt.innerHTML = '<i class="fab fa-youtube"></i>';
            }
        }
        
        isPlaying = true;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
        
        addDebugLog('YouTube', `Playing video: ${track.videoId}`, 'success');
    } catch (error) {
        console.error('Error creating YouTube player:', error);
        addDebugLog('YouTube', `Error creating player: ${error.message}`, 'error');
        alert('Error playing YouTube video. Please check your internet connection and try again.');
    }
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
            errorMessage = 'Video not found or removed.';
            break;
        case 101:
        case 150:
            errorMessage = 'Video not embeddable (owner restricted).';
            break;
        default:
            errorMessage = `YouTube error (code: ${event.data})`;
    }
    
    addDebugLog('YouTube', errorMessage, 'error');
    alert(errorMessage);
    isPlaying = false;
    if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
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
    if (tracks.length === 0) {
        addDebugLog('Player', 'No tracks to play', 'error');
        return;
    }
    
    const currentTrack = tracks[currentTrackIndex];
    
    if (!currentTrack) {
        addDebugLog('Player', 'No current track available', 'error');
        return;
    }
    
    if (currentTrack.source === 'youtube' && window.youtubePlayer) {
        // YouTube playback
        if (isPlaying) {
            window.youtubePlayer.pauseVideo();
            isPlaying = false;
            addDebugLog('YouTube', 'Paused playback', 'info');
        } else {
            window.youtubePlayer.playVideo();
            isPlaying = true;
            addDebugLog('YouTube', 'Resumed playback', 'info');
        }
    } else {
        // Regular audio playback
        if (!audioPlayer) {
            addDebugLog('Player', 'Audio player not available', 'error');
            return;
        }
        
        if (audioPlayer.paused) {
            audioPlayer.play().then(() => {
                isPlaying = true;
                if (playPauseIcon) playPauseIcon.className = 'fas fa-pause';
                addDebugLog('Player', `Playing: ${currentTrack.title}`, 'success');
            }).catch(error => {
                console.error('Play error:', error);
                isPlaying = false;
                if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
                addDebugLog('Player', `Play error: ${error.message}`, 'error');
                alert('Error playing audio. The source may be unavailable or blocked by CORS policy.');
            });
        } else {
            audioPlayer.pause();
            isPlaying = false;
            addDebugLog('Player', 'Paused playback', 'info');
        }
    }
    
    if (playPauseIcon) playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function playNext() {
    if (tracks.length === 0) return;
    
    let nextIndex;
    
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * tracks.length);
    } else if (currentTrackIndex < tracks.length - 1) {
        nextIndex = currentTrackIndex + 1;
    } else {
        nextIndex = 0;
    }
    
    console.log('playNext: current index:', currentTrackIndex, 'next index:', nextIndex, 'track:', tracks[nextIndex]);
    playTrack(nextIndex);
}

function playPrevious() {
    if (tracks.length === 0) return;
    
    let prevIndex;
    
    if (currentTrackIndex > 0) {
        prevIndex = currentTrackIndex - 1;
    } else {
        prevIndex = tracks.length - 1;
    }
    
    console.log('playPrevious: current index:', currentTrackIndex, 'previous index:', prevIndex, 'track:', tracks[prevIndex]);
    playTrack(prevIndex);
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
    const currentTrack = tracks[currentTrackIndex];
    
    if (currentTrack && currentTrack.source === 'youtube' && window.youtubePlayer) {
        // YouTube progress
        const currentTime = window.youtubePlayer.getCurrentTime();
        const duration = window.youtubePlayer.getDuration();
        
        if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            if (progressFill) progressFill.style.width = percent + '%';
            if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
            if (durationEl) durationEl.textContent = formatTime(duration);
        }
    } else if (audioPlayer && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        // Regular audio progress
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (progressFill) progressFill.style.width = percent + '%';
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        if (durationEl) durationEl.textContent = formatTime(audioPlayer.duration);
    }
}

function handleProgressClick(e) {
    if (!progressBar) return;
    
    const currentTrack = tracks[currentTrackIndex];
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    if (currentTrack && currentTrack.source === 'youtube' && window.youtubePlayer) {
        const duration = window.youtubePlayer.getDuration();
        if (duration > 0) {
            window.youtubePlayer.seekTo(duration * percent);
        }
    } else if (audioPlayer && audioPlayer.duration) {
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

function handleMetadataLoaded() {
    if (durationEl && audioPlayer) durationEl.textContent = formatTime(audioPlayer.duration);
}

function handleTrackEnd() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    const autoPlayNext = settings.autoPlayNext !== undefined ? settings.autoPlayNext : true;
    
    addDebugLog('Player', 'Track ended', 'info');
    
    if (isRepeat) {
        addDebugLog('Player', 'Repeating track', 'info');
        playTrack(currentTrackIndex);
    } else if (autoPlayNext) {
        addDebugLog('Player', 'Auto-playing next track', 'info');
        playNext();
    }
}

function handleAudioError(error) {
    console.error('Audio player error:', error);
    
    const currentTrack = tracks[currentTrackIndex];
    addDebugLog('Player', `Audio error: ${error.message}`, 'error');
    
    // Show error to user
    if (currentTrack) {
        console.error('Failed to play:', currentTrack);
        alert(`Error playing "${currentTrack.title}". The source may be unavailable or blocked by CORS policy.`);
    }
    
    // Try next track
    if (currentTrackIndex < tracks.length - 1) {
        playNext();
    } else {
        // Show error state if no more tracks
        isPlaying = false;
        if (playPauseIcon) playPauseIcon.className = 'fas fa-play';
    }
}

// Volume Functions
function handleVolumeChange(e) {
    if (!volumeSlider) return;
    
    const volume = e.target.value / 100;
    
    if (audioPlayer) {
        audioPlayer.volume = volume;
    }
    
    if (window.youtubePlayer) {
        window.youtubePlayer.setVolume(volume * 100);
    }
    
    updateVolumeIcon(volume);
    addDebugLog('Player', `Volume set to ${Math.round(volume * 100)}%`, 'info');
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

// Playlist Menu Function
function showPlaylistMenu(index) {
    const track = tracks[index];
    
    if (playlists.length === 0) {
        alert('No playlists available. Create a playlist in Settings first.');
        return;
    }
    
    // Create a simple menu for playlist selection
    const menu = document.createElement('div');
    menu.className = 'playlist-menu';
    menu.innerHTML = `
        <div class="playlist-menu-header">Add to Playlist</div>
        ${playlists.map(playlist => `
            <div class="playlist-menu-item" data-playlist-id="${playlist.id}">
                <i class="fas fa-music"></i>
                ${playlist.name}
            </div>
        `).join('')}
        <div class="playlist-menu-item create-new">
            <i class="fas fa-plus"></i> Create New Playlist
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Position menu near mouse
    menu.style.position = 'fixed';
    menu.style.left = '50%';
    menu.style.top = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    
    // Handle playlist selection
    menu.querySelectorAll('.playlist-menu-item:not(.create-new)').forEach(item => {
        item.addEventListener('click', () => {
            const playlistId = item.dataset.playlistId;
            if (addToPlaylist(playlistId, track)) {
                alert('Added to playlist');
            } else {
                alert('Track already in playlist');
            }
            document.body.removeChild(menu);
        });
    });
    
    // Handle create new playlist
    menu.querySelector('.create-new').addEventListener('click', () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName) {
            const newPlaylist = createPlaylist(playlistName);
            if (addToPlaylist(newPlaylist.id, track)) {
                alert('Created playlist and added track');
            }
        }
        document.body.removeChild(menu);
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

// Make functions available globally for onclick handlers
window.toggleLikeByIndex = toggleLikeByIndex;
window.addToQueueByIndex = addToQueueByIndex;

// Utility Functions
function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0)}`;
}

// Comprehensive track validation
function validateTrack(track) {
    if (!track) {
        return { valid: false, error: 'Track object is null or undefined' };
    }
    
    if (!track.title || typeof track.title !== 'string') {
        return { valid: false, error: 'Track title is missing or invalid' };
    }
    
    if (!track.audioUrl && !track.videoId) {
        return { valid: false, error: 'Track has no audio URL or video ID' };
    }
    
    if (track.audioUrl && !isValidUrl(track.audioUrl)) {
        return { valid: false, error: 'Track audio URL is invalid' };
    }
    
    if (track.source && !['audius', 'youtube', 'jamendo', 'spotify'].includes(track.source)) {
        return { valid: false, error: `Invalid track source: ${track.source}` };
    }
    
    return { valid: true };
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
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

// Debug Logging System
function addDebugLog(source, message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        timestamp,
        source,
        message,
        type
    };
    
    debugLogs.push(logEntry);
    
    // Keep only last 100 logs
    if (debugLogs.length > 100) {
        debugLogs.shift();
    }
    
    // Update API stats
    if (apiStats[source]) {
        apiStats[source].requests++;
        if (type === 'error') {
            apiStats[source].errors++;
        }
    }
    
    // Update debug UI if visible
    updateDebugUI();
    
    // Console logging in debug mode
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    if (settings.debugMode) {
        console.log(`[${timestamp}] [${source}] ${message}`);
    }
}

function updateDebugUI() {
    const debugLogsContainer = document.getElementById('debugLogs');
    if (!debugLogsContainer) return;
    
    if (debugLogs.length === 0) {
        debugLogsContainer.innerHTML = '<div class="debug-log-info">Debug logs will appear here...</div>';
        return;
    }
    
    debugLogsContainer.innerHTML = debugLogs.map(log => {
        const typeClass = log.type === 'error' ? 'debug-log-error' : 
                         log.type === 'success' ? 'debug-log-success' : 
                         'debug-log-info';
        return `
            <div class="debug-log-entry">
                <span class="debug-log-time">${log.timestamp}</span>
                <span class="debug-log-source">${log.source}</span>
                <span class="debug-log-message ${typeClass}">${log.message}</span>
            </div>
        `;
    }).join('');
    
    // Update stats
    document.getElementById('audiusRequestCount').textContent = apiStats.audius.requests;
    document.getElementById('youtubeRequestCount').textContent = apiStats.youtube.requests;
    document.getElementById('jamendoRequestCount').textContent = apiStats.jamendo.requests;
    document.getElementById('spotifyRequestCount').textContent = apiStats.spotify.requests;
    
    const totalErrors = Object.values(apiStats).reduce((sum, stat) => sum + stat.errors, 0);
    document.getElementById('totalErrorCount').textContent = totalErrors;
}

function clearDebugLogs() {
    debugLogs = [];
    apiStats = {
        audius: { requests: 0, errors: 0 },
        youtube: { requests: 0, errors: 0 },
        jamendo: { requests: 0, errors: 0 },
        spotify: { requests: 0, errors: 0 }
    };
    updateDebugUI();
}

function exportDebugLogs() {
    const data = {
        logs: debugLogs,
        stats: apiStats,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotfuck-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Playlist Management
function createPlaylist(name) {
    const playlist = {
        id: 'playlist_' + Date.now(),
        name: name,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    playlists.push(playlist);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    updatePlaylistUI();
    addDebugLog('Playlist', `Created playlist: ${name}`, 'success');
    return playlist;
}

function deletePlaylist(playlistId) {
    playlists = playlists.filter(p => p.id !== playlistId);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    updatePlaylistUI();
    addDebugLog('Playlist', `Deleted playlist: ${playlistId}`, 'info');
}

function addToPlaylist(playlistId, track) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        // Check if track already exists
        if (!playlist.tracks.some(t => t.id === track.id)) {
            playlist.tracks.push(track);
            playlist.updatedAt = new Date().toISOString();
            localStorage.setItem('playlists', JSON.stringify(playlists));
            addDebugLog('Playlist', `Added "${track.title}" to ${playlist.name}`, 'success');
            return true;
        }
    }
    return false;
}

function removeFromPlaylist(playlistId, trackId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
        playlist.updatedAt = new Date().toISOString();
        localStorage.setItem('playlists', JSON.stringify(playlists));
        addDebugLog('Playlist', `Removed track from ${playlist.name}`, 'info');
    }
}

function updatePlaylistUI() {
    const playlistList = document.getElementById('playlistList');
    if (!playlistList) return;
    
    if (playlists.length === 0) {
        playlistList.innerHTML = '<div class="empty-playlists">No playlists created yet</div>';
        return;
    }
    
    playlistList.innerHTML = playlists.map(playlist => `
        <div class="playlist-item">
            <div class="playlist-icon">
                <i class="fas fa-music"></i>
            </div>
            <div class="playlist-info">
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-meta">${playlist.tracks.length} tracks • Created ${new Date(playlist.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="playlist-actions">
                <button class="playlist-action-btn" onclick="playPlaylist('${playlist.id}')" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="playlist-action-btn" onclick="deletePlaylist('${playlist.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function playPlaylist(playlistId) {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && playlist.tracks.length > 0) {
        tracks = playlist.tracks;
        currentTrackIndex = 0;
        displayTracks();
        playTrack(0);
        addDebugLog('Playlist', `Playing playlist: ${playlist.name}`, 'success');
    }
}

function exportAllPlaylists() {
    const data = {
        playlists: playlists,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotfuck-playlists-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addDebugLog('Playlist', 'Exported all playlists', 'success');
}

function importPlaylist(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.playlists && Array.isArray(data.playlists)) {
                // Merge playlists, avoiding duplicates by name
                data.playlists.forEach(importedPlaylist => {
                    if (!playlists.some(p => p.name === importedPlaylist.name)) {
                        importedPlaylist.id = 'playlist_' + Date.now() + Math.random();
                        playlists.push(importedPlaylist);
                    }
                });
                
                localStorage.setItem('playlists', JSON.stringify(playlists));
                updatePlaylistUI();
                addDebugLog('Playlist', `Imported ${data.playlists.length} playlists`, 'success');
            }
        } catch (error) {
            addDebugLog('Playlist', 'Failed to import playlist: Invalid file format', 'error');
            alert('Failed to import playlist. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

// Audio Enhancement
let audioSource = null; // Store the audio source to prevent multiple connections
let audioChainInitialized = false;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create equalizer using BiquadFilterNodes
        const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        equalizer = {
            bands: [],
            getBand: function(freq) {
                return this.bands.find(band => band.frequency.value === freq);
            }
        };
        
        frequencies.forEach(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            equalizer.bands.push(filter);
        });
        
        setupAudioChain();
    }
}

function setupAudioChain() {
    if (audioChainInitialized) return;
    
    const audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer || !audioContext) return;
    
    try {
        // Create audio source only once
        if (!audioSource) {
            audioSource = audioContext.createMediaElementSource(audioPlayer);
        }
        
        // Connect through EQ bands
        let currentNode = audioSource;
        equalizer.bands.forEach(band => {
            currentNode.connect(band);
            currentNode = band;
        });
        
        // Create analyser for visualization
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        currentNode.connect(analyser);
        
        // Connect to destination
        analyser.connect(audioContext.destination);
        
        audioChainInitialized = true;
        addDebugLog('Audio', 'Audio chain initialized successfully', 'success');
    } catch (error) {
        console.error('Error setting up audio chain:', error);
        addDebugLog('Audio', 'Failed to setup audio chain: ' + error.message, 'error');
    }
}

// Audio Visualization
let visualizerContext = null;
let analyser = null;
let visualizerCanvas = null;
let visualizerCtx = null;
let animationId = null;
let visualizerSource = null;

function initAudioVisualizer() {
    try {
        visualizerCanvas = document.getElementById('audioVisualizer');
        
        if (!visualizerCanvas) return;
        
        // Set canvas size
        visualizerCanvas.width = window.innerWidth;
        visualizerCanvas.height = 60;
        
        visualizerCtx = visualizerCanvas.getContext('2d');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            visualizerCanvas.width = window.innerWidth;
            visualizerCanvas.height = 60;
        });
        
        // Start visualization if analyser is already set up
        if (analyser) {
            visualize();
            addDebugLog('Audio', 'Audio visualizer initialized', 'success');
        }
    } catch (error) {
        console.error('Error initializing audio visualizer:', error);
        addDebugLog('Audio', 'Failed to initialize visualizer: ' + error.message, 'error');
    }
}

function visualize() {
    if (!analyser || !visualizerCtx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        visualizerCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        
        // Draw bars
        const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            // Create gradient
            const gradient = visualizerCtx.createLinearGradient(0, visualizerCanvas.height, 0, visualizerCanvas.height - barHeight);
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#f87171');
            
            visualizerCtx.fillStyle = gradient;
            visualizerCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    draw();
}

function toggleVisualizer() {
    const canvas = document.getElementById('audioVisualizer');
    if (canvas) {
        canvas.classList.toggle('active');
        
        if (canvas.classList.contains('active')) {
            if (!animationId && analyser) {
                visualize();
            }
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    }
}

// Initialize audio context on first user interaction (required by browsers)
document.addEventListener('click', function initAudioOnInteraction() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    if (settings.enableVisualizer && !audioContext) {
        initAudioContext();
    }
    document.removeEventListener('click', initAudioOnInteraction);
}, { once: true });

function applyEqualizerPreset(preset) {
    if (!equalizer || !equalizer.bands) {
        addDebugLog('Audio', 'Equalizer not initialized', 'error');
        return;
    }
    
    const presets = {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bass: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
        vocal: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
        rock: [5, 4, 3, 1, 0, -1, 0, 2, 3, 4],
        pop: [2, 1, 0, 0, -1, -1, 0, 1, 2, 3],
        jazz: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3],
        classical: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4],
        electronic: [6, 5, 3, 0, -2, -2, 0, 2, 4, 5]
    };
    
    const gains = presets[preset] || presets.flat;
    
    equalizer.bands.forEach((band, index) => {
        if (gains[index] !== undefined) {
            band.gain.value = gains[index];
        }
    });
    
    // Update UI sliders
    const sliders = document.querySelectorAll('.eq-range');
    sliders.forEach((slider, index) => {
        if (gains[index] !== undefined) {
            slider.value = gains[index];
            slider.nextElementSibling.textContent = gains[index] + 'dB';
        }
    });
    
    addDebugLog('Audio', `Applied equalizer preset: ${preset}`, 'success');
}

function applyCustomEQ(freq, gain) {
    if (!equalizer || !equalizer.bands) return;
    
    const band = equalizer.bands.find(b => b.frequency.value === freq);
    if (band) {
        band.gain.value = gain;
        addDebugLog('Audio', `Custom EQ: ${freq}Hz set to ${gain}dB`, 'info');
    }
}

// Settings Export/Import
function exportSettings() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    const additionalData = {
        playlists: playlists,
        likedSongs: likedSongs,
        recentlyPlayed: recentlyPlayed,
        queue: queue,
        exportDate: new Date().toISOString()
    };
    
    const data = { ...settings, ...additionalData };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotfuck-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addDebugLog('Settings', 'Exported settings', 'success');
}

function importSettings(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Update settings
            localStorage.setItem('spotfuckSettings', JSON.stringify(data));
            
            // Update additional data if present
            if (data.playlists) {
                playlists = data.playlists;
                localStorage.setItem('playlists', JSON.stringify(playlists));
            }
            if (data.likedSongs) {
                likedSongs = data.likedSongs;
                localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
            }
            if (data.recentlyPlayed) {
                recentlyPlayed = data.recentlyPlayed;
                localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
            }
            if (data.queue) {
                queue = data.queue;
                localStorage.setItem('queue', JSON.stringify(queue));
            }
            
            // Reload settings
            loadSettingsToAPIConfig();
            updatePlaylistUI();
            
            addDebugLog('Settings', 'Imported settings successfully', 'success');
            alert('Settings imported successfully! The page will reload to apply changes.');
            location.reload();
        } catch (error) {
            addDebugLog('Settings', 'Failed to import settings: Invalid file format', 'error');
            alert('Failed to import settings. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        addDebugLog('Settings', 'Cleared all data', 'info');
        alert('All data cleared. The page will reload.');
        location.reload();
    }
}

// Make functions available globally
window.createPlaylist = createPlaylist;
window.deletePlaylist = deletePlaylist;
window.addToPlaylist = addToPlaylist;
window.removeFromPlaylist = removeFromPlaylist;
window.playPlaylist = playPlaylist;
window.exportAllPlaylists = exportAllPlaylists;
window.importPlaylist = importPlaylist;
window.applyEqualizerPreset = applyEqualizerPreset;
window.applyCustomEQ = applyCustomEQ;
window.exportSettings = exportSettings;
window.importSettings = importSettings;
window.clearAllData = clearAllData;
window.clearDebugLogs = clearDebugLogs;
window.exportDebugLogs = exportDebugLogs;
window.showPlaylistMenu = showPlaylistMenu;
window.displayPlaylists = displayPlaylists;
window.toggleVisualizer = toggleVisualizer;
window.initAudioContext = initAudioContext;

// Download Functions
function searchForDownloads(query) {
    addDebugLog('Downloader', `Searching for download: "${query}"`, 'info');
    
    const downloadSearchInput = document.getElementById('downloadSearchInput');
    const downloadTrackList = document.getElementById('downloadTrackList');
    
    if (!query) {
        downloadTrackList.innerHTML = `
            <div class="download-empty-state">
                <i class="fas fa-music"></i>
                <p>Enter a search term to find songs</p>
            </div>
        `;
        return;
    }
    
    downloadTrackList.innerHTML = `
        <div class="download-empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching...</p>
        </div>
    `;
    
    // Update download settings from UI before searching
    updateDownloadSettingsFromUI();
    
    // Search all available sources
    searchAllSources(query).then(results => {
        if (results.length === 0) {
            downloadTrackList.innerHTML = `
                <div class="download-empty-state">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }
        
        displayDownloadResults(results);
        addDebugLog('Downloader', `Found ${results.length} songs for download`, 'success');
    }).catch(error => {
        downloadTrackList.innerHTML = `
            <div class="download-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error searching: ${error.message}</p>
            </div>
        `;
        addDebugLog('Downloader', `Search error: ${error.message}`, 'error');
    });
}

function displayDownloadResults(results) {
    const downloadTrackList = document.getElementById('downloadTrackList');
    
    downloadTrackList.innerHTML = results.map((track, index) => `
        <div class="download-track-item">
            <div class="download-track-info">
                <div class="download-track-title">${track.title}</div>
                <div class="download-track-artist">${track.artist}</div>
                <div class="download-track-source">Source: ${track.source}</div>
            </div>
            <button class="download-track-btn" onclick="queueDownload(${index})">
                <i class="fas fa-download"></i> Add to Queue
            </button>
        </div>
    `).join('');
    
    // Store results for download queuing
    window.currentDownloadResults = results;
}

function queueDownload(index) {
    const track = window.currentDownloadResults[index];
    if (!track) return;
    
    // Update download settings from UI before queuing
    updateDownloadSettingsFromUI();
    
    const downloadItem = {
        id: 'download_' + Date.now(),
        track: track,
        status: 'pending',
        progress: 0,
        error: null,
        settings: { ...downloadSettings }
    };
    
    downloadQueue.push(downloadItem);
    updateDownloadQueueUI();
    addDebugLog('Downloader', `Added to queue: ${track.title}`, 'success');
}

function downloadFromDirectUrl() {
    const url = document.getElementById('directDownloadUrl').value.trim();
    const title = document.getElementById('directDownloadTitle').value.trim();
    const artist = document.getElementById('directDownloadArtist').value.trim();
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    // Validate URL
    if (!isValidUrl(url)) {
        alert('Please enter a valid URL (must start with http:// or https://)');
        return;
    }
    
    // Check if URL points to an audio file
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
    const hasAudioExtension = audioExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    if (!hasAudioExtension) {
        const proceed = confirm('The URL does not appear to be an audio file. Proceed anyway?');
        if (!proceed) return;
    }
    
    // Update download settings from UI before downloading
    updateDownloadSettingsFromUI();
    
    const downloadItem = {
        id: 'download_' + Date.now(),
        track: {
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            audioUrl: url,
            source: 'Direct URL',
            artwork: null
        },
        status: 'pending',
        progress: 0,
        error: null,
        settings: { ...downloadSettings }
    };
    
    downloadQueue.push(downloadItem);
    updateDownloadQueueUI();
    addDebugLog('Downloader', `Added direct URL download: ${url}`, 'success');
    
    // Clear inputs
    document.getElementById('directDownloadUrl').value = '';
    document.getElementById('directDownloadTitle').value = '';
    document.getElementById('directDownloadArtist').value = '';
}

async function startDownload(downloadItem) {
    downloadItem.status = 'downloading';
    downloadItem.progress = 0;
    updateDownloadQueueUI();
    
    try {
        const track = downloadItem.track;
        const audioUrl = track.audioUrl || track.previewUrl;
        
        if (!audioUrl) {
            throw new Error('No audio URL available');
        }
        
        addDebugLog('Downloader', `Starting download: ${track.title}`, 'info');
        
        // Check if URL is valid
        try {
            new URL(audioUrl);
        } catch (e) {
            throw new Error('Invalid audio URL');
        }
        
        // Fetch the audio file with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(audioUrl, { 
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;
        
        const reader = response.body.getReader();
        const chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (total) {
                downloadItem.progress = Math.round((loaded / total) * 100);
            } else {
                downloadItem.progress = Math.min(loaded / 1000000 * 100, 90); // Estimated progress
            }
            
            updateDownloadQueueUI();
        }
        
        // Combine chunks
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        
        // Generate filename
        const filename = generateFilename(track, downloadItem.settings);
        
        // Create download link
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        
        downloadItem.status = 'completed';
        downloadItem.progress = 100;
        addDebugLog('Downloader', `Download completed: ${track.title}`, 'success');
        
        // Show notification if enabled
        const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
        if (settings.showNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Download Complete', {
                body: `${track.title} - ${track.artist}`,
                icon: track.artwork || null
            });
        }
        
    } catch (error) {
        downloadItem.status = 'error';
        downloadItem.error = error.message;
        addDebugLog('Downloader', `Download failed: ${error.message}`, 'error');
        
        // Show error notification
        const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
        if (settings.showNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Download Failed', {
                body: `${downloadItem.track.title}: ${error.message}`,
                icon: null
            });
        }
    }
    
    updateDownloadQueueUI();
}

function generateFilename(track, settings) {
    let filename = '';
    
    if (settings.autoOrganize) {
        // Artist/Album structure
        const artist = sanitizeFilename(track.artist || 'Unknown Artist');
        const album = sanitizeFilename(track.album || 'Unknown Album');
        const title = sanitizeFilename(track.title || 'Unknown Title');
        filename = `${artist}/${album}/${title}`;
    } else {
        // Simple filename
        const title = sanitizeFilename(track.title || 'Unknown Title');
        const artist = sanitizeFilename(track.artist || 'Unknown Artist');
        filename = `${artist} - ${title}`;
    }
    
    // Add extension based on format
    const extension = settings.format === 'original' ? '.mp3' : `.${settings.format}`;
    filename += extension;
    
    return filename;
}

function sanitizeFilename(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 100); // Limit length
}

function updateDownloadQueueUI() {
    const downloadQueueEl = document.getElementById('downloadQueue');
    if (!downloadQueueEl) return;
    
    if (downloadQueue.length === 0) {
        downloadQueueEl.innerHTML = `
            <div class="download-queue-empty">
                <i class="fas fa-download"></i>
                <p>No downloads in queue</p>
            </div>
        `;
        return;
    }
    
    downloadQueueEl.innerHTML = downloadQueue.map(item => {
        const statusClass = item.status === 'completed' ? 'download-status-completed' :
                           item.status === 'error' ? 'download-status-error' :
                           item.status === 'downloading' ? 'download-status-downloading' : '';
        
        const icon = item.status === 'completed' ? 'fa-check' :
                     item.status === 'error' ? 'fa-times' :
                     item.status === 'downloading' ? 'fa-spinner fa-spin' : 'fa-clock';
        
        return `
            <div class="download-queue-item">
                <div class="download-queue-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="download-queue-info">
                    <div class="download-queue-title">${item.track.title}</div>
                    <div class="download-queue-status ${statusClass}">
                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        ${item.error ? `: ${item.error}` : ''}
                        ${item.progress > 0 && item.status === 'downloading' ? ` (${item.progress}%)` : ''}
                    </div>
                </div>
                <div class="download-queue-progress">
                    <div class="download-queue-progress-bar" style="width: ${item.progress}%"></div>
                </div>
                <div class="download-queue-actions">
                    <button class="download-queue-action" onclick="retryDownload('${item.id}')" title="Retry">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="download-queue-action danger" onclick="removeFromDownloadQueue('${item.id}')" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function retryDownload(downloadId) {
    const item = downloadQueue.find(d => d.id === downloadId);
    if (item) {
        item.status = 'pending';
        item.progress = 0;
        item.error = null;
        updateDownloadQueueUI();
        processDownloadQueue();
    }
}

function removeFromDownloadQueue(downloadId) {
    downloadQueue = downloadQueue.filter(d => d.id !== downloadId);
    updateDownloadQueueUI();
}

function clearDownloadQueue() {
    if (confirm('Are you sure you want to clear the download queue?')) {
        downloadQueue = [];
        updateDownloadQueueUI();
        addDebugLog('Downloader', 'Download queue cleared', 'info');
    }
}

let isProcessingDownloads = false;

async function processDownloadQueue() {
    if (isProcessingDownloads) return;
    
    const pendingDownloads = downloadQueue.filter(d => d.status === 'pending');
    
    if (pendingDownloads.length === 0) {
        isProcessingDownloads = false;
        return;
    }
    
    isProcessingDownloads = true;
    
    for (const download of pendingDownloads) {
        await startDownload(download);
    }
    
    isProcessingDownloads = false;
}

function startAllDownloads() {
    addDebugLog('Downloader', 'Starting all downloads', 'info');
    processDownloadQueue();
}

function pauseDownloads() {
    // For simplicity, we'll just stop processing new downloads
    isProcessingDownloads = false;
    addDebugLog('Downloader', 'Downloads paused', 'info');
}

// Load download settings
function loadDownloadSettings() {
    const settings = JSON.parse(localStorage.getItem('spotfuckSettings') || '{}');
    
    const downloadFormat = document.getElementById('downloadFormat');
    const downloadQuality = document.getElementById('downloadQuality');
    const overwriteBehavior = document.getElementById('overwriteBehavior');
    const downloadMetadata = document.getElementById('downloadMetadata');
    const downloadCoverArt = document.getElementById('downloadCoverArt');
    const autoOrganize = document.getElementById('autoOrganize');
    
    if (downloadFormat && settings.downloadFormat) {
        downloadFormat.value = settings.downloadFormat;
        downloadSettings.format = settings.downloadFormat;
    }
    if (downloadQuality && settings.downloadQuality) {
        downloadQuality.value = settings.downloadQuality;
        downloadSettings.quality = settings.downloadQuality;
    }
    if (overwriteBehavior && settings.overwriteBehavior) {
        overwriteBehavior.value = settings.overwriteBehavior;
        downloadSettings.overwriteBehavior = settings.overwriteBehavior;
    }
    if (downloadMetadata && settings.downloadMetadata !== undefined) {
        downloadMetadata.checked = settings.downloadMetadata;
        downloadSettings.downloadMetadata = settings.downloadMetadata;
    }
    if (downloadCoverArt && settings.downloadCoverArt !== undefined) {
        downloadCoverArt.checked = settings.downloadCoverArt;
        downloadSettings.downloadCoverArt = settings.downloadCoverArt;
    }
    if (autoOrganize && settings.autoOrganize !== undefined) {
        autoOrganize.checked = settings.autoOrganize;
        downloadSettings.autoOrganize = settings.autoOrganize;
    }
}

// Update download settings from UI
function updateDownloadSettingsFromUI() {
    const downloadFormat = document.getElementById('downloadFormat');
    const downloadQuality = document.getElementById('downloadQuality');
    const overwriteBehavior = document.getElementById('overwriteBehavior');
    const downloadMetadata = document.getElementById('downloadMetadata');
    const downloadCoverArt = document.getElementById('downloadCoverArt');
    const autoOrganize = document.getElementById('autoOrganize');
    
    if (downloadFormat) downloadSettings.format = downloadFormat.value;
    if (downloadQuality) downloadSettings.quality = downloadQuality.value;
    if (overwriteBehavior) downloadSettings.overwriteBehavior = overwriteBehavior.value;
    if (downloadMetadata) downloadSettings.downloadMetadata = downloadMetadata.checked;
    if (downloadCoverArt) downloadSettings.downloadCoverArt = downloadCoverArt.checked;
    if (autoOrganize) downloadSettings.autoOrganize = autoOrganize.checked;
}

// Make download functions available globally
window.searchForDownloads = searchForDownloads;
window.queueDownload = queueDownload;
window.downloadFromDirectUrl = downloadFromDirectUrl;
window.startAllDownloads = startAllDownloads;
window.pauseDownloads = pauseDownloads;
window.clearDownloadQueue = clearDownloadQueue;
window.retryDownload = retryDownload;
window.removeFromDownloadQueue = removeFromDownloadQueue;

// Make YouTube functions available globally
window.playYouTubeURL = playYouTubeURL;
window.extractYouTubeVideoId = extractYouTubeVideoId;

// Make validation functions available globally
window.validateTrack = validateTrack;
window.isValidUrl = isValidUrl;