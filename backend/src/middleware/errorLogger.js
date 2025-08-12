import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function errorLogger(err, req, res, next) {
  const log = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    error: err.message,
    stack: err.stack,
  };
  // سجل في ملف نصي
  fs.appendFileSync(
    path.join(__dirname, '../../error.log'),
    JSON.stringify(log) + '\n'
  );
  // سجل في الكونسول
  console.error('ServerError:', log);
  next(err);
}

export default errorLogger; 