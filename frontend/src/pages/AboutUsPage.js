import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import './About.css';

const AboutUsPage = () => {
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
      const res = await fetch('http://localhost:5000/api/basic-info/about');
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
      console.error('خطأ في جلب بيانات من نحن:', error);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>من نحن | منظمة جاستيس للحقوق والتنمية</title>
      </Helmet>
      
      <div className="about-page">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="arabic-text">من نحن</span>
              <span className="english-text">About Us</span>
            </h1>
            <p className="hero-subtitle">
              <span className="arabic-text">منظمة جاستيس للحقوق والتنمية</span>
              <span className="english-text">Justice Organization for Rights and Development</span>
            </p>
          </div>
          <div className="hero-image">
            {about.image && (
              <img src={about.image} alt="من نحن" />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="about-container">
          {/* About Us Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">من نحن</span>
                <span className="english-text">Who We Are</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card">
              <div className="content-text" dangerouslySetInnerHTML={{ __html: about.content || 'لا توجد بيانات بعد' }} />
            </div>
          </section>

          {/* Vision Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">الرؤية</span>
                <span className="english-text">Vision</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card vision-card">
              <div className="card-icon">👁️</div>
              <div className="content-text">{about.vision || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">الرسالة</span>
                <span className="english-text">Mission</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card mission-card">
              <div className="card-icon">🎯</div>
              <div className="content-text">{about.mission || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>

          {/* Strategic Goals Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">الأهداف الاستراتيجية</span>
                <span className="english-text">Strategic Goals</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card goals-card">
              <div className="card-icon">🎯</div>
              <div className="content-text">{about.strategic_goals || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>

          {/* Values Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">القيم والمبادئ</span>
                <span className="english-text">Values & Principles</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card values-card">
              <div className="card-icon">💎</div>
              <div className="content-text">{about.values || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>

          {/* Organizational Structure Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">الهيكل التنظيمي</span>
                <span className="english-text">Organizational Structure</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card structure-card">
              <div className="card-icon">🏗️</div>
              <div className="content-text">{about.org_structure || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>

          {/* Work Fields Section */}
          <section className="about-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="arabic-text">مجالات العمل</span>
                <span className="english-text">Work Fields</span>
              </h2>
              <div className="title-underline"></div>
            </div>
            <div className="content-card fields-card">
              <div className="card-icon">🌍</div>
              <div className="content-text">{about.work_fields || 'لا توجد بيانات بعد'}</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage; 