<script>
  import { onMount } from 'svelte';
  import { 
    ChakraProvider, 
    extendTheme, 
    CSSReset,
    Box 
  } from '@chakra-ui/svelte';
  import { checkAuth } from '../lib/api';
  import { user, loading } from '../lib/store';
  import Navbar from '../components/Navbar.svelte';
  
  // Custom theme
  const theme = extendTheme({
    colors: {
      brand: {
        50: '#e6f6ff',
        100: '#b3e0ff',
        200: '#80cbff',
        300: '#4db6ff',
        400: '#1aa1ff',
        500: '#0088e6',
        600: '#006bb3',
        700: '#004d80',
        800: '#00304d',
        900: '#00121a',
      },
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
    },
  });
  
  // Check authentication on app load
  onMount(async () => {
    try {
      $loading = true;
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await checkAuth();
        $user = userData;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // Clear invalid token
      localStorage.removeItem('token');
    } finally {
      $loading = false;
    }
  });
</script>

<ChakraProvider theme={theme}>
  <CSSReset />
  
  <div>
    <Navbar />
    
    <Box as="main" px={4} maxW="1200px" mx="auto">
      <slot />
    </Box>
  </div>
</ChakraProvider>

<style>
  /* Include FontAwesome CDN */
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
  
  /* Global styles */
  :global(body) {
    min-height: 100vh;
    background-color: #f8f9fa;
  }
</style>