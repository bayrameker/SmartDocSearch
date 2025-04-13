<script>
  import { 
    Box, 
    Heading, 
    Text,
    Flex,
    Alert,
    AlertIcon,
    Spinner,
    Card,
    Divider,
    Stack,
    Button,
    Badge,
    useToast,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { user } from '../../lib/store';
  import { navigate } from '$app/navigation';
  import { queryDocuments, getQueryHistory } from '../../lib/api';
  import QueryBox from '../../components/QueryBox.svelte';

  const toast = useToast();
  
  let queryResults = null;
  let loading = false;
  let error = null;
  let history = [];
  let loadingHistory = false;
  
  onMount(async () => {
    if (!$user) {
      navigate('/login');
      return;
    }
    
    await loadQueryHistory();
  });
  
  async function loadQueryHistory() {
    try {
      loadingHistory = true;
      const result = await getQueryHistory();
      history = result.history;
    } catch (err) {
      console.error('Failed to load query history:', err);
    } finally {
      loadingHistory = false;
    }
  }
  
  async function performQuery(query) {
    if (!query.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a question',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      loading = true;
      error = null;
      
      queryResults = await queryDocuments(query);
      
      // Refresh history
      await loadQueryHistory();
      
    } catch (err) {
      error = err.message || 'Query failed';
      toast({
        title: 'Query Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      loading = false;
    }
  }
  
  function handleQuery(event) {
    const query = event.detail;
    performQuery(query);
  }
  
  function useHistoryQuery(query) {
    document.getElementById('query-input').value = query;
    performQuery(query);
  }
</script>

<Box py={4}>
  <Heading size="lg" mb={6}>Document Query</Heading>
  
  <Text mb={4}>
    Ask questions about your documents and get AI-powered answers based on your content.
  </Text>
  
  <QueryBox onQuery={handleQuery} />
  
  {#if loading}
    <Box textAlign="center" py={8}>
      <Spinner size="xl" color="blue.500" />
      <Text mt={4}>Generating answer...</Text>
    </Box>
  {:else if error}
    <Alert status="error" mt={6}>
      <AlertIcon />
      {error}
    </Alert>
  {:else if queryResults}
    <Card p={5} mt={6} boxShadow="md" borderRadius="md">
      <Badge colorScheme="blue" mb={3}>Intent: {queryResults.intent || 'General'}</Badge>
      
      <Heading size="md" mb={4}>Answer</Heading>
      <Text whiteSpace="pre-line" mb={4}>{queryResults.answer}</Text>
      
      {#if queryResults.sources && queryResults.sources.length > 0}
        <Divider my={4} />
        
        <Accordion allowToggle>
          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Sources ({queryResults.sources.length})</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <Stack spacing={3}>
                {#each queryResults.sources as source}
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Flex mb={2}>
                      <Badge colorScheme="green" mr={2}>Doc ID: {source.documentId}</Badge>
                      <Badge colorScheme="purple">Relevance: {source.score.toFixed(2)}</Badge>
                    </Flex>
                    <Text fontSize="sm">{source.text}</Text>
                  </Box>
                {/each}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      {/if}
    </Card>
  {/if}
  
  {#if history.length > 0}
    <Box mt={8}>
      <Heading size="md" mb={4}>Recent Queries</Heading>
      
      <Accordion allowMultiple>
        {#each history as query}
          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text>{query.query}</Text>
                </Box>
                <Text fontSize="sm" color="gray.500" mr={2}>
                  {new Date(query.createdAt).toLocaleString()}
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <Text whiteSpace="pre-line" mb={3}>{query.response}</Text>
              
              <Flex justify="flex-end">
                <Button size="sm" colorScheme="blue" onClick={() => useHistoryQuery(query.query)}>
                  Ask Again
                </Button>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        {/each}
      </Accordion>
    </Box>
  {/if}
</Box>
