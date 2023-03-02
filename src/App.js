import logo from './logo.svg';
import ApiTokenForm from './components/apiTokenForm.js';
import HandleOauthClients from './components/handleOauthClients.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <header className="App-header">
        <ApiTokenForm />
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <hr style={{width: "95%"}}/>
        <br/>
        <HandleOauthClients />
      </header>
    </div>
  );
}

export default App;
