import { getDocument } from '../../../lib/api';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  try {
    const document = await getDocument(params.id);
    return {
      document,
    };
  } catch (error) {
    console.error('Error loading document:', error);
    return {
      document: null,
      error: error.message || 'Failed to load document',
    };
  }
}
