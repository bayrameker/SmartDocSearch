<script>
  import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    Flex,
    Alert,
    AlertIcon,
    Spinner,
    Badge,
    Card,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Divider,
    useToast,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '../../../lib/store';
  import { navigate } from '$app/navigation';
  import { getDocument, getDocumentDownloadUrl, queryDocuments } from '../../../lib/api';
  import QueryBox from '../../../components/QueryBox.svelte';

  const toast = useToast();
  
  export let data;
  
  let document = data.document;
  let loading = false;
  let error = null;
  let queryResults = null;
  let queryLoading = false;
  
  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  // Returns the appropriate status badge color
  function getStatusColor(status) {
    switch (status.toLowerCase()) {
      case 'processing': return 'yellow';
      case 'indexed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  }
  
  // Handle document download
  function downloadDocument() {
    if (!document) return;
    
    const downloadUrl = getDocumentDownloadUrl(document.id);
    window.open(downloadUrl, '_blank');
  }
  
  // Handle query submission
  async function handleQuery(event) {
    const query = event.detail;
    
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
      queryLoading = true;
      queryResults = null;
      
      // Add document title to the query for better context
      const enrichedQuery = `About the document "${document.title}": ${query}`;
      
      queryResults = await queryDocuments(enrichedQuery);
      
    } catch (err) {
      toast({
        title: 'Query Error',
        description: err.message || 'Query failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      queryLoading = false;
    }
  }
</script>

<Box py={4}>
  {#if loading}
    <Box textAlign="center" py={8}>
      <Spinner size="xl" color="blue.500" />
      <Text mt={4}>Loading document...</Text>
    </Box>
  {:else if error}
    <Alert status="error" mb={6}>
      <AlertIcon />
      {error}
    </Alert>
  {:else if document}
    <Flex justifyContent="space-between" alignItems="center" mb={6}>
      <Box>
        <Heading size="lg">{document.title}</Heading>
        <Flex gap={2} mt={2} flexWrap="wrap">
          <Badge colorScheme={getStatusColor(document.status)}>
            {document.status}
          </Badge>
          <Badge colorScheme="blue">
            {document.mimeType}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            Uploaded: {formatDate(document.createdAt)}
          </Text>
        </Flex>
      </Box>
      
      <Flex gap={3}>
        <Button 
          colorScheme="blue" 
          leftIcon={<i class="fas fa-download"></i>}
          onClick={downloadDocument}
        >
          Download
        </Button>
        
        <Button 
          colorScheme="red" 
          variant="outline"
          leftIcon={<i class="fas fa-trash"></i>}
          onClick={() => {
            // Implement delete with confirmation
            if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
              // Call delete API and navigate back
              navigate('/documents');
            }
          }}
        >
          Delete
        </Button>
      </Flex>
    </Flex>
    
    <Tabs variant="enclosed" mb={6}>
      <TabList>
        <Tab>Details</Tab>
        <Tab>Ask Questions</Tab>
      </TabList>
      
      <TabPanels>
        <TabPanel>
          <Card p={5} boxShadow="md">
            <Heading size="md" mb={4}>Document Information</Heading>
            
            <Divider mb={4} />
            
            <Box mb={4}>
              <Text><strong>Filename:</strong> {document.filename}</Text>
              <Text><strong>Type:</strong> {document.mimeType}</Text>
              <Text><strong>Status:</strong> {document.status}</Text>
              <Text><strong>Uploaded:</strong> {formatDate(document.createdAt)}</Text>
              
              {#if document.updatedAt !== document.createdAt}
                <Text><strong>Last Updated:</strong> {formatDate(document.updatedAt)}</Text>
              {/if}
            </Box>
            
            {#if document.typesenseId}
              <Text><strong>Search Index ID:</strong> {document.typesenseId}</Text>
            {/if}
            
            {#if document.qdrantCollection}
              <Text><strong>Vector Collection:</strong> {document.qdrantCollection}</Text>
            {/if}
            
            {#if document.textContent}
              <Accordion allowToggle mt={4}>
                <AccordionItem>
                  <h3>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Document Content Preview</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel pb={4} maxHeight="400px" overflowY="auto">
                    <Text whiteSpace="pre-line">
                      {document.textContent.substring(0, 5000)}
                      {document.textContent.length > 5000 ? '...' : ''}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            {/if}
          </Card>
        </TabPanel>
        
        <TabPanel>
          <QueryBox onQuery={handleQuery} />
          
          {#if queryLoading}
            <Box textAlign="center" py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text mt={4}>Generating answer...</Text>
            </Box>
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
        </TabPanel>
      </TabPanels>
    </Tabs>
  {:else}
    <Alert status="error">
      <AlertIcon />
      Document not found
    </Alert>
  {/if}
  
  <Flex justifyContent="flex-start" mt={6}>
    <Button 
      leftIcon={<i class="fas fa-arrow-left"></i>}
      onClick={() => navigate('/documents')}
    >
      Back to Documents
    </Button>
  </Flex>
</Box>
