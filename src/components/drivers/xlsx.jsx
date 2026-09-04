import React, { useEffect, useState, useMemo, useRef } from "react";
import ExcelJS from "exceljs";
import Handsontable from "handsontable";
import { registerLanguageDictionary, zhCN } from "handsontable/i18n";
import "handsontable/dist/handsontable.full.min.css";
import { camelCase, captain, fixMatrix, getWorksheetRows } from "./util";
import { Loading } from "../loading";
// 注册中文
registerLanguageDictionary(zhCN);

const indexedColors = [
  "000000",
  "FFFFFF",
  "FF0000",
  "00FF00",
  "0000FF",
  "FFFF00",
  "FF00FF",
  "00FFFF",
  "000000",
  "FFFFFF",
  "FF0000",
  "00FF00",
  "0000FF",
  "FFFF00",
  "FF00FF",
  "00FFFF",
  "800000",
  "008000",
  "000080",
  "808000",
  "800080",
  "008080",
  "C0C0C0",
  "808080",
  "9999FF",
  "993366",
  "FFFFCC",
  "CCFFFF",
  "660066",
  "FF8080",
  "0066CC",
  "CCCCFF",
  "000080",
  "FF00FF",
  "FFFF00",
  "00FFFF",
  "800080",
  "800000",
  "008080",
  "0000FF",
  "00CCFF",
  "CCFFFF",
  "CCFFCC",
  "FFFF99",
  "99CCFF",
  "FF99CC",
  "CC99FF",
  "FFCC99",
  "3366FF",
  "33CCCC",
  "99CC00",
  "FFCC00",
  "FF9900",
  "FF6600",
  "666699",
  "969696",
  "003366",
  "339966",
  "003300",
  "333300",
  "993300",
  "993366",
  "333399",
  "333333",
  "b7e0ff",
  "00CCFF",
];

