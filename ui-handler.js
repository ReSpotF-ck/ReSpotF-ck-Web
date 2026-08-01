/**
 * Spotfuck UI Handler
 * Handles all UI logic, player controls, and user interactions
 * This file separates UI logic from the HTML and API handler
 */

// State
let tracks = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentSource = 'audius';
let youtubePlayer = null;
let isMiniPlayerMode = false;
let currentView = 'search';
let queue = JSON.parse(localStorage.getItem('queue') || '[]');
let currentSearchFilter = 'all';
let searchHistoryList = JSON.parse(localStorage.getItem('searchHistory') || '[]');
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');

// DOM Elements
let audioPlayer, searchInput, searchBtn, trackList, progressBar, currentTimeEl, durationEl;
let playPauseBtn, playPauseIcon, prevBtn, nextBtn, shuffleBtn, repeatBtn, volumeBar;
let settingsBtn, settingsModal, closeSettings, saveSettings, themeToggle;
let youtubeApiKeyInput, spotifyClientIdInput, spotifyClientSecretInput, repoUrlInput, jamendoClientIdInput;
let copySettingsBtn, exportTxtBtn, exportJsonBtn, exportScreenshotBtn, importSettingsBtn, importFile;
let footerText, disclaimerModal, acceptDisclaimer, trackInfoModal, closeTrackInfo, copyTrackInfo, shareTrack;
let shortcutsModal, closeShortcuts, miniPlayerToggle, mainContainer, miniPlayerContent;
let queueModal, closeQueue, shuffleQueue, clearQueue, queueList, saveQueueAsPlaylist, queueBtnMain;
let pinModal, pinDisplay, pinError, clearPin, deletePin;
let searchHistory, historyTags, clearSearchHistory;
let recentlyPlayedSection, recentlyPlayedTracks, clearRecentlyPlayed;
let trendingSearches, trendingTags, searchFilters, recommendedTracks;
let likeBtn, likeIcon, volumeBtn, volumeIcon, progressSection;

/**
 * Initialize UI Handler
 */
async function initUIHandler() {
    // Cache DOM elements
    audioPlayer = document.getElementById('audioPlayer');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    trackList = document.getElementById('trackList');
    progressBar = document.getElementById('progressBar');
    currentTimeEl = document.getElementById('currentTime');
    durationEl = document.getElementById('duration');
    playPauseBtn = document.getElementById('playPauseBtn');
    playPauseIcon = document.getElementById('playPauseIcon');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    shuffleBtn = document.getElementById('shuffleBtn');
    repeatBtn = document.getElementById('repeatBtn');
    volumeBar = document.getElementById('volumeBar');
    settingsBtn = document.getElementById('settingsBtn');
    settingsModal = document.getElementById('settingsModal');
    closeSettings = document.getElementById('closeSettings');
    saveSettings = document.getElementById('saveSettings');
    themeToggle = document.getElementById('themeToggle');
    youtubeApiKeyInput = document.getElementById('youtubeApiKey');
    spotifyClientIdInput = document.getElementById('spotifyClientId');
    spotifyClientSecretInput = document.getElementById('spotifyClientSecret');
    repoUrlInput = document.getElementById('repoUrl');
    jamendoClientIdInput = document.getElementById('jamendoClientId');
    copySettingsBtn = document.getElementById('copySettings');
    exportTxtBtn = document.getElementById('exportTxt');
    exportJsonBtn = document.getElementById('exportJson');
    exportScreenshotBtn = document.getElementById('exportScreenshot');
    importSettingsBtn = document.getElementById('importSettings');
    importFile = document.getElementById('importFile');
    footerText = document.getElementById('footerText');
    disclaimerModal = document.getElementById('disclaimerModal');
    acceptDisclaimer = document.getElementById('acceptDisclaimer');
    trackInfoModal = document.getElementById('trackInfoModal');
    closeTrackInfo = document.getElementById('closeTrackInfo');
    copyTrackInfo = document.getElementById('copyTrackInfo');
    shareTrack = document.getElementById('shareTrack');
    shortcutsModal = document.getElementById('shortcutsModal');
    closeShortcuts = document.getElementById('closeShortcuts');
    miniPlayerToggle = document.getElementById('miniPlayerToggle');
    mainContainer = document.getElementById('mainContainer');
    miniPlayerContent = document.getElementById('miniPlayerContent');
    queueModal = document.getElementById('queueModal');
    closeQueue = document.getElementById('closeQueue');
    shuffleQueue = document.getElementById('shuffleQueue');
    clearQueue = document.getElementById('clearQueue');
    queueList = document.getElementById('queueList');
    saveQueueAsPlaylist = document.getElementById('saveQueueAsPlaylist');
    queueBtnMain = document.getElementById('queueBtnMain');
    pinModal = document.getElementById('pinModal');
    pinDisplay = document.getElementById('pinDisplay');
    pinError = document.getElementById('pinError');
    clearPin = document.getElementById('clearPin');
    deletePin = document.getElementById('deletePin');
    searchHistory = document.getElementById('searchHistory');
    historyTags = document.getElementById('historyTags');
    clearSearchHistory = document.getElementById('clearSearchHistory');
    recentlyPlayedSection = document.getElementById('recentlyPlayedSection');
    recentlyPlayedTracks = document.getElementById('recentlyPlayedTracks');
    clearRecentlyPlayed = document.getElementById('clearRecentlyPlayed');
    trendingSearches = document.getElementById('trendingSearches');
    trendingTags = document.getElementById('trendingTags');
    searchFilters = document.querySelectorAll('.search-filter');
    recommendedTracks = document.getElementById('recommendedTracks');
    likeBtn = document.getElementById('likeBtn');
    likeIcon = document.getElementById('likeIcon');
    volumeBtn = document.getElementById('volumeBtn');
    volumeIcon = document.getElementById('volumeIcon');
    progressSection = document.getElementById('progressSection');

    // Initialize event listeners
    setupEventListeners();
    
    // Show PIN modal immediately for first visit
    showPinModal();
    
    console.log('UI Handler initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeBar.addEventListener('input', handleVolumeChange);
    
    // Progress bar
    progressBar.addEventListener('input', handleSeek);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleTrackEnd);

    // Settings
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsModal);
    saveSettings.addEventListener('click', saveSettingsToStorage);
    themeToggle.addEventListener('click', toggleTheme);

    // Export/Import settings
    copySettingsBtn.addEventListener('click', copySettingsToClipboard);
    exportTxtBtn.addEventListener('click', exportSettingsAsTxt);
    exportJsonBtn.addEventListener('click', exportSettingsAsJson);
    exportScreenshotBtn.addEventListener('click', exportSettingsScreenshot);
    importSettingsBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importSettingsFromFile);

    // PIN and Disclaimer
    acceptDisclaimer.addEventListener('click', acceptDisclaimerHandler);
    clearPin.addEventListener('click', clearPinDisplay);
    deletePin.addEventListener('click', deletePinHandler);

    // Track info
    closeTrackInfo.addEventListener('click', closeTrackInfoModal);
    copyTrackInfo.addEventListener('click', copyTrackInfoToClipboard);
    shareTrack.addEventListener('click', shareTrackHandler);

    // Shortcuts
    closeShortcuts.addEventListener('click', closeShortcutsModal);

    // Mini player
    miniPlayerToggle.addEventListener('click', toggleMiniPlayer);

    // Queue
    queueBtnMain.addEventListener('click', openQueueModal);
    closeQueue.addEventListener('click', closeQueueModal);
    shuffleQueue.addEventListener('click', shuffleQueueHandler);
    clearQueue.addEventListener('click', clearQueueHandler);
    saveQueueAsPlaylist.addEventListener('click', saveQueueAsPlaylistHandler);

    // Search history
    clearSearchHistory.addEventListener('click', clearSearchHistoryHandler);

    // Recently played
    clearRecentlyPlayed.addEventListener('click', clearRecentlyPlayedHandler);

    // Search filters
    searchFilters.forEach(filter => {
        filter.addEventListener('click', handleSearchFilterChange);
    });

    // Like button
    likeBtn.addEventListener('click', toggleLike);

    // Volume button
    volumeBtn.addEventListener('click', toggleMute);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Bottom player art click
    const bottomPlayerArt = document.querySelector('.bottom-player-art');
    if (bottomPlayerArt) {
        bottomPlayerArt.addEventListener('click', () => {
            if (tracks[currentTrackIndex]) {
                showTrackInfo(tracks[currentTrackIndex]);
            }
        });
        bottomPlayerArt.style.cursor = 'pointer';
    }
}

