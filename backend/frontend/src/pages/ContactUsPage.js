import React, { useState, useEffect } from 'react';
import { 
  UserOutlined, 
  MailOutlined, 
  FileTextOutlined, 
  MessageOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './ContactUsPage.css';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/contact/info`);
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error('خطأ في جلب معلومات الاتصال:', error);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح رسالة الخطأ عند الكتابة
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // إرسال الرسالة إلى الخادم
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0]);
        } else {
          setError(data.message || 'حدث خطأ أثناء إرسال الرسالة');
        }
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى');
      console.error('خطأ في إرسال الرسالة:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="contact-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل معلومات الاتصال...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="contact-page">
        <div className="contact-hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">تم إرسال رسالتك بنجاح</h1>
              <p className="hero-subtitle">شكراً لك على التواصل معنا</p>
            </div>
          </div>
        </div>
        
        <div className="contact-content">
          <div className="container">
            <div className="success-message">
              <CheckCircleOutlined className="success-icon" />
              <h3>تم إرسال رسالتك بنجاح!</h3>
              <p>سنقوم بالرد عليك في أقرب وقت ممكن</p>
              <p className="confirmation-note">
                تم إرسال رسالة تأكيد إلى بريدك الإلكتروني
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="submit-btn"
                style={{ marginTop: '20px' }}
              >
                إرسال رسالة أخرى
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">اتصل بنا</h1>
            <p className="hero-subtitle">
              نحن هنا للإجابة على استفساراتك والاستماع إلى آرائك
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">دعم متواصل</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">استجابة سريعة</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">عميل راضٍ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info Section */}
            <div className="contact-info-section">
              <h2 className="section-title">معلومات الاتصال</h2>
              <p className="section-description">
                يمكنك التواصل معنا من خلال أي من الطرق التالية
              </p>
              
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <PhoneOutlined className="info-icon" />
                  <div className="info-content">
                    <h3 className="info-title">الهاتف</h3>
                    <a href="tel:04262918-771678010" className="info-value">
                      04262918-771678010
                    </a>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <MailOutlined className="info-icon" />
                  <div className="info-content">
                    <h3 className="info-title">البريد الإلكتروني</h3>
                    <a href="mailto:justiceorganzation@gmail.com" className="info-value">
                      justiceorganzation@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <EnvironmentOutlined className="info-icon" />
                  <div className="info-content">
                    <h3 className="info-title">العنوان</h3>
                    <span className="info-value">
                      اليمن-تعز-شارع جمال-خلف الكريمي-وسوق ديلوكس
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="contact-description">
                <h3>ساعات العمل</h3>
                <p>الأحد - الخميس: 8:00 ص - 4:00 م</p>
                <p>الجمعة - السبت: 9:00 ص - 2:00 م</p>
                <p>نحن متاحون للرد على الرسائل على مدار الساعة</p>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="contact-form-section">
              <h2 className="section-title">أرسل رسالة</h2>
              <p className="section-description">
                املأ النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن
              </p>
              
              {error && (
                <div className="error-message">
                  <ExclamationCircleOutlined className="error-icon" />
                  <span>{error}</span>
                </div>
              )}
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <UserOutlined />
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <MailOutlined />
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <FileTextOutlined />
                    الموضوع *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="أدخل موضوع الرسالة"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <MessageOutlined />
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    required
                    placeholder="اكتب رسالتك هنا..."
                    rows="6"
                  />
                </div>
                
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <SendOutlined />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="container">
          <div className="map-content">
            <h2 className="section-title">موقعنا</h2>
            <p className="section-description">
              يمكنك زيارتنا في مقرنا الرئيسي
            </p>
            
            <div className="map-placeholder">
              <EnvironmentOutlined className="map-icon" />
              <p>خريطة تفاعلية</p>
              <p className="map-address">
                اليمن-تعز-شارع جمال-خلف الكريمي-وسوق ديلوكس
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage; 