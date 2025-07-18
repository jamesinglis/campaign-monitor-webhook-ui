# Campaign Monitor – Webhook Management  
**Product‑Requirements Document (v1.0.0 – Implementation Update)**  

---

## Executive Summary  
This single‑page web application (SPA) helps developers and marketers manage *subscriber‑list webhooks* in Campaign Monitor (CM). A user pastes either an *account‑level* or *client‑level* API key. If the key is for an account, the app fetches the list of clients and asks the user to pick the client whose lists they want to see, avoiding expensive loading of all data. After selection, every list is displayed as a responsive card showing the number of webhooks with cache status indicators. Users can create, update (re‑create), or delete webhooks for **Subscribe / Update / Deactivate** events. The app features smart caching with background refresh, request deduplication, and comprehensive error handling. Built with **Vue 3, Vite 4, Pinia, and Tailwind CSS** on PHP 8.3+. The API key is stored in `sessionStorage` (cleared when the tab closes) with zero server‑side persistence. All webhook URLs are validated for **https://** both client and server‑side.

---

## 1 – Purpose & Goals  
| Goal | KPI | Priority |
| --- | --- | --- |
| Visual webhook manager for CM lists | Load lists & hooks \< 3 s for 95‑th pct | P0 |
| Support account‑level **and** client‑level keys | 100 % successful client selection | P0 |
| Zero persistence of credentials on server | 0 keys written to disk | P0 |
| One‑click CRUD for Subscribe / Update / Deactivate hooks | Round‑trip \< 1 s | P1 |

---

## 2 – Background  
* CM lists API: `GET /clients/{clientId}/lists` and webhooks API (`GET / POST / DELETE`) are available in v3.3 REST API.  
* Account‑level keys expose `/account/clients` for listing child clients.  
* CM docs mention *activate / deactivate* endpoints, but this version relies solely on **add / delete** to change state.  
* Pinia + `pinia-plugin‑persistedstate` supports `sessionStorage` persistence with one‑line config.  
* `sessionStorage` survives reloads of the current tab but is cleared when the tab or browser closes.  
* Vite can be embedded in a classic PHP site using templates such as **vite‑php‑setup**.  

---

## 3 – Users & Personas  
* **Email‑Ops Specialist** – occasionally needs to add a webhook; non‑technical.  
* **Developer / Integrator** – tests webhooks while building integrations.  

---

## 4 – Assumptions & Constraints  
* User has a working API key and (optionally) knows their client ID.  
* HTTPS is required for both the SPA hosting and webhook target URLs.  
* Browser support: last 2 major versions of Chrome, Edge, Safari, Firefox.  

---

## 5 – Success Metrics  
| Metric | Target |
| --- | --- |
| Lighthouse accessibility | ≥ 90 |
| CRUD error rate | \< 0.5 % |
| Bundle size (gzipped) | \< 150 kB |

---

## 6 – Functional Requirements  

### 6.1 Authentication & Setup  
1. **API‑key field** with helper link "Where do I find my key?".  
2. Store key in a Pinia `authStore` with `{ persist: { storage: sessionStorage } }`.  
3. Click **"Next"** →  
   * If account‑key → fetch `/account/clients`, show dropdown of clients.  
   * If client‑key → skip dropdown.  
4. Click **"Load Lists & Webhooks"** to start data retrieval and show spinner.

### 6.2 Data Retrieval Flow  
| Step | API Call | Implementation Details |
| --- | --- | --- |
| (optional) List clients | `GET /account/clients` | Cached with 15-min TTL |
| Fetch lists | `GET /clients/{clientId}/lists` | Cached with 15-min TTL |
| For each list fetch hooks | `GET /lists/{listId}/webhooks` | Batch fetched (max 3 concurrent), 10-min TTL |
| Background refresh | Automatic | Refreshes aging data (>5 min old) |

### 6.3 UI Presentation  
* **Top Nav‑Bar** → "Campaign Monitor — Webhook Management" with client switcher.  
* **Card Grid** (1‑col xs, 2‑col md+). Each card: list name, **pill** with #hooks, cache status icon.  
* Clicking card (not just pill) toggles webhook table with smooth animation.  
* **Hook table actions**: ➕ Add, ✏️ Update (implemented as delete + add), 🗑 Delete.  
* **Add / Update modal**:  
  * HTTPS URL input with real-time validation.  
  * Checkbox group: Subscribe, Update, Deactivate (at least one required).  
  * Select payload format JSON / XML (default JSON).  
  * Focus management and keyboard navigation (Esc to close).  

