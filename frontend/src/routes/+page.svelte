<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '../lib/store';
  
  let features = [
    {
      title: 'Belge Yükleme ve İşleme',
      description: 'PDF, Word, PowerPoint ve birçok belge formatını yükleyin. Sistem, belgelerinizin içeriğini otomatik olarak çıkarır.',
      icon: 'fa-file-upload'
    },
    {
      title: 'Akıllı Arama',
      description: 'Anahtar kelime araması ve anlamsal aramayı birleştiren gelişmiş arama özelliği. Gereksinim duyduğunuz bilgileri hızlı bir şekilde bulun.',
      icon: 'fa-search'
    },
    {
      title: 'YZ Destekli Sorgulama',
      description: 'Doğal dilde belgeleriniz hakkında sorular sorun ve anında yanıtlar alın. Yapay zeka, içeriği çözümleyerek doğru yanıtları sağlar.',
      icon: 'fa-robot'
    },
    {
      title: 'Güvenli Belge Yönetimi',
      description: 'Belgelerinizi güvenli bir şekilde depolayın ve yönetin. Dokümanlara kolay erişin ve istediğiniz zaman indirin.',
      icon: 'fa-lock'
    }
  ];
  
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });
  
  function handleGetStarted() {
    if ($user) {
      goto('/documents');
    } else {
      goto('/register');
    }
  }
</script>

<div class="landing-page">
  <section class="hero">
    <div class="hero-content">
      <h1>Akıllı Doküman Arama ve Sorgulama Sistemi</h1>
      <p class="subtitle">
        Belgelerinizi yükleyin, arama yapın ve doğal dilde sorular sorarak belgelerinizden bilgi çıkarın.
      </p>
      <div class="hero-actions">
        <button class="btn-primary" on:click={handleGetStarted}>
          <i class="fas fa-rocket"></i> Başla
        </button>
        <a href="/login" class="btn-outline">
          <i class="fas fa-sign-in-alt"></i> Giriş Yap
        </a>
      </div>
    </div>
    <div class="hero-image">
      <i class="fas fa-file-search hero-icon"></i>
    </div>
  </section>
  
  <section class="features">
    <h2>Özellikler</h2>
    <div class="features-grid">
      {#each features as feature}
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas {feature.icon}"></i>
          </div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      {/each}
    </div>
  </section>
  
  <section class="how-it-works">
    <h2>Nasıl Çalışır?</h2>
    
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Belgeleri Yükle</h3>
          <p>
            PDF, Word, PowerPoint ve diğer belge türlerini sisteme yükleyin. 
            Belgenin metnini ve yapısını otomatik olarak çıkarır.
          </p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Ara ve Keşfet</h3>
          <p>
            Anahtar kelimelerle veya anlamsal arama ile belgelerinizde ihtiyacınız olan bilgileri bulun.
            Arama sonuçları, ilgililik ve doğruluk için otomatik olarak sıralanır.
          </p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Sorular Sor</h3>
          <p>
            Doğal dilde sorular sorarak belgelerinizden bilgiler alın.
            YZ, belgelerinizde bulunan bilgilere dayanarak yanıtlar oluşturur.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="cta">
    <div class="cta-content">
      <h2>Bugün Başlayın!</h2>
      <p>
        Belge yönetimi, arama ve bilgi çıkarma deneyiminizi dönüştürün.
        Kayıt işlemi sadece birkaç dakika sürer.
      </p>
      <button class="btn-primary" on:click={handleGetStarted}>
        <i class="fas fa-rocket"></i> Hemen Başla
      </button>
    </div>
  </section>
</div>

<style>
  .landing-page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    padding: 2rem 0 4rem;
  }
  
  /* Hero Section */
  .hero {
    display: flex;
    align-items: center;
    gap: 2rem;
    min-height: 70vh;
  }
  
  .hero-content {
    flex: 1;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 1rem;
    color: #2d3748;
    line-height: 1.2;
  }
  
  .subtitle {
    font-size: 1.25rem;
    color: #4a5568;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
  
  .hero-actions {
    display: flex;
    gap: 1rem;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .btn-outline {
    background-color: transparent;
    color: #3182ce;
    border: 2px solid #3182ce;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    text-decoration: none;
  }
  
  .btn-outline:hover {
    background-color: rgba(49, 130, 206, 0.1);
  }
  
  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .hero-icon {
    font-size: 12rem;
    color: #3182ce;
    opacity: 0.2;
  }
  
  /* Features Section */
  .features {
    padding: 2rem 0;
  }
  
  h2 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
    color: #2d3748;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .feature-card {
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .feature-icon {
    font-size: 2.5rem;
    color: #3182ce;
    margin-bottom: 1.5rem;
  }
  
  .feature-card h3 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
    color: #2d3748;
  }
  
  .feature-card p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
  
  /* How It Works Section */
  .how-it-works {
    padding: 2rem 0;
  }
  
  .steps {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }
  
  .step-number {
    background-color: #3182ce;
    color: white;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-content h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .step-content p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
  
  /* CTA Section */
  .cta {
    background-color: #ebf8ff;
    padding: 4rem 2rem;
    border-radius: 1rem;
    text-align: center;
  }
  
  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .cta h2 {
    margin-bottom: 1rem;
  }
  
  .cta p {
    margin-bottom: 2rem;
    color: #4a5568;
  }
  
  /* Responsive Styles */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      text-align: center;
      min-height: auto;
      padding: 2rem 0;
    }
    
    .hero-actions {
      justify-content: center;
    }
    
    .hero-icon {
      font-size: 8rem;
    }
    
    .steps {
      padding: 0 1rem;
    }
    
    .step {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>