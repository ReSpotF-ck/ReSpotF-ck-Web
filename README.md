# ReSpotiF*ck - Free Music Streaming

A modern, completely redesigned music streaming application that aggregates music from multiple free and legal APIs including Audius, YouTube, Spotify, and Jamendo.

## 🌟 New Structure

- **index.html** - Landing page with special access requirements
- **signin.html** - Sign-in page with Discord, Telegram, and invite form
- **h0m3.html** - Main music streaming application (requires access)
- **css/shared.css** - Shared CSS components for all pages
- **js/shared.js** - Shared JavaScript functionality for all pages

## Features

- **Multi-Source Music Streaming**: Search and play music from Audius, YouTube, Jamendo, and Spotify
- **Modern Dark UI**: Beautiful AMOLED-friendly dark theme with red accents
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Audio Player**: Full-featured player with play/pause, next/previous, shuffle, repeat
- **Volume Control**: Adjustable volume with mute toggle
- **Progress Bar**: Visual progress tracking with seek functionality
- **Library Management**: Liked songs, recently played, and queue management
- **Local Storage**: Your preferences and playlists are saved locally
- **Keyboard Shortcuts**: Control playback with keyboard shortcuts
- **No Account Required**: Use without signing up (API keys optional)
- **Discover Section**: Trending, new releases, and genre browsing
- **Real YouTube Playback**: YouTube video integration with duration tracking
- **Spotify Previews**: 30-second preview clips from Spotify
- **Expanded Demo Library**: 20+ demo tracks with reliable audio

## Getting Started

### Option 1: Direct File Opening
1. Open `index.html` to see the landing page
2. Navigate to `signin.html` to sign in or request access
3. Once you have access, open `h0m3.html` for the music player
   - **PIN Required**: Enter `8` (the answer to "What is 5 + 3?") to access the music player
   - **Admin Bypass**: Press `Shift+B` or open `h0m3.html?bypass=1`

### Option 2: Quick Start
Run `start.bat` to open the landing page automatically.

### Option 3: Local Server (Recommended)
For the best experience, serve the files through a local web server:

#### Using Python
```bash
cd ReSpotiF*ck-Web
python -m http.server 8000
```
Then open http://localhost:8000/index.html for landing page or http://localhost:8000/h0m3.html for the music player.

#### Using Node.js
```bash
cd ReSpotiF*ck-Web
npx http-server -p 8000
```
Then open http://localhost:8000/index.html for landing page or http://localhost:8000/h0m3.html for the music player.

#### Using PowerShell (Windows)
```powershell
cd ReSpotiF*ck-Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host 'Server started on http://localhost:8000'
# Keep this window open
```

## Community Links Configuration

To customize the Discord and Telegram links in the sign-in page:

1. Open `signin.html`
2. Find the Discord button (around line 203):
   ```html
   <a href="https://discord.gg/your-discord-invite" target="_blank" class="social-btn discord-btn">
   ```
   Replace `your-discord-invite` with your actual Discord invite code.

3. Find the Telegram button (around line 208):
   ```html
   <a href="https://t.me/your-telegram-channel" target="_blank" class="social-btn telegram-btn">
   ```
   Replace `your-telegram-channel` with your actual Telegram username or channel.

## PIN Security System

The main music player (`h0m3.html`) is protected by a PIN entry system:

### Access Methods
1. **Standard PIN**: Enter `8` (case-insensitive)
2. **Admin Bypass**: Press `Shift+B` or open `h0m3.html?bypass=1`

### Features
- **Persistent Session**: Once authenticated, the PIN is remembered in localStorage
- **Show/Hide PIN**: Toggle visibility with the eye icon
- **Error Handling**: Shake animation and error message for incorrect PINs
- **Hint System**: On-screen hint mentions the PIN is the filename without extension
- **Auto-Focus**: PIN input is automatically focused on page load