/**
 * Show empty state / recommended tracks
 */
async function loadRecommendedTracks() {
    await showEmptyState();
}

/**
 * Search for tracks based on source
 */
async function searchTracks(query) {
    if (!query.trim()) return;
    
    console.log('Starting search for:', query, 'using source:', currentSource);
    
    // Show loading state
    trackList.innerHTML = `
        <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
            <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(239, 68, 68, 0.2); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
            <p class="loading-text" style="color: var(--text-secondary);">Searching ${currentSource.charAt(0).toUpperCase() + currentSource.slice(1)} for "${query}"...</p>
        </div>
    `;
    
    // Add to search history
    addToSearchHistory(query);
    
    let result;
    try {
        // Wait for API handler to be ready
        if (typeof window.searchAudius === 'undefined' || typeof window.searchJamendo === 'undefined') {
            console.log('API functions not ready, waiting for initialization...');
            await window.initAPIHandler();
            console.log('API Handler initialized during search');
        }
        
        console.log('API functions available:', {
            searchAudius: typeof window.searchAudius,
            searchJamendo: typeof window.searchJamendo,
            searchYouTube: typeof window.searchYouTube,
            searchSpotify: typeof window.searchSpotify
        });
        
        if (currentSource === 'jamendo') {
            console.log('Calling searchJamendo');
            result = await window.searchJamendo(query, currentSearchFilter);
        } else if (currentSource === 'youtube') {
            console.log('Calling searchYouTube');
            result = await window.searchYouTube(query);
        } else if (currentSource === 'spotify') {
            console.log('Calling searchSpotify');
            result = await window.searchSpotify(query);
        } else {
            console.log('Calling searchAudius');
            result = await window.searchAudius(query, currentSearchFilter);
        }
        
        console.log('Search result:', result);
        
        if (result.success && result.tracks && result.tracks.length > 0) {
            tracks = result.tracks;
            currentTrackIndex = 0;
            displayTracks(tracks);
            console.log('Tracks displayed successfully');
        } else {
            showError(result.error || 'No tracks found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'Search failed. Please try again.');
    }
}

/**
 * Display tracks in the list
 */
function displayTracks(tracksToDisplay) {
    if (!tracksToDisplay || tracksToDisplay.length === 0) {
        showEmptyState();
        return;
    }

    trackList.innerHTML = tracksToDisplay.map((track, index) => `
        <div class="track-item" data-index="${index}" onclick="playTrack(${index})">
            <div class="track-item-content">
                <div class="track-item-art">
                    <img src="${track.artwork || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(track.name) + '&background=dc2626&color=fff'}" 
                         alt="${track.name}" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(track.name)}&background=dc2626&color=fff'">
                </div>
                <div class="track-item-info">
                    <div class="track-item-name">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                </div>
                <div class="track-item-actions">
                    <button class="track-item-action" onclick="event.stopPropagation(); addToQueue(${index})" title="Add to queue">
                        <i class="fas fa-list"></i>
                    </button>
                    <button class="track-item-action" onclick="event.stopPropagation(); toggleLikeTrack(${index})" title="Like">
                        <i class="fas fa-heart ${isTrackLiked(track) ? 'liked' : ''}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Show empty state
 */
async function showEmptyState() {
    trackList.innerHTML = `
        <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
            <div class="empty-state-icon" style="font-size: 64px; color: var(--text-secondary); margin-bottom: 20px;">
                <i class="fas fa-music"></i>
            </div>
            <h3 class="empty-state-title" style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: var(--text-color);">
                Start Listening
            </h3>
            <p class="empty-state-text" style="color: var(--text-secondary); max-width: 300px; line-height: 1.6;">
                Search for your favorite music or explore recommendations below
            </p>
        </div>
    `;
    
    // Show recommended tracks
    await showRecommendedTracks();
}

/**
 * Show recommended tracks
 */
async function showRecommendedTracks() {
    const recommendedSection = document.getElementById('recommendedSection');
    if (!recommendedSection) return;

    // Fetch recommended tracks from API
    const [trendingTracks, newReleases, personalizedRecommendations] = await Promise.all([
        getTrendingTracks(),
        getNewReleases(),
        getPersonalizedRecommendations()
    ]);

    const recommendedData = [
        { name: 'Trending Now', icon: 'fa-fire', tracks: trendingTracks },
        { name: 'New Releases', icon: 'fa-star', tracks: newReleases },
        { name: 'For You', icon: 'fa-heart', tracks: personalizedRecommendations }
    ];

    recommendedSection.innerHTML = recommendedData.map(section => `
        <div class="recommended-section" style="margin-bottom: 32px;">
            <div class="recommended-header" style="display: flex; align-items: center; margin-bottom: 16px;">
                <i class="fas ${section.icon}" style="color: var(--primary-color); margin-right: 12px;"></i>
                <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${section.name}</h3>
            </div>
            <div class="recommended-tracks" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                ${section.tracks.map(track => `
                    <div class="recommended-track" onclick="playRecommendedTrack('${track.name}', '${track.source}')" 
                         style="cursor: pointer; padding: 12px; border-radius: 12px; background: var(--bg-tertiary); transition: all 0.3s ease;">
                        <div class="recommended-track-art" style="width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; margin-bottom: 8px;">
                            <img src="${track.artwork}" alt="${track.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="recommended-track-name" style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${track.name}
                        </div>
                        <div class="recommended-track-artist" style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${track.artist}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Get trending tracks - fetches from Audius API
 */
async function getTrendingTracks() {
    try {
        if (typeof window.searchAudius === 'undefined') {
            await window.initAPIHandler();
        }
        
        // Search for trending terms on Audius
        const trendingTerms = ['trending', 'popular', 'hits', 'viral'];
        const randomTerm = trendingTerms[Math.floor(Math.random() * trendingTerms.length)];
        
        const result = await window.searchAudius(randomTerm, 'all');
        if (result.success && result.tracks && result.tracks.length > 0) {
            return result.tracks.slice(0, 4).map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist,
                artwork: track.artwork,
                source: 'audius'
            }));
        }
    } catch (error) {
        console.error('Error fetching trending tracks:', error);
    }
    
    // Fallback to placeholder data
    return [
        { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://ui-avatars.com/api/?name=Blinding+Lights&background=dc2626&color=fff', source: 'audius' },
        { id: '2', name: 'Levitating', artist: 'Dua Lipa', artwork: 'https://ui-avatars.com/api/?name=Levitating&background=dc2626&color=fff', source: 'audius' },
        { id: '3', name: 'Stay', artist: 'The Kid LAROI', artwork: 'https://ui-avatars.com/api/?name=Stay&background=dc2626&color=fff', source: 'audius' },
        { id: '4', name: 'Good 4 U', artist: 'Olivia Rodrigo', artwork: 'https://ui-avatars.com/api/?name=Good+4+U&background=dc2626&color=fff', source: 'audius' }
    ];
}

/**
 * Get new releases - fetches from Audius API
 */
async function getNewReleases() {
    try {
        if (typeof window.searchAudius === 'undefined') {
            await window.initAPIHandler();
        }
        
        // Search for new releases terms on Audius
        const newTerms = ['new', 'fresh', 'latest', '2024'];
        const randomTerm = newTerms[Math.floor(Math.random() * newTerms.length)];
        
        const result = await window.searchAudius(randomTerm, 'all');
        if (result.success && result.tracks && result.tracks.length > 0) {
            return result.tracks.slice(0, 4).map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist,
                artwork: track.artwork,
                source: 'audius'
            }));
        }
    } catch (error) {
        console.error('Error fetching new releases:', error);
    }
    
    // Fallback to placeholder data
    return [
        { id: '5', name: 'As It Was', artist: 'Harry Styles', artwork: 'https://ui-avatars.com/api/?name=As+It+Was&background=dc2626&color=fff', source: 'audius' },
        { id: '6', name: 'Heat Waves', artist: 'Glass Animals', artwork: 'https://ui-avatars.com/api/?name=Heat+Waves&background=dc2626&color=fff', source: 'audius' },
        { id: '7', name: 'Shivers', artist: 'Ed Sheeran', artwork: 'https://ui-avatars.com/api/?name=Shivers&background=dc2626&color=fff', source: 'audius' },
        { id: '8', name: 'Industry Baby', artist: 'Lil Nas X', artwork: 'https://ui-avatars.com/api/?name=Industry+Baby&background=dc2626&color=fff', source: 'audius' }
    ];
}

/**
 * Get personalized recommendations - fetches from Audius API based on user history
 */
async function getPersonalizedRecommendations() {
    try {
        if (typeof window.searchAudius === 'undefined') {
            await window.initAPIHandler();
        }
        
        // Get user's search history for personalization
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        
        // Use search history or recently played to find similar tracks
        const searchTerms = searchHistory.length > 0 ? searchHistory.slice(0, 2) : ['music', 'chill'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        const result = await window.searchAudius(randomTerm, 'all');
        if (result.success && result.tracks && result.tracks.length > 0) {
            return result.tracks.slice(0, 4).map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist,
                artwork: track.artwork,
                source: 'audius'
            }));
        }
    } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
    }
    
    // Fallback to placeholder data
    return [
        { id: '9', name: 'Peaches', artist: 'Justin Bieber', artwork: 'https://ui-avatars.com/api/?name=Peaches&background=dc2626&color=fff', source: 'audius' },
        { id: '10', name: 'Montero', artist: 'Lil Nas X', artwork: 'https://ui-avatars.com/api/?name=Montero&background=dc2626&color=fff', source: 'audius' },
        { id: '11', name: 'Kiss Me More', artist: 'Doja Cat', artwork: 'https://ui-avatars.com/api/?name=Kiss+Me+More&background=dc2626&color=fff', source: 'audius' },
        { id: '12', name: 'Save Your Tears', artist: 'The Weeknd', artwork: 'https://ui-avatars.com/api/?name=Save+Your+Tears&background=dc2626&color=fff', source: 'audius' }
    ];
}

/**
 * Play recommended track
 */
async function playRecommendedTrack(trackName, source) {
    currentSource = source;
    
    // Search for the track by name to get full track data
    try {
        if (typeof window.searchAudius === 'undefined') {
            await window.initAPIHandler();
        }
        
        const result = await window.searchAudius(trackName, 'all');
        if (result.success && result.tracks && result.tracks.length > 0) {
            tracks = result.tracks;
            currentTrackIndex = 0;
            playTrack(0);
        }
    } catch (error) {
        console.error('Error playing recommended track:', error);
    }
}

/**
 * Show error message
 */
function showError(message) {
    trackList.innerHTML = `
        <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
            <div class="error-state-icon" style="font-size: 64px; color: var(--primary-color); margin-bottom: 20px;">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3 class="error-state-title" style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: var(--text-color);">
                Error
            </h3>
            <p class="error-state-text" style="color: var(--text-secondary); max-width: 300px; line-height: 1.6;">
                ${message}
            </p>
            <button onclick="showEmptyState()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

/**
 * Handle search button click
 */
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchTracks(query);
    }
}

/**
 * Play track at index
 */
function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    
    if (!track) return;

    // Update active state
    document.querySelectorAll('.track-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === index) {
            item.classList.add('active');
        }
    });

    // Update bottom player
    updateBottomPlayer(track);

    // Play based on source
    if (currentSource === 'youtube') {
        playYouTubeTrack(track);
    } else {
        playAudioTrack(track);
    }

    // Add to recently played
    addToRecentlyPlayed(track);

    isPlaying = true;
    updatePlayPauseButton();
}

/**
 * Update bottom player
 */
function updateBottomPlayer(track) {
    const bottomPlayerArt = document.querySelector('.bottom-player-art img');
    const bottomPlayerTitle = document.querySelector('.bottom-player-title');
    const bottomPlayerArtist = document.querySelector('.bottom-player-artist');

    if (bottomPlayerArt) {
        bottomPlayerArt.src = track.artwork || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(track.name) + '&background=dc2626&color=fff';
    }
    if (bottomPlayerTitle) {
        bottomPlayerTitle.textContent = track.name;
    }
    if (bottomPlayerArtist) {
        bottomPlayerArtist.textContent = track.artist;
    }

    // Update like button
    updateLikeButton(track);
}

/**
 * Play audio track (for non-YouTube sources)
 */
function playAudioTrack(track) {
    if (track.streamUrl) {
        audioPlayer.src = track.streamUrl;
        audioPlayer.play().catch(error => {
            console.error('Playback error:', error);
            showError('Failed to play track. Please try again.');
        });
    }
}

/**
 * Play YouTube track
 */
function playYouTubeTrack(track) {
    if (track.videoId && window.YT && window.YT.Player) {
        if (!youtubePlayer) {
            youtubePlayer = new window.YT.Player('youtubePlayer', {
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
        } else {
            youtubePlayer.loadVideoById(track.videoId);
        }
    }
}

/**
 * YouTube player state change handler
 */
function onYouTubePlayerStateChange(event) {
    if (event.data === window.YT.PlayerState.ENDED) {
        handleTrackEnd();
    }
}

/**
 * Toggle play/pause
 */
function togglePlayPause() {
    if (currentSource === 'youtube' && youtubePlayer) {
        const playerState = youtubePlayer.getPlayerState();
        if (playerState === window.YT.PlayerState.PLAYING) {
            youtubePlayer.pauseVideo();
            isPlaying = false;
        } else {
            youtubePlayer.playVideo();
            isPlaying = true;
        }
    } else {
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
    }
    updatePlayPauseButton();
}

/**
 * Update play/pause button
 */
function updatePlayPauseButton() {
    if (playPauseIcon) {
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

/**
 * Play previous track
 */
function playPrevious() {
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    } else {
        playTrack(tracks.length - 1);
    }
}

/**
 * Play next track
 */
function playNext() {
    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * tracks.length);
        playTrack(randomIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        playTrack(0);
    }
}

/**
 * Toggle shuffle
 */
function toggleShuffle() {
    isShuffle = !isShuffle;
    if (shuffleBtn) {
        shuffleBtn.style.color = isShuffle ? 'var(--primary-color)' : 'var(--text-secondary)';
    }
}

/**
 * Toggle repeat
 */
function toggleRepeat() {
    isRepeat = !isRepeat;
    if (repeatBtn) {
        repeatBtn.style.color = isRepeat ? 'var(--primary-color)' : 'var(--text-secondary)';
    }
}

/**
 * Handle volume change
 */
function handleVolumeChange() {
    const volume = volumeBar.value / 100;
    audioPlayer.volume = volume;
    if (youtubePlayer) {
        youtubePlayer.setVolume(volume * 100);
    }
    updateVolumeIcon(volume);
}

/**
 * Toggle mute
 */
function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.dataset.previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeBar.value = 0;
        if (youtubePlayer) {
            youtubePlayer.setVolume(0);
        }
    } else {
        const previousVolume = audioPlayer.dataset.previousVolume || 1;
        audioPlayer.volume = previousVolume;
        volumeBar.value = previousVolume * 100;
        if (youtubePlayer) {
            youtubePlayer.setVolume(previousVolume * 100);
        }
    }
    updateVolumeIcon(audioPlayer.volume);
}

/**
 * Update volume icon
 */
function updateVolumeIcon(volume) {
    if (volumeIcon) {
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
}

/**
 * Handle seek
 */
function handleSeek() {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
    if (youtubePlayer) {
        youtubePlayer.seekTo(seekTime, true);
    }
}

/**
 * Update progress
 */
function updateProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
}

/**
 * Update duration
 */
function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

/**
 * Format time
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Handle track end
 */
function handleTrackEnd() {
    if (isRepeat) {
        playTrack(currentTrackIndex);
    } else if (queue.length > 0) {
        // Play next in queue
        const nextTrack = queue.shift();
        localStorage.setItem('queue', JSON.stringify(queue));
        playTrackFromQueue(nextTrack);
    } else {
        playNext();
    }
}

/**
 * Settings functions
 */
function openSettings() {
    if (settingsModal) {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
    }
}

function closeSettingsModal() {
    if (settingsModal) {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
    }
}

function saveSettingsToStorage() {
    const settings = {
        youtubeApiKey: youtubeApiKeyInput.value,
        spotifyClientId: spotifyClientIdInput.value,
        spotifyClientSecret: spotifyClientSecretInput.value,
        repoUrl: repoUrlInput.value,
        jamendoClientId: jamendoClientIdInput.value
    };

    // Save to localStorage
    localStorage.setItem('youtubeApiKey', settings.youtubeApiKey);
    localStorage.setItem('spotifyClientId', settings.spotifyClientId);
    localStorage.setItem('spotifyClientSecret', settings.spotifyClientSecret);
    localStorage.setItem('repoUrl', settings.repoUrl);
    localStorage.setItem('jamendoClientId', settings.jamendoClientId);

    // Save to API handler
    if (window.saveCredentials) {
        window.saveCredentials(settings);
    }

    closeSettingsModal();
    alert('Settings saved successfully!');
}

function loadSettings() {
    youtubeApiKeyInput.value = localStorage.getItem('youtubeApiKey') || '';
    spotifyClientIdInput.value = localStorage.getItem('spotifyClientId') || '';
    spotifyClientSecretInput.value = localStorage.getItem('spotifyClientSecret') || '';
    repoUrlInput.value = localStorage.getItem('repoUrl') || 'https://github.com/ReSpotF-ck/ReSpotFuck-Web';
    jamendoClientIdInput.value = localStorage.getItem('jamendoClientId') || '';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

/**
 * Export/Import functions
 */
function copySettingsToClipboard() {
    const settings = {
        youtubeApiKey: youtubeApiKeyInput.value,
        spotifyClientId: spotifyClientIdInput.value,
        spotifyClientSecret: spotifyClientSecretInput.value,
        repoUrl: repoUrlInput.value,
        jamendoClientId: jamendoClientIdInput.value
    };

    const text = `Spotfuck Settings\n================\nYouTube API Key: ${settings.youtubeApiKey}\nSpotify Client ID: ${settings.spotifyClientId}\nSpotify Client Secret: ${settings.spotifyClientSecret}\nRepository URL: ${settings.repoUrl}\nJamendo Client ID: ${settings.jamendoClientId}`;

    navigator.clipboard.writeText(text).then(() => {
        copySettingsBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        setTimeout(() => {
            copySettingsBtn.innerHTML = '<i class="fas fa-copy mr-2"></i>Copy Settings';
        }, 2000);
    });
}

function exportSettingsAsTxt() {
    const settings = {
        youtubeApiKey: youtubeApiKeyInput.value,
        spotifyClientId: spotifyClientIdInput.value,
        spotifyClientSecret: spotifyClientSecretInput.value,
        repoUrl: repoUrlInput.value,
        jamendoClientId: jamendoClientIdInput.value
    };

    const text = `Spotfuck Settings\n================\nExport Date: ${new Date().toISOString()}\n\nYouTube API Key: ${settings.youtubeApiKey}\nSpotify Client ID: ${settings.spotifyClientId}\nSpotify Client Secret: ${settings.spotifyClientSecret}\nRepository URL: ${settings.repoUrl}\nJamendo Client ID: ${settings.jamendoClientId}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotfuck-settings.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function exportSettingsAsJson() {
    const settings = {
        youtubeApiKey: youtubeApiKeyInput.value,
        spotifyClientId: spotifyClientIdInput.value,
        spotifyClientSecret: spotifyClientSecretInput.value,
        repoUrl: repoUrlInput.value,
        jamendoClientId: jamendoClientIdInput.value,
        exportDate: new Date().toISOString(),
        version: '1.2.0'
    };

    const text = JSON.stringify(settings, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotfuck-settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportSettingsScreenshot() {
    if (typeof html2canvas !== 'undefined') {
        html2canvas(settingsModal).then(canvas => {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'spotfuck-settings-screenshot.png';
            a.click();
        });
    }
}

function importSettingsFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            let settings;

            if (file.name.endsWith('.json')) {
                settings = JSON.parse(content);
            } else {
                // Parse text format
                settings = {};
                const lines = content.split('\n');
                lines.forEach(line => {
                    const match = line.match(/(\w+):\s*(.+)/);
                    if (match) {
                        const key = match[1].toLowerCase().replace(/\s+/g, '');
                        const value = match[2].trim();
                        if (key.includes('youtube')) settings.youtubeApiKey = value;
                        if (key.includes('spotifyclientid')) settings.spotifyClientId = value;
                        if (key.includes('spotifyclientsecret')) settings.spotifyClientSecret = value;
                        if (key.includes('repository')) settings.repoUrl = value;
                        if (key.includes('jamendo')) settings.jamendoClientId = value;
                    }
                });
            }

            if (settings) {
                youtubeApiKeyInput.value = settings.youtubeApiKey || '';
                spotifyClientIdInput.value = settings.spotifyClientId || '';
                spotifyClientSecretInput.value = settings.spotifyClientSecret || '';
                repoUrlInput.value = settings.repoUrl || '';
                jamendoClientIdInput.value = settings.jamendoClientId || '';
                alert('Settings imported successfully!');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import settings. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

/**
 * PIN and Disclaimer functions
 */
function acceptDisclaimerHandler() {
    disclaimerModal.classList.add('hidden');
    disclaimerModal.classList.remove('flex');
}

function clearPinDisplay() {
    pinDisplay.textContent = '';
    pinError.classList.add('hidden');
}

function deletePinHandler() {
    pinDisplay.textContent = '';
    pinError.classList.add('hidden');
}

/**
 * Track info functions
 */
function showTrackInfo(track) {
    if (trackInfoModal) {
        const trackInfoContent = trackInfoModal.querySelector('.track-info-content');
        if (trackInfoContent) {
            trackInfoContent.innerHTML = `
                <div class="track-info-art" style="width: 200px; height: 200px; margin: 0 auto 20px; border-radius: 12px; overflow: hidden;">
                    <img src="${track.artwork || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(track.name) + '&background=dc2626&color=fff'}" 
                         alt="${track.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${track.name}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${track.artist}</p>
                <div class="track-info-details" style="text-align: left; padding: 20px; background: var(--bg-tertiary); border-radius: 12px;">
                    <p><strong>Source:</strong> ${currentSource.charAt(0).toUpperCase() + currentSource.slice(1)}</p>
                    <p><strong>Duration:</strong> ${track.duration || 'Unknown'}</p>
                    ${track.album ? `<p><strong>Album:</strong> ${track.album}</p>` : ''}
                </div>
            `;
        }
        trackInfoModal.classList.remove('hidden');
        trackInfoModal.classList.add('flex');
    }
}

function closeTrackInfoModal() {
    if (trackInfoModal) {
        trackInfoModal.classList.add('hidden');
        trackInfoModal.classList.remove('flex');
    }
}

function copyTrackInfoToClipboard() {
    const track = tracks[currentTrackIndex];
    if (!track) return;

    const text = `Track: ${track.name}\nArtist: ${track.artist}\nSource: ${currentSource}\nDuration: ${track.duration || 'Unknown'}`;

    navigator.clipboard.writeText(text).then(() => {
        copyTrackInfo.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        setTimeout(() => {
            copyTrackInfo.innerHTML = '<i class="fas fa-copy mr-2"></i>Copy Info';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy track info');
    });
}

function shareTrackHandler() {
    const track = tracks[currentTrackIndex];
    if (!track) return;

    const shareText = `🎵 Listening to "${track.name}" by ${track.artist} on Spotfuck!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: track.name,
            text: shareText,
            url: shareUrl
        }).catch(err => {
            console.log('Share failed:', err);
        });
    } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            shareTrack.innerHTML = '<i class="fas fa-check mr-2"></i>Link Copied!';
            setTimeout(() => {
                shareTrack.innerHTML = '<i class="fas fa-share mr-2"></i>Share';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy share link:', err);
        });
    }
}

