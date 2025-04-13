<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getDocuments } from '../../lib/api';
  import { documents, documentLoading, user } from '../../lib/store';
  
  let page = 1;
  let limit = 10;
  let totalPages = 1;
  let viewType = 'grid'; // grid or list
  
  onMount(async () => {
    if (!$user) {
      goto('/login');
      return;
    }
    
    await loadDocuments();
  });
  
  async function loadDocuments() {
    try {
      $documentLoading = true;
      const result = await getDocuments(page, limit);
      $documents = result.documents;
      totalPages = Math.ceil(result.total / limit);
    } catch (err) {
      console.error('Dokümanlar yüklenirken hata oluştu:', err);
    } finally {
      $documentLoading = false;
    }
  }
  
  function handleView(document) {
    goto(`/documents/${document.id}`);
  }
  
  function handleDelete(document) {
    // Silme işlemini onaylama ve silme işlemi için modal eklenebilir
    if (confirm(`'${document.title}' belgesini silmek istediğinizden emin misiniz?`)) {
      // Silme işlemi
    }
  }
  
  function handleUpload() {
    goto('/documents/upload');
  }
  
  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      page = newPage;
      loadDocuments();
    }
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  function getDocTypeIcon(mimeType) {
    if (mimeType.includes('pdf')) {
      return 'fas fa-file-pdf';
    } else if (mimeType.includes('word') || mimeType.includes('docx')) {
      return 'fas fa-file-word';
    } else if (mimeType.includes('powerpoint') || mimeType.includes('pptx')) {
      return 'fas fa-file-powerpoint';
    } else if (mimeType.includes('text')) {
      return 'fas fa-file-alt';
    } else {
      return 'fas fa-file';
    }
  }
</script>

<div class="documents-page">
  <header>
    <h1>Dokümanlarım</h1>
    
    <div class="toolbar">
      <div class="view-options">
        <button 
          class={viewType === 'grid' ? 'active' : ''} 
          on:click={() => viewType = 'grid'}
        >
          <i class="fas fa-th-large"></i>
        </button>
        <button 
          class={viewType === 'list' ? 'active' : ''}
          on:click={() => viewType = 'list'}
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
      
      <button class="btn-primary" on:click={handleUpload}>
        <i class="fas fa-plus"></i> Belge Yükle
      </button>
    </div>
  </header>
  
  {#if $documentLoading}
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i> Dokümanlar Yükleniyor...
    </div>
  {:else if $documents.length === 0}
    <div class="empty-state">
      <div class="icon">
        <i class="fas fa-file-upload"></i>
      </div>
      <h2>Henüz hiç belge yüklemediniz</h2>
      <p>İlk belgenizi yüklemek için "Belge Yükle" butonuna tıklayın.</p>
      <button class="btn-primary" on:click={handleUpload}>
        <i class="fas fa-plus"></i> Belge Yükle
      </button>
    </div>
  {:else}
    <div class="document-container {viewType}">
      {#each $documents as document}
        <div class="document-card">
          <div class="document-icon">
            <i class={getDocTypeIcon(document.mimeType)}></i>
          </div>
          <div class="document-info">
            <h3 class="document-title">{document.title}</h3>
            <p class="document-meta">
              {formatDate(document.createdAt)} · {document.pageCount} sayfa
            </p>
            <p class="document-status">
              <span class="status-badge {document.status.toLowerCase()}">
                {document.status === 'PROCESSING' ? 'İşleniyor' : 
                 document.status === 'COMPLETED' ? 'Tamamlandı' : 
                 document.status === 'ERROR' ? 'Hata' : document.status}
              </span>
            </p>
          </div>
          <div class="document-actions">
            <button 
              class="action-btn view" 
              on:click={() => handleView(document)} 
              title="Görüntüle"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button 
              class="action-btn delete" 
              on:click={() => handleDelete(document)} 
              title="Sil"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
    
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          disabled={page === 1} 
          on:click={() => changePage(page - 1)}
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        {#each Array(totalPages) as _, i}
          <button 
            class={page === i + 1 ? 'active' : ''} 
            on:click={() => changePage(i + 1)}
          >
            {i + 1}
          </button>
        {/each}
        
        <button 
          disabled={page === totalPages} 
          on:click={() => changePage(page + 1)}
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .documents-page {
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
  
  .toolbar {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .view-options {
    display: flex;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    overflow: hidden;
  }
  
  .view-options button {
    background: white;
    border: none;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }
  
  .view-options button.active {
    background-color: #e2e8f0;
    color: #3182ce;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #718096;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background-color: #f7fafc;
    border-radius: 0.5rem;
  }
  
  .empty-state .icon {
    font-size: 3rem;
    color: #a0aec0;
    margin-bottom: 1rem;
  }
  
  .empty-state h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .empty-state p {
    color: #718096;
    margin-bottom: 1.5rem;
  }
  
  .document-container {
    display: grid;
    gap: 1rem;
  }
  
  .document-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .document-container.list {
    grid-template-columns: 1fr;
  }
  
  .document-card {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .document-container.list .document-card {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  
  .document-icon {
    font-size: 2rem;
    color: #3182ce;
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  
  .document-container.list .document-icon {
    margin-bottom: 0;
    font-size: 1.75rem;
    min-width: 40px;
  }
  
  .document-info {
    flex: 1;
  }
  
  .document-title {
    font-size: 1.125rem;
    margin: 0 0 0.25rem;
    word-break: break-word;
  }
  
  .document-meta {
    font-size: 0.875rem;
    color: #718096;
    margin: 0 0 0.25rem;
  }
  
  .document-status {
    font-size: 0.875rem;
    margin: 0.5rem 0 0;
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
  
  .document-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .document-container.list .document-actions {
    margin-top: 0;
  }
  
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .action-btn.view {
    color: #3182ce;
  }
  
  .action-btn.delete {
    color: #e53e3e;
  }
  
  .action-btn:hover {
    background-color: #f7fafc;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
    margin-top: 2rem;
  }
  
  .pagination button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  
  .pagination button.active {
    background-color: #3182ce;
    color: white;
    border-color: #3182ce;
  }
  
  .pagination button:disabled {
    color: #cbd5e0;
    cursor: not-allowed;
  }
</style>