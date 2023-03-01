import localStorage from 'local-storage';
import { useState, useEffect } from 'react';

export default function ApiTokenForm() {

    let [APIKey, setAPIKey] = useState("");

    useEffect(() => {
        setAPIKey(localStorage.get('ld-api-key'));
    }, [])

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const formInput = event.target.elements['APIToken'].value;
        localStorage.set('ld-api-key', formInput);
        event.target.elements['APIToken'].form.reset();

        setAPIKey(formInput);
    }

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <fieldset>
                <div className="flex">
                    <label>
                        Your API Key:
                        <input name="APIToken" type="text" placeholder="Enter your API key"></input>
                    </label>
                    <button style={{border: "4px solid white", margin: "16px", padding: "8px"}} id="createClient">Save API key</button>
                </div>
                </fieldset>
            </form>
            <p><b>Saved API Key:</b> { APIKey ? APIKey : "null"}</p>
        </div>
    )
}

