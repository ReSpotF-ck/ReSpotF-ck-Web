# Setup Guide - Repository Configuration

This guide explains how to set up the Spotfuck app to fetch API configuration from a GitHub repository.

## Overview

The app can now automatically fetch API keys and configuration from a `config.json` file stored in a GitHub repository. This makes it easy to manage configuration across multiple instances or share settings with others.

**Default Repository:** https://github.com/ReSpotF-ck/ReSpotFuck-Web

The app is pre-configured to use this repository. You can change it in Settings if needed.

## Step 1: Create or Update config.json

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

## Step 2: Upload config.json to Your Repository

1. Make sure your `config.json` file is in the **main** branch of your repository
2. The file should be at the root level: `config.json`
3. Commit and push the file to GitHub

## Step 3: Configure the App

1. Open the Spotfuck app (`owo.html`)
2. The app is **pre-configured** with the default repository: `https://github.com/ReSpotF-ck/ReSpotFuck-Web`
3. If you want to use a different repository:
   - Click the **Settings** button (gear icon) in the top right
   - Enter your GitHub repository URL in the "Repository URL" field
   - Format: `https://github.com/your-username/your-repo`
   - Example: `https://github.com/johndoe/spotfuck-config`
   - Click **Save Settings**

The app will automatically:
- Fetch the `config.json` from your repository
- Load all API keys and configuration
- Save the repository URL for future use

## Step 4: Verification

After saving settings:
1. Check the browser console (F12) for success messages
2. You should see: "Configuration loaded successfully"
3. The app will now use the API keys from your repository

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
