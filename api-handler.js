/**
 * Spotfuck API Handler
 * Handles all API calls for music streaming services
 * This file separates API logic from the main UI
 */

// API Configuration
let config = {
    api: {
        jamendo: { clientId: '' },
        youtube: { apiKey: '' },
        spotify: { clientId: '', clientSecret: '' },
        audius: { enabled: true }
    }
};

// Runtime credentials (loaded from localStorage)
let JAMENDO_CLIENT_ID = '';
let youtubeApiKey = '';
let spotifyClientId = '';
let spotifyClientSecret = '';
let spotifyAccessToken = null;

/**
 * Initialize API handler with configuration
 */
async function initAPIHandler() {
    // Load from localStorage first
    loadCredentialsFromStorage();
    
    // Try to fetch from repository if URL is set
    const repoUrl = localStorage.getItem('repoUrl');
    if (repoUrl) {
        await fetchConfigFromRepo(repoUrl);
    }
    
    console.log('API Handler initialized');
}

/**
 * Load API credentials from localStorage
 */
function loadCredentialsFromStorage() {
    JAMENDO_CLIENT_ID = localStorage.getItem('jamendoClientId') || '';
    youtubeApiKey = localStorage.getItem('youtubeApiKey') || '';
    spotifyClientId = localStorage.getItem('spotifyClientId') || '';
    spotifyClientSecret = localStorage.getItem('spotifyClientSecret') || '';
    
    console.log('Credentials loaded from storage:', {
        jamendo: JAMENDO_CLIENT_ID ? 'Present' : 'Missing',
        youtube: youtubeApiKey ? 'Present' : 'Missing',
        spotify: spotifyClientId ? 'Present' : 'Missing'
    });
}

/**
 * Fetch configuration from GitHub repository
 */
