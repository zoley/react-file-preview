import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker";
import {
  Button,
  Spin,
  message,
  Upload,
  Input,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  UploadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";

// 设置 PDF.js worker，使用 legacy 版本兼容更多浏览器
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker?.toString();

const PdfPage = ({
  pdfDoc,
  pageNum,
  scale,
  containerWidth,
  onPageRendered,
}) => {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    let renderTask = null;
    let isMounted = true;

    const renderPage = async () => {
      if (!canvasRef.current) return;
      setRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Calculate scale
        let renderScale = 1.5;
        if (typeof scale === "number") {
          renderScale = scale;
        } else if (scale === "auto") {
          const unscaledViewport = page.getViewport({ scale: 1 });
          // Leave some margin
          renderScale = (containerWidth - 40) / unscaledViewport.width;
        }

        const viewport = page.getViewport({ scale: renderScale });

        // Handle high DPI displays
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (isMounted && onPageRendered) {
          onPageRendered();
        }
      } catch (error) {
        if (error.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNum}:`, error);
        }
      } finally {
        if (isMounted) {
          setRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale, containerWidth]);

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 20,
        display: "flex",
        justifyContent: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        backgroundColor: "#fff",
      }}
      data-page-number={pageNum}
    >
      <canvas ref={canvasRef} />
      {rendering && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        >
          <Spin />
        </div>
      )}
    </div>
  );
};

export const PdfPlusViewer = (props) => {
  const basePath = props?.basePath || "";
  const CMAP_URL = basePath + "/cmaps/";
  const Standard_Font_Data_Url = basePath + "/standard_fonts/";
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageInput, setCurrentPageInput] = useState("1");
  const [scale, setScale] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);

  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pagesRef = useRef([]);

  // 监听容器宽度变化，用于自动缩放
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isFullscreen]);

  // 处理全屏
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        message.error(`无法进入全屏: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 加载 PDF 文档
  const loadPdf = async (url) => {
    setLoading(true);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPageInput("1");

    try {
      // 添加 cMap 参数以修复特殊字体（如发票字体）不显示的问题
      const loadingTask = pdfjsLib.getDocument({
        url: typeof url === "string" ? url : undefined,
        data: typeof url !== "string" ? url : undefined,
        cMapUrl: CMAP_URL,
        cMapPacked: true,
        standardFontDataUrl: Standard_Font_Data_Url,
      });

      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      // message.success(`PDF加载成功`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      // message.error("PDF加载失败，请检查文件");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      if (props?.filePath) {
        loadPdf(props.filePath)
      }
    }, [props?.filePath]);

  // 监听滚动，更新当前页码
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollY = container.scrollTop;
    const containerHeight = container.clientHeight;

    // 简单计算当前在视口中心的页面
    const centerLine = scrollY + containerHeight / 2;

    let currentP = 1;
    let minDistance = Infinity;

    pagesRef.current.forEach((pageEl, index) => {
      if (!pageEl) return;
      const offsetTop = pageEl.offsetTop;
      const height = pageEl.clientHeight;
      const pageCenter = offsetTop + height / 2;

      const distance = Math.abs(centerLine - pageCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentP = index + 1;
      }
    });

    if (
      currentP.toString() !== currentPageInput &&
      document.activeElement?.id !== "page-input"
    ) {
      setCurrentPageInput(currentP.toString());
    }
  };

  // 跳转到指定页
  const jumpToPage = (pageStr) => {
    const pageNum = parseInt(pageStr, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPageInput(pageNum.toString());
      const pageEl = pagesRef.current[pageNum - 1];
      if (pageEl && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: pageEl.offsetTop - 20, // 留一点边距
          behavior: "smooth",
        });
      }
    } else {
      // 恢复为当前滚动位置的页码
      handleScroll();
    }
  };

  const handleZoomIn = () => {
    if (scale === "auto") setScale(1.5);
    else if (scale < 4) setScale(Math.min(4, scale + 0.25));
  };

  const handleZoomOut = () => {
    if (scale === "auto") setScale(1.0);
    else if (scale > 0.5) setScale(Math.max(0.5, scale - 0.25));
  };

  const handleZoomChange = (value) => {
    setScale(value);
  };

  // 生成页面数组
  const renderPages = () => {
    if (!pdfDoc) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div
          key={i}
          ref={(el) => (pagesRef.current[i - 1] = el)}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <PdfPage
            pdfDoc={pdfDoc}
            pageNum={i}
            scale={scale}
            containerWidth={containerWidth}
          />
        </div>,
      );
    }
    return pages;
  };
  const mobileStyle =
    window.innerWidth < 768
      ? {
          position: "relative",
          left: "unset",
          transform: "unset",
        }
      : {};
  return (
    <div
      ref={containerRef}
      className="pdf-plus-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "100%",
        margin: 0,
        background: "#f0f2f5",
        fontFamily: "sans-serif",
      }}
    >
      {/* 顶部工具栏 - 类似提供的图片样式 */}
      <div
      className="pdf-plus-control"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#2b579a", // 蓝色背景
          color: "white",
          padding: "5px 12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 10,
          position: "sticky",
          top: 0,
          ...props?.style,
        }}
      >
        {/* 左侧：搜索和分页 */}
        <Space size="middle">
          {/* <Button disabled type="text" style={{ color: 'white' }} icon={<SearchOutlined />} /> */}
          <Button
            type="text"
            style={{ color: "white" }}
            icon={<UpOutlined />}
            onClick={() =>
              jumpToPage((parseInt(currentPageInput) - 1).toString())
            }
            disabled={!pdfDoc || parseInt(currentPageInput) <= 1}
          />
          <Button
            type="text"
            style={{ color: "white" }}
            icon={<DownOutlined />}
            onClick={() =>
              jumpToPage((parseInt(currentPageInput) + 1).toString())
            }
            disabled={!pdfDoc || parseInt(currentPageInput) >= totalPages}
          />
          <span style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
            页面：
            <Input
              id="page-input"
              value={currentPageInput}
              onChange={(e) => setCurrentPageInput(e.target.value)}
              onPressEnter={(e) => jumpToPage(e.target.value)}
              onBlur={(e) => jumpToPage(e.target.value)}
              style={{
                width: 50,
                margin: "0 8px",
                textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                height: 24,
              }}
              disabled={!pdfDoc}
            />
            / {totalPages || "-"}
          </span>
        </Space>

        {/* 中间：缩放控制 */}
        <Space
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...mobileStyle,
          }}
        >
          <Button
            type="text"
            style={{ color: "white" }}
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={!pdfDoc || (typeof scale === "number" && scale <= 0.5)}
          />
          <Button
            type="text"
            style={{ color: "white" }}
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={!pdfDoc || (typeof scale === "number" && scale >= 4)}
          />
          <Select
            value={scale}
            onChange={handleZoomChange}
            disabled={!pdfDoc}
            style={{ width: 110 }}
            dropdownStyle={{ minWidth: 110 }}
            options={[
              { value: "auto", label: "自动缩放" },
              { value: 0.5, label: "50%" },
              { value: 0.75, label: "75%" },
              { value: 1, label: "100%" },
              { value: 1.25, label: "125%" },
              { value: 1.5, label: "150%" },
              { value: 2, label: "200%" },
              { value: 3, label: "300%" },
              { value: 4, label: "400%" },
            ]}
          />
        </Space>

        {/* 右侧：全屏控制 */}
        <Space>
          <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
            <Button
              type="text"
              style={{ color: "white" }}
              icon={
                isFullscreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {/* PDF 显示区域 - 滚动加载 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 0",
          position: "relative",
        }}
      >
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 100,
            }}
          >
            <Spin size="large" tip="加载文档中..." />
          </div>
        )}

        {!pdfDoc && !loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 100,
              color: "#999",
            }}
          >
            请点击左上角图标上传PDF文件
          </div>
        )}

        {renderPages()}
      </div>
    </div>
  );
};
