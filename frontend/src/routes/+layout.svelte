<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user } from '../lib/store';
  import { logoutUser } from '../lib/api';
  
  $: isLoggedIn = !!$user;
  let showMobileMenu = false;
  
  async function handleLogout() {
    try {
      await logoutUser();
      $user = null;
      goto('/login');
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu:', err);
      // Hata olsa da kullanıcı bilgilerini temizle
      $user = null; 
      goto('/login');
    }
  }
  
  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }
  
  function closeMobileMenu() {
    showMobileMenu = false;
  }
  
  // Sayfa değiştiğinde mobile menüyü kapat
  $: {
    $page;
    closeMobileMenu();
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <a href="/" class="logo-link">
          <i class="fas fa-book-open"></i>
          <span class="logo-text">Akıllı Doküman</span>
        </a>
      </div>
      
      <button 
        class="mobile-menu-toggle" 
        on:click={toggleMobileMenu}
        aria-label="Menüyü Aç/Kapa"
      >
        <i class="fas {showMobileMenu ? 'fa-times' : 'fa-bars'}"></i>
      </button>
      
      <nav class="nav {showMobileMenu ? 'mobile-open' : ''}">
        {#if isLoggedIn}
          <a 
            href="/documents" 
            class="nav-link {$page.url.pathname.startsWith('/documents') ? 'active' : ''}"
          >
            <i class="fas fa-file-alt"></i> Belgeler
          </a>
          <a 
            href="/search" 
            class="nav-link {$page.url.pathname.startsWith('/search') ? 'active' : ''}"
          >
            <i class="fas fa-search"></i> Arama
          </a>
          <a 
            href="/query" 
            class="nav-link {$page.url.pathname.startsWith('/query') ? 'active' : ''}"
          >
            <i class="fas fa-robot"></i> Sorgula
          </a>
          <div class="user-actions">
            <button class="logout-button" on:click={handleLogout}>
              <i class="fas fa-sign-out-alt"></i> Çıkış
            </button>
            {#if $user}
              <span class="user-name">
                <i class="fas fa-user-circle"></i> {$user.username}
              </span>
            {/if}
          </div>
        {:else}
          <a 
            href="/login" 
            class="nav-link {$page.url.pathname === '/login' ? 'active' : ''}"
          >
            <i class="fas fa-sign-in-alt"></i> Giriş
          </a>
          <a 
            href="/register" 
            class="nav-link {$page.url.pathname === '/register' ? 'active' : ''}"
          >
            <i class="fas fa-user-plus"></i> Kaydol
          </a>
        {/if}
      </nav>
    </div>
  </header>
  
  <main class="main-content">
    <div class="container">
      <slot />
    </div>
  </main>
  
  <footer class="footer">
    <div class="container">
      <p>© {new Date().getFullYear()} Akıllı Doküman Arama ve Sorgulama Sistemi</p>
    </div>
  </footer>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f7fafc;
    color: #2d3748;
    min-height: 100vh;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .header {
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .logo-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #3182ce;
    font-weight: 700;
    font-size: 1.25rem;
  }
  
  .mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #4a5568;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .nav-link {
    text-decoration: none;
    color: #4a5568;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    position: relative;
  }
  
  .nav-link:hover {
    color: #3182ce;
  }
  
  .nav-link.active {
    color: #3182ce;
  }
  
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #3182ce;
  }
  
  .user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 1px solid #e2e8f0;
  }
  
  .logout-button {
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
  }
  
  .user-name {
    font-size: 0.875rem;
    color: #718096;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .main-content {
    flex: 1;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
  }
  
  .footer {
    background-color: white;
    padding: 1.5rem 0;
    border-top: 1px solid #e2e8f0;
    margin-top: 2rem;
  }
  
  .footer p {
    text-align: center;
    color: #718096;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: block;
    }
    
    .nav {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: white;
      flex-direction: column;
      align-items: flex-start;
      padding: 4rem 2rem 2rem;
      gap: 2rem;
      z-index: 99;
    }
    
    .nav.mobile-open {
      display: flex;
    }
    
    .user-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      margin: 0;
      padding: 0;
      border: none;
      width: 100%;
    }
    
    .nav-link {
      font-size: 1.25rem;
    }
    
    .nav-link.active::after {
      display: none;
    }
  }
</style>