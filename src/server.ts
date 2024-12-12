
import express, { Request, Response } from 'express';

// 初始化 Express 應用程式
const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體設置，使用 JSON 格式
app.use(express.json());

// 簡單的路由
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, high concurrency API!');
});

// 高併發測試的示範端點
app.get('/compute', (req: Request, res: Response) => {
  const start = Date.now();
  
  // 模擬一個計算密集的任務
  while (Date.now() - start < 1000) {} // 停滯1秒

  res.send('Computation finished');
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
