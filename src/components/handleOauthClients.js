import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import localStorage from 'local-storage';
import { Button, TextField, FormControl, TableContainer, Table, TableHead, TableBody, TableRow, Modal, Typography, Box } from '@mui/material';

const modalStyle = {
    position: "absolute",
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

export default function HandleOauthClients() {

    const [OauthClients, setOauthClients] = useState([]);
    const [inputClientName, setInputClientName] = useState("");
    const [inputRedirectUrl, setInputRedirectUrl] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const apiToken = localStorage.get("ld-api-key");
    
    useEffect(() => {
        if(apiToken !== null) {
            listClients();
        }
    }, [])

    const createClient = (name, redirectUrl) => {
        axios.post('https://app.launchdarkly.com/api/v2/oauth/clients', {
            "name": name,
            "redirectUri": redirectUrl,
            "description": "Created via OAuth client creator V1.1"
        },{
            headers: {
                "LD-API-Version": "beta",
                'Content-Type': 'application/json',
                "Authorization": localStorage.get("ld-api-key")
            }
        })
            .then(res => {
                console.log(`Response status: ${res.status}`);
                console.log(res.data)
                listClients();
                setClientId(res.data._clientId);
                setClientSecret(res.data._clientSecret)
                handleOpen();
            })
            .catch(e => {
                console.log(e);
            })
    }

    const listClients = () => {
        axios.get('https://app.launchdarkly.com/api/v2/oauth/clients',{
            headers: {
                "LD-API-Version": "beta",
                "Authorization": localStorage.get("ld-api-key")
            }
        })
            .then(res => {
                console.log(`Response code: ${res.status}`);
                const rawClients = res.data.items;
                setOauthClients(rawClients) 
            })
            .catch(e => {
                console.log(e);
            })
    }

    const convertTimestampToDate = (timestamp) => {
        const date = new Date(timestamp);
        const humanDate = date.toLocaleString();
        return humanDate;
    }

    const deleteClient = (clientId) => {
                
        axios.delete(`https://app.launchdarkly.com/api/v2/oauth/clients/${clientId}`, {
            headers: {
                "LD-API-Version": "beta",
                "Authorization": localStorage.get("ld-api-key")
            }
        })
            .then(res => {
                console.log(`Response status: ${res.status}`);
            })
            .catch(e => {
                console.log(e);
            })
            .finally(() => listClients())
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();
        createClient(inputClientName, inputRedirectUrl);
        setInputClientName("");
        setInputRedirectUrl("");    
    }

    const handleClientNameInputChange = (event) => {
        setInputClientName(event.target.value);
    };

    const handleRedirectUrlInputChange = (event) => {
        setInputRedirectUrl(event.target.value);
    };
    
    return (
        <div style={{minWidth: "90%"}}>
            <FormControl sx={{ marginBottom: "1em" }}>
                <form 
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                    onSubmit={handleFormSubmit}
                >
                    <TextField
                        fullWidth
                        id="client-name"
                        label="Enter the OAuth client name"
                        variant="filled"
                        size="small"
                        sx={{ backgroundColor: "white" }}
                        value={inputClientName}
                        onChange={handleClientNameInputChange}
                    />
                    <TextField
                        fullWidth
                        id="redirect-uri"
                        label="Enter the redirect URL"
                        variant="filled"
                        size="small"
                        sx={{ backgroundColor: "white" }}
                        value={inputRedirectUrl}
                        onChange={handleRedirectUrlInputChange}
                    />
                    <Button 
                        type="submit"
                        variant="contained" 
                        sx={{ color: "#282C34", backgroundColor: "white" }}
                    >
                        Create OAuth Client!
                    </Button>

                </form>
            </FormControl>
            <Modal
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                <Box sx={modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                    Details of the new OAuth client
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <b>Client ID:</b> {clientId}
                        <br/>
                        <b>Client Secret:</b> {clientSecret}
                    </Typography>
                    <br/>
                    <Button variant="contained" sx={{ color: "#282C34", backgroundColor: "white" }} onClick={() => setModalOpen(false)}>Close modal</Button>
                </Box>
            </Modal>
            <h3>Existing OAuth clients</h3>
            <TableContainer sx={{ maxWidth: "100%", fontSize: "0.5em", paddingBottom: "30px" }}>
                <Table sx={{ }}>
                    <TableHead>
                        <TableRow>
                            <th style={{border: "1px solid white", padding: "5px"}}>Client name</th>
                            <th style={{border: "1px solid white", padding: "5px"}}>Client ID</th>
                            <th style={{border: "1px solid white", padding: "5px"}}>Redirect URL</th>
                            <th style={{border: "1px solid white", padding: "5px"}}>Creation Date</th>
                            <th style={{border: "1px solid white", padding: "5px"}}>Delete</th>
                        </TableRow>
                    </TableHead>
                    <TableBody>{
                        OauthClients.map(({name, _clientId, redirectUri,_creationDate},index) => {
                            return (
                                <TableRow key={index}>
                                    <td style={{border: "1px solid white", padding: "5px"}}>{name}</td>
                                    <td style={{border: "1px solid white", padding: "5px"}}>{_clientId}</td>
                                    <td style={{border: "1px solid white", padding: "5px"}}>{redirectUri}</td>
                                    <td style={{border: "1px solid white", padding: "5px"}}>{convertTimestampToDate(_creationDate)}</td>
                                    <td style={{border: "1px solid white", padding: "5px"}}><Button variant="contained" sx={{ color: "#282C34", backgroundColor: "white" }} onClick={ () => deleteClient(_clientId) }>delete client</Button></td>
                                </TableRow> 
                            )
                        })
                    }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}