// نسخة احتياطية من كود Dashboard.js قبل التعديل
import React, { useState } from 'react';
import '../../pages/AdminPanel.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles] = useState([
    { id: 1, title: 'تقرير جديد حول انتهاكات حقوق الإنسان', status: 'published', date: '2024-01-15' },
    { id: 2, title: 'نداء عاجل لحماية المدنيين', status: 'draft', date: '2024-01-12' }
  ]);
  const reports = [
    { id: 1, title: 'تقرير سنوي 2023', status: 'published', date: '2024-01-01' },
    { id: 2, title: 'الحقوق الرقمية في عصر التكنولوجيا', status: 'published', date: '2023-12-20' }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>لوحة التحكم</h2>
          <p> جاستيس للحقوق والتنمية </p>
        </div>
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 لوحة المعلومات
          </button>
          <button 
            className={`nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📰 إدارة الأخبار
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 إدارة التقارير
          </button>
        </nav>
      </div>
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div>
            <h1>لوحة المعلومات</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>إجمالي الأخبار</h3>
                <p className="stat-number" style={{ color: '#3498db' }}>{articles.length}</p>
              </div>
              <div className="stat-card">
                <h3>الأخبار المنشورة</h3>
                <p className="stat-number" style={{ color: '#27ae60' }}>{articles.filter(a => a.status === 'published').length}</p>
              </div>
              <div className="stat-card">
                <h3>المسودات</h3>
                <p className="stat-number" style={{ color: '#e74c3c' }}>{articles.filter(a => a.status === 'draft').length}</p>
              </div>
              <div className="stat-card">
                <h3>إجمالي التقارير</h3>
                <p className="stat-number" style={{ color: '#9b59b6' }}>{reports.length}</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'articles' && (
          <div>
            <h1>إدارة الأخبار</h1>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id}>
                    <td>{article.title}</td>
                    <td>{article.date}</td>
                    <td>
                      <span className={`status ${article.status}`}>
                        {article.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small">تعديل</button>
                      <button className="btn-small btn-danger">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'reports' && (
          <div>
            <h1>إدارة التقارير</h1>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>عنوان التقرير</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.title}</td>
                    <td>{report.date}</td>
                    <td>
                      <span className={`status ${report.status}`}>
                        {report.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small">تعديل</button>
                      <button className="btn-small btn-danger">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 