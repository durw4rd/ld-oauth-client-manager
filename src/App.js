import logo from './logo.svg';
// import OAuthClient from './components/createClient.js';
// import ExistingClients from './components/getClients.js';
// import ClientDeleter from './components/deleteClient.js';
import ApiTokenForm from './components/apiTokenForm.js';
import HandleOauthClients from './components/handleOauthClients.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ApiTokenForm />
        <img src={logo} className="App-logo" alt="logo" />
        <HandleOauthClients />
      </header>
    </div>
  );
}

export default App;