// 边框类型
const borders = ["left", "right", "top", "bottom"];
const RenderTable = ({ workbook = {}, ...props }) => {
  const [curSheetId, setCurSheetId] = useState(1);
  const [loading, setLoading] = useState(true);
  const workbookRef = useRef();
  const themeColors = useRef();

  const sheets = useMemo(() => {
    if (workbook?.worksheets) {
      return workbook.worksheets.filter((sheet) => sheet._rows.length);
    }
    return [];
  }, [workbook]);

  const ws = useMemo(() => {
    const { getWorksheet = {} } = workbook;
    if (getWorksheet && curSheetId !== -1) {
      const index = curSheetId || sheets[0].id;
      if (workbook?.getWorksheet) {
        return workbook?.getWorksheet(index);
      }
    }
    return null;
  }, [workbook, curSheetId]);

  const parseTheme = () => {
    const theme = workbook?._themes?.theme1;
    const parser = new DOMParser();
    if (theme) {
      const doc = parser.parseFromString(theme, "text/xml");
      const [{ children = [] } = {}] = doc.getElementsByTagName("a:clrScheme");
      themeColors.current = [...children]
        .flatMap((node) => [...node.getElementsByTagName("a:srgbClr")])
        .map((node) => node.getAttribute("val"))
        .filter((i) => i);
    }
  };

  const alignToClass = ({ horizontal, vertical }) => {
    return [horizontal, vertical]
      .filter((i) => i)
      .map((key) => `ht${key.charAt(0).toUpperCase()}${key.slice(1)}`)
      .join(" ");
  };

  const transferTime = (str) => {
    var date = new Date(str);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    var minute = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    let time = y + "-" + m + "-" + d;
    return time;
  };
  const renderDefault = () => {
    Handsontable.renderers.registerRenderer(
      "styleRender",
      (hotInstance, TD, row, col, prop, value, cell) => {
        Handsontable.renderers.getRenderer("text")(
          hotInstance,
          TD,
          row,
          col,
          prop,
          value,
          cell
        );
        const isTime = (value + "").indexOf("中国标准时间") > -1;
        if (isTime) {
          TD.innerText = transferTime(value);
        }
        if (ws && cell.style) {
          const {
            style: { alignment: { wrapText } = {}, border, fill, font },
          } = cell;
          const style = TD.style;
          if (font) {
            if (font.bold) style.fontWeight = "bold";
            if (font.size) style.fontSize = `${font.size}px`;
          }
          if (fill) {
            if (fill.bgColor) {
              const { argb, indexed } = fill.bgColor;
              style.backgroundColor = `#${argb || indexedColors[indexed]}`;
            }
            if (fill.fgColor) {
              const { theme, indexed } = fill.fgColor;
              if (theme && themeColors.current) {
                const color = themeColors.current[theme + 1];
                if (color) {
                  style.color = `#${color}`;
                }
              }
              if (indexed) {
                style.color = `#${indexedColors[indexed]}`;
              }
            }
          }
          if (border) {
            borders
              .map((key) => ({ key, value: border[key] }))
              .filter((v) => v.value)
              .forEach((v) => {
                const {
                  key,
                  value: { style: borderStyle },
                } = v;
                const prefix = `border${captain(key)}`;
                if (borderStyle === "thin") {
                  style[`${prefix}Width`] = "1px";
                } else {
                  style[`${prefix}Width`] = "2px";
                }
                style[`${prefix}Style`] = "solid";
                style[`${prefix}Color`] = "#000";
              });
          }
        }
        // 启用了内联css，直接赋值
        if (cell.css) {
          const style = TD.style;
          const { css } = cell;
          Object.keys(css).forEach((key) => {
            const k = camelCase(key);
            style[k] = css[key];
          });
        }
      }
    );
  };

  const merge = useMemo(() => {
    if (ws) {
      const { _merges = {} } = ws;
      return Object.values(_merges).map(({ left, top, right, bottom }) => {
        // 构建区域
        return {
          row: top - 1,
          col: left - 1,
          rowspan: bottom - top + 1,
          colspan: right - left + 1,
        };
      });
    }
  }, [ws]);

  const cols = useMemo(() => {
    return ws?.columns?.map((item) => item.letter);
  }, [ws]);
  const data = useMemo(() => {
    if (ws && cols) {
      const tdata = fixMatrix(
        getWorksheetRows(ws).map((row) =>
          (row?._cells.map((item) => {
            const value = item.model.value;
            if (value) {
              if (value.richText) {
                if (Array.isArray(value.richText)) {
                  return value.richText.map((x) => x.text).join("");
                } else {
                  return value.richText.text;
                }
              }
              return value;
            }
            return "";
          }) || [])
        ),
        cols?.length
      );
      return tdata;
    }
    return [];
  }, [ws, cols]);
  const columns = useMemo(() => {
    return ws?.columns?.map((item) => ({
      ...(item.width
        ? { width: item.width * 6 < 100 ? 100 : item.width * 6 }
        : { width: 100 }),
      className: alignToClass(item.alignment || {}),
      renderer: "styleRender",
    }));
  }, [ws]);
  const cell = useMemo(() => {
    if (ws) {
      return getWorksheetRows(ws).flatMap((row, ri) => {
        return (row?._cells
          ?.map((cell, ci) => {
            if (cell.style) {
              return {
                row: ri,
                col: ci,
                ...(cell.alignment
                  ? { className: alignToClass(cell.alignment) }
                  : {}),
                style: cell.style,
              };
            }
          })
          .filter((i) => i)) || [];
      });
    }
    return [];
  }, [ws]);
  const border = useMemo(() => {
    if (ws) {
      return getWorksheetRows(ws).flatMap((row, ri) => {
        return (row?._cells
          ?.map((cell, ci) => {
            if (cell.style && cell.style.border) {
              const border = cell.style.border;
              const keys = Object.keys(border);
              if (keys.length) {
                return {
                  row: ri,
                  col: ci,
                  ...keys.reduce((result, key) => {
                    result[key] = {
                      width: 1,
                      color: `#${
                        (border.color && indexedColors[border.color.indexed]) ||
                        border.argb ||
                        "000000"
                      }`,
                    };
                    return result;
                  }, {}),
                };
              }
            }
          })
          .filter((i) => i)) || [];
      });
    }
    return [];
  }, [ws]);
  const updateTable = () => {
    workbookRef.current.updateSettings({
      mergeCells: merge,
      data: data,
      colHeaders: cols,
      columns: columns,
      cell: cell,
      autoColumnSize: true,
      stretchH: "all",
      // customBorders: this.border,
    });
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };
  useEffect(() => {
    const dom = document.getElementById("xlsx-handsontable");
    const setting = {
      outsideClickDeselects: false,
      // 表格总宽度 默认undefined
      width: "100%",
      // 表格总高度 默认undefined
      height: "calc(100vh - 112px)",
      // 水平垂直居中
      className: "htCenter htMiddle",
      // 当值为true且列宽未设置时，自适应列大小
      autoColumnSize: true,
      // 列标题高度
      columnHeaderHeight: 24,
      // 是否允许列表行排序
      columnSorting: false,
      // 是否可以多列排序
      multiColumnSorting: false,
      // 列表头字段
      colHeaders: null,
      // 是否展示行表头
      rowHeaders: true,
      // 行表头宽度
      rowHeaderWidth: 30,
      // 行高
      rowHeights: 30,
      // 列宽--可以数字 100、字符串'100px'、数组[10,20,30]或者函数 (index)=>{return index*10}
      colWidths: 150,
      // 行拖动
      manualRowMove: false,
      // 列拖动
      manualColumnMove: false,
      // 手动调整行大小
      manualRowResize: false,
      // 手动调整列大小
      manualColumnResize: false,
      // 是否开启固定列
      manualColumnFreeze: true,
      // 列对应属性
      columns: undefined,
      // 只读属性，不可编辑
      readOnly: true,
      copyable: true,
      // 可粘贴 ctrl+ V
      copyPaste: true,
      // 禁用或启用拖动滚动功能
      dragToScroll: true,
      // 允许将可配置的下拉菜单添加到表的列标题中
      dropdownMenu: false,
      // 过滤
      filters: true,
      // 表格左侧指定固定（或冻结）列的数量
      fixedColumnsLeft: 0,
      // 表格底部指定固定（或冻结）行的数量
      fixedRowsBottom: 0,
      // 表格顶部指定固定（或冻结）行的数量
      fixedRowsTop: 0,
      // 合并单元格
      mergeCells: true,
      // 表宽度不同于所有列宽度的计算得出的总和时列的反应 'none' |'last'|'all'
      stretchH: "none",
      // 对单元值进行预定义的计算
      columnSummary: undefined,
      // 最少空列
      minSpareCols: 0,
      // 最少空行
      minSpareRows: 0,
      // 禁用公式计算
      formulas: false,
      viewportColumnRenderingOffset: 50,
      viewportRowRenderingOffset: 50,
      // 渲染全部行
      renderAllRows: true,
      language: "zh-CN",
      licenseKey: "non-commercial-and-evaluation",
    };
    if (dom && ws) {
      workbookRef.current = new Handsontable(dom, setting);
      parseTheme();
      renderDefault();
      updateTable();
    }
  }, [ws, data]);

  const handleTabSheet = (id) => {
    if (id === curSheetId) return;
    setLoading(true);
    setCurSheetId(-1);
    setTimeout(() => {
      setCurSheetId(id);
      updateTable();
    }, 0);
  };

  renderDefault();
  return (
    <div className="xlsx-viewer">
      {ws && data?.length > 0 && (
        <div
          style={{ display: loading ? "none" : "block" }}
          id="xlsx-handsontable"
        />
      )}
      {loading && <Loading />}
      <div className="xlsx-bottom-btns">
        {!loading &&
          sheets?.map((x, i) => (
            <button
              className="xlsx-btn"
              key={String(i) + "xlsxbtn"}
              onClick={() => {
                handleTabSheet(x?.id);
              }}
              style={
                curSheetId === x?.id
                  ? {
                      color: "#fff",
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }
                  : {}
              }
            >
              {x?.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export const XlsxViewer = (props) => {
  const [workbook, setWorkbook] = useState({});
  useEffect(() => {
    if (props?.filePath) {
      new ExcelJS.Workbook().xlsx.load(props?.filePath).then((workbook) => {
        setWorkbook(workbook);
      });
    }
  }, [props?.filePath]);

  return (
    <div className="xlsx-viewer-wrapper">
      <RenderTable workbook={workbook} />
    </div>
  );
};
