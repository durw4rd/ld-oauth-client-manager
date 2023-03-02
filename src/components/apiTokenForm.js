import React, { useState, useEffect } from 'react';
import localStorage from 'local-storage';
import { Button, TextField, FormControl } from '@mui/material';

export default function ApiTokenForm() {
    const [APIKey, setAPIKey] = useState("");
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        setAPIKey(localStorage.get('ld-api-key'));
    }, [])

    const handleFormSubmit = (event) => {
        event.preventDefault();

        console.log("Input value:", inputValue);

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
        <div>
            <FormControl sx={{width: "100%"}}>
                <form 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                    onSubmit={handleFormSubmit}
                >
                    <TextField
                        fullWidth
                        id="api-key"
                        label="Enter your API key"
                        variant="filled"
                        size="small"
                        sx={{ backgroundColor: "white" }}
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{ color: "#282C34", backgroundColor: "white" }}
                    >
                        Submit
                    </Button>
                </form>
            </FormControl>

            <p><b>Saved API Key:</b> {APIKey ? obfuscateString(APIKey) : "null"}</p>
        </div>
    )
}

