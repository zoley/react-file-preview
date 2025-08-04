

import React, { Suspense } from 'react';
import { ImgViewer, TextViewer, VideoViewer } from './drivers'
import { loadPDFViewer, loadDocxViewer, loadXlsxViewer, loadPPtxViewer } from './drivers'
import './style.css'

// 创建动态加载的组件
const PDFViewer = React.lazy(() => import('./drivers/pdf').then(module => ({ default: module.PDFViewer })));
const DocxViewer = React.lazy(() => import('./drivers/docx').then(module => ({ default: module.DocxViewer })));
const XlsxViewer = React.lazy(() => import('./drivers/xlsx').then(module => ({ default: module.XlsxViewer })));
const PPtxViewer = React.lazy(() => import('./drivers/pptx').then(module => ({ default: module.PPtxViewer })));

// 加载组件
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    fontSize: '16px',
    color: '#666'
  }}>
    正在加载文件查看器...
  </div>
);

export async function readBuffer(file) {
  if(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = loadEvent => resolve(loadEvent?.target?.result);
      reader.onerror = e => reject(e);
      reader.readAsArrayBuffer(file);
    });
  }else{
    return Promise.resolve('')
  }
 
}

export const FileViewer=(props)=>{

  const  getDriver=(fileType) =>{
    switch (fileType) {
      case 'pdf': {
        return (
          <Suspense fallback={<LoadingComponent />}>
            <PDFViewer {...props}/>
          </Suspense>
        );
      }
      case 'docx': {
        return (
          <Suspense fallback={<LoadingComponent />}>
            <DocxViewer {...props}/>
          </Suspense>
        );
      }
      case 'xlsx': {
        return (
          <Suspense fallback={<LoadingComponent />}>
            <XlsxViewer {...props}/>
          </Suspense>
        );
      }
      case 'pptx': {
        return (
          <Suspense fallback={<LoadingComponent />}>
            <PPtxViewer {...props}/>
          </Suspense>
        );
      }
      case "gif": 
      case "jpg": 
      case "jpeg":
      case "bmp": 
      case "tiff": 
      case "tif":
      case "png": {
        return <ImgViewer {...props}/>;
      }
      case "txt": 
      case "json": 
      case "js": 
      case "css": 
      case "java": 
      case "py": 
      case "html": 
      case "jsx": 
      case "ts": 
      case "tsx": 
      case "xml": 
      case "md": 
      case "log": {
        return <TextViewer {...props}/>;
      }
      case 'mp4': {
        return <VideoViewer {...props}/>;
      }
      default: {
        return <div>
          <h3 style={{textAlign:'center',marginTop:150}}>不支持 .{fileType} 格式的在线预览，请下载后预览或转换为支持的格式</h3>
          <p style={{textAlign:'center'}}>支持 .docx ，.xlsx ，.pptx ，.pdf ，以及纯文本格式和各种图片格式的在线预览</p>
        </div>;
      }
    }
  }

  return <div className="cr-viewer-wrapper">
    <div className="cr-viewer" id="cr-viewer">
    {getDriver(props?.fileType)}
    </div>
</div>
}
