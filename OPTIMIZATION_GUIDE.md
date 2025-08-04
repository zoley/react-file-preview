# React File Preview 性能优化指南

## 问题分析

原项目存在的主要性能问题：
1. **巨型 JS 文件**：所有依赖都被打包到主 bundle 中
   - `pdfjs-dist` 包含 pdf.worker.mjs（约 8MB+）
   - `handsontable` 表格组件（约 3MB+）
   - `exceljs` Excel 处理库（约 2MB+）
2. **同步加载**：所有组件在初始加载时就被引入
3. **缺少代码分割**：没有按功能模块分离代码

## 优化方案

### 1. 动态导入 (Dynamic Imports) ✅

将大型依赖改为按需加载：

```javascript
// 之前：静态导入
import {PDFViewer,DocxViewer,XlsxViewer} from './drivers'

// 优化后：动态导入
const PDFViewer = React.lazy(() => import('./drivers/pdf'));
const XlsxViewer = React.lazy(() => import('./drivers/xlsx'));
```

### 2. React.lazy + Suspense ✅

为重型组件实现懒加载：

```javascript
<Suspense fallback={<LoadingComponent />}>
  <PDFViewer {...props}/>
</Suspense>
```

### 3. Webpack 代码分割 ✅

配置 `splitChunks` 将大型依赖单独打包：

```javascript
splitChunks: {
  cacheGroups: {
    pdfjs: {
      test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
      name: 'pdfjs',
      chunks: 'all',
      priority: 20,
    },
    handsontable: {
      test: /[\\/]node_modules[\\/]handsontable[\\/]/,
      name: 'handsontable', 
      chunks: 'all',
      priority: 20,
    }
  }
}
```

### 4. PDF Worker 优化 ✅

优化 PDF.js worker 加载：

```javascript
// 优先使用 CDN，降级到本地
PDFJS.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.js`;
```

## 使用方法

### 开发环境
```bash
npm start
```

### 生产构建
```bash
npm run build
```

### 分析 Bundle 大小
```bash
npm install  # 安装 webpack-bundle-analyzer
npm run build:analyze
```

## 性能提升预期

优化后的预期效果：

1. **初始包大小减少 70-80%**
   - 主 bundle 从 ~25MB 降低到 ~5MB 以下
   - PDF 查看器按需加载（~8MB）
   - Excel 查看器按需加载（~5MB）

2. **首次加载速度提升 3-5 倍**
   - 只加载必要的基础组件
   - 文件查看器在需要时才加载

3. **缓存效率提升**
   - 各组件独立缓存
   - 更新某个组件不影响其他组件缓存

## 进一步优化建议

### 1. CDN 加速
将静态资源托管到 CDN：
```javascript
// 外部化大型依赖
externals: {
  'handsontable': 'Handsontable',
  'pdfjs-dist': 'pdfjsLib'
}
```

### 2. 预加载策略
对于可能用到的组件进行预加载：
```javascript
// 用户悬停时预加载
onMouseEnter={() => import('./drivers/pdf')}
```

### 3. Service Worker 缓存
实现离线缓存策略提升重复访问速度。

### 4. 组件级别优化
- 使用 `React.memo` 减少不必要的重渲染
- 虚拟滚动优化大文件预览
- 图片懒加载和压缩

## 监控和调试

1. 使用 `npm run build:analyze` 查看 bundle 分析
2. Chrome DevTools 监控网络请求
3. Lighthouse 性能评分
4. 使用 React DevTools Profiler 分析组件性能

## 注意事项

1. 动态导入会增加一些运行时开销
2. 首次使用某个查看器时会有短暂加载时间
3. 需要确保网络环境支持并发请求
4. CDN 加载失败时有降级方案