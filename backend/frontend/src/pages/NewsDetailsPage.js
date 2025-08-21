import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const NewsDetailsPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        }
      } catch (error) {
        console.error('خطأ في جلب تفاصيل الخبر:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) return <div>جاري التحميل...</div>;
  if (!news) return <div>لم يتم العثور على الخبر</div>;

  return (
    <div
      className="news-details"
      style={{
        maxWidth: 800,
        margin: '40px auto',
        background: '#fff',
        padding: 0,
        borderRadius: 16,
        boxShadow: '0 4px 24px #e0e0e0',
        overflow: 'hidden'
      }}
    >
      {/* الصورة الرئيسية */}
      {news.image && (
        <div
          style={{
            width: '100%',
            height: 340,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={
              news.image.startsWith('http')
                ? news.image
                : `${process.env.REACT_APP_API_URL || ''}${news.image}`
            }
            alt={news.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      )}

      <div style={{ padding: 32 }}>
        {/* التصنيف + التاريخ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          {news.category && (
            <span
              style={{
                background: '#007bff',
                color: '#fff',
                borderRadius: 8,
                padding: '4px 16px',
                fontSize: 15
              }}
            >
              {news.category}
            </span>
          )}
          {news.createdAt && (
            <span
              style={{
                color: '#888',
                fontSize: 14,
                background: '#f0f0f0',
                borderRadius: 8,
                padding: '4px 12px'
              }}
            >
              {new Date(news.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
        </div>

        {/* العنوان */}
        <h1
          style={{
            color: '#1e3c72',
            fontSize: 32,
            marginBottom: 18,
            fontWeight: 700,
            lineHeight: 1.2
          }}
        >
          {news.title}
        </h1>

        {/* الملخص */}
        {news.summary && (
          <div
            style={{
              marginBottom: 22,
              color: '#444',
              fontWeight: 'bold',
              fontSize: 18,
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '14px 18px'
            }}
          >
            {news.summary}
          </div>
        )}

        {/* المحتوى */}
        <div
          style={{ fontSize: 17, color: '#222', lineHeight: 1.8, marginBottom: 10 }}
          dangerouslySetInnerHTML={{ __html: news.content || '<p>لا يوجد محتوى للعرض</p>' }}
        />
      </div>
    </div>
  );
};

export default NewsDetailsPage;
