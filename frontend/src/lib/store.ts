import { writable } from 'svelte/store';

// User store
export const user = writable(
  typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
);

// Keep localStorage in sync with user store
if (typeof localStorage !== 'undefined') {
  user.subscribe(value => {
    localStorage.setItem('user', JSON.stringify(value));
  });
}

// Documents store
export const documents = writable([]);
export const documentLoading = writable(false);
export const currentDocument = writable(null);

// Search store
export const searchQuery = writable('');
export const searchResults = writable([]);
export const searchLoading = writable(false);

// Query store
export const queryText = writable('');
export const queryResult = writable(null);
export const queryLoading = writable(false);

// UI state
export const loading = writable(false);
export const error = writable(null);
export const toasts = writable([]);