### Reset Authentication
To clear the saved authentication and require PIN entry again:
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('pinAuthenticated');
localStorage.removeItem('adminBypass');
```

## Settings Panel

The music player includes a comprehensive settings panel accessible via the Settings button in the header:

### API Configuration
- **Audius API Key**: Configure your Audius API key for full access
- **YouTube API Key**: Add your YouTube Data API key
- **Jamendo Client ID**: Enter your Jamendo client ID
- **Spotify Credentials**: Configure Client ID and Client Secret

### Playback Settings
- **Default Volume**: Set the default volume level (0-100%)
- **Auto-play Next**: Enable/disable automatic track progression
- **Playback Notifications**: Enable desktop notifications for track changes

### Features
- **Persistent Storage**: All settings are saved to localStorage
- **Reset to Defaults**: One-click reset to default settings
- **Live Preview**: Volume changes are reflected immediately
- **Secure Storage**: Sensitive data (API keys) stored locally only
- **Help Links**: Direct links to API documentation for each service

### Access
- Click the Settings button (gear icon) in the header
- Configure your API keys and preferences
- Click "Save Settings" to persist changes
- Use "Reset to Defaults" to clear all settings

### Developer Access
Settings can also be accessed programmatically:
```javascript
// Get current settings
const settings = window.getSettings();

// Open settings modal
window.openSettings();

// Close settings modal
window.closeSettings();
```

## API Configuration

The application works out of the box with demo audio tracks. To use real music from the various platforms, configure API keys in the Settings panel:

### Demo Mode (Default)
- **8 Demo Tracks**: Pre-loaded with playable audio from reliable sources
- **No API Keys Required**: Works immediately upon opening
- **Full Functionality**: All player features work with demo content
- **Search Filtering**: Demo tracks can be filtered by search terms

### Real API Integration (Optional)
To access real music from the platforms, configure API keys via the Settings panel:

1. Click the **Settings** button (gear icon) in the header
2. Enter your API keys for the desired services
3. Click **Save Settings**
4. Search will now use real APIs in addition to demo content

**Services Available:**
- **Audius**: Free, decentralized music streaming
- **YouTube**: Largest video music library  
- **Jamendo**: Free music from independent artists
- **Spotify**: Premium music streaming (preview clips only)

**Getting API Keys:**
- [Audius Developers](https://developers.audius.co/)
- [Google Cloud Console](https://console.cloud.google.com/) (YouTube)
- [Jamendo Developers](https://developer.jamendo.com/v3.0/)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)

**Note**: The app works perfectly with demo audio without any API keys. API keys are optional for accessing real content from the platforms.

## Keyboard Shortcuts

- **Space**: Play/Pause
- **Shift + Right Arrow**: Next track
- **Shift + Left Arrow**: Previous track
- **Shift + S**: Toggle shuffle
- **Shift + R**: Toggle repeat

## Project Structure

```
ReSpotiF*ck-Web/
├── index.html          # Landing page with special access
├── signin.html         # Sign-in page with community links
├── h0m3.html           # Main music streaming application
├── css/
│   └── styles.css      # All styling
├── js/
│   └── app.js          # Application logic
├── start.bat           # Windows launcher
└── README.md           # This file
```

## Features Breakdown

### Music Sources
- **Audius**: Free, decentralized music streaming
- **YouTube**: Largest video music library
- **Jamendo**: Free music from independent artists
- **Spotify**: Premium music streaming (preview only)

### Player Controls
- Play/Pause/Next/Previous track
- Shuffle and repeat modes
- Volume control with mute
- Progress bar with seeking
- Time display (current/total)

### Library Features
- Liked songs (heart icon)
- Recently played history
- Queue management
- Source filtering
- Search functionality

### UI/UX
- Responsive design (mobile-first)
- Dark theme (AMOLED-friendly)
- Smooth animations
- Loading states
- Error handling
- Empty states

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks required
- **LocalStorage**: For saving user preferences
- **Responsive Design**: Mobile, tablet, and desktop
- **API Integration**: Multiple music service APIs
- **YouTube IFrame API**: For YouTube playback
- **HTML5 Audio**: For audio playback

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Legal Notice

This application is for educational purposes only. Users are responsible for ensuring they have the right to access and stream content from the various music sources. Always respect copyright and terms of service of the respective platforms.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Credits

- Original concept: ReSpotiF*ck
- Icons: Font Awesome
- Fonts: Google Fonts (Inter)
- APIs: Audius, YouTube, Jamendo, Spotify

---

Enjoy your music! 🎵