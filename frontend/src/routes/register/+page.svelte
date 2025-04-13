<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { registerUser } from '../../lib/api';
  import { user } from '../../lib/store';
  
  let username = '';
  let password = '';
  let email = '';
  let confirmPassword = '';
  let error = '';
  let isLoading = false;
  
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });
  
  async function handleSubmit() {
    if (!username || !password || !email || !confirmPassword) {
      error = 'Lütfen tüm alanları doldurun.';
      return;
    }
    
    if (password !== confirmPassword) {
      error = 'Şifreler eşleşmiyor.';
      return;
    }
    
    if (password.length < 8) {
      error = 'Şifre en az 8 karakter olmalıdır.';
      return;
    }
    
    try {
      isLoading = true;
      error = '';
      
      console.log('Kayıt formunda gönderilen:', { username, email });
      
      const userData = await registerUser(username, password, email);
      console.log('Kayıt başarılı, dönen veri:', userData);
      
      if (userData && userData.token) {
        // Token'ı localStorage'e kaydet
        localStorage.setItem('token', userData.token);
        
        // Kullanıcı datasını store'a kaydet
        $user = userData.user;
        
        goto('/documents');
      } else {
        error = 'Sunucudan geçersiz yanıt alındı.';
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      error = err.message || 'Kayıt yapılamadı. Lütfen tekrar deneyin.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-header">
      <h1>Kaydol</h1>
      <p>Akıllı Doküman Arama ve Sorgulama Sistemini kullanmak için kaydolun</p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> {error}
        </div>
      {/if}
      
      <div class="form-group">
        <label for="username">Kullanıcı Adı</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username} 
          disabled={isLoading}
          placeholder="Kullanıcı adınızı girin"
          autocomplete="username"
        />
      </div>
      
      <div class="form-group">
        <label for="email">E-posta</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          disabled={isLoading}
          placeholder="E-posta adresinizi girin"
          autocomplete="email"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Şifre</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          disabled={isLoading}
          placeholder="Şifrenizi girin (en az 8 karakter)"
          autocomplete="new-password"
        />
      </div>
      
      <div class="form-group">
        <label for="confirm-password">Şifre (Tekrar)</label>
        <input 
          type="password" 
          id="confirm-password" 
          bind:value={confirmPassword} 
          disabled={isLoading}
          placeholder="Şifrenizi tekrar girin"
          autocomplete="new-password"
        />
      </div>
      
      <button 
        type="submit" 
        class="btn-primary" 
        disabled={isLoading}
      >
        {#if isLoading}
          <i class="fas fa-spinner fa-spin"></i> Kaydolunuyor...
        {:else}
          Kaydol
        {/if}
      </button>
    </form>
    
    <div class="auth-footer">
      <p>Zaten hesabınız var mı? <a href="/login">Giriş Yapın</a></p>
    </div>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 150px);
    padding: 2rem 1rem;
  }
  
  .auth-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .auth-header h1 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem;
  }
  
  .auth-header p {
    color: #718096;
    margin: 0;
  }
  
  form {
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
  
  .btn-primary {
    width: 100%;
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #fed7d7;
    color: #c53030;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .auth-footer {
    text-align: center;
    color: #718096;
    border-top: 1px solid #e2e8f0;
    padding-top: 1.5rem;
  }
  
  .auth-footer a {
    color: #3182ce;
    text-decoration: none;
    font-weight: 500;
  }
  
  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>