<script>
  import { user } from '../lib/store';
  import { goto } from '$app/navigation';
  
  function logout() {
    // Clear token
    localStorage?.removeItem('token');
    // Reset user store
    $user = null;
    // Redirect to home
    goto('/');
  }
</script>

<nav>
  <div class="logo">
    <a href="/">DocuSearch</a>
  </div>
  
  <ul class="nav-links">
    {#if $user}
      <li><a href="/documents">Dokümanlarım</a></li>
      <li><a href="/search">Arama</a></li>
      <li><a href="/query">Sorgulama</a></li>
      <li class="dropdown">
        <button class="user-btn">
          <i class="fas fa-user-circle"></i> {$user.username}
        </button>
        <div class="dropdown-content">
          <a href="/profile">Profil</a>
          <button on:click={logout}>Çıkış Yap</button>
        </div>
      </li>
    {:else}
      <li><a href="/login">Giriş Yap</a></li>
      <li><a href="/register">Kaydol</a></li>
    {/if}
  </ul>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .logo a {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3182ce;
    text-decoration: none;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;
  }
  
  .nav-links li {
    margin-left: 1.5rem;
  }
  
  .nav-links a {
    color: #4a5568;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .nav-links a:hover {
    color: #3182ce;
  }
  
  .dropdown {
    position: relative;
  }
  
  .user-btn {
    background: none;
    border: none;
    font-weight: 500;
    color: #4a5568;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background-color: white;
    min-width: 160px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    z-index: 1;
    border-radius: 0.375rem;
    overflow: hidden;
  }
  
  .dropdown-content a,
  .dropdown-content button {
    display: block;
    padding: 0.75rem 1rem;
    text-align: left;
    width: 100%;
    background: none;
    border: none;
    font-size: 1rem;
    color: #4a5568;
    cursor: pointer;
    text-decoration: none;
  }
  
  .dropdown-content a:hover,
  .dropdown-content button:hover {
    background-color: #f7fafc;
    color: #3182ce;
  }
  
  .dropdown:hover .dropdown-content {
    display: block;
  }
  
  @media (max-width: 768px) {
    nav {
      flex-direction: column;
      padding: 1rem;
    }
    
    .logo {
      margin-bottom: 1rem;
    }
    
    .nav-links {
      width: 100%;
      justify-content: space-around;
    }
    
    .nav-links li {
      margin: 0;
    }
  }
</style>