import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { SearchOutlined, FilterOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import './NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news`);
        if (response.ok) {
          const data = await response.json();
          const publishedNews = Array.isArray(data) ? data.filter(item => item.status === 'published') : [];
          setNews(publishedNews);
          
          // استخراج الفئات الفريدة
          const uniqueCategories = [...new Set(publishedNews.map(item => item.category).filter(Boolean))];
          setCategories(uniqueCategories);
          
          setFilteredNews(publishedNews);
          setLoading(false);
        }
      } catch (error) {
        console.error('خطأ في جلب الأخبار:', error);
        setNews([]);
        setFilteredNews([]);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // تصفية الأخبار
  useEffect(() => {
    let filtered = news;

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredNews(filtered);
  }, [news, searchQuery, selectedCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>الأخبار | منظمة جاستيس للحقوق والتنمية</title>
        <meta name="description" content="أحدث الأخبار والتطورات في مجال حقوق الإنسان والتنمية" />
      </Helmet>
      
      <div className="news-page">
        {/* Hero Section */}
        <section className="news-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">الأخبار والتطورات</h1>
              <p className="hero-subtitle">
                تابع آخر المستجدات والتطورات في مجال حقوق الإنسان والتنمية
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{news.length}</span>
                  <span className="stat-label">خبر منشور</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{categories.length}</span>
                  <span className="stat-label">فئة</span>
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
                  placeholder="ابحث في الأخبار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="category-filter">
                <FilterOutlined className="filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="results-count">
                <span>تم العثور على {filteredNews.length} خبر</span>
              </div>
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="news-content">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل الأخبار...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <h3>لا توجد أخبار</h3>
                <p>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'جرب تغيير معايير البحث' 
                    : 'لا توجد أخبار منشورة حالياً'
                  }
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="news-grid">
                {filteredNews.map(item => (
                  <article key={item.id} className="news-card">
                    <div className="news-image">
                      <img 
                        src={item.image ? (item.image.startsWith('http') ? item.image : item.image) : 'https://via.placeholder.com/400x250/007bff/ffffff?text=لا+توجد+صورة'} 
                        alt={item.title} 
                      />
                      <div className="news-overlay">
                        <Link to={`/news/${item.id}`} className="read-more-btn">
                          <EyeOutlined />
                          <span>اقرأ المزيد</span>
                        </Link>
                      </div>
                      {item.category && (
                        <div className="news-category">
                          {item.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="news-content">
                      <div className="news-meta">
                        <span className="news-date">
                          <CalendarOutlined />
                          {formatDate(item.publishDate)}
                        </span>
                        {item.category && (
                          <span className="news-category-tag">
                            {item.category}
                          </span>
                        )}
                      </div>
                      
                      <Link to={`/news/${item.id}`} className="news-title">
                        <h3>{item.title}</h3>
                      </Link>
                      
                      <p className="news-summary">
                        {item.summary || (item.content ? item.content.slice(0, 150) + '...' : '')}
                      </p>
                      
                      <div className="news-footer">
                        <Link to={`/news/${item.id}`} className="read-more-link">
                          اقرأ المزيد
                          <span className="arrow">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-content">
              <div className="newsletter-text">
                <h3>اشترك في النشرة الإخبارية</h3>
                <p>احصل على آخر الأخبار والتحديثات مباشرة في بريدك الإلكتروني</p>
              </div>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default NewsPage;
