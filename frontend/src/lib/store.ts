import { writable } from 'svelte/store';

// User store
export const user = writable(null);

// Loading state store
export const loading = writable(false);

// Error message store
export const errorMessage = writable('');

// Document search results store
export const searchResults = writable([]);

// Current document store
export const currentDocument = writable(null);