import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import {
  backupDatabase,
  importDatabase,
  getBackups,
  deleteBackup,
  importTestFile
} from '../controllers/backupController.js';

const router = express.Router();

router.post('/', authenticateToken, backupDatabase);
router.post('/import', authenticateToken, upload.single('file'), importDatabase);
router.post('/import-test', authenticateToken, upload.single('file'), importTestFile);
router.get('/', authenticateToken, getBackups);
router.delete('/:filename', authenticateToken, deleteBackup);

export default router;
