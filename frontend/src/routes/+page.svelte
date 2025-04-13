<script>
  import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    Flex,
    Grid,
    GridItem,
    Card,
    Image
  } from '@chakra-ui/svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/store';

  // Redirect to documents page if already logged in
  onMount(() => {
    if ($user) {
      goto('/documents');
    }
  });

  function handleGetStarted() {
    goto('/login');
  }
</script>

<Box py={8} px={4}>
  <Flex direction="column" alignItems="center" textAlign="center" maxW="800px" mx="auto" mb={10}>
    <Heading size="2xl" mb={4}>
      Akıllı Doküman Arama ve Sorgulama Sistemi
    </Heading>
    <Text fontSize="xl" mb={6} color="gray.600">
      YZ destekli belge işleme, arama ve sorgulama çözümüyle dokümanlarınızdan  
      daha fazla değer elde edin. Belgelerinizdeki bilgileri zahmetsizce bulun.
    </Text>
    <Button 
      colorScheme="blue" 
      size="lg" 
      onClick={handleGetStarted}
      mb={6}
    >
      Başlayın
    </Button>
  </Flex>

  <Grid 
    templateColumns={{base: "1fr", md: "repeat(3, 1fr)"}} 
    gap={6} 
    maxW="1200px" 
    mx="auto"
  >
    <GridItem>
      <Card p={5} height="100%" boxShadow="md" borderRadius="lg">
        <Flex direction="column" alignItems="center" textAlign="center">
          <Box fontSize="3xl" color="blue.500" mb={4}>
            <i class="fas fa-file-upload"></i>
          </Box>
          <Heading size="md" mb={3}>Kolay Doküman Yükleme</Heading>
          <Text>
            Dokümanlarınızı sürükleyip bırakın veya bilgisayarınızdan seçin. 
            PDF, Word, PowerPoint ve daha fazlasını destekler.
          </Text>
        </Flex>
      </Card>
    </GridItem>
    
    <GridItem>
      <Card p={5} height="100%" boxShadow="md" borderRadius="lg">
        <Flex direction="column" alignItems="center" textAlign="center">
          <Box fontSize="3xl" color="blue.500" mb={4}>
            <i class="fas fa-search"></i>
          </Box>
          <Heading size="md" mb={3}>Gelişmiş Arama</Heading>
          <Text>
            Semantik arama ile içeriğe göz atmadan ilgili belgeleri bulun.
            Anlama dayalı filtreleme ile zamanınızı verimli kullanın.
          </Text>
        </Flex>
      </Card>
    </GridItem>
    
    <GridItem>
      <Card p={5} height="100%" boxShadow="md" borderRadius="lg">
        <Flex direction="column" alignItems="center" textAlign="center">
          <Box fontSize="3xl" color="blue.500" mb={4}>
            <i class="fas fa-robot"></i>
          </Box>
          <Heading size="md" mb={3}>YZ ile Sorgulama</Heading>
          <Text>
            Dokümanlarınız hakkında doğal dilde sorular sorun.
            YZ destekli analiz ile anında cevaplar alın.
          </Text>
        </Flex>
      </Card>
    </GridItem>
  </Grid>
  
  <Box maxW="800px" mx="auto" mt={16} mb={8}>
    <Heading size="xl" mb={6} textAlign="center">Nasıl Çalışır?</Heading>
    
    <Flex direction="column" gap={8}>
      <Flex 
        gap={6} 
        alignItems="center" 
        direction={{base: "column", md: "row"}}
      >
        <Box flex={1} textAlign={{base: "center", md: "left"}}>
          <Heading size="md" mb={3}>1. Dokümanlarınızı Yükleyin</Heading>
          <Text>
            PDF, Word veya PowerPoint belgelerinizi sisteme yükleyin. 
            OCR teknolojisi ile taranmış belgelerdeki metin otomatik olarak çıkarılır.
          </Text>
        </Box>
        <Box 
          flex={1} 
          bg="gray.100" 
          height="200px" 
          borderRadius="md" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <i class="fas fa-cloud-upload-alt" style="font-size: 64px; color: #3182CE;"></i>
        </Box>
      </Flex>
      
      <Flex 
        gap={6} 
        alignItems="center" 
        direction={{base: "column", md: "row-reverse"}}
      >
        <Box flex={1} textAlign={{base: "center", md: "right"}}>
          <Heading size="md" mb={3}>2. İndeksleme ve Anlama</Heading>
          <Text>
            Sistem dokümanları otomatik olarak indeksler ve analiz eder. Vektör embeddingler 
            ile belgelerinizin içeriğini ve bağlamını anlayan bir model oluşturulur.
          </Text>
        </Box>
        <Box 
          flex={1} 
          bg="gray.100" 
          height="200px" 
          borderRadius="md" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <i class="fas fa-brain" style="font-size: 64px; color: #3182CE;"></i>
        </Box>
      </Flex>
      
      <Flex 
        gap={6} 
        alignItems="center" 
        direction={{base: "column", md: "row"}}
      >
        <Box flex={1} textAlign={{base: "center", md: "left"}}>
          <Heading size="md" mb={3}>3. Sorgulama ve Arama</Heading>
          <Text>
            Doğal dilde sorular sorun veya anahtar kelimelerle arama yapın. 
            Semantik arama ve YZ sorgulama ile belgelerinizden hızlı ve doğru bilgiler elde edin.
          </Text>
        </Box>
        <Box 
          flex={1} 
          bg="gray.100" 
          height="200px" 
          borderRadius="md" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <i class="fas fa-comments" style="font-size: 64px; color: #3182CE;"></i>
        </Box>
      </Flex>
    </Flex>
  </Box>
  
  <Flex justifyContent="center" mt={10}>
    <Button 
      colorScheme="blue" 
      size="lg" 
      onClick={handleGetStarted}
    >
      Şimdi Başlayın
    </Button>
  </Flex>
</Box>