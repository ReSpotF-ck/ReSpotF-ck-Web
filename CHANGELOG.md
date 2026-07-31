# Changelog

All notable changes to Spotfuck will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-31

### Added
- Comprehensive API test suite integration with api-handler.js
- Feature flags configuration in config.json
- Navigation and pages documentation in SETUP_GUIDE.md
- Detailed troubleshooting section with common issues
- Test suite documentation and usage instructions
- GitHub repository link in Sign In page
- Direct app access button in Sign In page

### Changed
- Updated index.html to redirect to main app instead of showing "Access Denied"
- Enhanced config.json with app settings and feature flags
- Improved test.html to use centralized API handler functions
- Updated 404.html to redirect to owo.html instead of external URL
- Streamlined navigation flow across all pages
- Enhanced error handling and user feedback

### Fixed
- Removed invalid markdown code blocks from SignIn.html
- Fixed API test functions to properly use api-handler.js
- Corrected redirect URLs in 404.html and index.html
- Fixed duplicate test functions in test.html
- Improved credential management in test suite

### Documentation
- Updated README.md with v1.2.0 features and fixes
- Enhanced SETUP_GUIDE.md with comprehensive troubleshooting
- Added navigation and pages documentation
- Updated configuration examples with new structure
- Added API testing instructions

## [1.1.0] - Previous Release

### Added
- Spotify mobile-style UI with AMOLED red theme
- Multi-platform API integration (Audius, YouTube, Spotify, Jamendo)
- GitHub-based configuration fetching
- Settings export/import functionality
- Download capability for Audius and Jamendo tracks
- PIN-based access control (1412)
- DMCA disclaimer system
- Bottom player bar with full controls
- Liked songs library
- Queue management
- Keyboard shortcuts
- Enhanced album art fetching

### Features
- Full-featured music player with progress bar
- Volume control with mute toggle
- Shuffle and repeat functionality
- Search filters (tracks, artists, albums)
- Trending tags and search history
- Theme toggle (dark/light mode)
- Responsive design for all screen sizes

## [1.0.0] - Initial Release

### Added
- Initial music streaming application
- Basic Audius integration (free)
- Simple player controls
- Search functionality
- Mobile-responsive design
- Dark theme with red accents

[1.2.0]: https://github.com/ReSpotF-ck/ReSpotFuck-Web/releases/tag/v1.2.0
[1.1.0]: https://github.com/ReSpotF-ck/ReSpotFuck-Web/releases/tag/v1.1.0
[1.0.0]: https://github.com/ReSpotF-ck/ReSpotFuck-Web/releases/tag/v1.0.0