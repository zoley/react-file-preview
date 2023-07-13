import React,{ useEffect,useState } from 'react'

function readDataURL(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = loadEvent => resolve(loadEvent.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(new Blob([buffer]));
  });
}


export const ImgViewer=(props)=>{
  const [url,setUrl]=useState('')
  useEffect(()=>{
    if(props?.filePath){
      readDataURL(props?.filePath).then(setUrl)
    }
  },[props?.filePath])

  return <div className="img-viewer-wrapper">
   <img alt="图片" src={url} />
  </div>
}