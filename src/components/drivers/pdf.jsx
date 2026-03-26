/**
 * 下面这种写法是正常的，但是不兼容移动端的部分浏览器，包括微信
 * 无奈换成legacy,
 * https://github.com/mozilla/pdf.js/issues/18446   question
 * https://github.com/mozilla/pdf.js/issues/18006   question
 * https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#faq-support  solution
 *
 * import * as PDFJS from "pdfjs-dist";
 * PDFJS.GlobalWorkerOptions.workerSrc = new URL(
 *   "pdfjs-dist/build/pdf.worker.min.mjs",
 *   import.meta.url
 * ).toString();
 *
 */

import React, { useEffect, useState, useRef } from "react";
import VisibilitySensor from "react-visibility-sensor";
import { Loading } from "../loading";
import Plus from "./plus.svg";
import Minus from "./minus.svg";
// const PDFJS = await import("pdfjs-dist/legacy/build/pdf.mjs");
// const workerSrc=await import("pdfjs-dist/legacy/build/pdf.worker.mjs")
// PDFJS.GlobalWorkerOptions.workerSrc=workerSrc.toString()

import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker?.toString();

const DEFAULT_SCALE = 3;
const INCREASE_PERCENTAGE = 0.2;
let timeout;

const CMAP_PACKED = true;

const PDFPage = React.memo(({ index, zoom, pdfInstance, containerWidth }) => {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({});
  const handlePageRender = async () => {
    const page = await pdfInstance.getPage(index);

    // console.log(page.getViewport({ scale: DEFAULT_SCALE }).width);
    // const calculatedScale =
    //   containerWidth / page.getViewport({ scale: DEFAULT_SCALE }).width;
    // const scale =
    //   calculatedScale > DEFAULT_SCALE ? DEFAULT_SCALE : calculatedScale;
    const viewport = page.getViewport({ scale: DEFAULT_SCALE + zoom });
    const { width, height } = viewport;
    setStyle({
      width: `${width / 2}px`,
      height: `${height / 2}px`,
    });
    const canvas = document.getElementById("canvasPDF" + index);
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    page.render({
      canvasContext: context,
      viewport,
    });
  };
  const onChange = (visible) => {
    setVisible(visible);
  };
  useEffect(() => {
    if (visible) {
      handlePageRender();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, zoom, visible]);

  return (
    <div key={String(index) + "pdf"} style={{ textAlign: "center" }}>
      <VisibilitySensor partialVisibility onChange={onChange}>
        <canvas id={"canvasPDF" + index} style={style} />
      </VisibilitySensor>
    </div>
  );
});

export const PDFViewer = (props) => {
  const basePath=props?.basePath || '';
  const CMAP_URL = basePath+"/cmaps/";
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0);
  const pdfRef = useRef();
  const containerRef = useRef();
  const handleIncreaseZoom = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setZoom((s) => s + 1);
    }, 100);
  };

  const handleReduceZoom = () => {
    if (zoom < -13) return;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setZoom((s) => s - 1);
    }, 100);
  };

  useEffect(() => {
    if (props?.filePath) {
      PDFJS.getDocument({
        data: props?.filePath,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
      }).promise.then((pdf) => {
        pdfRef.current = pdf;
        const random = (Math.random() * 10000000).toFixed(0);
        const tempPages = Array.from({ length: pdf.numPages }).fill(random);
        setPages(tempPages);
        setLoading(false);
      });
    }
  }, [props?.filePath]);

  return (
    <div
      className="pdf-viewer-wrapper"
      style={{ width: "100%", height: "100%", overflow: "auto" }}
    >
      <div className="pdf-controls">
        <div className="pdf-large" onClick={handleIncreaseZoom}>
          <img src={Plus} alt="" />
        </div>
        <div className="pdf-small" onClick={handleReduceZoom}>
          <img src={Minus} alt="" />
        </div>
      </div>
      {loading && <Loading />}
      <div ref={containerRef} className="pdf-viewer">
        {!loading &&
          pages?.map((x, i) => {
            return (
              <PDFPage
                key={String(i) + "pdfs" + x}
                index={i + 1}
                zoom={zoom * INCREASE_PERCENTAGE}
                pdfInstance={pdfRef.current}
                containerWidth={containerRef.current?.offsetWidth}
              />
            );
          })}
      </div>
    </div>
  );
};
