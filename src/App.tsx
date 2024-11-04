import { useEffect, useState } from 'react';
import './App.css'
import { getCurrentTab } from './utils/getCurrentTab';
import Footer from './components/Footer';

type HopperHost = {
  label: string;
  host: string;
}

type HopperHub = {
  [hubId: string]: HopperHost[];
}

function App() {
  const [newHost, setNewHost] = useState('');
  const [newHostLabel, setNewHostLabel] = useState('');
  const [hopperHub, setHopperHub] = useState<HopperHub>({});
  const [path, setPath] = useState('');
  const [hubId, setHubId] = useState('');

  function handleAddHost(e: React.FormEvent) {
    e.preventDefault();
    if (!newHost || !newHostLabel) {
      return;
    }
    const newHopperHost: HopperHost = {
      label: newHostLabel,
      host: newHost,
    };
    const newHopperHub = { ...hopperHub };
    newHopperHub[hubId] = newHopperHub[hubId] || [];
    newHopperHub[hubId].push(newHopperHost);
    setHopperHub(newHopperHub);
    chrome.storage.local.set({ HopperHub: newHopperHub });
    setNewHost('');
    setNewHostLabel('');
  }

  async function handleRemove(HopperHost: HopperHost) {
    const newHopperHub = { ...hopperHub };
    newHopperHub[hubId] = newHopperHub[hubId].filter((host) => host.host !== HopperHost.host);
    setHopperHub(newHopperHub);
    chrome.storage.local.set({ HopperHub: newHopperHub });
  };

  useEffect(() => {
    chrome.storage.local.get('HopperHub', (result) => {
      setHopperHub(result.HopperHub || {});
    });
  }, []);

  useEffect(() => {
    getCurrentTab().then((tab) => {
      if (tab && tab.url) {
        const url = new URL(tab.url);
        setPath(url.pathname);
        setHubId(url.hostname);
      }
    });
  }, []);

  const hostsInHub = hopperHub[hubId] || [];


  return (
    <>
      <div className="hophub">
        {hostsInHub.length > 0 ?
          hostsInHub.map((host) =>
            <div>
              <a href={host.host + path}
                target="_blank"
                rel="noopener noreferrer"
                title={host.host + path}
              >{host.label}</a>
              <button className="removeBtn" onClick={() => handleRemove(host)}>-</button>
            </div>
          )
          :
          <p>No Hosts for this site</p>
        }
      </div>

      <form onSubmit={handleAddHost}>
        <div>
          <label htmlFor="hostlabel">Name:</label>
          <input
            required
            type="text" placeholder="Name" value={newHostLabel} onChange={(e) => setNewHostLabel(e.target.value)} />

          <label htmlFor="host">Host:</label>
          <input
            required
            pattern="https?://.*"
            type="text" placeholder="https://example.com" value={newHost} onChange={(e) => setNewHost(e.target.value)} />
        </div>
        <button type="submit">Add new Host</button>
      </form>
      <Footer />
    </>
  )
}

export default App
