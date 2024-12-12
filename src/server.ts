import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Worker } from 'worker_threads';

const app = express();
const port = 4000;

app.use(express.json());

// Express 路由

// 中介軟體設置，使用 JSON 格式
app.use(express.json());

// 函數來創建 Worker 並處理運算
function runWorker(operation: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./worker.ts');
  
      worker.postMessage({ operation, params });
  
      worker.on('message', (message) => {
        if (message.error) {
          reject(message.error);
        } else {
          resolve(message.result);
        }
      });
  
      worker.on('error', (error) => {
        reject(error);
      });
  
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
  
  // API 1: 登入
  app.post('/login', async (req: Request, res: Response) => {
    const { Uid, GameID, Time, Token } = req.body;
  
    if (typeof Uid !== 'string' || typeof GameID !== 'string' || typeof Time !== 'string' || typeof Token !== 'string') {
      res.status(400).send('Must be string');
    }
  
    try {
      const result = await runWorker('login',[Uid,GameID,Time,Token]);
      res.json({ result });
    } catch (error) {
      res.status(500).send(error);

      if (isError(error)) {
        res.status(500).send(error.message);
      } else {
        console.error('發生了未知的錯誤');
      }
    }
  });
  
  // API 2: 大廳
  app.post('/Hall', async (req: Request, res: Response) => {
    const { Uid, GameID, Time, Token } = req.body;
  
    if (typeof Uid !== 'string' || typeof GameID !== 'string' || typeof Time !== 'string' || typeof Token !== 'string') {
      res.status(400).send('Must be string');
    }
  
    try {
      const result = await runWorker('Hall', [Uid,GameID,Time,Token]);
      res.json({ result });
    } catch (error) {
      res.status(500).send(error);

      if (isError(error)) {
        res.status(500).send(error.message);
      } else {
        console.error('發生了未知的錯誤');
      }
    }
  });
  
  // API 3: Jackpot
  app.post('/Jackpot', async (req: Request, res: Response) => {
    const { Uid, GameID, Time, Hall, Token } = req.body;
  
    if (typeof Uid !== 'string' || typeof GameID !== 'string' || typeof Hall !== 'string' || typeof Time !== 'string' || typeof Token !== 'string') {
      res.status(400).send('must be numbers');
    }
  
    try {
      const result = await runWorker('Jackpot', [Uid,GameID,Hall,Time,Token]);
      res.json({ result });
    } catch (error) {
      res.status(500).send(error);

      if (isError(error)) {
        res.status(500).send(error.message);
      } else {
        console.error('發生了未知的錯誤');
      }
    }
  });
  
  // API 4: Level
  app.post('/Level', async (req: Request, res: Response) => {
    const { a, b } = req.body;
  
    if (typeof a !== 'number' || typeof b !== 'number') {
      res.status(400).send('Both a and b must be numbers');
    }
  
    try {
      const result = await runWorker('Level', [a,b]);
      res.json({ result });
    } catch (error: unknown) {
      //res.status(500).send(error.toString());
      res.status(500).send(error);
      if (isError(error)) {
        res.status(500).send(error.message);
      } else {
        console.error('發生了未知的錯誤');
      }
    }
  });



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
  

  
  // 啟動 HTTP 伺服器
  app.listen(port, () => {
    console.log(`HTTP and WebSocket server running on http://localhost:${port}`);
  });

  function isError(error: unknown): error is Error {
    return error instanceof Error;
  }
