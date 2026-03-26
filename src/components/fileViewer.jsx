

import {PDFViewer,PdfPlusViewer,DocxViewer,XlsxViewer,PPtxViewer,ImgViewer,TextViewer,VideoViewer} from './drivers'
import './style.css'

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
        return props?.hasControl?<PdfPlusViewer {...props}/>:<PDFViewer {...props}/>;
      }
      case 'docx': {
        return <DocxViewer {...props}/>;
      }
      case 'xlsx': {
        return <XlsxViewer {...props}/>;
      }
      case 'pptx': {
        return <PPtxViewer {...props}/>;
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

  return <div className="cr-viewer-wrapper" style={{height:'100%'}}>
    <div className="cr-viewer" id="cr-viewer" style={{height:'100%'}}>
    {getDriver(props?.fileType)}
    </div>
</div>
}