async function fetchConfigFromRepo(repoUrl) {
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            console.error('Invalid GitHub repository URL');
            return false;
        }

        const [, owner, repo] = match;
        const configUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/config.json`;

        console.log('Fetching config from:', configUrl);
        const response = await fetch(configUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fetchedConfig = await response.json();
        config = fetchedConfig;
        console.log('Configuration loaded successfully:', config);
        
        // Update API keys from config (only if they exist and localStorage is empty)
        if (config.api) {
            if (config.api.jamendo?.clientId && config.api.jamendo.clientId.trim() !== '' && !localStorage.getItem('jamendoClientId')) {
                JAMENDO_CLIENT_ID = config.api.jamendo.clientId;
                localStorage.setItem('jamendoClientId', JAMENDO_CLIENT_ID);
                console.log('Updated Jamendo client ID from config');
            }
            if (config.api.youtube?.apiKey && config.api.youtube.apiKey.trim() !== '' && !localStorage.getItem('youtubeApiKey')) {
                youtubeApiKey = config.api.youtube.apiKey;
                localStorage.setItem('youtubeApiKey', youtubeApiKey);
                console.log('Updated YouTube API key from config');
            }
            if (config.api.spotify?.clientId && config.api.spotify.clientId.trim() !== '' && !localStorage.getItem('spotifyClientId')) {
                spotifyClientId = config.api.spotify.clientId;
                localStorage.setItem('spotifyClientId', spotifyClientId);
                console.log('Updated Spotify client ID from config');
            }
            if (config.api.spotify?.clientSecret && config.api.spotify.clientSecret.trim() !== '' && !localStorage.getItem('spotifyClientSecret')) {
                spotifyClientSecret = config.api.spotify.clientSecret;
                localStorage.setItem('spotifyClientSecret', spotifyClientSecret);
                console.log('Updated Spotify client secret from config');
            }
        }
        
        // Reload from localStorage after config fetch
        loadCredentialsFromStorage();
        
        return true;
    } catch (error) {
        console.error('Error fetching config from repository:', error);
        return false;
    }
}

/**
 * Save credentials to localStorage
 */
function saveCredentials(credentials) {
    if (credentials.youtubeApiKey !== undefined) {
        youtubeApiKey = credentials.youtubeApiKey;
        localStorage.setItem('youtubeApiKey', youtubeApiKey);
    }
    if (credentials.spotifyClientId !== undefined) {
        spotifyClientId = credentials.spotifyClientId;
        localStorage.setItem('spotifyClientId', spotifyClientId);
    }
    if (credentials.spotifyClientSecret !== undefined) {
        spotifyClientSecret = credentials.spotifyClientSecret;
        localStorage.setItem('spotifyClientSecret', spotifyClientSecret);
    }
    if (credentials.jamendoClientId !== undefined) {
        JAMENDO_CLIENT_ID = credentials.jamendoClientId;
        localStorage.setItem('jamendoClientId', JAMENDO_CLIENT_ID);
    }
    
    // Clear Spotify token on credential change
    if (credentials.spotifyClientId !== undefined || credentials.spotifyClientSecret !== undefined) {
        spotifyAccessToken = null;
    }
    
    console.log('Credentials saved to storage');
}

/**
 * Search Audius (FREE - No API key required)
 */
async function searchAudius(query, searchFilter = 'all') {
    try {
        console.log('Audius search starting...');
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
        );
        
        // Get the host from the discovery API
        const hostResponse = await Promise.race([
            fetch('https://api.audius.co'),
            timeoutPromise
        ]);
        
        if (!hostResponse.ok) {
            throw new Error('Failed to connect to Audius discovery API');
        }
        
        const hostData = await hostResponse.json();
        
        if (!hostData.data || hostData.data.length === 0) {
            throw new Error('No Audius hosts available');
        }
        
        const host = hostData.data[0];
        console.log('Using Audius host:', host);
        
        let tracks = [];
        
        if (searchFilter === 'artists') {
            const url = `https://${host}/v1/users/search?query=${encodeURIComponent(query)}&limit=5`;
            console.log('Audius artist search URL:', url);
            const response = await Promise.race([fetch(url), timeoutPromise]);
            const data = await response.json();
            
            console.log('Audius artist response:', data);
            
            if (data.data && data.data.length > 0) {
                const artistId = data.data[0].id;
                const tracksResponse = await Promise.race([
                    fetch(`https://${host}/v1/users/${artistId}/tracks?limit=20`),
                    timeoutPromise
                ]);
                const tracksData = await tracksResponse.json();
                
                console.log('Audius artist tracks response:', tracksData);
                
                if (tracksData.data && tracksData.data.length > 0) {
                    tracks = tracksData.data.map(track => formatAudiusTrack(track, host));
                }
            }
        } else {
            let url = `https://${host}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=20`;
            console.log('Audius track search URL:', url);
            const response = await Promise.race([fetch(url), timeoutPromise]);
            const data = await response.json();
            
            console.log('Audius track response:', data);
            
            if (data.data && data.data.length > 0) {
                tracks = data.data.map(track => formatAudiusTrack(track, host));
            }
        }
        
        return { success: true, tracks };
    } catch (error) {
        console.error('Error searching Audius:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Format Audius track data
 */
function formatAudiusTrack(track, host) {
    let artwork = '';
    if (track.artwork) {
        // Try multiple resolution options in order of preference
        artwork = track.artwork['1500x1500'] || 
                  track.artwork['1000x1000'] ||
                  track.artwork['480x480'] || 
                  track.artwork['150x150'] || 
                  track.artwork['600x600'] ||
                  track.artwork['500x500'] || '';
    }
    
    // Fallback to generated avatar if no artwork
    if (!artwork) {
        const artistInitials = track.user ? track.user.name.substring(0, 2) : track.title.substring(0, 2);
        artwork = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistInitials)}&background=dc2626&color=fff&size=500&font-size=0.33`;
    }
    
    return {
        source: 'audius',
        id: track.id,
        audio: `https://${host}/v1/tracks/${track.id}/stream`,
        image: artwork,
        name: track.title,
        artist_name: track.user.name,
        duration: track.duration
    };
}

/**
 * Search Jamendo
 */
