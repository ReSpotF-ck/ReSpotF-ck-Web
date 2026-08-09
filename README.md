# Spotfuck - Free Music Streaming Platform

> ⚠️ **Alpha/Beta Status**: This project is currently in alpha/beta development. Many features may not work as expected. Please report issues on GitHub.

A modern, completely redesigned music streaming application that aggregates music from multiple free and legal APIs including Audius, YouTube, Spotify, and Jamendo.

## 🌐 Live Demo

- **Netlify**: https://respotfck.netlify.app
- **StaticHost**: https://respotfck.statichost.page
- **GitHub Pages**: https://respotf-ck.github.io/ReSpotFuck-Web/

## ✨ Features

- **🎵 Multi-Source Streaming**: Access music from Audius (completely FREE), YouTube, Spotify, and Jamendo
- **🎨 Modern AMOLED Red Theme**: Beautiful dark interface optimized for OLED displays
- **🎧 Full-Featured Player**: Play/pause, next/previous, shuffle, repeat, volume control with mute toggle
- **❤️ Liked Songs Library**: Save your favorite tracks with persistent storage
- **📋 Queue Management**: Add tracks to queue for later playback
- **🕐 Recently Played**: Quick access to your listening history
- **⌨️ Keyboard Shortcuts**: Space to play/pause, Shift+Arrow for navigation, Shift+S for shuffle, Shift+R for repeat
- **📱 Mobile Responsive**: Optimized for all screen sizes
- **🔐 PIN Protection**: Secure access with customizable PIN (default: 1412)
- **🛡️ Security Features**: Dev tools detection, console clearing, right-click protection
- **🔧 Dynamic Configuration**: Edit API keys directly in the app settings
- **🆓 Free Music Option**: Audius works completely free without any API keys
- **🎯 Smart Artwork Fallback**: Auto-generated avatars when artwork is unavailable

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: API keys for YouTube, Spotify, and Jamendo (Audius works for FREE without keys)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ReSpotF-ck/ReSpotFuck-Web.git
cd ReSpotFuck-Web
```

2. Open `index.html` in your web browser

3. Enter the PIN code (default: `1412`) to access the application

### 🔑 API Keys Setup

#### Audius (FREE - No API Key Required)
Audius works completely free without any API keys. No setup required!

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key and add it to the app settings

#### Spotify Web API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app
3. Copy the Client ID and Client Secret
4. Add them to the app settings

#### Jamendo API
1. Go to [Jamendo Developer](https://developer.jamendo.com/)
2. Create an account and get a Client ID
3. The default free tier Client ID is: `c4ce16c7`
4. Add it to the app settings (or use the default)

### ⚙️ Configuration

The application supports multiple configuration methods:

1. **In-App Settings**: Use the Settings modal (gear icon) to add API keys (saved to localStorage)
2. **Local Configuration**: Edit `config.json` directly in the repository
3. **GitHub Configuration**: Store your config in a GitHub repository and fetch it dynamically

#### config.json Structure

```json
{
  "api": {
    "jamendo": {
      "clientId": "c4ce16c7"
    },
    "youtube": {
      "apiKey": "your-youtube-api-key"
    },
    "spotify": {
      "clientId": "your-spotify-client-id",
      "clientSecret": "your-spotify-client-secret"
    },
    "audius": {
      "enabled": true
    }
  },
  "app": {
    "name": "Spotfuck",
    "version": "3.0.0",
    "defaultSource": "audius",
    "pin": "1412"
  },
  "features": {
    "downloads": true,
    "library": {
      "likedSongs": true,
      "queue": true
    },
    "player": {
      "shuffle": true,
      "repeat": true,
      "volumeControl": true
    }
  }
}
```

## 📁 Project Structure

```
ReSpotFuck-Web/
├── index.html              # Landing page with modern design
├── owo.html                # Main application page (redesigned)
├── SignIn.html             # Sign-in/access request page (redesigned)
├── api-handler.js          # API integration logic (updated)
├── ui-handler.js           # UI and player controls
├── config.json             # Configuration file (not in git)
├── config.json.template    # Configuration template
├── test.html               # API testing suite
└── README.md               # This file
```

## 📖 Usage

### Basic Usage

1. **Search Music**: Use the search bar to find tracks across all platforms
2. **Switch Sources**: Click on source tabs (Audius, YouTube, Spotify, Jamendo) to search specific platforms
3. **Play Tracks**: Click on any track to start playback
4. **Player Controls**: Use the bottom player bar to control playback
5. **Like Songs**: Click the heart icon to add tracks to your liked songs
6. **Add to Queue**: Click the list icon to add tracks to your queue
7. **Navigate Library**: Use the sidebar to access Home, Liked Songs, Recently Played, and Queue

### Keyboard Shortcuts

- `Space`: Play/Pause
- `Shift + →`: Next track
- `Shift + ←`: Previous track
- `Shift + S`: Toggle shuffle
- `Shift + R`: Toggle repeat

### 🔒 Security Features

- **PIN Protection**: Default PIN is `1412` (configurable in config.json)
- **Dev Tools Detection**: Detects when developer tools are opened
- **Console Clearing**: Periodically clears the browser console
- **Right-Click Disable**: Prevents context menu access
- **Text Selection Disable**: Prevents text selection
- **Drag-Drop Disable**: Prevents drag and drop operations

## 🎵 API Details

### Audius (FREE)
- **Cost**: Completely FREE
- **API Key**: Not required
- **Features**: Full streaming, search, artist profiles
- **Limitations**: None
- **Status**: Always available as fallback

### YouTube Data API v3
- **Cost**: Free tier available (10,000 units/day)
- **API Key**: Required
- **Features**: Video streaming, search, playlists
- **Limitations**: Quota limits, preview-only for some tracks
- **Setup**: Requires Google Cloud project

### Spotify Web API
- **Cost**: Free for non-commercial use
- **API Key**: Client ID and Secret required
- **Features**: 30-second previews, search, artist info
- **Limitations**: Preview-only (no full tracks)
- **Setup**: Requires Spotify Developer account

### Jamendo API
- **Cost**: Free tier available
- **API Key**: Client ID required (default: c4ce16c7)
- **Features**: Full streaming, search, artist profiles
- **Limitations**: Limited catalog compared to major platforms
- **Setup**: Requires Jamendo Developer account

## 🎉 What's New in v3.0.0

### Complete Redesign
- **Modern AMOLED Red Theme**: Beautiful dark interface with CSS custom properties
- **Improved Layout**: Sidebar navigation with Home, Liked Songs, Recently Played, Queue
- **Enhanced Player**: Volume control with mute toggle, better progress bar
- **Responsive Design**: Optimized for mobile devices with collapsible sidebar
- **Better Typography**: Inter font with improved readability

### Enhanced Features
- **Smart Artwork Fallback**: Auto-generated avatars when artwork is unavailable
- **Improved Search**: Better search UI with dedicated search button
- **Source Badges**: Visual indicators for free sources (Audius)
- **Better Modals**: Improved PIN modal, disclaimer, and settings modals
- **Enhanced Security**: Improved dev tools detection and console clearing
- **Persistent Queue**: Queue now saves to localStorage

### API Improvements
- **Better Error Handling**: Improved error messages and retry functionality
- **Default Jamendo Key**: Pre-configured with free tier client ID
- **Improved Audius Integration**: Better track formatting and artwork handling
- **Timeout Protection**: 15-second timeout for all API requests

## 🛠️ Troubleshooting

### Music Not Playing
- Check if API keys are configured in Settings
- Try switching to Audius (works without API keys)
- Check your internet connection
- Clear browser cache and localStorage

### API Errors
- Verify API keys are correct
- Check API quota limits (especially YouTube)
- Try the built-in test suite (test.html)
- Check browser console for error messages

### PIN Not Working
- Default PIN is `1412`
- Check config.json for custom PIN
- Clear localStorage and try again

## ⚖️ Legal Notice

This application uses legal APIs to stream music. We do not host any copyrighted content. All music is streamed directly from the respective platforms' APIs. Users are responsible for complying with the terms of service of the respective music platforms.

## 📜 DMCA Notice

This application is for educational and personal use only. It does not host any copyrighted content. All music is provided through legal APIs from third-party services. By using this application, you agree to comply with all applicable laws and the terms of service of the respective music platforms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 💬 Support

For support, please open an issue on GitHub or join our community Discord/Telegram.

## 🙏 Acknowledgments

- [Audius](https://audius.co/) - Free, decentralized music streaming
- [YouTube](https://youtube.com/) - Video and music platform
- [Spotify](https://spotify.com/) - Music streaming service
- [Jamendo](https://jamendo.com/) - Free music platform
