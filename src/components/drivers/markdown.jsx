import React,{useId} from 'react'
import {MdPreview} from 'md-editor-rt'
import 'md-editor-rt/lib/preview.css'
import {Loading} from '../loading'
import {useTextContent} from './useTextContent'

export const MarkdownViewer=(props)=>{
  const id='markdown-'+useId().replace(/:/g,'')
  const {content,loading,error}=useTextContent(props?.filePath)

  if(loading) return <Loading/>
  if(error) return <div role="alert">{error}</div>

  return <div style={{height:'100%',overflow:'auto'}}>
    <MdPreview id={id} modelValue={content}/>
  </div>
}
