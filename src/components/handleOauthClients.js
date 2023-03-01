import axios from 'axios';
import { useState, useEffect } from 'react';
import localStorage from 'local-storage';

export default function HandleOauthClients() {

    let [OauthClients, setOauthClients] = useState([]);
    // let [clientName, setClientName] = useState("");

    const apiToken = localStorage.get("ld-api-key");
    
    useEffect(() => {
        if(apiToken !== null) {
            listClients();
        }
    }, [])

    const createClient = (name) => {
        axios.post('https://app.launchdarkly.com/api/v2/oauth/clients', {
            "name": name,
            "redirectUri": "https://app.launchdarkly.com/login",
            "description": "Lorem Ipsum"
        },{
            headers: {
                "LD-API-Version": "beta",
                'Content-Type': 'application/json',
                "Authorization": localStorage.get("ld-api-key")
            }
        })
            .then(res => {
                console.log(`Response status: ${res.status}`);
                listClients();
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
                // console.log(rawClients);
                setOauthClients(rawClients) 
            })
            .catch(e => {
                console.log(e);
            })
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
        // setClientName(event.target.elements['oauthClientName'].value);
        createClient(event.target.elements['oauthClientName'].value);
        event.target.elements['oauthClientName'].form.reset();
    }
    
    return (
        <div style={{width: "90%"}}>
            <form onSubmit={handleFormSubmit}>
                <fieldset>
                <div className="flex">
                    <label>
                        New Client Name:
                        <input name="oauthClientName" type="text" placeholder="Enter Name of the new client"></input>
                    </label>
                    <button style={{border: "4px solid white", margin: "16px", padding: "8px"}}>Create Client!</button>
                </div>
                </fieldset>
            </form>
            <table style={{borderCollapse: "collapse", width: "100%"}}>
                <thead>
                    <tr>
                        <th style={{border: "1px solid white"}}>Client name</th>
                        <th style={{border: "1px solid white"}}>Client ID</th>
                        <th style={{border: "1px solid white"}}>Creation Date</th>
                        <th style={{border: "1px solid white"}}>Delete</th>
                    </tr>
                </thead>
                <tbody>{
                    OauthClients.map(({name, _clientId, _creationDate},index) => {
                        return (
                            <tr key={index}>
                                <td style={{border: "1px solid white"}}>{name}</td>
                                <td style={{border: "1px solid white"}}>{_clientId}</td>
                                <td style={{border: "1px solid white"}}>{_creationDate}</td>
                                <td style={{border: "1px solid white"}}><button style={{border: "4px solid white"}} onClick={ () => deleteClient(_clientId) }>delete client</button></td>
                            </tr> 
                        )
                    })
                }
                </tbody>
            </table>
        </div>
    )
}