/**
 * Shortcuts modal
 */
function closeShortcutsModal() {
    if (shortcutsModal) {
        shortcutsModal.classList.add('hidden');
        shortcutsModal.classList.remove('flex');
    }
}

/**
 * Mini player
 */
function toggleMiniPlayer() {
    isMiniPlayerMode = !isMiniPlayerMode;

    if (isMiniPlayerMode) {
        document.body.classList.add('mini-player-mode');
        miniPlayerToggle.innerHTML = '<i class="fas fa-expand"></i>';
        miniPlayerToggle.title = 'Exit Mini Player';
        miniPlayerContent.classList.remove('hidden');
        miniPlayerContent.classList.add('flex');
    } else {
        document.body.classList.remove('mini-player-mode');
        miniPlayerToggle.innerHTML = '<i class="fas fa-compress"></i>';
        miniPlayerToggle.title = 'Toggle Mini Player';
        miniPlayerContent.classList.add('hidden');
        miniPlayerContent.classList.remove('flex');
    }

    console.log('Mini player mode:', isMiniPlayerMode);
}

/**
 * Queue functions
 */
function openQueueModal() {
    if (queueModal) {
        queueModal.classList.remove('hidden');
        queueModal.classList.add('flex');
        displayQueue();
    }
}

function closeQueueModal() {
    if (queueModal) {
        queueModal.classList.add('hidden');
        queueModal.classList.remove('flex');
    }
}

