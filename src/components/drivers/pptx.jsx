import React,{ useEffect } from 'react'

import renderPptx from "./ppt";


export const PPtxViewer=(props)=>{
  
  useEffect(()=>{
    if(props?.filePath){
      const dom=document.getElementById('pptx-viewer')
      renderPptx(props?.filePath, dom, null);
    }
  },[props?.filePath])

  return <div className="pptx-viewer-wrapper">
    <div id="pptx-viewer" style={{width:1100,margin:'0 auto'}}></div>
  </div>
}