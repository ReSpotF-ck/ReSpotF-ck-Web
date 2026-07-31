# Contributing to Spotfuck

Thank you for your interest in contributing to Spotfuck! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of HTML, CSS, and JavaScript
- GitHub account
- Text editor or IDE

### Setting Up Development Environment

1. **Fork the repository**
   - Click the "Fork" button on the GitHub repository page
   - Clone your fork locally:
     ```bash
     git clone https://github.com/YOUR_USERNAME/ReSpotFuck-Web.git
     cd ReSpotFuck-Web
     ```

2. **Open the project**
   - Simply open `index.html` or `owo.html` in your browser
   - No build process or dependencies required

3. **Test your changes**
   - Make your changes to the files
   - Refresh your browser to see the changes
   - Use `test.html` to verify API integrations

## Development Guidelines

### Code Style

- **HTML**: Use semantic HTML5 elements
- **CSS**: Follow existing naming conventions and structure
- **JavaScript**: Use modern ES6+ syntax
- **Comments**: Add clear comments for complex logic
- **Indentation**: Use consistent indentation (2 spaces or 4 spaces)

### File Structure

```
ReSpotFuck-Web/
├── owo.html           # Main application (keep this as the primary app file)
├── api-handler.js     # API logic (keep API functions here)
├── index.html         # Landing page
├── SignIn.html        # Sign in/access page
├── 404.html           # Error page
├── config.json        # Configuration (never commit real API keys)
├── test.html          # API test suite
├── README.md          # Project documentation
├── SETUP_GUIDE.md     # Setup instructions
├── CHANGELOG.md       # Version history
├── CONTRIBUTING.md    # This file
└── LICENSE            # License file
```

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit the necessary files
   - Test thoroughly in your browser
   - Use the test suite to verify API integrations

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Provide a clear description of your changes

## Types of Contributions

### Bug Fixes
- Describe the bug clearly
- Explain how to reproduce it
- Provide steps to test the fix
- Update relevant documentation if needed

### New Features
- Describe the feature purpose
- Explain how it benefits users
- Include usage examples
- Update documentation (README, SETUP_GUIDE)
- Add tests if applicable

### Documentation
- Fix typos or grammar
- Improve clarity and structure
- Add missing information
- Update screenshots if needed
- Keep examples accurate

### Performance Improvements
- Benchmark before and after
- Explain the optimization approach
- Ensure no functionality is broken
- Document any API changes

## API Integration Guidelines

When adding or modifying API integrations:

1. **Update api-handler.js**
   - Add new API functions following existing patterns
   - Include proper error handling
   - Add timeout protection
   - Format responses consistently

2. **Update test.html**
   - Add test functions for new APIs
   - Include error case testing
   - Document test requirements

3. **Update config.json**
   - Add configuration options for new APIs
   - Include clear comments
   - Set sensible defaults

4. **Update documentation**
   - Document API requirements
   - Add setup instructions
   - Include troubleshooting tips

## Security Considerations

### API Keys
- **NEVER** commit real API keys to the repository
- Use placeholder values in config.json
- Document where users should add their keys
- Consider environment variables for production

### User Data
- Be careful with localStorage usage
- Don't store sensitive information
- Clear data when appropriate
- Inform users about data storage

### Content Security
- Validate all user inputs
- Sanitize data before display
- Use secure API calls (HTTPS)
- Implement proper error handling

## Testing Guidelines

### Manual Testing
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different screen sizes (mobile, tablet, desktop)
- Test with and without API keys
- Test error scenarios

### API Testing
- Use the built-in test suite (`test.html`)
- Test each API integration individually
- Test with invalid credentials
- Test with network issues

### User Testing
- Get feedback from real users
- Test on different devices
- Consider accessibility
- Test with slow connections

## Documentation Standards

### README.md
- Keep it up-to-date with latest features
- Include clear setup instructions
- Provide usage examples
- List requirements and dependencies
- Include troubleshooting section

### SETUP_GUIDE.md
- Provide detailed step-by-step instructions
- Include screenshots where helpful
- Cover common issues and solutions
- Keep configuration examples current

### Code Comments
- Comment complex logic
- Explain non-obvious implementations
- Document API integrations
- Include usage examples for functions

## Pull Request Guidelines

### PR Title
- Use clear, descriptive titles
- Follow conventional commit format:
  - `feat: add new feature`
  - `fix: resolve bug description`
  - `docs: update documentation`
  - `refactor: improve code structure`

### PR Description
- Explain the purpose of the PR
- List changes made
- Include screenshots for UI changes
- Document any breaking changes
- Link to related issues

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] Added tests (if applicable)
- [ ] All tests pass
- [ ] No console errors
- [ ] Works in multiple browsers

## Getting Help

### Questions
- Check existing documentation first
- Search for similar issues in the repository
- Ask questions in GitHub Discussions
- Be specific and provide context

### Issues
- Use GitHub issue tracker
- Provide clear reproduction steps
- Include browser and OS information
- Share relevant error messages
- Be patient with responses

## Code of Conduct

### Be Respectful
- Treat all contributors with respect
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Avoid personal attacks

### Be Collaborative
- Work together on solutions
- Consider different perspectives
- Be open to suggestions
- Acknowledge others' contributions

### Be Professional
- Keep discussions focused
- Use clear and professional language
- Respect time and effort of others
- Follow project guidelines

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation for major features

## License

By contributing to Spotfuck, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Spotfuck! Your help is greatly appreciated.