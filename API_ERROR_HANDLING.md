# Global API Error Handling Implementation

## Overview
This implementation provides automatic global error handling for API requests with 401/403 status code handling.

## Files Created

### 1. `/frontend/src/utils/apiClient.ts`
Enhanced fetch wrapper with automatic error handling:
- **401 Unauthorized**: Automatically clears tokens and redirects to `/client/login`
- **403 Forbidden**: Displays upgrade modal for premium features
- **Retry logic**: 3 automatic retries for network/server errors
- **Event system**: Global error handler notifications

**Usage:**
```typescript
import { apiClient } from '../utils/apiClient';

// GET request
const data = await apiClient.get('/api/dashboard');

// POST request
const result = await apiClient.post('/api/audits', { name: 'Test' });

// Skip auth redirect for specific calls
const data = await apiClient.get('/api/public', { skipAuthRedirect: true });
```

### 2. `/frontend/src/components/ApiErrorBoundary.tsx`
React Error Boundary for catching rendering and API errors:
- Catches unhandled errors in component tree
- Displays elegant error UI with retry/home buttons
- Shows stack trace in development mode
- Logs errors for monitoring services

**Features:**
- Dark/light mode support
- Expandable stack traces (dev only)
- Custom fallback UI option
- Error callback for logging

### 3. `/frontend/src/components/UpgradeRequired.tsx`
Modal for 403 Forbidden responses:
- Beautiful upgrade modal with pricing plans
- Displays Pro and Enterprise tiers
- Auto-triggers on 403 API responses
- Redirects to subscription page

**Features:**
- Animated entrance/exit
- Current plan display
- Feature comparison
- Dark mode support

## Integration

### AppNew.jsx
```jsx
import ApiErrorBoundary from './components/ApiErrorBoundary';
import { UpgradeRequiredModal } from './components/UpgradeRequired';

function App() {
  return (
    <Router>
      <ApiErrorBoundary>
        <ScrollToTop />
        <AppShell />
        <UpgradeRequiredModal />
      </ApiErrorBoundary>
    </Router>
  );
}
```

### useDashboardStore.ts
Updated to use new `apiClient`:
```typescript
import { apiFetch } from '../utils/apiClient';

// Automatic 401/403 handling built-in
const data = await apiFetch('/api/dashboard');
```

## Error Flow

### 401 Unauthorized
1. API returns 401
2. `apiClient.ts` detects error
3. Clears all tokens (token, client_token, adminToken)
4. Redirects to `/client/login`
5. User re-authenticates

### 403 Forbidden
1. API returns 403 (insufficient permissions/plan)
2. `apiClient.ts` triggers custom event
3. `UpgradeRequiredModal` listens and opens
4. User sees upgrade options
5. Click "Upgrade" → redirects to `/client/subscription`

### Other Errors
1. Caught by `ApiErrorBoundary`
2. Error UI displayed
3. User can retry or go home
4. Stack trace available in dev mode

## Token Management

The system supports multiple token types:
- `token` - Main JWT token
- `client_token` - Client portal token
- `adminToken` - Admin dashboard token

All are cleared on 401 errors.

## Customization

### Custom Error Handler
```typescript
import { onApiError } from '../utils/apiClient';

// Add global error listener
const unsubscribe = onApiError((error) => {
  console.log('API Error:', error);
  // Send to monitoring service
});
```

### Custom Upgrade Modal Trigger
```typescript
import { showUpgradeModal } from '../components/UpgradeRequired';

// Manually show upgrade modal
showUpgradeModal('Advanced Reports');
```

## Benefits
- ✅ Centralized error handling
- ✅ Automatic token cleanup
- ✅ Seamless user experience
- ✅ Premium upsell integration
- ✅ TypeScript support
- ✅ Dark mode compatible
- ✅ No duplicate logout logic needed
