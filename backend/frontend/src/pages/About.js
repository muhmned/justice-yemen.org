import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ApartmentOutlined,
  RocketOutlined
} from '@ant-design/icons';
import './About.css';

export default function About() {
  const [about, setAbout] = useState({
    title: '',
    content: '',
    image: '',
    vision: '',
    mission: '',
    strategic_goals: '',
    values: '',
    org_structure: '',
    work_fields: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchAbout = useCallback(async () => {
    setLoading(true);
    try {
const res = await fetch(`${process.env.REACT_APP_API_URL}/api/basic-info/about`);
      const data = await res.json();
      setAbout({
        title: data.title || 'من نحن',
        content: data.content || '',
        image: data.image || '',
        vision: data.vision || '',
        mission: data.mission || '',
        strategic_goals: data.strategic_goals || '',
        values: data.values || '',
        org_structure: data.org_structure || '',
        work_fields: data.work_fields || ''
      });
    } catch (error) {
      setAbout({
        title: 'من نحن',
        content: '',
        image: '',
        vision: '',
        mission: '',
        strategic_goals: '',
        values: '',
        org_structure: '',
        work_fields: ''
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  return (
    <>
      <Helmet>
        <title>من نحن | منظمة جاستيس للحقوق والتنمية</title>
        <meta name="description" content="تعرف على منظمة جاستيس للحقوق والتنمية وأهدافنا وقيمنا" />
      </Helmet>
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">{about.title || 'من نحن'}</h1>
                <p className="hero-subtitle">
                  منظمة جاستيس للحقوق والتنمية - نعمل من أجل مستقبل أفضل
                </p>
              </div>
              <div className="hero-image">
                {about.image && (
                  <img
                    src={about.image}
                    alt="من نحن"
                    className="about-main-image"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="about-content">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل المحتوى...</p>
              </div>
            ) : (
              <div className="content-grid">
                {/* قصة المنظمة */}
                <div className="about-text-section">
                  <h2 className="section-title">قصتنا</h2>
                  <div className="about-text">
                    {about.content || 'لا توجد بيانات بعد'}
                  </div>
                </div>

                {/* الرؤية */}
                <div className="value-card">
                  <div className="value-icon"><GlobalOutlined /></div>
                  <h3 className="value-title">الرؤية</h3>
                  <p className="value-description">{about.vision || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* الرسالة */}
                <div className="value-card">
                  <div className="value-icon"><TrophyOutlined /></div>
                  <h3 className="value-title">الرسالة</h3>
                  <p className="value-description">{about.mission || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* الأهداف الاستراتيجية */}
                <div className="value-card">
                  <div className="value-icon"><RocketOutlined /></div>
                  <h3 className="value-title">الأهداف الاستراتيجية</h3>
                  <p className="value-description">{about.strategic_goals || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* القيم والمبادئ */}
                <div className="value-card">
                  <div className="value-icon"><HeartOutlined /></div>
                  <h3 className="value-title">القيم والمبادئ</h3>
                  <p className="value-description">{about.values || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* الهيكل التنظيمي */}
                <div className="value-card">
                  <div className="value-icon"><ApartmentOutlined /></div>
                  <h3 className="value-title">الهيكل التنظيمي</h3>
                  <p className="value-description">{about.org_structure || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* مجالات العمل */}
                <div className="value-card">
                  <div className="value-icon"><CheckCircleOutlined /></div>
                  <h3 className="value-title">مجالات العمل</h3>
                  <p className="value-description">{about.work_fields || 'لا توجد بيانات بعد'}</p>
                </div>

                {/* CTA Section */}
                <div className="cta-section">
                  <div className="cta-content">
                    <h3>انضم إلينا</h3>
                    <p>ساعدنا في بناء مستقبل أفضل للجميع</p>
                    <div className="cta-buttons">
                      <Link to="/contact" className="cta-btn primary">
                        تواصل معنا
                      </Link>
                      <Link to="/news" className="cta-btn secondary">
                        اطلع على أخبارنا
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
} 