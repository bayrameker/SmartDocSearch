<script>
  import { onMount } from 'svelte';
  import { checkAuth } from '../lib/api';
  import { user, loading } from '../lib/store';
  import Navbar from '../components/Navbar.svelte';
  
  // Check authentication on app load
  onMount(async () => {
    try {
      $loading = true;
      
      // Check if token exists
      const token = localStorage?.getItem('token');
      if (token) {
        const userData = await checkAuth();
        $user = userData;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // Clear invalid token
      localStorage?.removeItem('token');
    } finally {
      $loading = false;
    }
  });
</script>

<div class="app">
  <Navbar />
  
  <main>
    <slot />
  </main>
</div>

<style>
  /* Include FontAwesome CDN */
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  
  /* Global styles */
  :global(body) {
    min-height: 100vh;
    background-color: #f8f9fa;
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  main {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
</style>