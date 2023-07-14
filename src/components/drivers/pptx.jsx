import React,{ useEffect,useState } from 'react'
import {Loading}from "../loading";
import renderPptx from "./ppt";


export const PPtxViewer=(props)=>{
  
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    if(props?.filePath){
      const dom=document.getElementById('pptx-viewer')
      renderPptx(props?.filePath, dom, null).finally(()=>{
        setLoading(false)
      });
    }
  },[props?.filePath])

  return <div className="pptx-viewer-wrapper">
       {loading && <Loading/>}
    <div id="pptx-viewer" style={{width:1100,margin:'0 auto',visibility:loading?'hidden':'visible'}}></div>
  </div>
}