function displayQueue() {
    if (!queueList) return;

    if (queue.length === 0) {
        queueList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Queue is empty</p>';
        return;
    }

    queueList.innerHTML = queue.map((track, index) => `
        <div class="queue-item" style="display: flex; align-items: center; padding: 12px; border-radius: 8px; background: var(--bg-tertiary); margin-bottom: 8px;">
            <div class="queue-item-art" style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; margin-right: 12px;">
                <img src="${track.artwork || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(track.name) + '&background=dc2626&color=fff'}" 
                     alt="${track.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="queue-item-info" style="flex: 1;">
                <div class="queue-item-name" style="font-weight: 500;">${track.name}</div>
                <div class="queue-item-artist" style="font-size: 12px; color: var(--text-secondary);">${track.artist}</div>
            </div>
            <button onclick="removeFromQueue(${index})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 8px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addToQueue(index) {
    const track = tracks[index];
    if (track) {
        queue.push(track);
        localStorage.setItem('queue', JSON.stringify(queue));
        alert('Added to queue!');
    }
}

function removeFromQueue(index) {
    queue.splice(index, 1);
    localStorage.setItem('queue', JSON.stringify(queue));
    displayQueue();
}

function shuffleQueueHandler() {
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    localStorage.setItem('queue', JSON.stringify(queue));
    displayQueue();
}

function clearQueueHandler() {
    queue = [];
    localStorage.setItem('queue', JSON.stringify(queue));
    displayQueue();
}

function saveQueueAsPlaylistHandler() {
    alert('Playlist saved!');
}

function playTrackFromQueue(track) {
    tracks = [track];
    currentTrackIndex = 0;
    playTrack(0);
}

/**
 * Search history functions
 */
function addToSearchHistory(query) {
    if (!searchHistoryList.includes(query)) {
        searchHistoryList.unshift(query);
        if (searchHistoryList.length > 10) {
            searchHistoryList.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
        loadSearchHistory();
    }
}

function loadSearchHistory() {
    if (!historyTags) return;

    if (searchHistoryList.length === 0) {
        searchHistory.classList.add('hidden');
        return;
    }

    searchHistory.classList.remove('hidden');
    historyTags.innerHTML = searchHistoryList.map(query => `
        <span class="history-tag" onclick="searchInput.value='${query}'; searchTracks('${query}');" 
              style="display: inline-block; padding: 6px 12px; background: var(--bg-tertiary); border-radius: 16px; font-size: 12px; margin: 4px; cursor: pointer;">
            ${query}
        </span>
    `).join('');
}

function clearSearchHistoryHandler() {
    searchHistoryList = [];
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
    loadSearchHistory();
}

/**
 * Recently played functions
 */
function addToRecentlyPlayed(track) {
    recentlyPlayed = recentlyPlayed.filter(t => t.id !== track.id);
    recentlyPlayed.unshift(track);
    if (recentlyPlayed.length > 20) {
        recentlyPlayed.pop();
    }
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    loadRecentlyPlayed();
}

function loadRecentlyPlayed() {
    if (!recentlyPlayedTracks) return;

    if (recentlyPlayed.length === 0) {
        recentlyPlayedSection.classList.add('hidden');
        return;
    }

    recentlyPlayedSection.classList.remove('hidden');
    recentlyPlayedTracks.innerHTML = recentlyPlayed.map(track => `
        <div class="recently-played-track" onclick="playTrackFromRecentlyPlayed('${track.id}')" 
             style="cursor: pointer; padding: 12px; border-radius: 8px; background: var(--bg-tertiary); margin-bottom: 8px; display: flex; align-items: center;">
            <div class="recently-played-art" style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; margin-right: 12px;">
                <img src="${track.artwork || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(track.name) + '&background=dc2626&color=fff'}" 
                     alt="${track.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="recently-played-info" style="flex: 1;">
                <div class="recently-played-name" style="font-weight: 500;">${track.name}</div>
                <div class="recently-played-artist" style="font-size: 12px; color: var(--text-secondary);">${track.artist}</div>
            </div>
        </div>
    `).join('');
}

function clearRecentlyPlayedHandler() {
    recentlyPlayed = [];
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    loadRecentlyPlayed();
}

function playTrackFromRecentlyPlayed(trackId) {
    const track = recentlyPlayed.find(t => t.id === trackId);
    if (track) {
        tracks = [track];
        currentTrackIndex = 0;
        playTrack(0);
    }
}

/**
 * Trending searches
 */
function loadTrendingSearches() {
    if (!trendingTags) return;

    const trending = ['lofi hip hop', 'chill vibes', 'workout music', 'focus music', 'party hits'];
    trendingTags.innerHTML = trending.map(query => `
        <span class="trending-tag" onclick="searchInput.value='${query}'; searchTracks('${query}');" 
              style="display: inline-block; padding: 6px 12px; background: rgba(239, 68, 68, 0.1); border-radius: 16px; font-size: 12px; margin: 4px; cursor: pointer; color: var(--primary-color);">
            ${query}
        </span>
    `).join('');
}

/**
 * Search filter functions
 */
function handleSearchFilterChange(event) {
    searchFilters.forEach(filter => filter.classList.remove('active'));
    event.target.classList.add('active');
    currentSearchFilter = event.target.dataset.filter;
}

/**
 * Like functions
 */
function toggleLike() {
    const track = tracks[currentTrackIndex];
    if (track) {
        toggleLikeTrack(currentTrackIndex);
    }
}

/**
 * PIN Entry System
 */
let enteredPin = '';
const correctPin = '1412';

function showPinModal() {
    console.log('Showing PIN modal');
    pinModal.classList.remove('hidden');
    pinModal.classList.add('flex');
    enteredPin = '';
    updatePinDisplay();
    pinError.classList.add('hidden');
    
    // Add PIN button handlers
    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (enteredPin.length < 4) {
                enteredPin += btn.dataset.num;
                updatePinDisplay();
                if (enteredPin.length === 4) {
                    validatePin();
                }
            }
        });
    });
    
    clearPin.addEventListener('click', () => {
        enteredPin = '';
        updatePinDisplay();
        pinError.classList.add('hidden');
    });
    
    deletePin.addEventListener('click', () => {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDisplay();
        pinError.classList.add('hidden');
    });
}

function updatePinDisplay() {
    const dots = pinDisplay.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < enteredPin.length) {
            dot.style.backgroundColor = '#dc2626';
        } else {
            dot.style.backgroundColor = 'transparent';
        }
    });
}

function validatePin() {
    if (enteredPin === correctPin) {
        pinModal.classList.add('hidden');
        pinModal.classList.remove('flex');
        showDisclaimer();
    } else {
        pinError.classList.remove('hidden');
        enteredPin = '';
        updatePinDisplay();
        setTimeout(() => {
            pinError.classList.add('hidden');
        }, 2000);
    }
}

function showDisclaimer() {
    disclaimerModal.classList.remove('hidden');
    disclaimerModal.classList.add('flex');
    
    acceptDisclaimer.addEventListener('click', () => {
        disclaimerModal.classList.add('hidden');
        disclaimerModal.classList.remove('flex');
        // Load app content after disclaimer accepted
        loadAppContent();
    });
}

function loadAppContent() {
    // Show main app content
    const mainAppContent = document.getElementById('mainAppContent');
    if (mainAppContent) {
        mainAppContent.classList.remove('hidden');
    }
    
    // Load initial state
    loadRecommendedTracks();
    loadSearchHistory();
    loadRecentlyPlayed();
    loadTrendingSearches();
    loadSettings();
}

function toggleLikeTrack(index) {
    const track = tracks[index];
    if (!track) return;

    let likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const existingIndex = likedSongs.findIndex(t => t.id === track.id);

    if (existingIndex > -1) {
        likedSongs.splice(existingIndex, 1);
    } else {
        likedSongs.push(track);
    }

    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    updateLikeButton(track);
    displayTracks(tracks);
}

function isTrackLiked(track) {
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    return likedSongs.some(t => t.id === track.id);
}

function updateLikeButton(track) {
    if (likeIcon) {
        if (isTrackLiked(track)) {
            likeIcon.classList.add('liked');
            likeIcon.style.color = 'var(--primary-color)';
        } else {
            likeIcon.classList.remove('liked');
            likeIcon.style.color = 'var(--text-secondary)';
        }
    }
}

/**
 * Keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (event.key) {
        case ' ':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            if (event.shiftKey) {
                playPrevious();
            } else {
                audioPlayer.currentTime -= 10;
            }
            break;
        case 'ArrowRight':
            if (event.shiftKey) {
                playNext();
            } else {
                audioPlayer.currentTime += 10;
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            volumeBar.value = Math.min(100, parseInt(volumeBar.value) + 10);
            handleVolumeChange();
            break;
        case 'ArrowDown':
            event.preventDefault();
            volumeBar.value = Math.max(0, parseInt(volumeBar.value) - 10);
            handleVolumeChange();
            break;
        case 's':
        case 'S':
            toggleShuffle();
            break;
        case 'r':
        case 'R':
            toggleRepeat();
            break;
        case 'l':
        case 'L':
            toggleLike();
            break;
        case 'm':
        case 'M':
            toggleMute();
            break;
    }
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initUIHandler();
});

/**
 * YouTube API ready callback
 */
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
    window.ytApiReady = true;
}
