<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { loginUser } from '../../lib/api';
  import { user, loading } from '../../lib/store';
  
  let username = '';
  let password = '';
  let error = '';
  let isLoading = false;
  
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });
  
  async function handleSubmit() {
    if (!username || !password) {
      error = 'Lütfen tüm alanları doldurun.';
      return;
    }
    
    try {
      isLoading = true;
      error = '';
      
      const userData = await loginUser(username, password);
      $user = userData;
      
      goto('/documents');
    } catch (err) {
      console.error('Giriş hatası:', err);
      error = err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-header">
      <h1>Giriş Yap</h1>
      <p>Dokümanlarınıza erişmek için giriş yapın</p>
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
        <label for="password">Şifre</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          disabled={isLoading}
          placeholder="Şifrenizi girin"
          autocomplete="current-password"
        />
      </div>
      
      <button 
        type="submit" 
        class="btn-primary" 
        disabled={isLoading}
      >
        {#if isLoading}
          <i class="fas fa-spinner fa-spin"></i> Giriş Yapılıyor...
        {:else}
          Giriş Yap
        {/if}
      </button>
    </form>
    
    <div class="auth-footer">
      <p>Hesabınız yok mu? <a href="/register">Kaydolun</a></p>
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