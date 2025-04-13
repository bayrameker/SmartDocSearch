<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let queryText = '';
  let loading = false;
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!queryText.trim()) return;
    
    dispatch('query', queryText.trim());
  }
</script>

<div class="query-box">
  <form on:submit={handleSubmit}>
    <div class="input-container">
      <textarea
        id="query-input"
        bind:value={queryText}
        placeholder="Sorgunuzu yazın (örnek: Bu belgedeki ana konular nelerdir?)"
        disabled={loading}
        on:keydown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      ></textarea>
      
      <div class="actions">
        <button 
          type="submit" 
          class="btn-primary" 
          disabled={loading || !queryText.trim()}
        >
          {#if loading}
            <i class="fas fa-spinner fa-spin"></i> Sorgulanıyor...
          {:else}
            <i class="fas fa-search"></i> Sorgula
          {/if}
        </button>
      </div>
    </div>
  </form>
</div>

<style>
  .query-box {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
    resize: vertical;
    font-family: inherit;
  }
  
  textarea:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .btn-primary {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary:hover {
    background-color: #2b6cb0;
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>