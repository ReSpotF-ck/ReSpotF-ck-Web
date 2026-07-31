# Setup Guide - Spotfuck

This guide explains how to set up and use the Spotfuck music streaming application.

## Overview

Spotfuck is a music streaming app with a Spotify mobile-inspired design and AMOLED red theme. It integrates with multiple music APIs and can fetch configuration from a GitHub repository.

**Default Repository:** https://github.com/ReSpotF-ck/ReSpotFuck-Web

## Access Control

### PIN Entry (Privacy)
- **PIN**: 1412
- Required on **every page load** for privacy
- No authentication is saved to localStorage

### DMCA Disclaimer (Legal Compliance)
- Shown **every time** after entering PIN
- Must be accepted to access the app
- No acceptance is saved to localStorage

## Quick Start

1. Open `owo.html` in your browser
2. Enter PIN: `1412`
3. Accept the DMCA disclaimer
4. Select a music source (Audius is FREE and selected by default)
5. Search and play music
6. Use the bottom player controls for playback
7. Like songs to add them to your library
8. Add tracks to queue for later playback

## Player Features

### Bottom Player Controls
- **Play/Pause**: Toggle playback with center button
- **Previous/Next**: Skip tracks with arrow buttons
- **Shuffle**: Randomize playback order (S key)
- **Repeat**: Loop current track (R key)
- **Like**: Add track to liked songs library (L key)
- **Volume**: Adjust volume with slider or mute button (M key)

### Progress Bar
- Located above the bottom player
- Shows current time and total duration
- Drag to seek to any position in the track
- Works with all music sources

### Liked Songs Library
- Click the heart icon in bottom player to like current track
- Access liked songs via "Liked Songs" button in source selector
- Liked songs persist in localStorage
- Remove songs by clicking the heart icon again

### Queue Management
- Click the list icon on any track to add to queue
- Queue persists in localStorage
- Play next in queue functionality available

### Keyboard Shortcuts
- **Space**: Play/Pause
- **Arrow Left/Right**: Seek 10 seconds
- **Shift + Arrow Left/Right**: Previous/Next track
- **Arrow Up/Down**: Volume control
- **S**: Toggle shuffle
- **R**: Toggle repeat
- **L**: Toggle like
- **M**: Mute/Unmute

### Enhanced Album Art
- High-resolution artwork fetching for all sources
- Multiple resolution fallbacks for best quality
- Automatic fallback to generated avatars when no artwork available

## Music Sources

### Audius (FREE - Recommended)
- No API key required
- Works immediately
- Download tracks locally

### YouTube (Requires API Key)
- Get API key from console.cloud.google.com
- Enable YouTube Data API v3
- Cannot download tracks (terms of service)

### Spotify (Requires Client ID & Secret)
- Get credentials from developer.spotify.com
- Client ID: Public identifier for your app
- Client Secret: Secret key for authentication
- Only 30-second previews available
- Cannot download tracks

### Jamendo (Requires Client ID)
- Get Client ID from jamendo.com
- Free tier available
- Download tracks locally

## GitHub Repository Configuration

The app can automatically fetch API keys and configuration from a `config.json` file stored in a GitHub repository.

### Step 1: Create or Update config.json

Create a `config.json` file in your GitHub repository with the following structure:

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

### Getting API Keys

#### YouTube API Key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the key to your `config.json`

#### Spotify Credentials
1. Go to [developer.spotify.com](https://developer.spotify.com)
2. Create an app
3. Get your Client ID and Client Secret
4. Add them to your `config.json`

#### Jamendo Client ID
- The default client ID `c4ce16c7` is for the free tier
- You can use this as-is or get your own from [jamendo.com](https://jamendo.com)

### Step 2: Upload config.json to Your Repository

1. Make sure your `config.json` file is in the **main** branch of your repository
2. The file should be at the root level: `config.json`
3. Commit and push the file to GitHub

### Step 3: Configure the App

1. Open the Spotfuck app (`owo.html`)
2. Enter PIN: `1412`
3. Accept the DMCA disclaimer
4. The app is **pre-configured** with the default repository: `https://github.com/ReSpotF-ck/ReSpotFuck-Web`
5. If you want to use a different repository:
   - Click the **Settings** button (gear icon) in the top right
   - Enter your GitHub repository URL in the "Repository URL" field
   - Format: `https://github.com/your-username/your-repo`
   - Example: `https://github.com/johndoe/spotfuck-config`
   - Click **Save Settings**

The app will automatically:
- Fetch the `config.json` from your repository
- Load all API keys and configuration
- Save the repository URL for future use

### Step 4: Verification

After saving settings:
1. Check the browser console (F12) for success messages
2. You should see: "Configuration loaded successfully"
3. The app will now use the API keys from your repository

## Downloading Tracks

### Supported Sources
- **Audius**: Can download tracks locally
- **Jamendo**: Can download tracks locally
- **YouTube**: Cannot download (terms of service)
- **Spotify**: Cannot download (only 30-second previews)

### How to Download
1. Search for tracks
2. Click the red download button next to the track duration
3. The track will download as an MP3 file
4. Track metadata is saved to localStorage

### Important Warning
⚠️ **If you clear website data or cache, saved songs will be deleted.**
- Downloaded audio files are saved to your device
- Track metadata is saved in localStorage
- Clearing browser data will remove the metadata but not the downloaded files

## Fallback Behavior

If the repository fetch fails:
- The app will fall back to manually entered API keys
- You can still enter keys directly in the Settings modal
- The app will show an alert if the fetch fails

## Security Notes

⚠️ **Important Security Considerations:**

- **Public Repositories**: If your repository is public, your API keys will be visible to anyone
- **Private Repositories**: The app uses GitHub's raw content URL which may not work with private repos
- **Recommendation**: Use a separate private repository for config, or use environment variables for production

## Troubleshooting

### "Failed to load configuration from repository"
- Check that the repository URL is correct
- Ensure `config.json` exists in the main branch
- Verify the JSON format is valid (use a JSON validator)
- Check browser console for detailed error messages

### API keys not working
- Verify the keys are correct in your `config.json`
- Check that the keys have the required permissions
- Some APIs (like Spotify) may require additional setup

### Config not updating
- The app fetches config on load and when you save settings
- Clear browser cache if changes don't appear
- Check that the repository URL is saved in localStorage

## Example Repository Structure

```
your-repo/
├── config.json          # API configuration
├── api-handler.js      # API handler (optional - if you want to customize API logic)
├── README.md           # Documentation
└── .gitignore          # (optional)
```

## Advanced Usage

### Multiple Environments
You can create different config files for different environments:
- `config.json` - Production
- `config-dev.json` - Development
- `config-test.json` - Testing

Modify the `fetchConfigFromRepo` function in `owo.html` to fetch different files based on environment.

### Custom Branch
If your config is on a different branch, modify the fetch URL in the code:
```javascript
const configUrl = `https://raw.githubusercontent.com/${owner}/${repo}/your-branch/config.json`;
```

## Support

For issues or questions:
- Check the browser console for error messages
- Verify your repository and config.json setup
- Ensure API keys are valid and have proper permissions
