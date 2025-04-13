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
    useToast
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '../../lib/store';
  import { registerUser } from '../../lib/api';

  const toast = useToast();
  
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = '';
  
  // Redirect if already logged in
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });
  
  async function handleRegister(e) {
    e.preventDefault();
    
    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      error = 'Please fill in all fields';
      return;
    }
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (password.length < 6) {
      error = 'Password must be at least 6 characters long';
      return;
    }
    
    try {
      loading = true;
      error = '';
      
      const userData = await registerUser(username, email, password);
      
      // Update user store
      $user = userData;
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.username}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to documents page
      goto('/documents');
      
    } catch (err) {
      error = err.message || 'Registration failed. Please try again.';
      console.error('Registration error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<Box my={8} maxW="md" mx="auto">
  <Card p={8} boxShadow="lg" borderRadius="lg">
    <Heading size="lg" mb={6} textAlign="center">Hesap Oluştur</Heading>
    
    {#if error}
      <Alert status="error" mb={6} borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    {/if}
    
    <form on:submit={handleRegister}>
      <Stack spacing={4}>
        <FormControl isRequired isInvalid={error && !username}>
          <FormLabel>Kullanıcı Adı</FormLabel>
          <Input 
            type="text" 
            bind:value={username} 
            placeholder="Kullanıcı adınızı seçin"
            disabled={loading}
          />
          {#if error && !username}
            <FormErrorMessage>Kullanıcı adı gerekli</FormErrorMessage>
          {/if}
        </FormControl>
        
        <FormControl isRequired isInvalid={error && !email}>
          <FormLabel>E-posta</FormLabel>
          <Input 
            type="email" 
            bind:value={email} 
            placeholder="E-posta adresinizi girin"
            disabled={loading}
          />
          {#if error && !email}
            <FormErrorMessage>E-posta gerekli</FormErrorMessage>
          {/if}
        </FormControl>
        
        <FormControl isRequired isInvalid={error && !password}>
          <FormLabel>Şifre</FormLabel>
          <Input 
            type="password" 
            bind:value={password} 
            placeholder="Şifre oluşturun"
            disabled={loading}
          />
          {#if error && !password}
            <FormErrorMessage>Şifre gerekli</FormErrorMessage>
          {/if}
        </FormControl>
        
        <FormControl isRequired isInvalid={error && (password !== confirmPassword)}>
          <FormLabel>Şifre Onayı</FormLabel>
          <Input 
            type="password" 
            bind:value={confirmPassword} 
            placeholder="Şifrenizi onaylayın"
            disabled={loading}
          />
          {#if error && (password !== confirmPassword)}
            <FormErrorMessage>Şifreler eşleşmiyor</FormErrorMessage>
          {/if}
        </FormControl>
        
        <Button 
          type="submit" 
          colorScheme="blue" 
          size="lg" 
          width="full"
          mt={4}
          isLoading={loading}
          loadingText="Hesap oluşturuluyor..."
        >
          Kayıt Ol
        </Button>
      </Stack>
    </form>
    
    <Text mt={6} textAlign="center">
      Zaten hesabınız var mı?{' '}
      <Button 
        variant="link" 
        colorScheme="blue" 
        onClick={() => goto('/login')}
      >
        Giriş Yap
      </Button>
    </Text>
  </Card>
</Box>