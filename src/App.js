import './sheet.scss';
import { Homepage, Reader, Settings } from './components';
import { useState, useEffect } from 'react';


function App() {

  const [url, setUrl] = useState();
  const [theme, setTheme] = useState('white');

  useEffect( () => {

    document.querySelector('body').setAttribute('data-theme', theme);

  }, [theme]);

  return (
    <div id="wrapper">
      {!url && <Homepage onSubmit={ (e) => setUrl(e) } /> }
      {url && <Reader url={url} /> }
      {url && <Settings onChangeTheme={ (e) => setTheme(e) } /> }
    </div>
  );
}

export default App;