### 6.4 Mutations  
| Action | Endpoint | Method |
| --- | --- | --- |
| Create hook | `/lists/{listId}/webhooks` | POST |
| Update hook | delete old → create new | DELETE + POST |
| Delete hook | `/lists/{listId}/webhooks/{id}` | DELETE |

*(Activate / Deactivate endpoints excluded in this version for simplicity)*  

### 6.5 Validation & Errors  
* Reject non‑HTTPS URLs client‑side and server‑side.  
* Map HTTP 401 (invalid key) and CM code 610 (invalid endpoint) to UI messages.  
* Exponential back‑off on 429 / 5xx with automatic retry (up to 3 attempts).  
* Request cancellation when switching clients.  
* Graceful handling of network failures and timeouts.  
* Clear inline error messages (not toasts) for better UX.

---

## 7 – Non‑Functional Requirements  
| Aspect | Requirement | Implementation |
| --- | --- | --- |
| **Security** | Key in `sessionStorage`; never logged server‑side. | ✅ Achieved with Pinia persistence |
| **Performance** | First contentful paint < 2s; API concurrency limited to 3 requests. | ✅ Vite optimization, request pooling |
| **Accessibility** | WCAG 2.2 AA; full keyboard support. | ✅ ARIA labels, focus management |
| **Caching** | Smart caching to minimize API calls | ✅ 15min lists, 10min webhooks |
| **UX** | Optimistic updates, background refresh | ✅ Immediate UI feedback |

---

## 8 – Technical Architecture  
```
[Vue SPA] —axios→ /api/proxy.php —cURL→ CM REST
    ↓
[Pinia Stores]
    ↓
[sessionStorage]
```
* **Frontend**: Vue 3 (Composition API), Vite 4, Tailwind CSS, Pinia with persistence  
* **Backend**: `proxy.php` (PHP 8.3) validates requests, injects auth, handles errors  
* **State Management**: Dual-store architecture (auth + data) with smart caching  
* **Build System**: Vite with code splitting, serves from `/dist` in production

---

## 9 – UX Wireframe  
1. **API Key ↳ Next**  
2. **Client Select (if needed) ↳ Load**  
3. **Cards grid** → hook tables.

---

## 10 – Analytics & Logging  
* PHP `error_log` to `storage/logs/error.log` for debugging  
* Client-side error boundaries for graceful failure handling  
* Request/response logging for API debugging (development only)

---

## 11 – Implementation Status  
| Phase | Status | Key Features |
| --- | --- | --- |
| Project Setup | ✅ Complete | Vite + Vue 3 + DDEV environment |
| Authentication | ✅ Complete | sessionStorage persistence, API key validation |
| API Proxy | ✅ Complete | Full CM API integration with error handling |
| Data Management | ✅ Complete | Smart caching, background refresh, request pooling |
| UI Components | ✅ Complete | All CRUD operations, responsive design |
| Production Build | ✅ Complete | Optimized bundle < 150KB gzipped |

---

## 12 – Implemented Beyond Spec  
* **Smart Caching System**: TTL-based cache with background refresh  
* **Request Management**: Per-client request tracking and cancellation  
* **Cache Status UI**: Visual indicators showing data freshness  
* **Client Switcher**: Quick switching between clients without re-auth  
* **Batch Operations**: Concurrent webhook fetching with progress tracking  

## 13 – Future Enhancements  
* Test webhook button to verify endpoint connectivity  
* Bulk operations (delete/create multiple webhooks)  
* Export/import webhook configurations  
* Webhook activity logs

## 14 – Recent Implementations (Post v1.0.0)
* ✅ **Dark Mode Theme** - System-aware dark mode with manual toggle (light/dark/auto)
  - Tailwind CSS v4 dark mode configuration
  - Pinia theme store with sessionStorage persistence  
  - DarkModeToggle component in navigation bar
  - Comprehensive dark mode styling across all components