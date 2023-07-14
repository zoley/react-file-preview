import React,{ useEffect,useState } from 'react'
import {Loading}from "../loading";
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
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    if(props?.filePath){
      readDataURL(props?.filePath).then(setUrl).finally(()=>{
        setLoading(false)
      })
    }
  },[props?.filePath])

  return <div className="img-viewer-wrapper">
       {loading && <Loading/>}
   {url && <img alt="图片" src={url} />}
  </div>
}