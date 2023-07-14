
import * as PDFJS from "pdfjs-dist/legacy/build/pdf"
import React,{ useEffect,useState,useRef } from 'react'
import VisibilitySensor from 'react-visibility-sensor';
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry"
import {Loading}from "../loading";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker


const DEFAULT_SCALE=1.4
const INCREASE_PERCENTAGE = 0.2;
let timeout;

const PDFPage=React.memo(({index,zoom,pdfInstance,containerWidth})=>{
  const [visible,setVisible]=useState(false)
  const handlePageRender=async()=>{
    const page= await pdfInstance.getPage(index);
    const calculatedScale = (containerWidth / page.getViewport({scale:DEFAULT_SCALE}).width);
    const scale = calculatedScale > DEFAULT_SCALE ? DEFAULT_SCALE : calculatedScale;
    const viewport = page.getViewport({scale:scale + zoom});
    const { width, height } = viewport;
    const canvas = document.getElementById("canvasPDF" + index);
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    page.render({
      canvasContext: context,
      viewport,
    });
  }
  const onChange=(visible)=>{
    setVisible(visible)
  }
  useEffect(()=>{
    if(visible){
      handlePageRender()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[index,zoom,visible])

  return <div key={String(index)+'pdf'} style={{textAlign:'center',display:'flex',justifyContent:'center'}}>
    <VisibilitySensor partialVisibility onChange={onChange}>
     <canvas id={'canvasPDF'+index}/> 
    </VisibilitySensor>
  </div>

})

export const PDFViewer=(props)=>{
  const [pages,setPages]=useState([])
  const [loading,setLoading]=useState(true)
  const [zoom,setZoom]=useState(0)
  const pdfRef=useRef()
  const containerRef=useRef()
  const handleIncreaseZoom=()=>{
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(()=>{
      setZoom(s=>s+1)
    }, 200);
    
  }

  const handleReduceZoom=()=>{
    if (zoom <-2) return;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(()=>{
      setZoom(s=>s-1)
    }, 200);
  }

  useEffect(()=>{
    if(props?.filePath){
      PDFJS.getDocument(props?.filePath).promise.then((pdf) => {
        pdfRef.current=pdf
        const random=(Math.random() * 10000000).toFixed(0)
        const tempPages = Array.from({ length: pdf.numPages }).fill(random);
        setPages(tempPages)
        setLoading(false)
      });
    }
  },[props?.filePath])

  return <div className="pdf-viewer-wrapper">
    <div className="pdf-controls">
      <div className="pdf-large" onClick={handleIncreaseZoom}>➕</div>
      <div className="pdf-small" onClick={handleReduceZoom}>➖</div>
    </div>
    {loading && <Loading/>}
    <div ref={containerRef} className="pdf-viewer">
      {
        !loading && pages?.map((x,i)=>{
          return <PDFPage 
            key={String(i)+'pdfs'+x}
            index={i+1} 
            zoom={zoom * INCREASE_PERCENTAGE} 
            pdfInstance={pdfRef.current} 
            containerWidth={containerRef.current?.offsetWidth}
          />
        })
      }
    </div>
  </div>
}