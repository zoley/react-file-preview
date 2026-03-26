import { FileViewer, readBuffer } from "./components";
// import {FileViewer,readBuffer} from "/lib/index";
// const {FileViewer,readBuffer}=await import("/lib/index")
import { Loading } from "./components/loading";
import { useState } from "react";
function App() {
  const [filePath, setFilePath] = useState("");
  const [fileType, setFileType] = useState("");
  function getExtend(name) {
    const dot = name.lastIndexOf(".");
    return name.substr(dot + 1);
  }
  // console.log(ABC)
  const handleChange = (e) => {
    console.log(e?.target?.files);
    const [file] = e?.target?.files;
    setFileType(getExtend(file?.name || ""));
    // setFilePath(window.URL.createObjectURL(file))
    setFilePath("");
    readBuffer(file).then((buffer) => {
      setTimeout(() => {
        setFilePath(buffer);
      }, 20);
    });
  };
  return (
    <div className="App" style={{ height: "90vh", overflow: "auto" }}>
      <h1>
        <input type="file" onChange={handleChange} />
      </h1>
      {filePath ? (
        <FileViewer fileType={fileType} filePath={filePath} hasControl />
      ) : (
        <>暂无数据</>
      )}
    </div>
  );
}

export default App;
