# Spotfuck

Spotfuck is an open-source music streaming web application with a Spotify mobile-inspired design and AMOLED red theme. It integrates with multiple music APIs to provide a unified listening experience. The app fetches configuration from a GitHub repository, making it easy to manage API keys and settings across instances.

**Live Demo:** https://spotfuck.netlify.app/

## Features

- **Spotify Mobile-Style UI**: Clean, modern interface inspired by Spotify's mobile app
- **AMOLED Red Theme**: Pure black background with red accents for true AMOLED displays
- **Responsive Design**: Optimized for mobile, tablet, and desktop screens
- **Full-Featured Player**: Progress bar with seek, volume control, shuffle/repeat, and time display
- **Liked Songs Library**: Save your favorite tracks with persistent storage
- **Queue Management**: Add tracks to queue for later playback
- **Keyboard Shortcuts**: Full keyboard control for power users (Space, arrows, S/R/L/M keys)
- **Bottom Player Bar**: Fixed bottom player with album art, controls, and track info
- **Multi-Platform Integration**: Stream music from YouTube, Spotify, Jamendo, and Audius
- **Enhanced Album Art**: High-resolution artwork fetching with multiple fallbacks
- **GitHub-Based Configuration**: Automatically fetch API keys and settings from a `config.json` file in your GitHub repository
- **Dynamic Configuration**: Change API keys and settings without redeploying the app
- **Fallback Support**: Manual API key entry if repository fetch fails
- **Free Music Option**: Audius works without API keys - no setup required
- **Download/Save Tracks**: Download Audius and Jamendo tracks locally (with cache warning)
- **Privacy Protection**: PIN required on every page load (PIN: 1412)
- **Legal Compliance**: DMCA disclaimer shown on every visit
- **Settings Export/Import**: Export settings as TXT, JSON, or screenshot; import from TXT or JSON files

## Supported Music Services

- **Audius** (FREE): Decentralized music streaming platform - works without API keys
- **YouTube**: Full YouTube Music library access via YouTube Data API v3 (requires API key)
- **Spotify**: Spotify integration with OAuth authentication (requires Client ID & Secret)
- **Jamendo**: Free tier access to Jamendo's music catalog (requires Client ID)

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub account (for hosting config.json)
- API keys for desired music services (except Audius - it's free!)
- See [Setup Guide](SETUP_GUIDE.md) for detailed instructions

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ReSpotF-ck/ReSpotFuck-Web.git
   cd ReSpotFuck-Web
   ```

2. **Open the application**
   - Simply open `owo.html` in your web browser
   - Or deploy to Netlify/Vercel for hosting

3. **Start listening**
   - The app defaults to Audius (FREE) - no setup required!
   - Enter PIN: `1412` to unlock
   - Accept the disclaimer
   - Search and play music immediately

4. **Configure additional sources (optional)**
   - Click the Settings button (gear icon)
   - The app is pre-configured to fetch from: `https://github.com/ReSpotF-ck/ReSpotFuck-Web`
   - Add your API keys to `config.json` in your GitHub repository
   - Or enter API keys directly in Settings

For detailed setup instructions, see the [Setup Guide](SETUP_GUIDE.md).

## Getting API Keys

### YouTube API Key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project and enable YouTube Data API v3
3. Create credentials (API Key)

### Spotify Credentials
1. Go to [developer.spotify.com](https://developer.spotify.com)
2. Create an app to get Client ID and Client Secret

### Jamendo Client ID
- Use the default free tier ID or get your own from [jamendo.com](https://jamendo.com)

## Configuration

Create a `config.json` file in your GitHub repository:

```json
{
  "api": {
    "jamendo": {
      "clientId": "c4ce16c7"
    },
    "youtube": {
      "apiKey": "YOUR_YOUTUBE_API_KEY"
    },
    "spotify": {
      "clientId": "YOUR_SPOTIFY_CLIENT_ID",
      "clientSecret": "YOUR_SPOTIFY_CLIENT_SECRET"
    },
    "audius": {
      "enabled": true
    }
  },
  "app": {
    "name": "Spotfuck",
    "version": "1.0.0"
  }
}
```

## Security Notes

⚠️ **Important**: If using a public GitHub repository, your API keys will be visible to anyone. Consider:
- Using a private repository (may require additional setup)
- Using environment variables for production deployments
- Rotating keys regularly if exposed

## Project Structure

```
ReSpotFuck-Web/
├── owo.html           # Main application
├── api-handler.js     # API handler - separates API logic from UI
├── index.html         # Landing page
├── 404.html           # 404 error page
├── config.json        # Configuration file for API keys
├── SETUP_GUIDE.md     # Detailed setup instructions
├── README.md          # This file
└── test.html          # API test suite
```

## Recent Updates

- **Fixed API Handler**: Functions now properly exposed to browser window object for direct access
- **Improved YouTube Integration**: Better error handling and API readiness checks
- **Enhanced Initialization**: Automatic config loading from GitHub repository on startup
- **Better Error Messages**: More descriptive error messages for API failures

## Contributing

Pull requests are welcome! Please feel free to submit issues or enhancement requests.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the [Setup Guide](SETUP_GUIDE.md) for troubleshooting
- Verify your API keys are valid and have proper permissions
- Check browser console for error messages
