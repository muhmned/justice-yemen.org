import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const SectionDetailsPage = () => {
  const { slug } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  // جلب بيانات القسم
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/sections/slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setSection(data);
        } else {
          setError('لم يتم العثور على هذا القسم');
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات القسم:', error);
        setError('خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [slug]);

  // جلب مقالات القسم
  useEffect(() => {
    const fetchArticles = async () => {
      if (!section) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/articles`);
        if (response.ok) {
          const data = await response.json();

          // ✅ فلترة المقالات لتكون خاصة بهذا القسم فقط
          const sectionArticles = Array.isArray(data)
            ? data.filter(article => {
                const articleSectionId =
                  article.sectionId?.id || article.sectionId?._id || article.sectionId || null;
                return articleSectionId && section.id && articleSectionId === section.id;
              })
            : [];

          setArticles(sectionArticles);
        }
      } catch (error) {
        console.error('خطأ في جلب المقالات:', error);
      }
    };

    fetchArticles();
  }, [section]);

  if (loading) return <div style={{ textAlign: 'center' }}>جاري التحميل...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!section) return null;

  return (
    <div className="section-details-page" style={{ maxWidth: 1000, margin: '40px auto', padding: 0 }}>
      {/* بطاقة القسم */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e0e0', padding: 32, marginBottom: 32, position: 'relative' }}>
        <h1 style={{ textAlign: 'right', color: '#1e3c72', marginBottom: 12, fontSize: 32 }}>{section.name}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
          <span style={{ color: '#888', fontWeight: 'bold' }}>
            العنوان الفريد: <span style={{ color: '#007bff' }}>{section.slug}</span>
          </span>
          <span style={{ color: '#888', fontWeight: 'bold' }}>
            الحالة: <span style={{ color: section.status === 'active' ? '#28a745' : '#dc3545' }}>
              {section.status === 'active' ? 'نشط' : 'غير نشط'}
            </span>
          </span>
          <span style={{ color: '#888', fontWeight: 'bold' }}>
            الترتيب: <span style={{ color: '#007bff' }}>{section.order}</span>
          </span>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right', color: '#444', fontSize: 18 }}>
          <b>الوصف:</b>
          <div style={{ marginTop: 4 }}>{section.description || <span style={{ color: '#aaa' }}>لا يوجد وصف</span>}</div>
        </div>
      </div>

      {/* عرض المقالات الخاصة بهذا القسم */}
      {articles.length > 0 ? (
        <div style={{ marginTop: 0 }}>
          <h2 style={{ color: '#1e3c72', marginBottom: 24, fontSize: 26, textAlign: 'right' }}>مقالات هذا القسم</h2>
          <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 32 }}>
            {articles.map(article => (
              <div
                key={article.id || article._id}
                className="card"
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px #eee',
                  overflow: 'hidden',
                  transition: 'transform 0.2s,box-shadow 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 340
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 24px #d0d0d0';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px #eee';
                }}
              >
                <Link to={`/articles/${article.id || article._id}`} style={{ display: 'block', flex: 1 }}>
                  <img
                    src={
                      article.image
                        ? (article.image.startsWith('http')
                            ? article.image
                            : `${process.env.REACT_APP_API_URL || ''}${article.image}`)
                        : 'https://via.placeholder.com/400x250/cccccc/000000?text=No+Image'
                    }
                    alt={article.title}
                    className="card-image"
                    style={{ width: '100%', height: 170, objectFit: 'cover', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                  />
                  <div className="card-content" style={{ padding: 18 }}>
                    <h3 className="card-title" style={{ color: '#1e3c72', fontSize: 20, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </h3>
                    <p className="card-text" style={{ color: '#444', fontSize: 15, marginBottom: 8, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.summary || (article.content ? article.content.slice(0, 100) + '...' : '')}
                    </p>
                    <p className="card-date" style={{ color: '#888', fontSize: 13 }}>
                      {article.createdAt ? article.createdAt.slice(0, 10) : ''}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 40, fontSize: 20 }}>
          لا توجد مقالات منشورة في هذا القسم حالياً.
        </div>
      )}
    </div>
  );
};

export default SectionDetailsPage;
