import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import localStorage from 'local-storage';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

const LD_API_ORIGIN = 'https://app.launchdarkly.com';

/** Resolve `_links.next.href` from the LD API (absolute or root-relative). */
function resolveLdNextPageUrl(href) {
    if (!href || typeof href !== 'string') {
        return null;
    }
    try {
        return new URL(href, LD_API_ORIGIN).href;
    } catch {
        return null;
    }
}

export default function HandleOauthClients() {

    const [OauthClients, setOauthClients] = useState([]);
    const [inputClientName, setInputClientName] = useState("");
    const [inputRedirectUrl, setInputRedirectUrl] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalLoaded, setTotalLoaded] = useState(0);
    const [apiToken, setApiToken] = useState(localStorage.get("ld-api-key"));
    
    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const loadAllClients = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setOauthClients([]);
        setTotalLoaded(0);
        
        const headers = {
            "LD-API-Version": "beta",
            "Authorization": apiToken
        };

        try {
            const allClients = [];
            let nextUrl = `${LD_API_ORIGIN}/api/v2/oauth/clients`;
            const maxPages = 500;
            let page = 0;

            while (nextUrl) {
                if (page >= maxPages) {
                    throw new Error(
                        `Stopped after ${maxPages} pages of OAuth clients to avoid an infinite loop.`
                    );
                }
                page += 1;

                const response = await axios.get(nextUrl, { headers });
                const batch = response.data.items || [];
                allClients.push(...batch);

                const href = response.data._links?.next?.href;
                nextUrl = resolveLdNextPageUrl(href);
            }

            setOauthClients(allClients);
            setTotalLoaded(allClients.length);
            
        } catch (err) {
            console.error('Error loading OAuth clients:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load OAuth clients');
        } finally {
            setIsLoading(false);
        }
    }, [apiToken]);

    useEffect(() => {
        if (apiToken !== null) {
            loadAllClients();
        }
    }, [apiToken, loadAllClients]);

    // Listen for localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const newApiToken = localStorage.get("ld-api-key");
            if (newApiToken !== apiToken) {
                setApiToken(newApiToken);
            }
        };

        const interval = setInterval(handleStorageChange, 1000);
        
        return () => clearInterval(interval);
    }, [apiToken]);

    const createClient = (name, redirectUrl) => {
        setIsLoading(true);
        setError(null);
        
        axios.post('https://app.launchdarkly.com/api/v2/oauth/clients', {
            "name": name,
            "redirectUri": redirectUrl,
            "description": "Created via OAuth client creator V1.1"
        },{
            headers: {
                "LD-API-Version": "beta",
                'Content-Type': 'application/json',
                "Authorization": apiToken
            }
        })
            .then(res => {
                console.log(`Response status: ${res.status}`);
                console.log(res.data)
                loadAllClients();
                setClientId(res.data._clientId);
                setClientSecret(res.data._clientSecret)
                handleOpen();
            })
            .catch(e => {
                console.log(e);
                setError(e.response?.data?.message || e.message || 'Failed to create OAuth client');
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    const convertTimestampToDate = (timestamp) => {
        const date = new Date(timestamp);
        const humanDate = date.toLocaleString();
        return humanDate;
    }

    const deleteClient = (clientIdToDelete) => {
        setIsLoading(true);
        setError(null);
                
        axios.delete(`https://app.launchdarkly.com/api/v2/oauth/clients/${clientIdToDelete}`, {
                            headers: {
                    "LD-API-Version": "beta",
                    "Authorization": apiToken
                }
        })
            .then(res => {
                console.log(`Response status: ${res.status}`);
                loadAllClients();
            })
            .catch(e => {
                console.log(e);
                setError(e.response?.data?.message || e.message || 'Failed to delete OAuth client');
            })
            .finally(() => {
                setIsLoading(false);
            })
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
        <Stack spacing={3} sx={{ width: '100%' }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: '1.25rem' }}>
                OAuth clients
            </Typography>

            <Box
                component="form"
                onSubmit={handleFormSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: { md: 'flex-start' },
                }}
            >
                <TextField
                    sx={{ flex: '1 1 220px' }}
                    id="client-name"
                    label="Client name"
                    value={inputClientName}
                    onChange={handleClientNameInputChange}
                />
                <TextField
                    sx={{ flex: '1 1 260px' }}
                    id="redirect-uri"
                    label="Redirect URL"
                    value={inputRedirectUrl}
                    onChange={handleRedirectUrlInputChange}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{ mt: { xs: 0, md: '2px' } }}
                >
                    Create client
                </Button>
            </Box>
            
            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}
            
            <Modal
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '560px' },
                        maxWidth: '560px',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="modal-modal-title" variant="h6" component="h2" color="text.primary">
                    New OAuth client credentials
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} variant="body2" color="text.secondary">
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Client ID:</Box>{' '}
                        {clientId}
                        <br/>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Client secret:</Box>{' '}
                        {clientSecret}
                    </Typography>
                    <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => setModalOpen(false)}>
                        Close
                    </Button>
                </Box>
            </Modal>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.1rem' }} color="text.primary">
                    Registered clients ({totalLoaded})
                </Typography>
                {isLoading === true && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={22} color="primary" />
                        <Typography variant="body2" color="text.secondary">Loading…</Typography>
                    </Box>
                )}
            </Box>
            
            <TableContainer sx={{ fontSize: '0.875rem' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Client name</TableCell>
                            <TableCell>Client ID</TableCell>
                            <TableCell>Redirect URL</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{
                        OauthClients.map(({ name, _clientId, redirectUri, _creationDate }) => {
                            return (
                                <TableRow key={_clientId} hover>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{name}</TableCell>
                                    <TableCell>{_clientId}</TableCell>
                                    <TableCell sx={{ maxWidth: 280, wordBreak: 'break-all' }}>{redirectUri}</TableCell>
                                    <TableCell>{convertTimestampToDate(_creationDate)}</TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => deleteClient(_clientId)}
                                            disabled={isLoading}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow> 
                            )
                        })
                    }
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}
