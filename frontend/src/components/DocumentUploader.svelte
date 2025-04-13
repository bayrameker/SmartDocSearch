<script>
  import { onMount } from 'svelte';
  import { user } from '../lib/store';
  import { uploadDocument } from '../lib/api';

  export let onSuccess = () => {};
  
  let fileInput;
  let selectedFile = null;
  let title = '';
  let uploading = false;
  let uploadProgress = 0;
  let error = null;
  let successMessage = null;
  
  // Handle file selection
  function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) {
      selectedFile = null;
      return;
    }
    
    selectedFile = files[0];
    
    // Set default title from filename
    if (!title && selectedFile) {
      const filename = selectedFile.name;
      // Remove file extension for default title
      const lastDotIndex = filename.lastIndexOf('.');
      title = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    }
  }
  
  // Handle document upload
  async function handleUpload() {
    if (!selectedFile) {
      error = 'Lütfen yüklemek için bir dosya seçin';
      return;
    }
    
    if (!title.trim()) {
      error = 'Lütfen belge için bir başlık girin';
      return;
    }
    
    let progressInterval;
    
    try {
      uploading = true;
      error = null;
      successMessage = null;
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      
      console.log('Yükleniyor:', { fileName: selectedFile.name, fileSize: selectedFile.size, title });
      
      // Mock progress updates
      progressInterval = setInterval(() => {
        if (uploadProgress < 90) {
          uploadProgress += 10;
        }
      }, 500);
      
      const response = await uploadDocument(formData);
      console.log('Yükleme cevabı:', response);
      
      clearInterval(progressInterval);
      uploadProgress = 100;
      
      successMessage = 'Belge başarıyla yüklendi ve işleniyor';
      
      // Reset form
      selectedFile = null;
      title = '';
      fileInput.value = '';
      
      // Notify parent component
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      error = err.message || 'Belge yükleme başarısız oldu';
      console.error('Yükleme hatası:', err);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      uploading = false;
      uploadProgress = 0;
    }
  }
</script>

<div class="document-uploader">
  {#if error}
    <div class="alert alert-error">
      <i class="fas fa-exclamation-circle"></i> {error}
    </div>
  {/if}
  
  {#if successMessage}
    <div class="alert alert-success">
      <i class="fas fa-check-circle"></i> {successMessage}
    </div>
  {/if}
  
  <div class="form-group">
    <label for="title">Belge Başlığı</label>
    <input 
      type="text" 
      id="title"
      placeholder="Belge başlığını girin" 
      bind:value={title}
      disabled={uploading}
    />
    <div class="form-hint">
      Belgeniz için açıklayıcı bir isim
    </div>
  </div>
  
  <div class="form-group">
    <label for="file">Belge Dosyası</label>
    <input
      type="file"
      id="file"
      accept=".pdf,.txt,.docx,.doc"
      on:change={handleFileSelect}
      disabled={uploading}
      bind:this={fileInput}
    />
    <div class="form-hint">
      Desteklenen formatlar: PDF, TXT, DOCX, DOC (maks. 50MB)
    </div>
  </div>
  
  {#if selectedFile}
    <div class="file-info">
      <p><strong>Seçilen dosya:</strong> {selectedFile.name}</p>
      <p><strong>Boyut:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
      <p><strong>Tür:</strong> {selectedFile.type}</p>
    </div>
  {/if}
  
  {#if uploading}
    <div class="progress-container">
      <div class="progress-bar" style="width: {uploadProgress}%"></div>
    </div>
  {/if}
  
  <button 
    class="btn-upload"
    on:click={handleUpload} 
    disabled={!selectedFile || uploading}
  >
    {#if uploading}
      <i class="fas fa-spinner fa-spin"></i> Yükleniyor...
    {:else}
      <i class="fas fa-upload"></i> Belge Yükle  
    {/if}
  </button>
</div>

<style>
  .document-uploader {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .alert {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .alert-error {
    background-color: #fed7d7;
    color: #c53030;
  }
  
  .alert-success {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 1rem;
  }
  
  input[type="file"] {
    width: 100%;
    padding: 0.5rem 0;
    font-size: 1rem;
  }
  
  .form-hint {
    font-size: 0.875rem;
    color: #718096;
    margin-top: 0.25rem;
  }
  
  .file-info {
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1.5rem;
  }
  
  .file-info p {
    margin: 0.25rem 0;
  }
  
  .progress-container {
    height: 0.5rem;
    background-color: #edf2f7;
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #3182ce;
    transition: width 0.3s ease;
  }
  
  .btn-upload {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-upload:hover {
    background-color: #2b6cb0;
  }
  
  .btn-upload:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
</style>
