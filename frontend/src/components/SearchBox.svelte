<script>
  import { 
    Box, 
    Input, 
    InputGroup, 
    InputRightElement, 
    Button,
    FormControl
  } from '@chakra-ui/svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let onSearch = () => {};
  export let initialValue = '';
  
  const dispatch = createEventDispatcher();
  
  let searchQuery = initialValue;
  let searchInput;
  
  onMount(() => {
    if (searchInput) {
      searchInput.focus();
    }
  });
  
  function handleSubmit(event) {
    event.preventDefault();
    dispatch('search', searchQuery);
    onSearch(searchQuery);
  }
</script>

<Box as="form" onSubmit={handleSubmit} mb={6}>
  <FormControl>
    <InputGroup size="lg">
      <Input
        placeholder="Search documents..."
        value={searchQuery}
        on:input={(e) => searchQuery = e.target.value}
        borderRadius="full"
        bg="white"
        bind:this={searchInput}
      />
      <InputRightElement width="4.5rem" right="0.25rem">
        <Button 
          h="1.75rem" 
          size="sm" 
          colorScheme="blue"
          borderRadius="full"
          type="submit"
          aria-label="Search"
        >
          <i class="fas fa-search"></i>
        </Button>
      </InputRightElement>
    </InputGroup>
  </FormControl>
</Box>
