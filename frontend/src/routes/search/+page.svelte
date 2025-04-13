<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { searchDocuments } from '../../lib/api';
  import { searchQuery, searchResults, user, loading } from '../../lib/store';
  
  let page = 1;
  let limit = 10;
  let totalResults = 0;
  let totalPages = 1;
  let isLoading = false;
  let error = null;
  
  // Filter options
  let filters = {
    dateStart: '',
    dateEnd: '',
    fileTypes: [],
    categories: []
  };
  
  // Available filter options (would normally come from API)
  const fileTypeOptions = ['PDF', 'DOCX', 'PPTX', 'TXT'];
  const categoryOptions = ['Rapor', 'Sunum', 'Form', 'Fatura', 'Diğer'];
  
  onMount(async () => {
    if (!$user) {
      goto('/login');
      return;
    }
    
    // If there's a query in the store, search with it
    if ($searchQuery) {
      await handleSearch();
    }
  });
  
  async function handleSearch(event) {
    if (event) event.preventDefault();
    
    if (!$searchQuery.trim()) return;
    
    try {
      isLoading = true;
      error = null;
      
      const result = await searchDocuments($searchQuery, page, limit);
      $searchResults = result.documents;
      totalResults = result.total;
      totalPages = Math.ceil(totalResults / limit);
    } catch (err) {
      console.error('Arama hatası:', err);
      error = 'Arama sırasında bir hata oluştu.';
    } finally {
      isLoading = false;
    }
  }
  
  function handleClear() {
    $searchQuery = '';
    $searchResults = [];
    totalResults = 0;
    totalPages = 1;
    error = null;
  }
  
  function viewDocument(doc) {
    goto(`/documents/${doc.id}`);
  }
  
  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      page = newPage;
      handleSearch();
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
  
  function toggleFilter(filterType, value) {
    if (filters[filterType].includes(value)) {
      filters[filterType] = filters[filterType].filter(v => v !== value);
    } else {
      filters[filterType] = [...filters[filterType], value];
    }
    
    // Re-search with filters
    if ($searchQuery) {
      handleSearch();
    }
  }
</script>

