import React, { useState, useEffect } from 'react';
import localStorage from 'local-storage';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function ApiTokenForm() {
    const [APIKey, setAPIKey] = useState("");
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        setAPIKey(localStorage.get('ld-api-key'));
    }, [])

    const handleFormSubmit = (event) => {
        event.preventDefault();

        localStorage.set('ld-api-key', inputValue);
        setAPIKey(inputValue);
        setInputValue("");
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    function obfuscateString(str) {
        const firstFourChars = str.substring(0, 4);
        const lastFiveChars = str.substring(str.length - 5);
        const obfuscation = "***";
        return firstFourChars + obfuscation + lastFiveChars;
    }

    return (
        <Paper
            variant="outlined"
            sx={{ overflow: 'hidden', borderColor: 'divider' }}
        >
            {/* Section header band */}
            <Box sx={{ bgcolor: 'background.default', px: 3, py: 2.5 }}>
                <Typography variant="h2" component="h2" sx={{ fontSize: '1.1rem', mb: 0.75 }}>
                    API access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Use a{' '}
                    <a
                        className="ld-link"
                        href="https://docs.launchdarkly.com/home/account/api"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        personal or service access token
                    </a>{' '}
                    with permission to manage OAuth clients. It is stored only in this browser (local storage).
                </Typography>
            </Box>

            <Divider />

            {/* Section body */}
            <Box sx={{ px: 3, py: 3 }}>
                <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <Box
                        component="form"
                        onSubmit={handleFormSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <TextField
                            fullWidth
                            id="api-key"
                            label="API access token"
                            type="password"
                            autoComplete="off"
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                        <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
                            Save token
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Saved token:</Box>{' '}
                        {APIKey ? obfuscateString(APIKey) : 'None'}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    )
}
