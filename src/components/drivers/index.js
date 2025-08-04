// 动态导入组件，实现按需加载
export const loadPDFViewer = () => import('./pdf').then(module => module.PDFViewer);
export const loadDocxViewer = () => import('./docx').then(module => module.DocxViewer);
export const loadXlsxViewer = () => import('./xlsx').then(module => module.XlsxViewer);
export const loadPPtxViewer = () => import('./pptx').then(module => module.PPtxViewer);
export const loadImgViewer = () => import('./image').then(module => module.ImgViewer);
export const loadTextViewer = () => import('./text').then(module => module.TextViewer);
export const loadVideoViewer = () => import('./video').then(module => module.VideoViewer);

// 保持静态导出用于向后兼容（可选）
export * from './image';
export * from './text';
export * from './video';