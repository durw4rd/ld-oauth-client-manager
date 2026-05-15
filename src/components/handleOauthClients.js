import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import localStorage from 'local-storage';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { KeyboardArrowDownIcon, KeyboardArrowUpIcon, RefreshIcon, EditIcon } from './icons';

const LD_ORIGINS = {
    us: 'https://app.launchdarkly.com',
    eu: 'https://app.eu.launchdarkly.com',
};

function resolveLdNextPageUrl(href, origin) {
    if (!href || typeof href !== 'string') return null;
    try {
        return new URL(href, origin).href;
    } catch {
        return null;
    }
}

function ClientRow({ client, isLoading, onDelete, onEdit }) {
    const [open, setOpen] = useState(false);
    const { name, _clientId, redirectUri, _creationDate, description } = client;

    return (
        <>
            <TableRow hover>
                <TableCell sx={{ width: 40, pr: 0 }}>
                    <IconButton
                        aria-label={open ? 'collapse row' : 'expand row'}
                        size="small"
                        onClick={() => setOpen(!open)}
                        disabled={!description}
                        sx={{ color: description ? 'text.secondary' : 'text.disabled' }}
                    >
                        {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{name}</TableCell>
                <TableCell>{_clientId}</TableCell>
                <TableCell sx={{ maxWidth: 220, wordBreak: 'break-all' }}>{redirectUri}</TableCell>
                <TableCell>{new Date(_creationDate).toLocaleString()}</TableCell>
                <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit client">
                            <span>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => onEdit(client)}
                                    disabled={isLoading}
                                    startIcon={<EditIcon fontSize="small" />}
                                >
                                    Edit
                                </Button>
                            </span>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => onDelete(_clientId)}
                            disabled={isLoading}
                        >
                            Delete
                        </Button>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0, border: open ? undefined : 'none' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 1.5, px: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: description ? 'normal' : 'italic' }}>
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Description: </Box>
                                {description || 'No description'}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function HandleOauthClients() {

    const [OauthClients, setOauthClients] = useState([]);
    const [inputClientName, setInputClientName] = useState("");
    const [inputRedirectUrl, setInputRedirectUrl] = useState("");
    const [inputDescription, setInputDescription] = useState("");
    const [inputScim, setInputScim] = useState(false);

    const handleScimToggle = (checked) => {
        setInputScim(checked);
        if (checked) {
            setInputDescription(prev => prev ? `${prev}\nSCIM-enabled.` : 'SCIM-enabled.');
        } else {
            setInputDescription(prev =>
                prev.split('\n').filter(l => l.trim() !== 'SCIM-enabled.').join('\n').trimEnd()
            );
        }
    };
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalLoaded, setTotalLoaded] = useState(0);
    const [apiToken, setApiToken] = useState(localStorage.get("ld-api-key"));
    const [isEu, setIsEu] = useState(!!localStorage.get("ld-eu-account"));
    const apiOrigin = isEu ? LD_ORIGINS.eu : LD_ORIGINS.us;

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [editName, setEditName] = useState("");
    const [editRedirectUri, setEditRedirectUri] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

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
            let nextUrl = `${apiOrigin}/api/v2/oauth/clients`;
            const maxPages = 500;
            let page = 0;

            while (nextUrl) {
                if (page >= maxPages) {
                    throw new Error(`Stopped after ${maxPages} pages to avoid an infinite loop.`);
                }
                page += 1;

                const response = await axios.get(nextUrl, { headers });
                const batch = response.data.items || [];
                allClients.push(...batch);

                const href = response.data._links?.next?.href;
                nextUrl = resolveLdNextPageUrl(href, apiOrigin);
            }

            setOauthClients(allClients);
            setTotalLoaded(allClients.length);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load OAuth clients');
        } finally {
            setIsLoading(false);
        }
    }, [apiToken, apiOrigin]);

    useEffect(() => {
        if (apiToken !== null) {
            loadAllClients();
        }
    }, [apiToken, loadAllClients]);

    // Poll for API token / region changes (set from the sibling ApiTokenForm component)
    useEffect(() => {
        const interval = setInterval(() => {
            const newApiToken = localStorage.get("ld-api-key");
            if (newApiToken !== apiToken) setApiToken(newApiToken);

            const newIsEu = !!localStorage.get("ld-eu-account");
            if (newIsEu !== isEu) setIsEu(newIsEu);
        }, 1000);

        return () => clearInterval(interval);
    }, [apiToken, isEu]);

    const createClient = ({ name, redirectUrl, description, scim }) => {
        setIsLoading(true);
        setError(null);

        const body = { name, redirectUri: redirectUrl };
        if (description) body.description = description;
        if (scim) body.scim = true;

        axios.post(`${apiOrigin}/api/v2/oauth/clients`, body, {
            headers: {
                "LD-API-Version": "beta",
                'Content-Type': 'application/json',
                "Authorization": apiToken
            }
        })
            .then(res => {
                loadAllClients();
                setClientId(res.data._clientId);
                setClientSecret(res.data._clientSecret);
                setModalOpen(true);
            })
            .catch(e => {
                setError(e.response?.data?.message || e.message || 'Failed to create OAuth client');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const deleteClient = (clientIdToDelete) => {
        setIsLoading(true);
        setError(null);

        axios.delete(`${apiOrigin}/api/v2/oauth/clients/${clientIdToDelete}`, {
            headers: {
                "LD-API-Version": "beta",
                "Authorization": apiToken
            }
        })
            .then(() => loadAllClients())
            .catch(e => {
                setError(e.response?.data?.message || e.message || 'Failed to delete OAuth client');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const openEditDialog = (client) => {
        setEditClient(client);
        setEditName(client.name || "");
        setEditRedirectUri(client.redirectUri || "");
        setEditDescription(client.description || "");
        setEditError(null);
        setEditOpen(true);
    };

    const patchClient = async () => {
        const ops = [];
        if (editName !== editClient.name)
            ops.push({ op: "replace", path: "/name", value: editName });
        if (editRedirectUri !== editClient.redirectUri)
            ops.push({ op: "replace", path: "/redirectUri", value: editRedirectUri });
        if (editDescription !== (editClient.description || ""))
            ops.push({ op: "replace", path: "/description", value: editDescription });
        if (ops.length === 0) {
            setEditOpen(false);
            return;
        }

        setEditLoading(true);
        setEditError(null);

        try {
            await axios.patch(
                `${apiOrigin}/api/v2/oauth/clients/${editClient._clientId}`,
                ops,
                {
                    headers: {
                        "LD-API-Version": "beta",
                        "Content-Type": "application/json",
                        "Authorization": apiToken
                    }
                }
            );
            setEditOpen(false);
            loadAllClients();
        } catch (e) {
            setEditError(e.response?.data?.message || e.message || 'Failed to update OAuth client');
        } finally {
            setEditLoading(false);
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        createClient({
            name: inputClientName,
            redirectUrl: inputRedirectUrl,
            description: inputDescription,
            scim: inputScim,
        });
        setInputClientName("");
        setInputRedirectUrl("");
        setInputDescription("");
        setInputScim(false);
    };

    return (
        <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: 'divider', width: '100%' }}>
            {/* Section header band */}
            <Box sx={{ bgcolor: 'background.default', px: 3, py: 2.5 }}>
                <Typography variant="h2" component="h2" sx={{ fontSize: '1.1rem' }}>
                    OAuth clients
                </Typography>
            </Box>

            <Divider />

            <Stack spacing={3} sx={{ px: 3, py: 3 }}>

                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: { md: 'flex-start' },
                    }}>
                        <TextField
                            sx={{ flex: '1 1 220px' }}
                            id="client-name"
                            label="Client name"
                            value={inputClientName}
                            onChange={(e) => setInputClientName(e.target.value)}
                        />
                        <TextField
                            sx={{ flex: '1 1 260px' }}
                            id="redirect-uri"
                            label="Redirect URL"
                            value={inputRedirectUrl}
                            onChange={(e) => setInputRedirectUrl(e.target.value)}
                        />
                        <TextField
                            sx={{ flex: '1 1 300px' }}
                            id="description"
                            label="Description (optional)"
                            value={inputDescription}
                            onChange={(e) => setInputDescription(e.target.value)}
                            multiline
                            minRows={1}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                            <Switch
                                    checked={inputScim}
                                    onChange={(e) => handleScimToggle(e.target.checked)}
                                    size="small"
                                    color="primary"
                                />
                                }
                                label={
                                    <Typography variant="body2" color="text.secondary">
                                        SCIM enabled
                                    </Typography>
                                }
                            />
                        </FormGroup>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            sx={{ flexShrink: 0 }}
                        >
                            Create client
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" variant="outlined">
                        {error}
                    </Alert>
                )}

                {/* Credentials modal shown after create */}
                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
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
                            <br />
                            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Client secret:</Box>{' '}
                            {clientSecret}
                        </Typography>
                        <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => setModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Modal>

                {/* Edit client dialog */}
                <Dialog
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { bgcolor: 'background.paper' } }}
                >
                    <DialogTitle sx={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 }}>
                        Edit client
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {editError && (
                                <Alert severity="error" variant="outlined">
                                    {editError}
                                </Alert>
                            )}
                            <TextField
                                fullWidth
                                label="Client name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Redirect URL"
                                value={editRedirectUri}
                                onChange={(e) => setEditRedirectUri(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                multiline
                                minRows={2}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button onClick={() => setEditOpen(false)} disabled={editLoading} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={patchClient} variant="contained" color="primary" disabled={editLoading}>
                            {editLoading ? 'Saving…' : 'Save changes'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h3" component="h3" sx={{ fontSize: '1.1rem' }} color="text.primary">
                            Registered clients ({totalLoaded})
                        </Typography>
                        <Tooltip title="Reload client list">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={loadAllClients}
                                    disabled={isLoading}
                                    aria-label="Reload client list"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    {isLoading && (
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
                                <TableCell sx={{ width: 40 }} />
                                <TableCell>Client name</TableCell>
                                <TableCell>Client ID</TableCell>
                                <TableCell>Redirect URL</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {OauthClients.map((client) => (
                                <ClientRow
                                    key={client._clientId}
                                    client={client}
                                    isLoading={isLoading}
                                    onDelete={deleteClient}
                                    onEdit={openEditDialog}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Stack>
        </Paper>
    );
}
