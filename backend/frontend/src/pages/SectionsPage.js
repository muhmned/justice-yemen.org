import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const SectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/sections`);
        if (res.ok) {
          const data = await res.json();
          // ✅ عدلنا هنا: فلترة على active بدل published
          const activeSections = Array.isArray(data) ? data.filter(item => item.status === 'active') : [];
          setSections(activeSections);
        }
      } catch (error) {
        console.error('خطأ في جلب الأقسام:', error);
      } finally {
        // ✅ حتى لو صار خطأ لازم نوقف التحميل
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return (
    <>
      <Helmet>
        <title>الأقسام | منظمة جاستيس للحقوق والتنمية</title>
      </Helmet>
      <div className="section">
        <h1 className="section-title">أقسام المحتوى</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>جاري تحميل الأقسام...</p>
          </div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>لا توجد أقسام لعرضها حالياً.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {sections.map(section => (
              <div key={section.id} className="card">
                <div className="card-content">
                  <h3 className="card-title">{section.name}</h3>
                  <p className="card-text">{section.description || 'تفاصيل القسم'}</p>
                  <Link to={`/sections/${section.slug}`} className="btn">
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SectionsPage;