<div class="search-page">
  <div class="search-container">
    <h1>Belgeleri Ara</h1>
    
    <form on:submit={handleSearch} class="search-form">
      <div class="search-input-container">
        <input 
          type="text" 
          bind:value={$searchQuery} 
          placeholder="Anahtar kelimeler veya doğal dilde arama yapın..."
          disabled={isLoading}
          class="search-input"
        />
        
        <div class="search-buttons">
          {#if $searchQuery}
            <button 
              type="button" 
              class="btn-icon" 
              on:click={handleClear}
              title="Temizle"
            >
              <i class="fas fa-times"></i>
            </button>
          {/if}
          
          <button 
            type="submit" 
            class="btn-primary"
            disabled={isLoading || !$searchQuery.trim()}
          >
            {#if isLoading}
              <i class="fas fa-spinner fa-spin"></i>
            {:else}
              <i class="fas fa-search"></i>
            {/if}
            Ara
          </button>
        </div>
      </div>
    </form>
    
    <div class="search-content">
      <aside class="filters">
        <h2>Filtreler</h2>
        
        <div class="filter-group">
          <h3>Tarih Aralığı</h3>
          <div class="date-range">
            <div class="form-group">
              <label for="date-start">Başlangıç</label>
              <input 
                type="date" 
                id="date-start" 
                bind:value={filters.dateStart}
              />
            </div>
            <div class="form-group">
              <label for="date-end">Bitiş</label>
              <input 
                type="date" 
                id="date-end" 
                bind:value={filters.dateEnd}
              />
            </div>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Dosya Türleri</h3>
          <div class="checkbox-group">
            {#each fileTypeOptions as fileType}
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.fileTypes.includes(fileType)}
                  on:change={() => toggleFilter('fileTypes', fileType)}
                />
                {fileType}
              </label>
            {/each}
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Kategoriler</h3>
          <div class="checkbox-group">
            {#each categoryOptions as category}
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.categories.includes(category)}
                  on:change={() => toggleFilter('categories', category)}
                />
                {category}
              </label>
            {/each}
          </div>
        </div>
      </aside>
      
      <div class="results">
        {#if error}
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> {error}
          </div>
        {:else if isLoading}
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Aranıyor...
          </div>
        {:else if $searchResults.length === 0}
          {#if $searchQuery}
            <div class="no-results">
              <div class="icon">
                <i class="fas fa-search"></i>
              </div>
              <h2>Sonuç bulunamadı</h2>
              <p>"{$searchQuery}" için hiçbir belge bulunamadı. Lütfen arama kriterlerinizi değiştirin.</p>
            </div>
          {:else}
            <div class="search-info">
              <div class="icon">
                <i class="fas fa-search"></i>
              </div>
              <h2>Belgelerinde Ara</h2>
              <p>Anahtar kelimeler veya doğal dilde sorgular ile belgelerinizde arama yapın.</p>
              <p class="examples">
                <strong>Örnekler:</strong>
                <span>finansal raporlar 2023</span>
                <span>2022 ve 2023 arasındaki satış faturaları</span>
                <span>GDPR ile ilgili belgeler</span>
              </p>
            </div>
          {/if}
        {:else}
          <div class="results-header">
            <div class="results-count">
              <span>{totalResults} sonuç bulundu</span>
            </div>
            <div class="results-sort">
              <label for="sort">Sıralama:</label>
              <select id="sort">
                <option value="relevance">İlgililik</option>
                <option value="date-desc">Tarih (Yeni-Eski)</option>
                <option value="date-asc">Tarih (Eski-Yeni)</option>
                <option value="title">Başlık (A-Z)</option>
              </select>
            </div>
          </div>
          
          <div class="results-list">
            {#each $searchResults as document}
              <div class="result-item" on:click={() => viewDocument(document)}>
                <div class="result-icon">
                  <i class={getDocTypeIcon(document.mimeType)}></i>
                </div>
                <div class="result-content">
                  <h3 class="result-title">{document.title}</h3>
                  <p class="result-meta">
                    <span>{formatDate(document.createdAt)}</span>
                    <span>·</span>
                    <span>{document.pageCount} sayfa</span>
                    {#if document.category}
                      <span>·</span>
                      <span>{document.category}</span>
                    {/if}
                  </p>
                  {#if document.matchedText}
                    <p class="result-match">
                      {@html document.matchedText}
                    </p>
                  {/if}
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
    </div>
  </div>
</div>

<style>
  .search-page {
    padding: 1rem 0;
  }
  
  .search-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 1.75rem;
    margin: 0 0 1.5rem;
  }
  
  .search-form {
    margin-bottom: 2rem;
  }
  
  .search-input-container {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .search-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
  
  .search-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-icon {
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 0 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  
  .btn-icon:hover {
    background-color: #cbd5e0;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
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
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .search-content {
    display: flex;
    gap: 2rem;
  }
  
  .filters {
    flex: 0 0 250px;
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    align-self: flex-start;
    position: sticky;
    top: 1rem;
  }
  
  .filters h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .filter-group {
    margin-bottom: 1.5rem;
  }
  
  .filter-group h3 {
    font-size: 1rem;
    margin: 0 0 0.75rem;
  }
  
  .date-range {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .form-group label {
    font-size: 0.875rem;
    color: #4a5568;
  }
  
  .form-group input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
  }
  
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
  
  .results {
    flex: 1;
  }
  
  .error-message {
    background-color: #fed7d7;
    color: #c53030;
    padding: 0.75rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .loading, .no-results, .search-info {
    text-align: center;
    padding: 3rem 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .loading {
    color: #718096;
  }
  
  .no-results .icon, .search-info .icon {
    font-size: 3rem;
    color: #a0aec0;
    margin-bottom: 1rem;
  }
  
  .no-results h2, .search-info h2 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
  }
  
  .no-results p, .search-info p {
    color: #718096;
    margin: 0 0 0.5rem;
  }
  
  .examples {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .examples span {
    background-color: #ebf8ff;
    color: #2b6cb0;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    display: inline-block;
  }
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .results-count {
    font-size: 0.875rem;
    color: #718096;
  }
  
  .results-sort {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
  
  .results-sort select {
    padding: 0.375rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
  }
  
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .result-item {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    display: flex;
    gap: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .result-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .result-icon {
    font-size: 1.5rem;
    color: #3182ce;
    padding-top: 0.25rem;
  }
  
  .result-content {
    flex: 1;
  }
  
  .result-title {
    font-size: 1.125rem;
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .result-meta {
    font-size: 0.75rem;
    color: #718096;
    display: flex;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
  }
  
  .result-match {
    font-size: 0.875rem;
    color: #4a5568;
    margin: 0;
    line-height: 1.5;
  }
  
  .result-match :global(mark) {
    background-color: #fefcbf;
    padding: 0.125rem;
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
  
  @media (max-width: 768px) {
    .search-content {
      flex-direction: column;
    }
    
    .filters {
      flex: 0 0 auto;
      width: 100%;
      position: static;
    }
  }
</style>