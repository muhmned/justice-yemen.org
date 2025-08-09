import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, CalendarOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import './ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [filteredReports, setFilteredReports] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(data => {
        const reportsData = data.reports || data;
        setReports(reportsData);
        
        // استخراج السنوات الفريدة
        const uniqueYears = [...new Set(reportsData.map(report => {
          const year = new Date(report.publishDate).getFullYear();
          return year;
        }).filter(Boolean))].sort((a, b) => b - a);
        
        setYears(uniqueYears);
        setFilteredReports(reportsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('خطأ في جلب التقارير:', error);
        setReports([]);
        setFilteredReports([]);
        setLoading(false);
      });
  }, []);

  // تصفية التقارير
  useEffect(() => {
    let filtered = reports;

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تصفية حسب السنة
    if (selectedYear !== 'all') {
      filtered = filtered.filter(report => {
        const year = new Date(report.publishDate).getFullYear();
        return year === parseInt(selectedYear);
      });
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, selectedYear]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async (report, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const pdfUrl = report.pdfUrl.startsWith('http')
        ? report.pdfUrl
        : `http://localhost:5000${report.pdfUrl}`;

      const response = await fetch(pdfUrl, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`فشل التحميل. كود الاستجابة: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.pdfUrl.split('/').pop() || `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("حدث خطأ أثناء تحميل الملف:", err);
      alert('حدث خطأ أثناء تحميل الملف: ' + err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>التقارير والدراسات | منظمة جاستيس للحقوق والتنمية</title>
        <meta name="description" content="تقارير ودراسات مفصلة حول حقوق الإنسان والتنمية" />
      </Helmet>
      
      <div className="reports-page">
        {/* Hero Section */}
        <section className="reports-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">التقارير والدراسات</h1>
              <p className="hero-subtitle">
                تقارير ودراسات مفصلة حول حقوق الإنسان والتنمية المستدامة
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{reports.length}</span>
                  <span className="stat-label">تقرير منشور</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{years.length}</span>
                  <span className="stat-label">سنة</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">PDF</span>
                  <span className="stat-label">صيغة الملفات</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="container">
            <div className="filters-content">
              {/* Search */}
              <div className="search-box">
                <SearchOutlined className="search-icon" />
                <input
                  type="text"
                  placeholder="ابحث في التقارير..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Year Filter */}
              <div className="year-filter">
                <FilterOutlined className="filter-icon" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="all">جميع السنوات</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="results-count">
                <span>تم العثور على {filteredReports.length} تقرير</span>
              </div>
            </div>
          </div>
        </section>

        {/* Reports Grid */}
        <section className="reports-content">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل التقارير...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>لا توجد تقارير</h3>
                <p>
                  {searchQuery || selectedYear !== 'all' 
                    ? 'جرب تغيير معايير البحث' 
                    : 'لا توجد تقارير منشورة حالياً'
                  }
                </p>
                {(searchQuery || selectedYear !== 'all') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedYear('all');
                    }}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map(report => (
                  <article key={report.id} className="report-card">
                    <div className="report-image">
                      <img 
                        src={report.thumbnail ? (report.thumbnail.startsWith('http') ? report.thumbnail : `http://localhost:5000${report.thumbnail}`) : 'https://via.placeholder.com/400x250/28a745/ffffff?text=لا+توجد+صورة'} 
                        alt={report.title} 
                      />
                      <div className="report-overlay">
                        <div className="overlay-actions">
                          <Link to={`/reports/${report.id}`} className="view-btn">
                            <EyeOutlined />
                            <span>عرض</span>
                          </Link>
                          <button 
                            className="download-btn"
                            onClick={(e) => handleDownload(report, e)}
                          >
                            <DownloadOutlined />
                            <span>تحميل</span>
                          </button>
                        </div>
                      </div>
                      <div className="report-type">
                        <FileTextOutlined />
                        PDF
                      </div>
                    </div>
                    
                    <div className="report-content">
                      <div className="report-meta">
                        <span className="report-date">
                          <CalendarOutlined />
                          {formatDate(report.publishDate)}
                        </span>
                        <span className="report-year">
                          {new Date(report.publishDate).getFullYear()}
                        </span>
                      </div>
                      
                      <Link to={`/reports/${report.id}`} className="report-title">
                        <h3>{report.title}</h3>
                      </Link>
                      
                      <p className="report-summary">
                        {report.summary || 'لا يوجد ملخص متاح لهذا التقرير'}
                      </p>
                      
                      <div className="report-footer">
                        <Link to={`/reports/${report.id}`} className="view-link">
                          عرض التقرير
                          <span className="arrow">→</span>
                        </Link>
                        <button 
                          className="download-link"
                          onClick={(e) => handleDownload(report, e)}
                        >
                          <DownloadOutlined />
                          تحميل PDF
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <div className="cta-text">
                <h3>هل تبحث عن تقرير معين؟</h3>
                <p>تواصل معنا للحصول على تقارير محددة أو لطلب تقارير مخصصة</p>
              </div>
              <div className="cta-actions">
                <Link to="/contact-us" className="cta-btn primary">
                  تواصل معنا
                </Link>
                <Link to="/about-us" className="cta-btn secondary">
                  تعرف علينا
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReportsPage; 