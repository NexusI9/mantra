import './sheet.scss';
import { Homepage, Reader, Settings, PopUp } from './components';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


function App() {

  //global
  const [url, setUrl] = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  //popup translator
  const [translation, setTranslation] = useState(null);

  //reader
  const [lockReader, setLockReader] = useState(false);
  const [theme, setTheme] = useState('white');
  const [fontSize, setSize] = useState(2.5);
  const [speed, setSpeed] = useState(0.4);

  useEffect( () => {

    const body = document.querySelector('body');
    body.setAttribute('data-theme', theme);
    if(searchParams.get('article')){ setUrl(searchParams.get('article'));  }
    if(url){ setSearchParams({article:url}); }


  }, [theme, url]);

  return (
      <div id="wrapper">
        {!url && <Homepage onSubmit={ (e) => setUrl(e) } /> }
        {url &&
          <Reader
          url={url}
          onTranslate={ e => setTranslation(e) }
          fontSize = { fontSize }
          speed = { speed }
          lock={ lockReader }
          /> }
        {url &&
          <Settings
          onChangeTheme={ e => setTheme(e) }
          onChangeSpeed = { e => setSpeed(e)  }
          onChangeSize = { e => setSize(e)  }
          onQuit={ () => setLockReader(false) }
          onStart={ () => setLockReader(true) }
          returnHome={ () => { setUrl(); searchParams.delete('article');

         }}
          />
        }
        {translation &&
          <PopUp
          words={translation}
          onQuit={ () => { setTranslation(null); setLockReader(false); }}
          onStart={ () => setLockReader(true) }/>
        }
      </div>
  );
}

export default App;
