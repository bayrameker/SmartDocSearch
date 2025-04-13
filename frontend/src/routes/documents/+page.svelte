<script>
  import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    Stack,
    Alert,
    AlertIcon,
    Spinner,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useToast
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { user } from '../../lib/store';
  import { navigate } from '$app/navigation';
  import { getDocuments } from '../../lib/api';
  import DocumentUploader from '../../components/DocumentUploader.svelte';
  import DocumentList from '../../components/DocumentList.svelte';

  const toast = useToast();
  
  let documents = [];
  let loading = true;
  let error = null;
  
  // Fetch documents on mount
  onMount(async () => {
    if (!$user) {
      navigate('/login');
      return;
    }
    
    await loadDocuments();
  });
  
  // Load user's documents
  async function loadDocuments() {
    try {
      loading = true;
      error = null;
      
      documents = await getDocuments();
      
    } catch (err) {
      error = err.message || 'Failed to load documents';
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      loading = false;
    }
  }
  
  // Handle document upload success
  function handleUploadSuccess() {
    toast({
      title: 'Document Uploaded',
      description: 'Your document has been uploaded and is being processed.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Reload documents
    loadDocuments();
  }
</script>

<Box py={4}>
  <Heading size="lg" mb={6}>My Documents</Heading>
  
  <Tabs variant="enclosed" mb={6}>
    <TabList>
      <Tab>All Documents</Tab>
      <Tab>Upload New</Tab>
    </TabList>
    
    <TabPanels>
      <TabPanel>
        {#if loading}
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="blue.500" />
            <Text mt={4}>Loading your documents...</Text>
          </Box>
        {:else if error}
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        {:else if documents.length === 0}
          <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
            <Text fontSize="lg" mb={4}>You haven't uploaded any documents yet</Text>
            <Button colorScheme="blue" onClick={() => document.getElementById('upload-tab').click()}>
              Upload Your First Document
            </Button>
          </Box>
        {:else}
          <DocumentList {documents} onDelete={loadDocuments} />
        {/if}
      </TabPanel>
      
      <TabPanel id="upload-tab">
        <DocumentUploader onSuccess={handleUploadSuccess} />
      </TabPanel>
    </TabPanels>
  </Tabs>
</Box>
