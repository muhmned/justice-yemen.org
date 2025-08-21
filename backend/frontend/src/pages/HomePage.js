import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSiteSettings } from '../hooks/useSiteSettings';
import Carousel from '../components/Carousel';
import './HomePage.css';

const HomePage = () => {
  const [homeInfo, setHomeInfo] = useState({ title: '', content: '', image: '' });
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestReports, setLatestReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [stats, setStats] = useState({
    articles: 0,
    reports: 0,
    sections: 0,
    years: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchHome = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/basic-info/home`);
      const data = await res.json();
      setHomeInfo({
        title: data.title || '',
        content: data.content || '',
        image: data.image || ''
      });
    } catch (error) {
      console.error('خطأ في جلب بيانات الصفحة الرئيسية:', error);
      setHomeInfo({
        title: '',
        content: '',
        image: ''
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news`);
      const data = await res.json();
      const publishedNews = Array.isArray(data) ? data.filter(news => news.status === 'published') : [];
      setFeaturedNews(publishedNews.slice(0, 6));
    } catch (error) {
      console.error('خطأ في جلب الأخبار:', error);
      setFeaturedNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchLatestReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/reports`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLatestReports(data.slice(0, 3));
      } else {
        setLatestReports([]);
      }
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      setLatestReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [newsRes, reportsRes, sectionsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || ''}/api/news`),
        fetch(`${process.env.REACT_APP_API_URL || ''}/api/reports`),
        fetch(`${process.env.REACT_APP_API_URL || ''}/api/sections`)
      ]);

      const [newsData, reportsData, sectionsData] = await Promise.all([
        newsRes.json(),
        reportsRes.json(),
        sectionsRes.json()
      ]);

      setStats({
        articles: Array.isArray(newsData) ? newsData.filter(n => n.status === 'published').length : 0,
        reports: Array.isArray(reportsData) ? reportsData.length : 0,
        sections: Array.isArray(sectionsData) ? sectionsData.length : 0,
        years: 5 // سنوات الخبرة
      });
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  }, []);

  useEffect(() => {
    fetchHome();
    fetchLatestNews();
    fetchLatestReports();
    fetchStats();
  }, [fetchHome, fetchLatestNews, fetchLatestReports, fetchStats]);

  
  const handleDownload = async (report, e) => {
    e.preventDefault();
    e.stopPropagation();
    
   try {
  const pdfUrl = report.pdfUrl.startsWith('http')
    ? report.pdfUrl
    : `${process.env.REACT_APP_API_URL || ''}${report.pdfUrl}`;

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

  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // البحث في الأخبار والتقارير
      const [newsRes, reportsRes] = await Promise.all([
        fetch(`/api/news/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/reports/search?q=${encodeURIComponent(query)}`)
      ]);

      const [newsData, reportsData] = await Promise.all([
        newsRes.json(),
        reportsRes.json()
      ]);

      const combinedResults = [
        ...(newsData.news || []).map(item => ({ ...item, type: 'news' })),
        ...(Array.isArray(reportsData) ? reportsData : []).map(item => ({ ...item, type: 'report' }))
      ];

      setSearchResults(combinedResults);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const { facebookUrl, twitterUrl, instagramUrl, youtubeUrl } = useSiteSettings();

  return (
    <>
      <Helmet>
        <title>الصفحة الرئيسية | منظمة جاستيس للحقوق والتنمية</title>
        <meta name="description" content="منظمة جاستيس للحقوق والتنمية - نعمل من أجل حقوق الإنسان والتنمية المستدامة" />
      </Helmet>
      
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                منظمة جاستيس
                <span className="hero-subtitle">للحقوق والتنمية</span>
              </h1>
              <p className="hero-description">
                نعمل من أجل حقوق الإنسان والتنمية المستدامة في المجتمع
              </p>
              <div className="hero-buttons">
                <Link to="/about-us" className="btn btn-primary">تعرف علينا</Link>
                <Link to="/reports" className="btn btn-secondary">تقاريرنا</Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.sections}</span>
                  <span className="stat-label">الاقسام</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.reports}</span>
                  <span className="stat-label">تقرير</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.articles}</span>
                  <span className="stat-label">خبر منشور</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <div className="container">
            <div className="search-content">
              <h2 className="search-title">البحث في المحتوى</h2>
              <p className="search-subtitle">ابحث في الأخبار والتقارير والدراسات</p>
              
              <div className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="اكتب كلمة البحث هنا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
              
                    className="search-input"
                  />
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={searchLoading}
                    className="search-button"
                  >
                    {searchLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-search"></i>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3 className="results-title">نتائج البحث ({searchResults.length})</h3>
                  <div className="results-grid">
                    {searchResults.map((item, index) => (
                      <div key={index} className="result-card">
                        <div className="result-icon">
                          <i className={`fas ${item.type === 'news' ? 'fa-newspaper' : 'fa-chart-bar'}`}></i>
                        </div>
                        <div className="result-content">
                          <h4 className="result-title">{item.title}</h4>
                          <p className="result-excerpt">{item.excerpt || item.summary}</p>
                          <div className="result-meta">
                            <span className="result-type">
                              {item.type === 'news' ? 'خبر' : 'تقرير'}
                            </span>
                            {(item.publishDate || item.createdAt) && (
                              <span className="result-date">
                                {new Date(item.publishDate || item.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>
                          <Link 
                            to={item.type === 'news' ? `/news/${item.id}` : `/reports/${item.id}`}
                            className="result-link"
                          >
                            عرض التفاصيل
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="carousel-section">
          <Carousel />
        </section>

    

        {/* Featured News Section */}
        <section className="news-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">أحدث الأخبار</h2>
              <p className="section-subtitle">تابع آخر المستجدات والتطورات في مجال حقوق الإنسان</p>
            </div>
            
            {newsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل الأخبار...</p>
              </div>
            ) : featuredNews.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-newspaper"></i>
                <h3>لا توجد أخبار منشورة حالياً</h3>
                <p>سنقوم بإضافة محتوى جديد قريباً</p>
              </div>
            ) : (
              <div className="news-grid">
                {featuredNews.map(news => (
                  <div key={news.id} className="news-card">
                    <div className="news-image">
                      <img 
                        src={news.image ? (news.image.startsWith('http') ? news.image : news.image) : 'https://via.placeholder.com/400x250/007bff/ffffff?text=لا+توجد+صورة'} 
                        alt={news.title} 
                      />
                      <div className="news-overlay">
                        <Link to={`/news/${news.id}`} className="read-more-btn">
                          <i className="fas fa-arrow-left"></i>
                        </Link>
                      </div>
                    </div>
                    <div className="news-content">
                      <div className="news-meta">
                        <span className="news-date">
                          <i className="far fa-calendar-alt"></i>
                          {news.publishDate ? new Date(news.publishDate).toLocaleDateString('ar-SA') : ''}
                        </span>
                        <span className="news-category">
                          <i className="fas fa-tag"></i>
                          {news.category || 'عام'}
                        </span>
                      </div>
                      <Link to={`/news/${news.id}`} className="news-title">
                        <h3>{news.title}</h3>
                      </Link>
                      <p className="news-summary">
                        {news.summary || (news.content ? news.content.slice(0, 120) + '...' : '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="section-footer">
              <Link to="/news" className="btn btn-outline">
                <span>عرض جميع الأخبار</span>
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section className="reports-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">أحدث التقارير</h2>
              <p className="section-subtitle">تقارير ودراسات مفصلة حول حقوق الإنسان والتنمية</p>
            </div>
            
            {reportsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل التقارير...</p>
              </div>
            ) : latestReports.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-file-alt"></i>
                <h3>لا توجد تقارير منشورة حالياً</h3>
                <p>سنقوم بإضافة تقارير جديدة قريباً</p>
              </div>
            ) : (
              <div className="reports-grid">
                {latestReports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-image">
                      <img
                        src={report.thumbnail ? (report.thumbnail.startsWith('http') ? report.thumbnail : report.thumbnail) : 'https://via.placeholder.com/400x250/28a745/ffffff?text=لا+توجد+صورة'} 
                        alt={report.title || 'Report'}
                      />
                      <div className="report-overlay">
                        <a onClick={(e) => handleDownload(report, e)} target="_blank" rel="noopener noreferrer" className="download-btn">
                          <i className="fas fa-download"></i>
                        </a>
                      </div>
                    </div>
                    <div className="report-content">
                      <div className="report-meta">
                        <span className="report-date">
                          <i className="far fa-calendar-alt"></i>
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ar-SA') : ''}
                        </span>
                        <span className="report-type">
                          <i className="fas fa-file-pdf"></i>
                          PDF
                        </span>
                      </div>
                      <h3 className="report-title">{report.title || 'تقرير غير معنون'}</h3>
                      <p className="report-summary">{report.summary || ''}</p>
                      <div className="report-actions">
                        <a onClick={(e) => handleDownload(report, e)}    target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                          <i className="fas fa-download"  ></i>
                          تحميل التقرير
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="section-footer">
              <Link to="/reports" className="btn btn-outline">
                <span>عرض جميع التقارير</span>
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="quick-links-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">روابط سريعة</h2>
              <p className="section-subtitle">استكشف محتوى الموقع بسهولة</p>
            </div>
            
            <div className="quick-links-grid">
              <div className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-sitemap"></i>
                </div>
                <div className="quick-link-content">
                  <h3>أقسام المحتوى</h3>
                  <p>استعرض جميع أقسام المحتوى وتعرف على مجالات عملنا المختلفة</p>
                  <Link to="/sections" className="quick-link-btn">
                    <span>استعراض الأقسام</span>
                    <i className="fas fa-arrow-left"></i>
                  </Link>
                </div>
              </div>
              
              <div className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="quick-link-content">
                  <h3>التقارير والدراسات</h3>
                  <p>اطلع على أحدث التقارير والدراسات التي تصدرها المنظمة</p>
                  <Link to="/reports" className="quick-link-btn">
                    <span>المزيد</span>
                    <i className="fas fa-arrow-left"></i>
                  </Link>
                </div>
              </div>
              
              <div className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="quick-link-content">
                  <h3>من نحن</h3>
                  <p>تعرف على رؤيتنا ورسالتنا وأهدافنا في منظمة جاستيس</p>
                  <Link to="/about-us" className="quick-link-btn">
                    <span>المزيد</span>
                    <i className="fas fa-arrow-left"></i>
                  </Link>
                </div>
              </div>
              
              <div className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="quick-link-content">
                  <h3>اتصل بنا</h3>
                  <p>تواصل معنا لأي استفسارات أو اقتراحات</p>
                  <Link to="/contact-us" className="quick-link-btn">
                    <span>تواصل معنا</span>
                    <i className="fas fa-arrow-left"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

   
   

        {/* Call to Action Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">انضم إلينا في رحلة التغيير</h2>
              <p className="cta-description">
                ساعدنا في بناء مستقبل أفضل لحقوق الإنسان والتنمية المستدامة
              </p>
              <div className="cta-buttons">
                <Link to="/contact-us" className="btn btn-primary">تواصل معنا</Link>
                <Link to="/about-us" className="btn btn-outline">تعرف علينا أكثر</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
