import React, { useEffect, useState } from "react";
import { Loading } from "../loading";
import Plus from "./plus.svg";
import Minus from "./minus.svg";
import { defaultOptions, renderAsync } from "docx-preview";
let timeout;

export const DocxViewer = (props) => {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const handleIncreaseZoom = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setZoom((s) => s + 0.2);
    }, 100);
  };

  const handleReduceZoom = () => {
    if (zoom < 0.3) return;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setZoom((s) => s - 0.2);
    }, 100);
  };
  useEffect(() => {
    const A = document.getElementById("docx-viewer");
    const B = A.getElementsByClassName("docx-wrapper")[0];
    if (B) {
      const section = B.querySelector("section");
      if (section) {
        section.style.zoom = zoom;
      }
    }
  }, [zoom]);

  useEffect(() => {
    if (props?.filePath) {
      const docxOptions = Object.assign(defaultOptions, {
        debug: false,
        experimental: true,
      });
      const dom = document.getElementById("docx-viewer");
      renderAsync(props?.filePath, dom, null, docxOptions).finally(() => {
        setLoading(false);
      });
    }
  }, [props?.filePath]);

  return (
    <div
      className="docx-viewer-wrapper"
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
      <div
        id="docx-viewer"
        style={{ visibility: loading ? "hidden" : "visible" }}
      ></div>
    </div>
  );
};
