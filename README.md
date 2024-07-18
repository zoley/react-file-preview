# File viewer for React 
Niubility！


## How to use
```js
import {FileViewer,readBuffer} from "@zoley/react-file-preview";

const filePath = await readBuffer(file)
const fileType = 'pdf'

<FileViewer
  fileType={fileType}
  filePath={filePath}
/>
```
### What file types are supported
```js
case 'pdf': 
case 'docx': 
case 'xlsx': 
case 'pptx': 
case "gif": 
case "jpg": 
case "jpeg":
case "bmp": 
case "tiff": 
case "tif":
case "png":
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
case "log": 
case 'mp4':
```


#### The following note is only for previewing special fonts in PDF
Note: Copy cmaps from the dependency package lib folder to the public folder of the project
