

import React,{ useEffect } from 'react'

import { defaultOptions, renderAsync } from "docx-preview";


export const DocxViewer=(props)=>{
  
  useEffect(()=>{
    if(props?.filePath){
      const docxOptions = Object.assign(defaultOptions, {
        debug: false,
        experimental: true,
      });
      const dom=document.getElementById('docx-viewer')
      renderAsync(props?.filePath, dom, null, docxOptions)
    }
  },[props?.filePath])

  return <div className="docx-viewer-wrapper">
    <div id="docx-viewer"></div>
  </div>
}