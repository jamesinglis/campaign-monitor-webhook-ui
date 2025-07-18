# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-18

### Added
- Initial release of Campaign Monitor Webhook Management application
- Full CRUD operations for webhook management
  - Create webhooks with HTTPS URL validation
  - Update webhooks (implemented as delete + create)
  - Delete webhooks with confirmation
  - View all webhooks per subscriber list
- Support for both account-level and client-level API keys
- Smart caching system
  - 15-minute TTL for subscriber lists
  - 10-minute TTL for webhook data
  - Background refresh for aging data (>5 minutes old)
  - Visual cache status indicators
- Client switching functionality for account-level keys
- Secure API key management with sessionStorage (no server persistence)
- Request management features
  - Per-client request tracking and cancellation
  - Concurrent request limiting (max 3 requests)
  - Request deduplication
  - Exponential backoff for rate limiting
- Responsive UI with Tailwind CSS
  - Mobile-friendly card layout
  - Smooth animations and transitions
  - Keyboard navigation support
  - ARIA labels for accessibility
- PHP backend proxy for Campaign Monitor API
  - Server-side validation matching client validation
  - Error logging to `/storage/logs/error.log`
  - CORS support for SPA architecture
- Production-optimized build
  - Bundle size < 150KB gzipped
  - Code splitting for optimal loading
  - First contentful paint < 2 seconds
- Comprehensive documentation
  - Product Requirements Document (PRD)
  - Implementation Plan
  - Developer guide (CLAUDE.md)
  - User-facing README

### Technical Stack
- Frontend: Vue 3.3 (Composition API), Vite 4, Pinia, Tailwind CSS
- Backend: PHP 8.3, Guzzle HTTP
- Development: DDEV, Node.js 16+

### Security
- All webhook URLs must use HTTPS (validated client and server-side)
- API keys stored in sessionStorage only
- No persistence of credentials on server
- Secure proxy pattern for API communication

### Known Limitations
- Webhook activate/deactivate endpoints not implemented (use delete/create instead)
- No bulk operations for webhooks
- No webhook testing functionality
- No export/import capabilities

[1.0.0]: https://github.com/your-org/campaign-monitor-webhook-ui/releases/tag/v1.0.0