async function searchJamendo(query, searchFilter = 'all') {
    // Reload from localStorage to get latest values
    JAMENDO_CLIENT_ID = localStorage.getItem('jamendoClientId') || '';
    console.log('Jamendo Client ID:', JAMENDO_CLIENT_ID ? 'Present' : 'Missing');
    
    if (!JAMENDO_CLIENT_ID || JAMENDO_CLIENT_ID.trim() === '') {
        return { 
            success: false, 
            error: 'Jamendo Client ID required. Please add it in Settings.' 
        };
    }
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
        );
        
        let url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&include=musicinfo&imagesize=500`;
        
        console.log('Jamendo search URL:', url);
        
        if (searchFilter === 'artists') {
            url += `&artists=${encodeURIComponent(query)}`;
        } else if (searchFilter === 'albums') {
            url += `&albums=${encodeURIComponent(query)}`;
        } else {
            url += `&search=${encodeURIComponent(query)}`;
        }
        
        const response = await Promise.race([fetch(url), timeoutPromise]);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const tracks = data.results.map(track => {
                // Try multiple artwork sources with fallbacks
                let artwork = track.image || 
                              track.album_image || 
                              track.cover_image || 
                              track.waveform_image || '';
                
                // If no artwork, generate avatar with artist initials
                if (!artwork) {
                    const artistInitials = track.artist_name ? track.artist_name.substring(0, 2) : track.name.substring(0, 2);
                    artwork = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistInitials)}&background=dc2626&color=fff&size=500&font-size=0.33`;
                }
                
                return {
                    source: 'jamendo',
                    id: track.id,
                    audio: track.audio,
                    image: artwork,
                    name: track.name,
                    artist_name: track.artist_name,
                    duration: track.duration
                };
            });
            return { success: true, tracks };
        } else {
            return { success: false, error: 'No tracks found' };
        }
    } catch (error) {
        console.error('Error searching Jamendo:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search YouTube
 */
async function searchYouTube(query, searchFilter = 'all') {
    // Reload from localStorage to get latest values
    youtubeApiKey = localStorage.getItem('youtubeApiKey') || '';
    console.log('YouTube API key check:', youtubeApiKey ? 'Present' : 'Missing');
    
    if (!youtubeApiKey || youtubeApiKey.trim() === '') {
        return { 
            success: false, 
            error: 'YouTube API key required. Please add it in Settings.' 
        };
    }
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
        );
        
        let searchQuery = query;
        if (searchFilter === 'artists') {
            searchQuery = query + ' artist music';
        } else if (searchFilter === 'albums') {
            searchQuery = query + ' album music';
        } else {
            searchQuery = query + ' music';
        }
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(searchQuery)}&type=video&key=${youtubeApiKey}`;
        console.log('YouTube search URL:', url);
        
        const response = await Promise.race([fetch(url), timeoutPromise]);
        const data = await response.json();
        
        console.log('YouTube response:', data);
        
        if (data.error) {
            console.error('YouTube API error:', data.error);
            return { success: false, error: `YouTube API Error: ${data.error.message}` };
        }
        
        if (data.items && data.items.length > 0) {
            const tracks = data.items.map(item => {
                // Try multiple thumbnail sizes in order of preference
                let thumbnail = item.snippet.thumbnails.maxres?.url || 
                               item.snippet.thumbnails.standard?.url ||
                               item.snippet.thumbnails.high?.url || 
                               item.snippet.thumbnails.medium?.url || 
                               item.snippet.thumbnails.default?.url || '';
                
                // If no thumbnail, generate avatar with channel initials
                if (!thumbnail) {
                    const channelInitials = item.snippet.channelTitle ? item.snippet.channelTitle.substring(0, 2) : item.snippet.title.substring(0, 2);
                    thumbnail = `https://ui-avatars.com/api/?name=${encodeURIComponent(channelInitials)}&background=dc2626&color=fff&size=500&font-size=0.33`;
                }
                
                return {
                    source: 'youtube',
                    videoId: item.id.videoId,
                    name: item.snippet.title,
                    artist_name: item.snippet.channelTitle,
                    image: thumbnail,
                    duration: 0
                };
            });
            return { success: true, tracks };
        } else {
            return { success: false, error: 'No tracks found' };
        }
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get Spotify access token
 */
async function getSpotifyAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(spotifyClientId + ':' + spotifyClientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        
        const data = await response.json();
        if (data.access_token) {
            spotifyAccessToken = data.access_token;
            return data.access_token;
        } else {
            console.error('Failed to get Spotify access token:', data);
            return null;
        }
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
        return null;
    }
}

/**
 * Search Spotify
 */
