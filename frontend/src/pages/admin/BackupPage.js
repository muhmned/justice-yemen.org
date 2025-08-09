import React, { useState, useEffect } from 'react';
import './BackupPage.css';

const BackupPage = () => {
  const [backupType, setBackupType] = useState('full');
  const [importFile, setImportFile] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch('/api/backups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBackups(data.backups);
      } else {
        console.error('Error fetching backups:', data.error);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage('');
    setCurrentStep(1);
    setBackupProgress(0);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage('يرجى تسجيل الدخول مرة أخرى');
        setMessageType('error');
        return;
      }
      
      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      setCurrentStep(2);
      
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: backupType }),
      });
      
      clearInterval(progressInterval);
      setBackupProgress(100);
      setCurrentStep(3);
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        fetchBackups(); // تحديث القائمة
        setTimeout(() => {
          setCurrentStep(1);
          setBackupProgress(0);
        }, 2000);
      } else {
        setMessage(data.error || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
        setMessageType('error');
        setCurrentStep(1);
        setBackupProgress(0);
      }
    } catch (error) {
      console.error('Backup error:', error);
      setMessage('حدث خطأ في الاتصال بالخادم');
      setMessageType('error');
      setCurrentStep(1);
      setBackupProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setMessage('يرجى اختيار ملف للاستيراد');
      setMessageType('error');
      return;
    }

    if (!window.confirm('تحذير: سيتم استبدال البيانات الموجودة. هل أنت متأكد؟')) {
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage('يرجى تسجيل الدخول مرة أخرى');
        setMessageType('error');
        return;
      }
      
      console.log('Importing file:', importFile.name);
      console.log('File size:', importFile.size);
      console.log('File type:', importFile.type);
      
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      const data = await response.json();
      
      console.log('Import response status:', response.status);
      console.log('Import response data:', data);
      
      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setImportFile(null);
        // إعادة تحميل الصفحة بعد الاستيراد
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(data.error || 'حدث خطأ أثناء الاستيراد');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage('حدث خطأ في الاتصال بالخادم');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`هل أنت متأكد من حذف النسخة الاحتياطية "${filename}"؟`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage('يرجى تسجيل الدخول مرة أخرى');
        setMessageType('error');
        return;
      }
      
      const response = await fetch(`/api/backups/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        fetchBackups(); // تحديث القائمة
      } else {
        setMessage(data.error || 'حدث خطأ أثناء الحذف');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Delete backup error:', error);
      setMessage('حدث خطأ في الاتصال بالخادم');
      setMessageType('error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-SA');
  };

  const getBackupTypeInfo = (type) => {
    switch(type) {
      case 'full':
        return {
          title: 'نسخة كاملة',
          description: 'جميع البيانات في قاعدة البيانات',
          icon: '📦',
          details: ['المستخدمين', 'الأقسام', 'المقالات', 'الأخبار', 'التقارير', 'الإعدادات', 'سجل النشاطات']
        };
      case 'tables':
        return {
          title: 'الجداول الرئيسية',
          description: 'المحتوى الأساسي للنظام',
          icon: '📋',
          details: ['المستخدمين', 'الأقسام', 'المقالات', 'الأخبار', 'التقارير']
        };
      case 'sections':
        return {
          title: 'الأقسام والمقالات',
          description: 'محتوى سريع للأقسام والمقالات',
          icon: '📄',
          details: ['الأقسام', 'الفئات', 'المقالات']
        };
      default:
        return { title: '', description: '', icon: '', details: [] };
    }
  };

  return (
    <div className="backup-page">
      <div className="backup-header">
        <h1>🔄 إدارة النسخ الاحتياطية</h1>
        <p>إنشاء واستيراد وحذف النسخ الاحتياطية لقاعدة البيانات</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="backup-sections">
        {/* قسم إنشاء النسخ الاحتياطية */}
        <div className="backup-section">
          <h2>📤 إنشاء نسخة احتياطية</h2>
          
          {/* خطوات العملية */}
          <div className="backup-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-text">اختيار النوع</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-text">جاري الإنشاء</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-text">اكتمل</div>
            </div>
          </div>

          {/* شريط التقدم */}
          {currentStep > 1 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${backupProgress}%` }}></div>
              <span className="progress-text">{backupProgress}%</span>
            </div>
          )}

          <div className="backup-form">
            <div className="form-group">
              <label>نوع النسخة الاحتياطية:</label>
              <div className="radio-group">
                {['full', 'tables', 'sections'].map(type => {
                  const info = getBackupTypeInfo(type);
                  return (
                    <label key={type} className={`radio-label ${backupType === type ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        value={type}
                        checked={backupType === type}
                        onChange={() => setBackupType(type)}
                      />
                      <div className="radio-content">
                        <div className="radio-icon">{info.icon}</div>
                        <div className="radio-text">
                          <div className="radio-title">{info.title}</div>
                          <div className="radio-description">{info.description}</div>
                          <div className="radio-details">
                            {info.details.map((detail, index) => (
                              <span key={index} className="detail-tag">{detail}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={handleBackup} 
              disabled={loading}
              className="btn btn-primary btn-large"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  جاري إنشاء النسخة الاحتياطية...
                </>
              ) : (
                <>
                  <span className="btn-icon">📤</span>
                  إنشاء نسخة احتياطية
                </>
              )}
            </button>
          </div>
        </div>

        {/* قسم استيراد النسخ الاحتياطية */}
        <div className="backup-section">
          <h2>📥 استيراد نسخة احتياطية</h2>
          <div className="import-form">
            <div className="form-group">
              <label>اختر ملف النسخة الاحتياطية:</label>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <span className="file-icon">📁</span>
                  <span className="file-text">
                    {importFile ? importFile.name : 'اختر ملف JSON'}
                  </span>
                </label>
              </div>
            </div>
            <button 
              onClick={handleImport} 
              disabled={loading || !importFile}
              className="btn btn-warning btn-large"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <span className="btn-icon">📥</span>
                  استيراد النسخة الاحتياطية
                </>
              )}
            </button>
            <div className="import-warning">
              <strong>⚠️ تحذير:</strong> سيتم استبدال البيانات الموجودة بالبيانات المستوردة
            </div>
          </div>
        </div>

        {/* قسم قائمة النسخ الاحتياطية */}
        <div className="backup-section">
          <h2>📋 النسخ الاحتياطية المتاحة</h2>
          <div className="backups-list">
            {backups.length === 0 ? (
              <div className="no-backups">
                <div className="no-backups-icon">📭</div>
                <p>لا توجد نسخ احتياطية متاحة</p>
                <p className="no-backups-hint">قم بإنشاء نسخة احتياطية أولاً</p>
              </div>
            ) : (
              <div className="backups-grid">
                {backups.map((backup, index) => (
                  <div key={index} className="backup-card">
                    <div className="backup-info">
                      <div className="backup-header-card">
                        <h3>{backup.filename}</h3>
                        <span className={`backup-type-badge ${backup.type}`}>
                          {getBackupTypeInfo(backup.type).title}
                        </span>
                      </div>
                      <div className="backup-details">
                        <div className="detail-item">
                          <span className="detail-label">📏 الحجم:</span>
                          <span className="detail-value">{formatFileSize(backup.size)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📅 التاريخ:</span>
                          <span className="detail-value">{formatDate(backup.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">🔢 الإصدار:</span>
                          <span className="detail-value">{backup.version}</span>
                        </div>
                      </div>
                    </div>
                    <div className="backup-actions">
                      <button 
                        onClick={() => handleDeleteBackup(backup.filename)}
                        className="btn btn-danger btn-sm"
                      >
                        <span className="btn-icon">🗑️</span>
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
