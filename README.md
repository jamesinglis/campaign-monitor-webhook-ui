# Campaign Monitor Webhook Management

A modern web application for managing Campaign Monitor webhook subscriptions with an intuitive interface and smart caching.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Vue.js](https://img.shields.io/badge/Vue.js-3.3-4FC08D?logo=vue.js)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

This single-page application (SPA) provides a visual interface for managing webhook subscriptions across Campaign Monitor subscriber lists. It supports both account-level and client-level API keys, features smart caching to minimize API calls, and ensures secure credential handling with sessionStorage.

### Key Features

- 🔐 **Secure API Key Management** - Keys stored in sessionStorage only, never persisted server-side
- 🚀 **Smart Caching** - 15-minute TTL for lists, 10-minute for webhooks with background refresh
- 🎯 **Full CRUD Operations** - Create, read, update (recreate), and delete webhooks
- 📊 **Visual Status Indicators** - See cache freshness and webhook counts at a glance
- 🔄 **Client Switching** - Quick switch between clients without re-authentication
- 🌙 **Dark Mode Support** - System-aware theme with manual toggle (light/dark/auto)
- ⚡ **Optimized Performance** - Sub-150KB bundle, <2s first paint, <1s operations

## Getting Started

### Prerequisites

- PHP 8.1+ with cURL extension
- Node.js 16+ with npm
- [DDEV](https://ddev.readthedocs.io/en/stable/) (recommended) or any PHP web server
- Campaign Monitor API key (account or client level)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/campaign-monitor-webhook-ui.git
   cd campaign-monitor-webhook-ui
   ```

2. **Start DDEV environment** (recommended)
   ```bash
   ddev start
   ```

3. **Install dependencies**
   ```bash
   # Node dependencies
   npm install
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env to set CM_API_BASE_URL if needed
   ```

6. **Access the application**
   - With DDEV: https://campaign-monitor-webhook-ui.ddev.site
   - Without DDEV: Configure your web server to serve `index.php`

### Alternative Setup (Without DDEV)

If you prefer not to use DDEV:

1. Ensure PHP 8.1+ with cURL extension is installed
2. Install Node dependencies: `npm install`
3. Build assets: `npm run build`
4. Configure your web server (Apache/Nginx) to:
   - Set document root to the project directory
   - Route all requests to `index.php`
   - Ensure `/api/proxy.php` is accessible

## Usage

### First Time Setup

1. **Open the application** in your browser
2. **Enter your API key**
   - Use an account-level key to access multiple clients
   - Use a client-level key for direct access
3. **Select a client** (if using account-level key)
4. **Click "Load Lists & Webhooks"** to fetch your data

### Managing Webhooks

#### View Webhooks
- Click on any list card to expand and view its webhooks
- Cache status indicators show data freshness:
  - 🟢 Fresh (< 5 minutes old)
  - 🟡 Aging (5-10 minutes old)
  - 🔴 Stale (> 10 minutes old)

#### Create a Webhook
1. Click the **➕ Add Webhook** button on any list
2. Enter the webhook URL (must be HTTPS)
3. Select events to monitor:
   - Subscribe
   - Update
   - Deactivate
4. Choose payload format (JSON or XML)
5. Click **Create Webhook**

#### Update a Webhook
1. Click the **✏️ Edit** button next to any webhook
2. Modify the URL, events, or format
3. Click **Update Webhook**
   
*Note: Updates are implemented as delete + create operations*

#### Delete a Webhook
1. Click the **🗑 Delete** button next to any webhook
2. Confirm the deletion

### Dark Mode

The application includes a smart dark mode toggle in the top navigation bar:
- **System** (default) - Follows your OS dark mode preference
- **Light** - Always light theme
- **Dark** - Always dark theme

Click the theme icon (computer/sun/moon) to cycle through modes.

### Switching Clients

If using an account-level API key:
- Click the client name in the header
- Select a different client from the dropdown
- Data will automatically reload

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Vue.js SPA    │────▶│ PHP Proxy    │────▶│ Campaign Monitor │
│                 │◀────│ (/api/proxy) │◀────│      API         │
└─────────────────┘     └──────────────┘     └──────────────────┘
        │                                              
        ▼                                              
┌─────────────────┐                                    
│  Pinia Stores   │                                    
│  (sessionStorage)│                                    
└─────────────────┘                                    
```

### Frontend Stack
- **Vue 3** - Composition API for modern component architecture
- **Vite 4** - Lightning-fast build tool
- **Pinia** - State management with persistence
- **Tailwind CSS v4** - Utility-first styling with dark mode support
- **Axios** - HTTP client with interceptors

### Backend Stack
- **PHP 8.3** - Server-side proxy (no dependencies)
- **cURL** - Campaign Monitor API client
- **Vanilla PHP** - Lightweight, self-contained

## Security

- API keys are stored in `sessionStorage` only
- Keys are never logged or persisted server-side
- All webhook URLs must use HTTPS
- Server-side validation mirrors client validation
- CORS headers configured for SPA security

## Performance

- **Bundle Size**: < 150KB gzipped
- **First Paint**: < 2 seconds
- **API Operations**: < 1 second
- **Concurrent Requests**: Limited to 3
- **Smart Caching**: Reduces API calls by 80%+
- **Background Refresh**: Keeps data fresh

## Development

### Commands

```bash
# Start development environment
ddev start

# Install/update dependencies
npm install

# Build for production
npm run build

# Build and watch for changes
npm run build -- --watch

# Preview production build
npm run preview

# Stop development environment
ddev stop
```

### Project Structure

```
campaign-monitor-webhook-ui/
├── src/                # Vue application source
│   ├── components/     # Reusable components
│   ├── views/          # Page components
│   ├── stores/         # Pinia state stores
│   └── services/       # API service layer
├── api/                # PHP backend
│   └── proxy.php       # API proxy endpoint
├── dist/               # Production build
├── docs/               # Documentation
└── storage/logs/       # Error logs
```

### Making Changes

1. Edit Vue components in `src/`
2. Run `npm run build` to compile
3. Test in browser via DDEV URL
4. PHP changes take effect immediately

### Debugging

- Check browser DevTools for frontend errors
- View `/storage/logs/error.log` for PHP errors
- Use Network tab to inspect API calls
- SessionStorage can be viewed in DevTools

### API Testing

Two test files are available to validate Campaign Monitor API connectivity:

**test-api.php** - Comprehensive API test suite
- Tests multiple API versions (v3.1, v3.2, v3.3)
- Validates both client-level and account-level API keys
- Tests various endpoint patterns and authentication methods
- Includes proxy endpoint testing

**test-curl-exact.php** - Direct cURL test
- Tests exact cURL commands that work with Campaign Monitor API
- Validates webhook and list endpoints
- Simple success/failure validation with clear output

Both files require environment variables in `.env`:
```
TEST_CLIENT_API_KEY=your_client_api_key
TEST_ACCOUNT_API_KEY=your_account_api_key
TEST_CLIENT_ID=your_client_id
TEST_LIST_ID=your_list_id
```

Run tests with:
```bash
ddev php test-api.php
ddev php test-curl-exact.php
```

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure you're accessing via DDEV URL, not localhost
- Check that `/api/proxy.php` is accessible

**API Key Not Working**
- Verify key is valid in Campaign Monitor
- Check for spaces or hidden characters
- Try in an incognito window

**Data Not Loading**
- Check browser console for errors
- Verify Campaign Monitor API is accessible
- Clear cache (refresh the page)

**Build Issues**
- Delete `node_modules/` and run `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js 16+ is installed

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for a list of changes and version history.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to test
5. Submit a pull request

Please maintain:
- Existing code style (Composition API)
- Security constraints (HTTPS, sessionStorage)
- Performance targets
- Documentation updates

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions:
- Check existing issues on GitHub
- Review the documentation in `/docs`
- Contact the development team

---

Built with ❤️ for Campaign Monitor users