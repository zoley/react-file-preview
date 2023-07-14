import React,{ useEffect ,useState} from 'react'
import {Loading}from "../loading";
function readText(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = loadEvent => resolve(loadEvent.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(new Blob([buffer]), 'utf-8');
  });
}

export const TextViewer=(props)=>{
  
  const [loading,setLoading]=useState(true)
  const [content,setContent]=useState('')
  useEffect(()=>{
    if(props?.filePath){
      readText(props?.filePath).then(setContent).finally(()=>{
        setLoading(false)
      });
    }
  },[props?.filePath])


  return <div className="text-viewer-wrapper">
    <div id="text-viewer">
    {loading && <Loading/>}
      <pre className="code-area">
        {content}
      </pre>
    </div>
  </div>
}