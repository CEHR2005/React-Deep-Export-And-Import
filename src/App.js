import React from 'react';
import {
  ChakraProvider,
  Box,
  theme, Input, Button, useToast
} from '@chakra-ui/react';
import {saveData, LoadData} from "./code";
import {createApolloClient} from "./code/createApolloClient";
import {ApolloClient, InMemoryCache, gql} from "@apollo/client";


function App() {
  const toast = useToast();
  const [uri, setUri] = React.useState('')
  const [token, setToken] = React.useState('')
  const [fileContent, setFileContent] = React.useState("");
  const [client, setClient] = React.useState(null);
  const [clientStatus, setClientStatus] = React.useState(false);
  const handleUriChange = (event) => setUri(event.target.value)
  const handleTokenChange = (event) => setToken(event.target.value)
  const createClient = () => {
    const newClient = new ApolloClient({
      uri: uri,
      cache: new InMemoryCache(),
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    setClient(newClient);
    setClientStatus(true);
    toast({
      title: 'Apollo Client created successfully',
      status: 'success',
    });
  };

  function handleSave() {
    console.log(client)
        saveData(client)
    toast({
      title: "Data saved!",
      description: "The data has been successfully saved to a file.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }
  const handlePing = () => {
    if (!client) {
      toast({
        title: 'Apollo Client not created yet',
        status: 'error',
      });
      return;
    }

    client.query({
      query: gql`
        query Ping {
          ping
        }
      `,
    })
        .then(() => {
          toast({
            title: 'Apollo Client is working',
            status: 'success',
          });
        })
        .catch(() => {
          toast({
            title: 'Apollo Client is not working',
            status: 'error',
          });
        });
  };
  function handleLoad() {
    console.log(fileContent)
        LoadData(client, fileContent, uri)
  }
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      setFileContent(event.target.result);
    };

    reader.readAsText(file);
  };
  // const fileInput = document.querySelector("input");
  // const output = document.querySelector(".output");
  //
  // fileInput.addEventListener("change", () => {
  //   const [file] = fileInput.files;
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.addEventListener("load", () => {
  //       output.innerText = reader.result;
  //     });
  //     reader.readAsText(file);
  //   }
  // });
  return (
    <ChakraProvider theme={theme}>
      <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          fontSize="xl"
          w="25vw"
          h="100vh"
          flexDirection="column"
          margin="auto">
        <Input placeholder='Token' size='md' onChange={handleTokenChange}/>
        <Input placeholder='Gqllink' size='md' onChange={handleUriChange}/>
        <Input
            placeholder="Input file"
            size="md"
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
        />
        <div>
          <Button onClick={createClient}>Create Apollo Client</Button>
          {clientStatus ? (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      marginRight: '5px',
                      backgroundColor: client ? 'green' : 'red',
                    }}
                />
                <span>{client ? 'Apollo Client is working' : 'Apollo Client is not working'}</span>
                <Button ml="10px" onClick={handlePing}>Ping</Button>
              </div>
          ) : null}
        </div>
        <Button colorScheme='blue' onClick={handleSave}>Save</Button>
        <Button colorScheme='blue' onClick={handleLoad}>Load</Button>
        <div className="output"></div>
      </Box>
    </ChakraProvider>
  );
}

export default App;
