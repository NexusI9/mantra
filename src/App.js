import './sheet.scss';
import { Homepage, Reader, Settings, PopUp } from './components';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


function App() {

  const [url, setUrl] = useState();
  const [theme, setTheme] = useState('white');
  const [searchParams, setSearchParams] = useSearchParams();
  const [translation, setTranslation] = useState(null);

  useEffect( () => {

    document.querySelector('body').setAttribute('data-theme', theme);
    if(searchParams.get('article')){ setUrl(searchParams.get('article'));  }
    if(url){ setSearchParams({article:url}); }


  }, [theme, url]);

  return (
      <div id="wrapper">
        {!url && <Homepage onSubmit={ (e) => setUrl(e) } /> }
        {url && <Reader url={url} onTranslate={ e => setTranslation(e) } setTimer={ () => translation === null } /> }
        {url && <Settings onChangeTheme={ (e) => setTheme(e) } onPrevParagraph = { () => 0 } onNextParagraph= { () => 0}/> }
        {translation && <PopUp words={translation} onQuit={ () => setTranslation(null) }/>}
      </div>
  );
}

export default App;
