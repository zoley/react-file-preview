import React from 'react'
import {Loading} from '../loading'
import {useTextContent} from './useTextContent'

export const HtmlViewer=(props)=>{
  const {content,loading,error}=useTextContent(props?.filePath)

  if(loading) return <Loading/>
  if(error) return <div role="alert">{error}</div>

  return <iframe title="HTML 文档预览" srcDoc={content} style={{display:'block',width:'100%',height:'100%',border:0}}/>
}
