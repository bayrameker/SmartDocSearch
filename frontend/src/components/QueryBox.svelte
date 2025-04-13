<script>
  import { 
    Box, 
    Textarea, 
    Button,
    FormControl,
    InputGroup,
    FormHelperText,
    Flex,
    useToast
  } from '@chakra-ui/svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let onQuery = () => {};
  export let initialValue = '';
  
  const dispatch = createEventDispatcher();
  const toast = useToast();
  
  let queryText = initialValue;
  let queryInput;
  
  onMount(() => {
    if (queryInput) {
      queryInput.focus();
    }
  });
  
  function handleSubmit(event) {
    event.preventDefault();
    
    if (!queryText.trim()) {
      toast({
        title: 'Empty query',
        description: 'Please enter a question',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    dispatch('query', queryText);
    onQuery(queryText);
  }
  
  function handleKeyPress(event) {
    // Submit on Ctrl+Enter or Command+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit(event);
    }
  }
</script>

<Box as="form" onSubmit={handleSubmit} mb={6} bg="white" p={5} borderRadius="md" boxShadow="sm">
  <FormControl>
    <Textarea
      id="query-input"
      placeholder="Ask a question about your documents..."
      value={queryText}
      on:input={(e) => queryText = e.target.value}
      on:keydown={handleKeyPress}
      minHeight="120px"
      mb={3}
      bind:this={queryInput}
    />
    <FormHelperText mb={3}>
      Example questions: "Summarize the key points in my document", "What are the main findings?", "When was this document created?"
    </FormHelperText>
    
    <Flex justify="flex-end">
      <Button 
        colorScheme="teal" 
        type="submit"
        rightIcon={<i class="fas fa-paper-plane"></i>}
      >
        Ask Question
      </Button>
    </Flex>
  </FormControl>
</Box>
