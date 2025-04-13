import { writable } from 'svelte/store';

// Define User type
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// Authentication and user state
export const user = writable<User | null>(null);
export const loading = writable<boolean>(false);

// Document and search state
export const searchQuery = writable<string>('');
export const searchResults = writable<any[]>([]);
export const currentDocument = writable<any | null>(null);
export const documents = writable<any[]>([]);
export const documentLoading = writable<boolean>(false);

// Query state 
export const queryText = writable<string>('');
export const queryResult = writable<any | null>(null);
export const queryLoading = writable<boolean>(false);