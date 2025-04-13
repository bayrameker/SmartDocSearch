<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import DocumentUploader from '../../../components/DocumentUploader.svelte';
  import { user } from '../../../lib/store';

  onMount(() => {
    if (!$user) {
      goto('/login');
    }
  });

  function handleUploadSuccess() {
    // Başarılı yüklemeden sonra belge listesine dön
    goto('/documents');
  }
</script>

<div class="upload-page">
  <header>
    <h1>Belge Yükle</h1>
    <button class="btn-secondary" on:click={() => goto('/documents')}>
      <i class="fas fa-arrow-left"></i> Belgelere Dön
    </button>
  </header>

  <div class="uploader-container">
    <DocumentUploader onSuccess={handleUploadSuccess} />
  </div>
</div>

<style>
  .upload-page {
    padding: 1rem 0;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  h1 {
    font-size: 1.75rem;
    margin: 0;
  }
  
  .btn-secondary {
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .btn-secondary:hover {
    background-color: #cbd5e0;
  }
  
  .uploader-container {
    max-width: 700px;
    margin: 0 auto;
  }
</style>