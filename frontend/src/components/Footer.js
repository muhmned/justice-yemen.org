import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';
import { useSiteSettings } from '../hooks/useSiteSettings';

const Footer = () => {
  const { 
    site_name, 
    site_logo, 
    facebookUrl, 
    twitterUrl, 
    instagramUrl, 
    youtubeUrl 
  } = useSiteSettings();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'الرئيسية', icon: <HomeOutlined /> },
    { to: '/news', label: 'الأخبار', icon: <FileTextOutlined /> },
    { to: '/reports', label: 'التقارير', icon: <GlobalOutlined /> },
    { to: '/about-us', label: 'من نحن', icon: <TeamOutlined /> },
    { to: '/contact-us', label: 'اتصل بنا', icon: <PhoneOutlined /> },
  ];

  const contactInfo = [
    { icon: <MailOutlined />, label: 'البريد الإلكتروني', value: 'justiceorganzation@gmail.com' },
    { icon: <PhoneOutlined />, label: 'الهاتف', value: '04262918-771678010' },
    { icon: <EnvironmentOutlined />, label: 'العنوان', value: 'اليمن-تعز-شارع جمال-خلف الكريمي-وسوق ديلوكس' },
  ];

  return (
    <footer className="main-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="footer-logo-section">
                <img 
                  src={site_logo || '/logo.png'} 
                  alt={site_name || 'منظمة جاستيس'} 
                  className="footer-logo"
                />
                <div className="footer-brand-text">
                  <h3 className="footer-title">{site_name || 'منظمة جاستيس'}</h3>
                  <p className="footer-subtitle">للحقوق والتنمية</p>
                </div>
              </div>
              <p className="footer-description">
                منظمة حقوقية مستقلة تعمل على تعزيز حقوق الإنسان والتنمية المستدامة 
                من خلال العمل المباشر مع المجتمعات المحلية وبناء الشراكات الاستراتيجية.
              </p>
              <div className="footer-social">
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <FaFacebook />
                  </a>
                )}
                {twitterUrl && (
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <FaTwitter />
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <FaInstagram />
                  </a>
                )}
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                    <FaYoutube />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-section-title">روابط سريعة</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer-link">
                      <span className="link-icon">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4 className="footer-section-title">خدماتنا</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/reports" className="footer-link">
                    <span className="link-icon">📊</span>
                    التقارير والدراسات
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="footer-link">
                    <span className="link-icon">📰</span>
                    الأخبار والتحديثات
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="footer-link">
                    <span className="link-icon">👥</span>
                    البرامج والمشاريع
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="footer-link">
                    <span className="link-icon">🤝</span>
                    الشراكات والتعاون
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4 className="footer-section-title">معلومات الاتصال</h4>
              <div className="contact-info">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="contact-item">
                    <div className="contact-icon">{contact.icon}</div>
                    <div className="contact-details">
                      <span className="contact-label">{contact.label}</span>
                      <span className="contact-value">{contact.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <span>© {currentYear} جميع الحقوق محفوظة لـ {site_name || 'منظمة جاستيس'}</span>
            </div>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">سياسة الخصوصية</Link>
              <Link to="/terms" className="footer-bottom-link">شروط الاستخدام</Link>
              <Link to="/sitemap" className="footer-bottom-link">خريطة الموقع</Link>
            </div>
            <div className="footer-made-with">
         {/*     <span>صنع بـ</span>
              <HeartOutlined className="heart-icon" />
              <span>في الشرق الأوسط</span>*/}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 