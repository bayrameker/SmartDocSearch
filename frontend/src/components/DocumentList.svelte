<script>
  import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    Stack,
    Flex,
    Badge,
    Card,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useToast
  } from '@chakra-ui/svelte';
  import { goto } from '$app/navigation';
  import { deleteDocument } from '../lib/api';
  
  export let documents = [];
  export let onDelete = () => {};
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  let cancelRef;
  let documentToDelete = null;
  
  // Open delete confirmation dialog
  function confirmDelete(document) {
    documentToDelete = document;
    onOpen();
  }
  
  // Handle document deletion
  async function handleDelete() {
    if (!documentToDelete) return;
    
    try {
      await deleteDocument(documentToDelete.id);
      
      toast({
        title: 'Document deleted',
        description: `"${documentToDelete.title}" has been deleted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Notify parent component to refresh the list
      onDelete();
      
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      documentToDelete = null;
    }
  }
  
  // Formats the date for display
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
</script>

<Stack spacing={4}>
  {#each documents as document}
    <Card p={4} boxShadow="md" borderRadius="md">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Heading size="md" mb={2}>{document.title}</Heading>
          
          <Flex gap={2} mb={3} flexWrap="wrap">
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
          
          <Text noOfLines={2} fontSize="sm" color="gray.600" mb={3}>
            {document.filename}
          </Text>
        </Box>
        
        <Flex gap={2}>
          <Button 
            size="sm" 
            colorScheme="blue" 
            variant="outline"
            onClick={() => goto(`/documents/${document.id}`)}
          >
            <i class="fas fa-eye mr-1"></i> View
          </Button>
          
          <Button 
            size="sm" 
            colorScheme="red" 
            variant="outline"
            onClick={() => confirmDelete(document)}
          >
            <i class="fas fa-trash mr-1"></i> Delete
          </Button>
        </Flex>
      </Flex>
    </Card>
  {/each}
</Stack>

<!-- Delete Confirmation Dialog -->
<AlertDialog 
  isOpen={isOpen} 
  leastDestructiveRef={cancelRef}
  onClose={onClose}
>
  <AlertDialogOverlay>
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        Delete Document
      </AlertDialogHeader>

      <AlertDialogBody>
        Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onClose}>
          Cancel
        </Button>
        <Button colorScheme="red" onClick={handleDelete} ml={3}>
          Delete
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialogOverlay>
</AlertDialog>