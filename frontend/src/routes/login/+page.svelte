<script>
  import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Alert,
    AlertIcon,
    Card,
    Stack,
    Checkbox,
    Flex,
    useToast
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '../../lib/store';
  import { loginUser } from '../../lib/api';

  const toast = useToast();
  
  let usernameOrEmail = '';
  let password = '';
  let rememberMe = false;
  let loading = false;
  let error = '';
  
  // Redirect if already logged in
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });
  
  async function handleLogin(e) {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    try {
      loading = true;
      error = '';
      
      const userData = await loginUser(usernameOrEmail, password);
      
      // Update user store
      $user = userData;
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.username}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to documents page
      goto('/documents');
      
    } catch (err) {
      error = err.message || 'Login failed. Please check your credentials.';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<Box my={8} maxW="md" mx="auto">
  <Card p={8} boxShadow="lg" borderRadius="lg">
    <Heading size="lg" mb={6} textAlign="center">Giriş Yap</Heading>
    
    {#if error}
      <Alert status="error" mb={6} borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    {/if}
    
    <form on:submit={handleLogin}>
      <Stack spacing={4}>
        <FormControl isRequired isInvalid={error && !usernameOrEmail}>
          <FormLabel>Kullanıcı Adı veya E-posta</FormLabel>
          <Input 
            type="text" 
            bind:value={usernameOrEmail} 
            placeholder="Kullanıcı adı veya e-posta adresinizi girin"
            disabled={loading}
          />
          {#if error && !usernameOrEmail}
            <FormErrorMessage>Kullanıcı adı veya e-posta gerekli</FormErrorMessage>
          {/if}
        </FormControl>
        
        <FormControl isRequired isInvalid={error && !password}>
          <FormLabel>Şifre</FormLabel>
          <Input 
            type="password" 
            bind:value={password} 
            placeholder="Şifrenizi girin"
            disabled={loading}
          />
          {#if error && !password}
            <FormErrorMessage>Şifre gerekli</FormErrorMessage>
          {/if}
        </FormControl>
        
        <Flex justify="space-between" align="center">
          <Checkbox bind:checked={rememberMe} disabled={loading}>
            Beni hatırla
          </Checkbox>
          
          <Button variant="link" size="sm" colorScheme="blue">
            Şifremi unuttum
          </Button>
        </Flex>
        
        <Button 
          type="submit" 
          colorScheme="blue" 
          size="lg" 
          width="full"
          isLoading={loading}
          loadingText="Giriş yapılıyor..."
        >
          Giriş Yap
        </Button>
      </Stack>
    </form>
    
    <Text mt={6} textAlign="center">
      Hesabınız yok mu?{' '}
      <Button 
        variant="link" 
        colorScheme="blue" 
        onClick={() => goto('/register')}
      >
        Kayıt Ol
      </Button>
    </Text>
  </Card>
</Box>