<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/store';

  // Redirect to documents page if already logged in
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });

  function handleGetStarted() {
    goto('/login');
  }
</script>

<div class="container">
  <header>
    <h1>Akıllı Doküman Arama ve Sorgulama Sistemi</h1>
    <p class="subtitle">
      YZ destekli belge işleme, arama ve sorgulama çözümüyle dokümanlarınızdan  
      daha fazla değer elde edin. Belgelerinizdeki bilgileri zahmetsizce bulun.
    </p>
    <button class="btn-primary" on:click={handleGetStarted}>
      Başlayın
    </button>
  </header>

  <div class="features">
    <div class="feature-card">
      <div class="icon">
        <i class="fas fa-file-upload"></i>
      </div>
      <h2>Kolay Doküman Yükleme</h2>
      <p>
        Dokümanlarınızı sürükleyip bırakın veya bilgisayarınızdan seçin. 
        PDF, Word, PowerPoint ve daha fazlasını destekler.
      </p>
    </div>
    
    <div class="feature-card">
      <div class="icon">
        <i class="fas fa-search"></i>
      </div>
      <h2>Gelişmiş Arama</h2>
      <p>
        Semantik arama ile içeriğe göz atmadan ilgili belgeleri bulun.
        Anlama dayalı filtreleme ile zamanınızı verimli kullanın.
      </p>
    </div>
    
    <div class="feature-card">
      <div class="icon">
        <i class="fas fa-robot"></i>
      </div>
      <h2>YZ ile Sorgulama</h2>
      <p>
        Dokümanlarınız hakkında doğal dilde sorular sorun.
        YZ destekli analiz ile anında cevaplar alın.
      </p>
    </div>
  </div>
  
  <section class="how-it-works">
    <h1>Nasıl Çalışır?</h1>
    
    <div class="step">
      <div class="step-content">
        <h2>1. Dokümanlarınızı Yükleyin</h2>
        <p>
          PDF, Word veya PowerPoint belgelerinizi sisteme yükleyin. 
          OCR teknolojisi ile taranmış belgelerdeki metin otomatik olarak çıkarılır.
        </p>
      </div>
      <div class="step-image">
        <i class="fas fa-cloud-upload-alt"></i>
      </div>
    </div>
    
    <div class="step reverse">
      <div class="step-content">
        <h2>2. İndeksleme ve Anlama</h2>
        <p>
          Sistem dokümanları otomatik olarak indeksler ve analiz eder. Vektör embeddingler 
          ile belgelerinizin içeriğini ve bağlamını anlayan bir model oluşturulur.
        </p>
      </div>
      <div class="step-image">
        <i class="fas fa-brain"></i>
      </div>
    </div>
    
    <div class="step">
      <div class="step-content">
        <h2>3. Sorgulama ve Arama</h2>
        <p>
          Doğal dilde sorular sorun veya anahtar kelimelerle arama yapın. 
          Semantik arama ve YZ sorgulama ile belgelerinizden hızlı ve doğru bilgiler elde edin.
        </p>
      </div>
      <div class="step-image">
        <i class="fas fa-comments"></i>
      </div>
    </div>
  </section>
  
  <div class="cta">
    <button class="btn-primary" on:click={handleGetStarted}>
      Şimdi Başlayın
    </button>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #1a202c;
  }
  
  .subtitle {
    font-size: 1.25rem;
    color: #4a5568;
    max-width: 800px;
    margin: 0 auto 1.5rem;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 4rem;
  }
  
  .feature-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    height: 100%;
  }
  
  .icon {
    font-size: 2rem;
    color: #3182ce;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: #1a202c;
  }
  
  .how-it-works {
    max-width: 800px;
    margin: 0 auto 3rem;
  }
  
  .how-it-works h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .step {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    align-items: center;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-image {
    flex: 1;
    background-color: #f7fafc;
    height: 200px;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .step-image i {
    font-size: 4rem;
    color: #3182ce;
  }
  
  .reverse {
    flex-direction: row-reverse;
  }
  
  .cta {
    text-align: center;
    margin-top: 2rem;
  }
  
  @media (max-width: 768px) {
    .step {
      flex-direction: column;
    }
    
    .reverse {
      flex-direction: column;
    }
    
    .step-content {
      text-align: center;
    }
  }
</style>