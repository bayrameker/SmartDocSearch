<script>
  import { 
    Box, 
    Flex, 
    Spacer, 
    Button, 
    Menu, 
    MenuButton, 
    MenuList, 
    MenuItem, 
    MenuDivider, 
    Avatar, 
    IconButton
  } from '@chakra-ui/svelte';
  import { user } from '../lib/store';
  import { goto } from '$app/navigation';
  
  // Handle logout
  function logout() {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Clear user store
    $user = null;
    
    // Redirect to home
    goto('/');
  }
  
  // Function to navigate
  function navigateTo(path) {
    goto(path);
  }
  
  // Get user initials for avatar
  function getUserInitials(username) {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  }
</script>

<Box
  bg="blue.600"
  px={4}
  boxShadow="md"
  position="sticky"
  top={0}
  zIndex={10}
>
  <Flex h={16} alignItems="center">
    <!-- Logo/Brand -->
    <Box 
      fontWeight="bold" 
      fontSize="xl" 
      color="white" 
      cursor="pointer"
      onClick={() => navigateTo('/')}
    >
      <i class="fas fa-search-document mr-2"></i>
      Doküman Arama
    </Box>
    
    <Spacer />
    
    <!-- Navigation Links (only when logged in) -->
    {#if $user}
      <Flex align="center" mr={4} display={{ base: 'none', md: 'flex' }}>
        <Button
          variant="ghost"
          color="white"
          mr={4}
          _hover={{ bg: 'blue.500' }}
          onClick={() => navigateTo('/documents')}
        >
          <i class="fas fa-file-alt mr-2"></i> Dokümanlar
        </Button>
        
        <Button
          variant="ghost"
          color="white"
          mr={4}
          _hover={{ bg: 'blue.500' }}
          onClick={() => navigateTo('/search')}
        >
          <i class="fas fa-search mr-2"></i> Arama
        </Button>
        
        <Button
          variant="ghost"
          color="white"
          _hover={{ bg: 'blue.500' }}
          onClick={() => navigateTo('/query')}
        >
          <i class="fas fa-robot mr-2"></i> Sorgulama
        </Button>
      </Flex>
    {/if}
    
    <!-- Login/Register buttons or User menu -->
    {#if $user}
      <Menu>
        <MenuButton
          as={IconButton}
          size="md"
          borderRadius="full"
          aria-label="User menu"
          icon={<Avatar size="sm" name={$user.username} bg="blue.300" color="white" />}
        />
        <MenuList>
          <Box px={4} py={2}>
            <Box fontWeight="bold">{$user.username}</Box>
            <Box fontSize="sm" opacity={0.8}>{$user.email}</Box>
          </Box>
          <MenuDivider />
          <MenuItem icon={<i class="fas fa-user" />} onClick={() => navigateTo('/profile')}>
            Profil
          </MenuItem>
          <MenuItem icon={<i class="fas fa-cog" />} onClick={() => navigateTo('/settings')}>
            Ayarlar
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<i class="fas fa-sign-out-alt" />} onClick={logout}>
            Çıkış Yap
          </MenuItem>
        </MenuList>
      </Menu>
    {:else}
      <Button 
        variant="outline" 
        colorScheme="whiteAlpha" 
        mr={4}
        onClick={() => navigateTo('/login')}
      >
        Giriş Yap
      </Button>
      
      <Button 
        colorScheme="whiteAlpha" 
        onClick={() => navigateTo('/register')}
      >
        Kayıt Ol
      </Button>
    {/if}
  </Flex>
</Box>