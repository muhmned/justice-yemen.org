const express = require('express');
const router = express.Router();
const { 
  backupDatabase, 
  importDatabase, 
  getBackups, 
  deleteBackup, 
  importTestFile 
} = require('../controllers/backupController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/multer');

router.post('/backup', authenticateToken, backupDatabase);
router.post('/import', authenticateToken, upload.single('file'), importDatabase);
router.post('/import-test', authenticateToken, upload.single('file'), importTestFile);
router.get('/backups', authenticateToken, getBackups);
router.delete('/backups/:filename', authenticateToken, deleteBackup);

module.exports = router;
