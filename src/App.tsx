import './App.css'
import { getCurrentTab } from './utils/getCurrentTab';

async function handleClick() {
  const tab = await getCurrentTab();
  if (!tab || !tab.url) {
    return;
  }
  const url = new URL(tab.url);

  const targetUrl = 'https://wust.dev';

  chrome.tabs.update({
    url: targetUrl + url.pathname
  })
};



function App() {
    return (
    <>
      <button onClick={handleClick}>Goto Wust.dev</button>
    </>
  )
}

export default App