async function searchSpotify(query, searchFilter = 'all') {
    // Reload credentials from localStorage to get latest values
    spotifyClientId = localStorage.getItem('spotifyClientId') || '';
    spotifyClientSecret = localStorage.getItem('spotifyClientSecret') || '';
    
    console.log('Spotify credentials check:', { 
        clientId: spotifyClientId ? 'Present' : 'Missing', 
        clientSecret: spotifyClientSecret ? 'Present' : 'Missing'
    });
    
    if (!spotifyClientId || !spotifyClientSecret || spotifyClientId.trim() === '' || spotifyClientSecret.trim() === '') {
        return { 
            success: false, 
            error: 'Spotify API credentials required. Please add them in Settings.' 
        };
    }
    
    // Get access token if not available
    if (!spotifyAccessToken) {
        const token = await getSpotifyAccessToken();
        if (!token) {
            return { success: false, error: 'Failed to get Spotify access token' };
        }
    }
    
    try {
        let searchType = 'track';
        if (searchFilter === 'artists') {
            searchType = 'artist';
        } else if (searchFilter === 'albums') {
            searchType = 'album';
        }
        
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=20`,
            {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}` 
                }
            }
        );
        
        if (response.status === 401) {
            // Token expired, get new one and retry
            await getSpotifyAccessToken();
            return searchSpotify(query, searchFilter);
        }
        
        const data = await response.json();
        
        if (data.tracks && data.tracks.items.length > 0) {
            const tracks = data.tracks.items.map(track => formatSpotifyTrack(track));
            return { success: true, tracks };
        } else if (data.artists && data.artists.items.length > 0) {
            // For artist search, get top tracks
            const artistId = data.artists.items[0].id;
            const tracksResponse = await fetch(
                `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US&limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${spotifyAccessToken}` 
                    }
                }
            );
            const tracksData = await tracksResponse.json();
            
            if (tracksData.tracks && tracksData.tracks.length > 0) {
                const tracks = tracksData.tracks.map(track => formatSpotifyTrack(track));
                return { success: true, tracks };
            }
        } else if (data.albums && data.albums.items.length > 0) {
            // For album search, get album tracks
            const albumId = data.albums.items[0].id;
            const albumResponse = await fetch(
                `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${spotifyAccessToken}` 
                    }
                }
            );
            const albumData = await albumResponse.json();
            
            if (albumData.items && albumData.items.length > 0) {
                let albumImage = data.albums.items[0].images.find(img => img.height >= 600)?.url || 
                                data.albums.items[0].images.find(img => img.height >= 300)?.url || 
                                data.albums.items[0].images[0]?.url || '';
                if (!albumImage) {
                    albumImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.albums.items[0].name.substring(0, 2))}&background=dc2626&color=fff&size=150`;
                }
                const tracks = albumData.items.map(track => ({
                    source: 'spotify',
                    spotifyUrl: track.external_urls.spotify,
                    name: track.name,
                    artist_name: data.albums.items[0].artists.map(a => a.name).join(', '),
                    image: albumImage,
                    duration: track.duration_ms / 1000,
                    preview_url: track.preview_url
                }));
                return { success: true, tracks };
            }
        }
        
        return { success: false, error: 'No tracks found' };
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Format Spotify track data
 */
function formatSpotifyTrack(track) {
    // Try multiple image sizes in order of preference
    let artwork = track.album.images.find(img => img.height >= 1000)?.url ||
                  track.album.images.find(img => img.height >= 640)?.url ||
                  track.album.images.find(img => img.height >= 600)?.url || 
                  track.album.images.find(img => img.height >= 300)?.url || 
                  track.album.images[0]?.url || '';
    
    // If no artwork, generate avatar with artist initials
    if (!artwork) {
        const artistInitials = track.artists && track.artists[0] ? track.artists[0].name.substring(0, 2) : track.name.substring(0, 2);
        artwork = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistInitials)}&background=dc2626&color=fff&size=500&font-size=0.33`;
    }
    
    return {
        source: 'spotify',
        spotifyUrl: track.external_urls.spotify,
        name: track.name,
        artist_name: track.artists.map(a => a.name).join(', '),
        image: artwork,
        duration: track.duration_ms / 1000,
        preview_url: track.preview_url
    };
}

/**
 * Check if API credentials are available for a source
 */
function hasCredentialsForSource(source) {
    // Reload from localStorage to get latest values
    loadCredentialsFromStorage();
    
    switch (source) {
        case 'audius':
            return true; // No credentials needed
        case 'jamendo':
            const hasJamendo = !!(JAMENDO_CLIENT_ID && JAMENDO_CLIENT_ID.trim() !== '');
            console.log('Jamendo credentials check:', hasJamendo, 'ID length:', JAMENDO_CLIENT_ID.length);
            return hasJamendo;
        case 'youtube':
            const hasYouTube = !!(youtubeApiKey && youtubeApiKey.trim() !== '');
            console.log('YouTube credentials check:', hasYouTube, 'Key length:', youtubeApiKey.length);
            return hasYouTube;
        case 'spotify':
            const hasSpotify = !!(spotifyClientId && spotifyClientId.trim() !== '' && 
                                spotifyClientSecret && spotifyClientSecret.trim() !== '');
            console.log('Spotify credentials check:', hasSpotify, 'Client ID length:', spotifyClientId.length, 'Secret length:', spotifyClientSecret.length);
            return hasSpotify;
        default:
            return false;
    }
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAPIHandler,
        searchAudius,
        searchJamendo,
        searchYouTube,
        searchSpotify,
        saveCredentials,
        fetchConfigFromRepo,
        hasCredentialsForSource
    };
}

// Expose functions to browser window object
if (typeof window !== 'undefined') {
    window.initAPIHandler = initAPIHandler;
    window.searchAudius = searchAudius;
    window.searchJamendo = searchJamendo;
    window.searchYouTube = searchYouTube;
    window.searchSpotify = searchSpotify;
    window.saveCredentials = saveCredentials;
    window.fetchConfigFromRepo = fetchConfigFromRepo;
    window.hasCredentialsForSource = hasCredentialsForSource;
}
