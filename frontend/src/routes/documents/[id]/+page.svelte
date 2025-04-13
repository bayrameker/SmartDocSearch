<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getDocument, getDocumentDownloadUrl, queryDocuments } from '../../../lib/api';
  import { currentDocument, documentLoading, queryResult, queryLoading, queryText } from '../../../lib/store';
  
  export let data;
  let id = data?.id;
  let document;
  let loading = true;
  let error = null;
  
  // For the query panel
  let showQueryPanel = false;
  let searchQuery = '';
  
  onMount(async () => {
    // If no ID in route data (SvelteKit issue), try to extract from URL
    if (!id) {
      const parts = window.location.pathname.split('/');
      id = parseInt(parts[parts.length - 1]);
    }
    
    if (!id || isNaN(id)) {
      error = 'Geçersiz belge ID';
      loading = false;
      return;
    }
    
    try {
      loading = true;
      document = await getDocument(id);
      $currentDocument = document;
    } catch (err) {
      console.error('Belge detayları yüklenirken hata oluştu:', err);
      error = 'Belge yüklenirken bir hata oluştu.';
    } finally {
      loading = false;
    }
  });
  
  function handleBack() {
    goto('/documents');
  }
  
  function handleDownload() {
    const downloadUrl = getDocumentDownloadUrl(id);
    window.open(downloadUrl, '_blank');
  }
  
  function handleDelete() {
    if (confirm(`"${document.title}" belgesini silmek istediğinizden emin misiniz?`)) {
      // Silme işlemi sonra eklenecek
    }
  }
  
  function toggleQueryPanel() {
    showQueryPanel = !showQueryPanel;
  }
  
  async function submitQuery() {
    if (!searchQuery.trim()) return;
    
    try {
      $queryLoading = true;
      $queryText = searchQuery;
      const result = await queryDocuments(searchQuery);
      $queryResult = result;
    } catch (err) {
      console.error('Sorgu işlenirken hata oluştu:', err);
    } finally {
      $queryLoading = false;
    }
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  function getDocTypeIcon(mimeType) {
    if (mimeType?.includes('pdf')) {
      return 'fas fa-file-pdf';
    } else if (mimeType?.includes('word') || mimeType?.includes('docx')) {
      return 'fas fa-file-word';
    } else if (mimeType?.includes('powerpoint') || mimeType?.includes('pptx')) {
      return 'fas fa-file-powerpoint';
    } else if (mimeType?.includes('text')) {
      return 'fas fa-file-alt';
    } else {
      return 'fas fa-file';
    }
  }
</script>

<div class="document-detail-page">
  <div class="actions-bar">
    <button class="btn-secondary" on:click={handleBack}>
      <i class="fas fa-arrow-left"></i> Geri
    </button>
    
    <div class="right-actions">
      <button class="btn-secondary" on:click={toggleQueryPanel}>
        <i class="fas fa-search"></i> Sorgula
      </button>
      <button class="btn-secondary" on:click={handleDownload}>
        <i class="fas fa-download"></i> İndir
      </button>
      <button class="btn-danger" on:click={handleDelete}>
        <i class="fas fa-trash-alt"></i> Sil
      </button>
    </div>
  </div>
  
  {#if loading}
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i> Belge Yükleniyor...
    </div>
  {:else if error}
    <div class="error">
      <div class="icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2>Hata Oluştu</h2>
      <p>{error}</p>
      <button class="btn-primary" on:click={handleBack}>
        Belgelere Dön
      </button>
    </div>
  {:else}
    <div class="document-detail">
      <div class="document-header">
        <div class="icon">
          <i class={getDocTypeIcon(document.mimeType)}></i>
        </div>
        <div class="info">
          <h1>{document.title}</h1>
          <div class="metadata">
            <span>
              <i class="fas fa-calendar"></i> {formatDate(document.createdAt)}
            </span>
            <span>
              <i class="fas fa-file-alt"></i> {document.pageCount} sayfa
            </span>
            <span>
              <i class="fas fa-tag"></i> {document.category || 'Kategorisiz'}
            </span>
            <span class="status-badge {document.status.toLowerCase()}">
              {document.status === 'PROCESSING' ? 'İşleniyor' : 
               document.status === 'COMPLETED' ? 'Tamamlandı' : 
               document.status === 'ERROR' ? 'Hata' : document.status}
            </span>
          </div>
        </div>
      </div>
      
      {#if document.description}
        <div class="document-description">
          <h2>Açıklama</h2>
          <p>{document.description}</p>
        </div>
      {/if}
      
      {#if document.content}
        <div class="document-content">
          <h2>İçerik</h2>
          <div class="content-preview">
            <p>{document.content}</p>
          </div>
        </div>
      {/if}
      
      {#if document.entities && document.entities.length > 0}
        <div class="document-entities">
          <h2>Tespit Edilen Varlıklar</h2>
          <div class="entity-list">
            {#each document.entities as entity}
              <span class="entity-badge" title={entity.type}>
                {entity.text}
              </span>
            {/each}
          </div>
        </div>
      {/if}
      
      {#if document.keywords && document.keywords.length > 0}
        <div class="document-keywords">
          <h2>Anahtar Kelimeler</h2>
          <div class="keyword-list">
            {#each document.keywords as keyword}
              <span class="keyword-badge">
                {keyword}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
  
  {#if showQueryPanel}
    <div class="query-panel">
      <div class="query-header">
        <h2>Belge Hakkında Soru Sor</h2>
        <button class="close-btn" on:click={toggleQueryPanel}>
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="query-input">
        <input 
          type="text" 
          bind:value={searchQuery} 
          placeholder="Örn: Bu belgedeki ana fikirler nelerdir?"
          on:keydown={(e) => e.key === 'Enter' && submitQuery()}
        />
        <button 
          class="btn-primary" 
          on:click={submitQuery}
          disabled={$queryLoading}
        >
          {#if $queryLoading}
            <i class="fas fa-spinner fa-spin"></i>
          {:else}
            <i class="fas fa-search"></i>
          {/if}
          Sorgula
        </button>
      </div>
      
      {#if $queryResult}
        <div class="query-result">
          <h3>Cevap</h3>
          <div class="answer">
            {$queryResult.answer}
          </div>
          
          {#if $queryResult.sources && $queryResult.sources.length > 0}
            <div class="sources">
              <h4>Kaynaklar</h4>
              <ul>
                {#each $queryResult.sources as source}
                  <li>
                    {source.text}
                    <small>Sayfa: {source.page || 'Bilinmiyor'}</small>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .document-detail-page {
    position: relative;
    padding-bottom: 2rem;
  }
  
  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .right-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-secondary, .btn-primary, .btn-danger {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .btn-secondary {
    background-color: #edf2f7;
    color: #4a5568;
  }
  
  .btn-secondary:hover {
    background-color: #e2e8f0;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .btn-danger {
    background-color: #fff5f5;
    color: #e53e3e;
  }
  
  .btn-danger:hover {
    background-color: #fed7d7;
  }
  
  .loading, .error {
    text-align: center;
    padding: 3rem 1rem;
    background-color: #f7fafc;
    border-radius: 0.5rem;
  }
  
  .loading {
    color: #718096;
  }
  
  .error .icon {
    color: #e53e3e;
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .error h2 {
    margin-bottom: 0.5rem;
  }
  
  .error p {
    margin-bottom: 1.5rem;
    color: #718096;
  }
  
  .document-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .document-header .icon {
    font-size: 3rem;
    color: #3182ce;
  }
  
  .document-header .info {
    flex: 1;
  }
  
  .document-header h1 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem;
    word-break: break-word;
  }
  
  .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
    color: #718096;
  }
  
  .metadata span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-badge.completed {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  .status-badge.processing {
    background-color: #bee3f8;
    color: #2b6cb0;
  }
  
  .status-badge.error {
    background-color: #fed7d7;
    color: #c53030;
  }
  
  .document-description, .document-content, .document-entities, .document-keywords {
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.25rem;
    margin: 0 0 0.75rem;
    color: #2d3748;
  }
  
  .content-preview {
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-line;
  }
  
  .entity-list, .keyword-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .entity-badge, .keyword-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
  }
  
  .entity-badge {
    background-color: #ebf4ff;
    color: #3182ce;
  }
  
  .keyword-badge {
    background-color: #edf2f7;
    color: #4a5568;
  }
  
  .query-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    max-width: 100%;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }
  
  .query-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .query-header h2 {
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #718096;
  }
  
  .query-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .query-input input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  
  .query-result {
    flex: 1;
    overflow-y: auto;
  }
  
  .query-result h3 {
    font-size: 1.125rem;
    margin: 0 0 0.5rem;
  }
  
  .answer {
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    white-space: pre-line;
  }
  
  .sources h4 {
    font-size: 0.875rem;
    margin: 0 0 0.5rem;
  }
  
  .sources ul {
    padding-left: 1.5rem;
    font-size: 0.875rem;
    color: #718096;
  }
  
  .sources li {
    margin-bottom: 0.5rem;
  }
  
  .sources small {
    display: block;
    color: #a0aec0;
    margin-top: 0.25rem;
  }
  
  @media (max-width: 768px) {
    .query-panel {
      width: 100%;
    }
    
    .document-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .metadata {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>