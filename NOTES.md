# Development Notes

This file contains development notes, architectural decisions, and important information for maintaining and extending the Spotfuck music player.

## Architecture Overview

### File Structure

```
ReSpotFuck-Web/
├── owo.html           # Main application (single-page app with embedded JS)
├── api-handler.js     # Centralized API logic (separated for maintainability)
├── index.html         # Landing page with auto-redirect
├── SignIn.html        # Access control and authentication
├── 404.html           # Custom error page
├── config.json        # Application configuration
├── test.html          # API testing suite
├── README.md          # User documentation
├── SETUP_GUIDE.md     # Setup instructions
├── CHANGELOG.md       # Version history
├── CONTRIBUTING.md    # Contribution guidelines
├── LICENSE            # MIT License
└── .gitignore         # Git ignore rules
```

### Architecture Pattern

- **Single Page Application**: Main app logic is embedded in owo.html
- **API Handler Pattern**: All API calls centralized in api-handler.js
- **Configuration-Driven**: Behavior controlled via config.json
- **GitHub Integration**: Automatic config fetching from repositories
- **Client-Side Only**: No backend required, all logic in browser

## Key Technical Decisions

### Single File vs. Separation

**Decision**: Keep main app as single HTML file (owo.html) but separate API logic.

**Rationale**:
- Easy deployment (just upload HTML file)
- Simple for users to run locally
- API handler separated for testing and reusability
- Reduces complexity for non-technical users

### API Handler Architecture

**Design**: All API functions exposed to window object for direct access.

**Benefits**:
- Easy testing via test.html
- Can be called from console for debugging
- Consistent interface across all APIs
- Centralized credential management

### Configuration Strategy

**Approach**: GitHub-based configuration with localStorage fallback.

**Flow**:
1. Check localStorage for API keys
2. If repo URL set, fetch config.json from GitHub
3. Merge GitHub config with localStorage (localStorage takes precedence)
4. Save merged config to localStorage

**Security**: Warning about public repositories exposing API keys.

### PIN and Disclaimer System

**Design**: Required on every page load, never saved to localStorage.

**Rationale**:
- Privacy protection (no authentication persistence)
- Legal compliance (DMCA disclaimer)
- Security (repeated verification)
- User awareness (reminds of terms)

## API Integration Details

### Audius (FREE)

**Endpoint**: `https://api.audius.co` (discovery API)

**Flow**:
1. Fetch available hosts from discovery API
2. Select first available host
3. Make search requests to selected host
4. Format response with artwork URLs

**No Authentication Required**: Works out of the box.

**Timeout**: 15 seconds for all requests.

### YouTube

**Authentication**: API Key required.

**Endpoint**: `https://www.googleapis.com/youtube/v3/search`

**Limitations**:
- Cannot download tracks (ToS)
- Only audio playback via embed player
- API quota limits apply

**Workaround**: Use Audius for full functionality.

### Spotify

**Authentication**: OAuth 2.0 (Client Credentials Flow).

**Endpoint**: `https://api.spotify.com/v1/search`

**Limitations**:
- Only 30-second previews
- Requires token refresh
- Rate limiting applies

**Use Case**: Discovery and preview, not full playback.

### Jamendo

**Authentication**: Client ID required (free tier available).

**Endpoint**: `https://api.jamendo.com/v3.0/tracks/`

**Benefits**:
- Full track playback
- Download capability
- Free tier available

**Default ID**: `c4ce16c7` (free tier).

## State Management

### localStorage Usage

**Stored Data**:
- API credentials (jamendoClientId, youtubeApiKey, spotifyClientId, spotifyClientSecret)
- Repository URL (repoUrl)
- Theme preference (theme)
- Search history (searchHistory)
- Liked songs (likedSongs)
- Queue (queue)
- Downloaded tracks metadata (downloadedTracks)

**Excluded Data**:
- PIN entry (never stored)
- Disclaimer acceptance (never stored)
- Current playback state (transient)

### State Flow

1. **Initialization**: Load from localStorage
2. **API Handler Init**: Fetch config from GitHub if repo URL set
3. **Merge**: GitHub config + localStorage (localStorage wins)
4. **Runtime**: Update localStorage on any changes
5. **Cleanup**: Clear on logout or reset

## Performance Considerations

### Image Loading

**Strategy**: Progressive enhancement with fallbacks.

**Priority Order**:
1. High-resolution artwork (1500x1500)
2. Medium resolution (480x480)
3. Low resolution (150x150)
4. Generated avatar (ui-avatars.com)
5. Placeholder image

### API Timeout

**Default**: 15 seconds for all API calls.

**Rationale**: Balance between reliability and user experience.

### Debouncing

**Implemented**: Search input debouncing (planned for future).

**Current**: Immediate search on button press.

## Security Considerations

### API Key Storage

**Current**: localStorage (not secure for production).

**Recommendations**:
- Use environment variables for production
- Consider backend proxy for API calls
- Implement encryption for sensitive data
- Use private GitHub repositories for config

### Content Security

**CSP Headers**: Defined in meta tags.

**Current Policy**: Allow necessary domains for APIs and CDNs.

**Recommendation**: Review and tighten for production.

### Input Validation

**Current**: Basic validation in forms.

**Recommendations**:
- Sanitize all user inputs
- Validate API responses
- Implement rate limiting
- Add CSRF protection if backend added

