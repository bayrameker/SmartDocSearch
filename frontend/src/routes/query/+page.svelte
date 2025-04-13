<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '../../lib/store';
  import { queryDocuments, getQueryHistory } from '../../lib/api';
  
  let query = '';
  let queryResults = null;
  let loading = false;
  let error = null;
  let history = [];
  let loadingHistory = false;
  let openAccordions = {};
  
  onMount(async () => {
    if (!$user) {
      goto('/login');
      return;
    }
    
    await loadQueryHistory();
  });
  
  async function loadQueryHistory() {
    try {
      loadingHistory = true;
      const result = await getQueryHistory();
      history = result.history || [];
    } catch (err) {
      console.error('Sorgu geçmişi yüklenirken hata oluştu:', err);
    } finally {
      loadingHistory = false;
    }
  }
  
  async function performQuery() {
    if (!query.trim()) {
      error = 'Lütfen bir soru girin.';
      return;
    }
    
    try {
      loading = true;
      error = null;
      
      queryResults = await queryDocuments(query);
      
      // Refresh history
      await loadQueryHistory();
      
    } catch (err) {
      error = err.message || 'Sorgu başarısız oldu.';
    } finally {
      loading = false;
    }
  }
  
  function useHistoryQuery(historyQuery) {
    query = historyQuery;
    performQuery();
  }
  
  function toggleAccordion(id) {
    openAccordions[id] = !openAccordions[id];
    openAccordions = {...openAccordions};
  }
</script>

<div class="query-page">
  <h1>Belge Sorgulama</h1>
  
  <p class="description">
    Belgeleriniz hakkında sorular sorun ve içeriğinize dayalı YZ destekli cevaplar alın.
  </p>
  
  <div class="query-box">
    <textarea
      bind:value={query}
      placeholder="Sorgunuzu yazın (örnek: Bu belgedeki ana konular nelerdir?)"
      disabled={loading}
      class="query-input"
      on:keydown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          performQuery();
        }
      }}
    ></textarea>
    
    <button 
      class="btn-primary" 
      on:click={performQuery}
      disabled={loading || !query.trim()}
    >
      {#if loading}
        <i class="fas fa-spinner fa-spin"></i> Sorgulanıyor...
      {:else}
        <i class="fas fa-search"></i> Sorgula
      {/if}
    </button>
  </div>
  
  {#if error}
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i> {error}
    </div>
  {/if}
  
  {#if loading}
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cevap oluşturuluyor...</p>
    </div>
  {:else if queryResults}
    <div class="result-card">
      {#if queryResults.intent}
        <div class="badge intent-badge">
          Niyet: {queryResults.intent}
        </div>
      {/if}
      
      <h2>Cevap</h2>
      <div class="answer">
        {queryResults.answer}
      </div>
      
      {#if queryResults.sources && queryResults.sources.length > 0}
        <div class="divider"></div>
        
        <div class="accordion">
          <div 
            class="accordion-header" 
            on:click={() => toggleAccordion('sources')}
          >
            <h3>Kaynaklar ({queryResults.sources.length})</h3>
            <i class={`fas fa-chevron-${openAccordions['sources'] ? 'up' : 'down'}`}></i>
          </div>
          
          {#if openAccordions['sources']}
            <div class="accordion-content">
              <div class="source-list">
                {#each queryResults.sources as source}
                  <div class="source-item">
                    <div class="source-badges">
                      <span class="badge doc-badge">
                        Belge ID: {source.documentId}
                      </span>
                      <span class="badge relevance-badge">
                        İlgililik: {source.score.toFixed(2)}
                      </span>
                    </div>
                    <div class="source-text">
                      {source.text}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if history.length > 0}
    <div class="history-section">
      <h2>Son Sorgular</h2>
      
      <div class="history-list">
        {#each history as item, index}
          <div class="history-item">
            <div 
              class="history-header" 
              on:click={() => toggleAccordion(`history-${index}`)}
            >
              <div class="history-query">{item.query}</div>
              <div class="history-meta">
                <span class="history-date">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
                <i class={`fas fa-chevron-${openAccordions[`history-${index}`] ? 'up' : 'down'}`}></i>
              </div>
            </div>
            
            {#if openAccordions[`history-${index}`]}
              <div class="history-content">
                <div class="history-response">
                  {item.response}
                </div>
                
                <div class="history-actions">
                  <button 
                    class="btn-secondary"
                    on:click={() => useHistoryQuery(item.query)}
                  >
                    Tekrar Sor
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .query-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem 0;
  }
  
  h1 {
    font-size: 1.75rem;
    margin: 0 0 1rem;
    color: #2d3748;
  }
  
  .description {
    color: #4a5568;
    margin-bottom: 1.5rem;
  }
  
  .query-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .query-input {
    width: 100%;
    min-height: 100px;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
    resize: vertical;
    font-family: inherit;
  }
  
  .query-input:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
  
  .btn-primary {
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
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-secondary:hover {
    background-color: #cbd5e0;
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
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: #718096;
  }
  
  .loading i {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .result-card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .intent-badge {
    background-color: #ebf8ff;
    color: #3182ce;
  }
  
  .doc-badge {
    background-color: #f0fff4;
    color: #38a169;
  }
  
  .relevance-badge {
    background-color: #faf5ff;
    color: #805ad5;
  }
  
  h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
    color: #2d3748;
  }
  
  h3 {
    font-size: 1rem;
    margin: 0;
    font-weight: 600;
    color: #2d3748;
  }
  
  .answer {
    white-space: pre-line;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 1.5rem 0;
  }
  
  .accordion {
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    overflow: hidden;
  }
  
  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    background-color: #f7fafc;
    transition: background-color 0.2s;
  }
  
  .accordion-header:hover {
    background-color: #edf2f7;
  }
  
  .accordion-content {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .source-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .source-item {
    padding: 0.75rem;
    background-color: #f7fafc;
    border-radius: 0.375rem;
  }
  
  .source-badges {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .source-text {
    font-size: 0.875rem;
    color: #4a5568;
  }
  
  .history-section {
    margin-top: 2rem;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .history-item {
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    overflow: hidden;
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    background-color: #f7fafc;
    transition: background-color 0.2s;
  }
  
  .history-header:hover {
    background-color: #edf2f7;
  }
  
  .history-query {
    flex: 1;
    font-weight: 500;
  }
  
  .history-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .history-date {
    font-size: 0.75rem;
    color: #718096;
  }
  
  .history-content {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .history-response {
    white-space: pre-line;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  .history-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    .query-page {
      padding: 1rem;
    }
  }
</style>