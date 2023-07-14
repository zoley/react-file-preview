

import React,{ useEffect,useState } from 'react'
import {Loading}from "../loading";

import { defaultOptions, renderAsync } from "docx-preview";


export const DocxViewer=(props)=>{
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    if(props?.filePath){
      const docxOptions = Object.assign(defaultOptions, {
        debug: false,
        experimental: true,
      });
      const dom=document.getElementById('docx-viewer')
      renderAsync(props?.filePath, dom, null, docxOptions).finally(()=>{
        setLoading(false)
      })
    }
  },[props?.filePath])

  return <div className="docx-viewer-wrapper">
       {loading && <Loading/>}
    <div id="docx-viewer" style={{visibility:loading?'hidden':'visible'}}></div>
  </div>
}