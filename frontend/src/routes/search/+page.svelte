<script>
  import { 
    Box, 
    Heading, 
    Text,
    Flex,
    Alert,
    AlertIcon,
    Spinner,
    Badge,
    Card,
    Divider,
    Highlight,
    Stack,
    Button,
    useToast
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { user } from '../../lib/store';
  import { navigate } from '$app/navigation';
  import { searchDocuments } from '../../lib/api';
  import SearchBox from '../../components/SearchBox.svelte';

  const toast = useToast();
  
  let searchResults = [];
  let loading = false;
  let error = null;
  let searchQuery = '';
  let searching = false;
  
  onMount(() => {
    // Get search query from URL if present
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchQuery = q;
      performSearch(q);
    }
  });
  
  async function performSearch(query) {
    if (!query.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      searching = true;
      loading = true;
      error = null;
      
      // Update URL with search query
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      history.pushState({}, '', url);
      
      searchResults = await searchDocuments(query);
      
    } catch (err) {
      error = err.message || 'Search failed';
      toast({
        title: 'Search Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      loading = false;
    }
  }
  
  function handleSearch(event) {
    const query = event.detail;
    searchQuery = query;
    performSearch(query);
  }
  
  function viewDocument(id) {
    navigate(`/documents/${id}`);
  }
</script>

<Box py={4}>
  <Heading size="lg" mb={6}>Document Search</Heading>
  
  <SearchBox onSearch={handleSearch} initialValue={searchQuery} />
  
  {#if loading}
    <Box textAlign="center" py={8}>
      <Spinner size="xl" color="blue.500" />
      <Text mt={4}>Searching documents...</Text>
    </Box>
  {:else if error}
    <Alert status="error" mt={6}>
      <AlertIcon />
      {error}
    </Alert>
  {:else if searching && searchResults.length === 0}
    <Box textAlign="center" py={8} bg="gray.50" borderRadius="md" mt={6}>
      <Text fontSize="lg">No documents found matching "{searchQuery}"</Text>
    </Box>
  {:else if searching}
    <Box mt={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text>{searchResults.length} results for "{searchQuery}"</Text>
      </Flex>
      
      <Stack spacing={4}>
        {#each searchResults as result}
          <Card p={4} boxShadow="md" borderRadius="md">
            <Heading size="md" mb={2}>
              <Highlight query={searchQuery} styles={{ bg: 'yellow.200' }}>
                {result.title}
              </Highlight>
            </Heading>
            
            <Flex gap={2} mb={3}>
              {#if result.metadata && result.metadata.author}
                <Badge colorScheme="blue">Author: {result.metadata.author}</Badge>
              {/if}
              <Badge colorScheme="purple">Score: {result.score.toFixed(2)}</Badge>
            </Flex>
            
            <Text mb={3}>
              <Highlight query={searchQuery} styles={{ bg: 'yellow.200' }}>
                {result.highlight}
              </Highlight>
            </Text>
            
            <Divider mb={3} />
            
            <Flex justify="flex-end">
              <Button size="sm" colorScheme="blue" onClick={() => viewDocument(result.id)}>
                View Document
              </Button>
            </Flex>
          </Card>
        {/each}
      </Stack>
    </Box>
  {/if}
</Box>