## Browser Compatibility

### Target Browsers

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Features Used

- ES6+ JavaScript
- CSS Grid and Flexbox
- LocalStorage API
- Fetch API
- Audio API
- HTML5 Audio/Video

### Fallbacks

**Needed**: Polyfills for older browsers (not currently implemented).

**Decision**: Focus on modern browsers for simplicity.

## Future Enhancements

### Planned Features

1. **Backend Integration**: Add optional backend for:
   - Secure API key storage
   - User authentication
   - Playlist syncing
   - Usage analytics

2. **Offline Support**: Service Worker for:
   - Offline playback
   - Cached assets
   - Background sync

3. **Enhanced Player**:
   - Lyrics display
   - Crossfade
   - Equalizer
   - Visualizations

4. **Social Features**:
   - Playlist sharing
   - User profiles
   - Follow system
   - Comments

5. **API Expansions**:
   - SoundCloud integration
   - Bandcamp integration
   - Apple Music integration
   - Local file support

### Technical Debt

1. **Code Organization**: Consider modularizing owo.html
2. **Error Handling**: Implement comprehensive error boundaries
3. **Testing**: Add automated testing framework
4. **Documentation**: API documentation for each integration
5. **Performance**: Implement lazy loading for images

## Troubleshooting Guide

### Common Issues

**API Calls Failing**:
1. Check browser console for errors
2. Verify API keys are valid
3. Test with test.html
4. Check network connectivity
5. Verify API quota not exceeded

**Audio Not Playing**:
1. Check browser audio permissions
2. Verify audio URL is accessible
3. Test different browser
4. Check if track is region-restricted
5. Verify audio format support

**Config Not Loading**:
1. Check GitHub repository URL format
2. Verify config.json exists in main branch
3. Check GitHub raw content accessibility
4. Verify JSON syntax is valid
5. Check browser console for CORS errors

**localStorage Issues**:
1. Verify localStorage is enabled
2. Check browser privacy settings
3. Clear browser data and retry
4. Verify available storage space
5. Check for quota exceeded errors

### Debug Mode

**Enable Detailed Logging**:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Reload page
```

**API Handler Debug**:
```javascript
// Test individual API functions
window.searchAudius('test query');
window.searchJamendo('rock');
window.hasCredentialsForSource('youtube');
```

## Deployment Considerations

### Static Hosting

**Recommended**: Netlify, Vercel, GitHub Pages.

**Requirements**:
- Static file hosting
- HTTPS support
- No server-side processing needed

### Configuration Management

**Development**: Use config.json.template
**Production**: Use environment variables or secure backend
**Distribution**: Include placeholder config.json

### Performance Optimization

**Before Deployment**:
1. Minify CSS and JavaScript
2. Optimize images
3. Enable compression
4. Implement caching headers
5. Use CDN for static assets

## API Rate Limits

### Current Limits

- **Audius**: No documented limits
- **YouTube**: 10,000 units/day (free tier)
- **Spotify**: Rate-limited based on token
- **Jamendo**: Reasonable usage allowed

### Mitigation Strategies

1. Implement request queuing
2. Add retry logic with exponential backoff
3. Cache API responses when possible
4. Use pagination for large result sets
5. Monitor usage and implement throttling

## Internationalization

### Current Status

**Language**: English only
**Time Format**: Local browser settings
**Number Format**: Local browser settings

### Future i18n

**Considerations**:
- String externalization
- RTL language support
- Date/time localization
- Currency formatting (if payments added)
- Cultural considerations

## Accessibility

### Current Implementation

**Strengths**:
- Semantic HTML
- Keyboard navigation
- ARIA labels on controls
- Focus management

**Improvements Needed**:
- Screen reader testing
- High contrast mode
- Reduced motion support
- Alt text improvements
- Focus indicators

## Testing Strategy

### Current Testing

**Manual Testing**:
- Browser compatibility testing
- API integration testing via test.html
- Cross-device testing
- User acceptance testing

### Future Testing

**Automated Testing**:
- Unit tests for API handler
- Integration tests for flows
- E2E tests with Playwright/Cypress
- Performance testing
- Accessibility testing

## Monitoring and Analytics

### Current Status

**No Analytics**: Privacy-focused design.

### Future Monitoring

**Consider Adding**:
- Error tracking (Sentry)
- Performance monitoring
- Usage analytics (opt-in)
- API usage monitoring
- Uptime monitoring

## Legal and Compliance

### DMCA Compliance

**Current**: Disclaimer on every app load.

**Additional Considerations**:
- Terms of Service
- Privacy Policy
- Copyright notice
- Attribution requirements
- User content policy

### Data Privacy

**Current Data Collection**:
- None (privacy-focused)

**If Analytics Added**:
- Clear privacy policy
- Opt-in consent
- Data minimization
- Right to deletion
- GDPR compliance

## Contact and Support

### Development Team

**Maintainer**: ReSpotF-ck
**Repository**: https://github.com/ReSpotF-ck/ReSpotFuck-Web
**Issues**: GitHub Issues

### Community

**Discussions**: GitHub Discussions
**Documentation**: README.md and SETUP_GUIDE.md
**Testing**: Built-in test suite

---

**Last Updated**: 2026-07-31
**Version**: 1.2.0