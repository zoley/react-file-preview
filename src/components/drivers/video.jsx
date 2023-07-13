import React,{ useEffect ,useState} from 'react'

function renderVideo(buffer, target) {
  const mp4 = document.createElement('video');
  mp4.width = 850;
  mp4.height = 520;
  mp4.controls = true;
  const source = document.createElement('source');
  source.src = URL.createObjectURL(new Blob([buffer]));
  mp4.appendChild(source);
  target.innerHTML=''
  target.appendChild(mp4)
}

export const VideoViewer=(props)=>{
  useEffect(()=>{
    if(props?.filePath){
      const dom=document.getElementById('video-viewer')
      renderVideo(props?.filePath,dom)
    }
  },[props?.filePath])


  return <div className="video-viewer-wrapper">
    <div id="video-viewer" style={{display:'flex',justifyContent:'center'}}>
    </div>
  </div>
}