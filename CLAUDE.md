# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Campaign Monitor Webhook Management** application - a fully functional single-page Vue.js application with a PHP backend proxy for managing Campaign Monitor webhook subscriptions. The project is production-ready with all core features implemented and optimized.

## Development Environment

### DDEV Configuration
- **Start development**: `ddev start`
- **Stop development**: `ddev stop`
- **Database access**: `ddev mysql`
- **PHP version**: 8.3
- **Web server**: nginx-fpm
- **Document root**: Project root (`.`)

### Project Status
This is a **completed project** with:
- ✅ Full Vue 3 + Vite frontend implementation
- ✅ PHP backend proxy with Campaign Monitor API integration
- ✅ Smart caching system with TTL management
- ✅ All CRUD operations for webhook management
- ✅ Production build optimized and ready
- ✅ Comprehensive error handling and validation

## Architecture

```
[Vue SPA] —axios→ /api/proxy.php —Guzzle→ Campaign Monitor REST API
    ↓
[Pinia Stores] ←→ [sessionStorage]
    ↓
[Smart Cache Layer]
```

### Technology Stack
- **Frontend**: Vue 3 (Composition API), Vite 4, Pinia, Tailwind CSS, Axios
- **Backend**: PHP 8.3, Guzzle HTTP, vanilla PHP (no framework)
- **State Management**: Pinia with sessionStorage persistence (security requirement)
- **Build Tool**: Vite with PHP integration

## Key Implementation Features

### Security
- API keys stored in `sessionStorage` only (never localStorage or server-side) ✅
- All webhook URLs must be HTTPS (validated client and server-side) ✅
- No persistence of credentials on server ✅
- Error logging to `/storage/logs/error.log` (not database) ✅

### Performance Optimizations
- First contentful paint < 2s ✅
- Bundle size < 150KB gzipped ✅
- CRUD operations < 1s response time ✅
- API concurrency limited to 3 requests ✅
- Smart caching: 15-min TTL for lists, 10-min for webhooks
- Background refresh for aging data (>5 min old)
- Request deduplication to prevent duplicate API calls

### Advanced Features Implemented
- **Dual-store architecture**: Separate auth and data stores
- **Request management**: Per-client request tracking and cancellation
- **Cache status indicators**: Visual feedback on data freshness
- **Client switcher**: Quick switching without re-authentication
- **Batch operations**: Concurrent webhook fetching with progress
- **Graceful error handling**: Inline messages, no disruptive toasts

## Directory Structure (Actual)

```
/src/               # Vue source code
  /components/      # Vue components (all implemented)
  /views/           # Vue views (HomeView.vue)
  /stores/          # Pinia stores (auth.js, data.js)
  /services/        # API service layer (api.js)
  /assets/          # CSS and static assets
  /utils/           # Utility functions (empty - not needed)
/api/               # PHP backend
  proxy.php         # Main API proxy (fully implemented)
/dist/              # Production build output
/storage/logs/      # Error logs
/docs/              # Documentation
/vendor/            # PHP dependencies (Guzzle)
/node_modules/      # JS dependencies
```

## Key Files to Reference

### Documentation
- **`docs/PRD.md`** - Product requirements (updated to v2.1 with implementation details)
- **`docs/IMPLEMENTATION_PLAN.md`** - Implementation roadmap (all phases completed)
- **`README.md`** - User-facing documentation and setup guide

### Core Implementation Files
- **`src/stores/auth.js`** - Authentication management with API key validation
- **`src/stores/data.js`** - Data management with smart caching
- **`src/services/api.js`** - API client with request pooling
- **`api/proxy.php`** - Backend proxy with validation and error handling
- **`src/views/HomeView.vue`** - Main application view
- **`src/components/WebhookModal.vue`** - Webhook CRUD operations
- **`src/components/ListCard.vue`** - List display with cache indicators

## Campaign Monitor API Integration

The application successfully proxies these Campaign Monitor v3.3 endpoints:
- `GET /account/clients` - List clients (account-level keys)
- `GET /clients/{clientId}/lists` - List subscriber lists
- `GET /lists/{listId}/webhooks` - Get webhooks for a list
- `POST /lists/{listId}/webhooks` - Create webhook
- `DELETE /lists/{listId}/webhooks/{id}` - Delete webhook

## Common Development Commands

**Frontend**:
- `npm install` - Install dependencies
- `npm run dev` - Start Vite dev server (not recommended with DDEV)
- `npm run build` - Build for production ⭐ USE THIS
- `npm run preview` - Preview production build

**Backend**:
- `ddev composer install` - Install PHP dependencies
- `ddev composer update` - Update PHP dependencies
- `ddev php api/proxy.php` - Test PHP proxy directly

**API Testing**:
- `ddev php test-api.php` - Run comprehensive API connectivity tests
- `ddev php test-curl-exact.php` - Run direct cURL tests

**DDEV**:
- `ddev start` - Start development environment
- `ddev stop` - Stop development environment
- `ddev ssh` - SSH into web container
- `ddev logs` - View container logs

## Development Workflow Notes

### Building and Testing
- Always run `npm run build` to create production assets that work with the DDEV environment
- The application serves built assets from the `/dist` folder automatically
- Access the app at your DDEV URL (e.g., https://campaign-monitor-webhook-ui.ddev.site)

### Making Changes
1. Edit Vue components/stores as needed
2. Run `npm run build` to compile changes
3. Test in browser with DDEV URL
4. PHP changes to api/proxy.php take effect immediately

### API Testing
- Use the included `test-api.php` for direct API testing
- Check `/storage/logs/error.log` for PHP errors
- Browser DevTools Network tab shows all API requests

## Key Implementation Insights

### State Management Pattern
The app uses a dual-store pattern:
- `authStore`: Manages API keys and client selection
- `dataStore`: Handles lists, webhooks, and caching

This separation allows for clean request cancellation when switching clients.

### Caching Strategy
- Cache entries include timestamps and TTL
- Background refresh runs for data older than 5 minutes
- Visual indicators show cache status (fresh/aging/stale)
- Cache is cleared when switching clients

### Error Handling
- Server validation mirrors client validation
- Exponential backoff for rate limiting (429 errors)
- User-friendly error messages without technical jargon
- Network failures handled gracefully with retry options

### Performance Considerations
- Batch API calls limited to 3 concurrent requests
- Request deduplication prevents redundant calls
- Immediate UI updates with rollback on failure
- Production build uses code splitting for optimal loading

## Common Issues and Solutions

1. **CORS errors**: Make sure you're accessing via DDEV URL, not localhost
2. **API key not persisting**: Check sessionStorage in DevTools
3. **Build not updating**: Clear browser cache or use hard refresh
4. **PHP errors**: Check `/storage/logs/error.log`

## Future Development Guidelines

When adding new features:
1. Follow the existing Composition API patterns
2. Add new API endpoints to both `api.js` and `proxy.php`
3. Maintain the caching strategy for new data types
4. Keep security constraints (HTTPS validation, sessionStorage)
5. Update documentation as you go

Remember: This is a production-ready application. Any changes should maintain the existing quality standards and user experience.