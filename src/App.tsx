import { useEffect, useState } from 'react';
import './App.css'
import { getCurrentTab } from './utils/getCurrentTab';

type HopperHost = {
  label: string;
  host: string;
}

type HopperHub = {
  [hubId: string]: HopperHost[];
}

async function handleGoto(HopperHost: HopperHost) {
  const tab = await getCurrentTab();
  if (!tab || !tab.url) {
    return;
  }

  const url = new URL(tab.url);

  chrome.tabs.update({
    url: HopperHost.host + url.pathname
  })
};

function App() {
  const [newHost, setNewHost] = useState('');
  const [newHostLabel, setNewHostLabel] = useState('');
  const [hopperHub, setHopperHub] = useState<HopperHub>({});
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
        // hubId is current host
        setHubId(url.hostname);
      }
    });
  }, []);

  const hostsInHub = hopperHub[hubId] || [];


  return (
    <>
      <h2>HopperHub:</h2>
      <div className="hophub">
        {hostsInHub.length > 0 ?
          hostsInHub.map((host) =>
            <div>
              <button onClick={() => handleGoto(host)}>Goto {host.label}</button>
              <button className="removeBtn" onClick={() => handleRemove(host)}>-</button>
            </div>
          )
          :
          <p>No Hosts in Hub.</p>
        }
      </div>

      <h2>Add Host:</h2>
      <form onSubmit={handleAddHost}>
        <label htmlFor="hostlabel">Name:</label>
        <input type="text" placeholder="Name" value={newHostLabel} onChange={(e) => setNewHostLabel(e.target.value)} />

        <label htmlFor="host">Host:</label>
        <input type="text" placeholder="http(s)://..." value={newHost} onChange={(e) => setNewHost(e.target.value)} />

        <button type="submit">Add to Hub</button>
      </form>
    </>
  )
}

export default App
