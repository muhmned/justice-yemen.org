import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const SectionsPage = (props) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/sections');
                const data = await res.json();
                setSections(Array.isArray(data) ? data : []);
                if (props.showAlert) props.showAlert('تم جلب الأقسام بنجاح', 'success');
            } catch (error) {
                console.error('Error fetching sections:', error);
                setSections([]);
                if (props.showAlert) props.showAlert('حدث خطأ أثناء جلب الأقسام', 'error');
            } finally {
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
