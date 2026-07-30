# SpotFuck-Web

SpotFuck-Web is an open-source music streaming web application that integrates with multiple music APIs to provide a unified listening experience. The app fetches configuration from a GitHub repository, making it easy to manage API keys and settings across instances.

**Live Demo:** https://spotfuck.netlify.app/

## Features

- **Multi-Platform Integration**: Stream music from YouTube, Spotify, Jamendo, and Audius
- **GitHub-Based Configuration**: Automatically fetch API keys and settings from a `config.json` file in your GitHub repository
- **Simple Web Player UI**: Clean, intuitive interface for music playback
- **Dynamic Configuration**: Change API keys and settings without redeploying the app
- **Fallback Support**: Manual API key entry if repository fetch fails

## Supported Music Services

- **YouTube**: Full YouTube Music library access via YouTube Data API v3
- **Spotify**: Spotify integration with OAuth authentication
- **Jamendo**: Free tier access to Jamendo's music catalog
- **Audius**: Decentralized music streaming platform

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub account (for hosting config.json)
- API keys for desired music services (see [Setup Guide](SETUP_GUIDE.md))

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ReSpotF-ck/ReSpotFuck-Web.git
   cd ReSpotFuck-Web
   ```

2. **Open the application**
   - Simply open `owo.html` in your web browser
   - Or deploy to Netlify/Vercel for hosting

3. **Configure API keys**
   - The app is pre-configured to fetch from: `https://github.com/ReSpotF-ck/ReSpotFuck-Web`
   - Click the Settings button (gear icon) to change the repository URL
   - Add your API keys to `config.json` in your GitHub repository

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
├── index.html         # Landing page
├── config.json        # Example configuration file
├── SETUP_GUIDE.md     # Detailed setup instructions
└── README.md          # This file
```

## Contributing

Pull requests are welcome! Please feel free to submit issues or enhancement requests.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the [Setup Guide](SETUP_GUIDE.md) for troubleshooting
- Verify your API keys are valid and have proper permissions
- Check browser console for error messages
