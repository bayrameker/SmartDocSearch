<script>
  import { 
    Box, 
    Text, 
    Button, 
    Input,
    FormControl,
    FormLabel,
    FormHelperText,
    Progress,
    Alert,
    AlertIcon,
    useToast
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { user } from '../lib/store';
  import { uploadDocument } from '../lib/api';

  export let onSuccess = () => {};
  
  const toast = useToast();
  
  let fileInput;
  let selectedFile = null;
  let title = '';
  let uploading = false;
  let uploadProgress = 0;
  let error = null;
  
  // Handle file selection
  function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) {
      selectedFile = null;
      return;
    }
    
    selectedFile = files[0];
    
    // Set default title from filename
    if (!title && selectedFile) {
      const filename = selectedFile.name;
      // Remove file extension for default title
      const lastDotIndex = filename.lastIndexOf('.');
      title = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    }
  }
  
  // Handle document upload
  async function handleUpload() {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for the document',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      uploading = true;
      error = null;
      
      // Mock progress updates
      const progressInterval = setInterval(() => {
        if (uploadProgress < 90) {
          uploadProgress += 10;
        }
      }, 500);
      
      await uploadDocument(selectedFile, title);
      
      clearInterval(progressInterval);
      uploadProgress = 100;
      
      toast({
        title: 'Upload successful',
        description: 'Your document is being processed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      selectedFile = null;
      title = '';
      fileInput.value = '';
      
      // Notify parent component
      onSuccess();
      
    } catch (err) {
      error = err.message || 'Failed to upload document';
      toast({
        title: 'Upload failed',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      clearInterval(progressInterval);
      uploading = false;
      uploadProgress = 0;
    }
  }
</script>

<Box bg="white" p={6} borderRadius="md" boxShadow="sm">
  {#if error}
    <Alert status="error" mb={4}>
      <AlertIcon />
      {error}
    </Alert>
  {/if}
  
  <FormControl mb={4}>
    <FormLabel>Document Title</FormLabel>
    <Input 
      type="text" 
      placeholder="Enter document title" 
      bind:value={title}
      disabled={uploading}
    />
    <FormHelperText>
      A descriptive name for your document
    </FormHelperText>
  </FormControl>
  
  <FormControl mb={5}>
    <FormLabel>Document File</FormLabel>
    <Input
      type="file"
      accept=".pdf,.txt"
      onChange={handleFileSelect}
      disabled={uploading}
      bind:this={fileInput}
    />
    <FormHelperText>
      Supported formats: PDF, TXT (Max 50MB)
    </FormHelperText>
  </FormControl>
  
  {#if selectedFile}
    <Box mb={4} p={3} bg="gray.50" borderRadius="md">
      <Text><strong>Selected file:</strong> {selectedFile.name}</Text>
      <Text><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</Text>
      <Text><strong>Type:</strong> {selectedFile.type}</Text>
    </Box>
  {/if}
  
  {#if uploading}
    <Progress value={uploadProgress} mb={4} colorScheme="blue" />
  {/if}
  
  <Button 
    colorScheme="blue" 
    onClick={handleUpload} 
    isLoading={uploading}
    loadingText="Uploading..."
    disabled={!selectedFile || uploading}
    width="full"
  >
    Upload Document
  </Button>
</Box>
