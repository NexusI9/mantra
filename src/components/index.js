import { useState, useEffect, useRef } from 'react';
import cloud from '../assets/cloud.png';
import smoke from '../assets/smoke.png';
import sand from '../assets/sand.png';

export const Homepage = ({onSubmit = (e) => e}) => {

  return(
    <div id='home'>
      <div id='painting'>
        <img alt='cloud' data-type='cloud' src={cloud}/>
        <img alt='cloud' data-type='cloud' src={cloud}/>
        <img alt='sand' data-type='sand' src={sand}/>
        <img alt='smoke' data-type='smoke' src={smoke}/>
      </div>
      <div id='urlContent'>
        <h2>Welcome to <br/> Mantra</h2>
        <InputLink onSubmit={ e => onSubmit(e) }/>
      </div>

    </div>
  );
}

export const InputLink = ({onSubmit = (e) => e}) => {

  const [value, setValue] = useState();

  return(
    <div id='maininput'>
      <form id='enterURL' onSubmit={ () => onSubmit(value) }>
        <input type='text' placeholder='paste umedia link here' onChange={ e => setValue(e.target.value) } />
        <input type='submit' />
      </form>
    </div>
  );

}

export const Settings = ({onChangeTheme}) => {

  const [expand, setExpand] = useState(false);
  const themeDot = [
    {
      color: "#17181a",
      theme: "dark"
    },
    {
      color: "#fbf0db",
      theme: "paper"
    },
    {
      color: "#e4e4e4",
      theme: "white"
    }
  ];

   return(
     <div id="settings">
      <div className="theme_select">
        { themeDot.map(item => <span key={item.theme+"dot"} onClick={ () => onChangeTheme(item.theme) } style={{background:item.color}}></span> )}
      </div>
     </div>
   );
}


export const Reader = ({url, secPerWords=0.4, fontSize=2.5, theme='white'}) => {

  const [content, setContent] = useState();
  const [para, setPara] = useState();
  const [activePara, setActivePara] = useState(-1);
  const [needle, setNeedle] = useState(0);
  const listPara = useRef([]);

  let running = false;
  let timeout = null;

  let activeSentence = null;
  let activeSentIndex = 0;

  let activeParagraph = null;
  let activeParaIndex = -1;

  const read = (paragraph, index=0) => {

      if(!paragraph){return;}
      clearTimeout(timeout);
      console.log(activeParagraph);
      //Set globals for mousemove
      activeParagraph = paragraph;
      activeSentIndex = index;

      //remove all active sentences
      const element = document.getElementsByClassName('sentence');
      for(var sent of element){ sent.classList.remove('active'); }

      //set new active sentences
      activeSentence = paragraph.sentences[index];
      activeSentence.classList.add('active');
      window.scrollTo({top: activeSentence.getBoundingClientRect().top + window.scrollY - window.innerHeight/2, behavior: 'smooth' });

      const during = activeSentence.innerHTML.length * secPerWords * 1000 > 3000 ? activeSentence.innerHTML.length * secPerWords * 1000 : 3000;

      timeout = setTimeout( () => {
        clearTimeout(timeout);
        //loop through paragraph, if end of array return to 0
        if( index+1 === paragraph.sentences.length ){ read(paragraph, 0 ); }
        else{ read(paragraph, index+1 ); }
      }, during);
  }


  useEffect(() => {

    //convert
    fetch(url).then(res => res.text()).then(body => {
      //get all paragraphs
      let pr = body.match(/(?<=<p>)(.*?)(?=<\/p>)/g);
      //filter empty indexex
      pr = pr.filter(entry => entry.trim() != '');
      //remove space & residual inline tag
      pr = pr.map( item => item.trim().replace(/<(.*?)>/g, '') );
      //separate sentences within paragraphs
      pr = pr.map( item => item.split('，') );

      //listPara.current = listPara.current.slice(0, pr.length);
      listPara.current = pr.map( item => Object.assign({ paragraph:null, sentences:[] }) );
      setPara(pr);
    });

    const onKeyDown = (e) => {

      switch(e.key){

          case 'Enter':
            clearTimeout(timer)
            clearTimeout(timeout);
            if(para){ activeParaIndex = (activeParaIndex+1 === para.length) ? 0 : activeParaIndex+1; }
            else{ activeParaIndex++; }
            activeSentIndex = 0;
            read(listPara.current[activeParaIndex]);
          break;

      }
    }

    let timer;
    const onMouseMove = (e) => {
      clearTimeout(timer)
      clearTimeout(timeout);
      timer = setTimeout(() => read(activeParagraph, activeSentIndex), 300);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('mousemove', onMouseMove);
    }

  }, [url]);

  return(
    <div id='scene'>
      {
        para && para.map( (paragraphs,p) =>
            <div className='paragraph' key={'para_'+p} ref={ el => listPara.current[p].paragraph = el }>
              { paragraphs.map( (sentence,s) => <p ref={el => listPara.current[p].sentences[s] = el } className='sentence' key={sentence}>{sentence}</p> ) }
            </div>
        )
     }
    </div>
  );
}
