import { useState, useEffect, useRef } from 'react';
import background from '../assets/bkg_home.jpg';
import wordDict from '../data/cedict_ts.u8';
import wordIndex from '../data/cedict.idx';
import grammarKeywords from '../data/grammarKeywordsMin.json';
import ZhongwenDictionary from '../lib/zhongwendico.js';
import { toZhuyin } from '../lib/pinyin-to-zhuyin.js';
import { PinyinConverter } from '../lib/pinyin_converter.js';


export const Homepage = ({onSubmit = (e) => e}) => {

  return(
    <div id='home'>
      <img src={background}/>
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
      <div className='para_change'>
        <button data-type='prev'></button>
        <button data-type='next'></button>

      </div>
     </div>
   );
}

export const PopUp = ({word}) => {

  return(<>

    </>);
}

export const Reader = ({url, secPerWords=0.4, fontSize=2.5, theme='white', onTranslate = (e) => e, setTimer = (e) => e }) => {

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

    //--Timer--
    let timer;

    //--dico--
    let lastText;
    let savedStartOffset, savedRange;
    let globalObject;
    let dico;

    //--Load dico--
    async function loadDictData() {
        let f_wordDict = fetch(wordDict).then(r => r.text());
        let f_wordIndex = fetch(wordIndex).then(r => r.text());
        return Promise.all([f_wordDict, f_wordIndex]);
    }
    loadDictData().then( res => dico = new ZhongwenDictionary(res[0], res[1], grammarKeywords) );

    //--Utilities--
    const urlToHtml = (url) => {

      fetch(url).then(res => res.text()).then(body => {
        //get all paragraphs
        let pr = body.match(/(?<=<p>)(.*?)(?=<\/p>)/g);
        //filter empty indexex
        pr = pr.filter(entry => entry.trim() != '');
        //remove space & residual inline tag
        pr = pr.map( item => item.trim().replace(/<(.*?)>/g, '') );
        //separate sentences within paragraphs
        //pr = pr.map( item => item.split('，') );
        pr = pr.map( item => item.split(/。|、|！|，/gm) );

        //listPara.current = listPara.current.slice(0, pr.length);
        listPara.current = pr.map( item => Object.assign({ paragraph:null, sentences:[] }) );
        setPara(pr);
      });
    }
    const switchParagraph = (type='next') => {
      clearTimeout(timer)
      clearTimeout(timeout);

      switch(type){
        case 'next':
          if(para){ activeParaIndex = (activeParaIndex+1 === para.length) ? 0 : activeParaIndex+1; }
          else{ activeParaIndex++; }
        break;

        case 'prev':
          if(para){ activeParaIndex = (activeParaIndex-1 < 0) ? 0 : activeParaIndex-1; }
          else{ activeParaIndex--; }
        break;
      }

      activeSentIndex = 0;
      read(listPara.current[activeParaIndex]);
    }
    const onResult = (result) => {
        onTranslate(result);
    }
    const clearAllTimers = () => {
      clearTimeout(timer)
      clearTimeout(timeout);
    }

    //---Events---
    const preventScroll = (e) => {
      e.stopPropagation();
    }
    const onKeyDown = (e) => {

      switch(e.key){
          case 'Enter':
              switchParagraph('next');
          break;

      }
    }
    const onMouseDown = (e) => {

      if(!dico){ return; }

      const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
      const REGEX_PONCT = /[\$\uFFE5\^\+=`~<>{}\[\]|\u3000-\u303F!-#%-\x2A,-/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/g;

      let targetNode;
      let select = window.getSelection();

      function findNextTextNode(root, previous) {
          if (root === null) { return null; }

          let nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, null);
          let node = nodeIterator.nextNode();
          while (node !== previous) {
              node = nodeIterator.nextNode(); //next Node jusqu'a qu'on reach le previous (actuel node)
              if (node === null) {
                  return findNextTextNode(root.parentNode, previous);
              }
          }
          let result = nodeIterator.nextNode();
          if (result !== null) { return result; }
          else { return findNextTextNode(root.parentNode, previous); }
      }
      function getText(nd){

        if(!REGEX_CHINESE.test(nd.data)){ return; }

        let range = new Range();
        let startOffset = savedStartOffset;
        let increment = 1;
        let max_increment = nd.data.length - startOffset;
        let result = null;

        range.setStart(nd,startOffset);
        range.setEnd(nd,startOffset+max_increment);
        savedRange = range;
        range = range.toString();

        if(lastText !== range && !REGEX_PONCT.test(range) && isNaN(range) ){
          globalObject = null;
          result = dico.search(range);
          lastText = range;
        }

        return textResult(result);
      }
      function textResult(result){

         if(!result){return;}

         let max_increment = 0;
         let newRange = savedRange;
         let startOffset = savedStartOffset;

         for(var i = 0; i < result.data.length; i++){
           if( result.data[i][1].length > max_increment){
             max_increment = result.data[i][1].length;
           }
         }

         newRange.setEnd(targetNode,startOffset+max_increment);
         select.removeAllRanges();
         select.addRange(newRange);

         result = result.data;
         result = result.map( item => convert(item) );
         return result;

      }
      function tone(str){
        str = str.replace("u:","ü");
        str = str.replace("U:","Ü");
        str = PinyinConverter.convert(str);
        return str;
      }
      function convert(word){

            let zhg = word[0].match( /^[^\[]+/gm );
            let trad = "";

            zhg = zhg[0].split(" ");
            zhg = zhg.filter(item => item);

            trad = zhg[0];
            zhg = zhg[1];

            let pin = word[0].match( /(?<=\[).+?(?=\])/ );
            let zhu = toZhuyin(pin[0]);
            pin = tone(pin[0]).toLowerCase();
            pin = pin.split(" ");

            let trans = word[0].match( /(?<=\/).*/gm );

            trans = tone(trans[0]);
            trans = trans.split("/");
            trans = trans.filter( item => item !== '');

            return Object.assign({
              simplified: zhg,
              traditional:trad,
              pinyin:pin,
              zhuyin:zhu,
              definition:trans
            });
        }
      let range;
      let rangeNode;
      let rangeOffset;

      if(document.caretRangeFromPoint){
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range === null) { return; }
        rangeNode = range.startContainer; //actual element node
        rangeOffset = range.startOffset;

      }else if(document.caretPositionFromPoint){
        range = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (range === null) {  return; }
        rangeNode = range.offsetNode;
        rangeOffset = range.offset;
      }

      if (rangeNode.data && rangeOffset === rangeNode.data.length) {
          rangeNode = findNextTextNode(rangeNode.parentNode, rangeNode);
          rangeOffset = 0;
      }


      if (!rangeNode || rangeNode.parentNode !== e.target){
          lastText = null;
          globalObject = null;
          select.removeAllRanges();
          rangeNode = null;
          rangeOffset = -1;
      }


      if(rangeNode &&
        rangeNode.data &&
        rangeOffset < rangeNode.data.length ){

          savedStartOffset = rangeOffset;
          targetNode = rangeNode;

           let result = getText(rangeNode);
           if(result){ onResult(result); }
        }

      }
    const onMouseMove = (e) => {
      clearAllTimers();
      timer = setTimeout(() => read(activeParagraph, activeSentIndex), 300);
    }

    window.addEventListener('touchmove',preventScroll,false);
    window.addEventListener('scroll',preventScroll,false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);

    urlToHtml(url);

    return () => {
        window.removeEventListener('touchmove',preventScroll,false);
        window.removeEventListener('scroll',preventScroll,false);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);

        clearAllTimers();
    }

  }, [url]);

  return(
    <div id='scene'>
      {
        para && para.map( (paragraphs,p) =>
            <div className='paragraph' key={'para_'+p} ref={ el => listPara.current[p].paragraph = el }>
              { paragraphs.map( (sentence,s) => <p ref={el => listPara.current[p].sentences[s] = el } className='sentence' key={"sentence"+Math.random()+sentence}>{sentence}</p> ) }
            </div>
        )
     }
    </div>
  );
}
