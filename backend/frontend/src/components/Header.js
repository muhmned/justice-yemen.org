import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MenuOutlined, 
  CloseOutlined, 
  SearchOutlined, 
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  PhoneOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';
import { useSiteSettings } from '../hooks/useSiteSettings';

const navLinks = [
  { to: '/', label: 'الرئيسية', icon: <HomeOutlined /> },
  { to: '/news', label: 'الأخبار', icon: <FileTextOutlined /> },
  { to: '/reports', label: 'التقارير', icon: <GlobalOutlined /> },
  { to: '/sections', label: 'الأقسام', icon: <TeamOutlined /> },
  { to: '/about-us', label: 'من نحن', icon: <TeamOutlined /> },
  { to: '/contact-us', label: 'اتصل بنا', icon: <PhoneOutlined /> },
];

const Header = ({ darkMode, setDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { site_logo, site_name } = useSiteSettings();
  const [sections, setSections] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const sectionsDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/sections/active')
      .then(res => {
        if (!res.ok) throw new Error('تعذر جلب الأقسام');
        return res.json();
      })
      .then(data => {
        setSections(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // setSectionsError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقًا');
      });
  }, []);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (sectionsDropdownRef.current && !sectionsDropdownRef.current.contains(event.target)) {
        setSectionsOpen(false);
      }
    }
    if (sectionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sectionsOpen]);

  // التركيز على حقل البحث عند فتحه
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    setSearchOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    setMenuOpen(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  // وظيفة البحث الفعلية
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // البحث في الأخبار
      const newsResponse = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
      const newsData = await newsResponse.json();

      // البحث في التقارير
      const reportsResponse = await fetch(`/api/reports/search?q=${encodeURIComponent(query)}`);
      const reportsData = await reportsResponse.json();

      // البحث في الأقسام
      const sectionsResponse = await fetch(`/api/sections/search?q=${encodeURIComponent(query)}`);
      const sectionsData = await sectionsResponse.json();

      // دمج النتائج
      const allResults = [
        ...(newsData.news || []).map(item => ({ ...item, type: 'news', typeLabel: 'أخبار' })),
        ...(reportsData.reports || []).map(item => ({ ...item, type: 'report', typeLabel: 'تقارير' })),
        ...(sectionsData.sections || []).map(item => ({ ...item, type: 'section', typeLabel: 'أقسام' }))
      ];

      setSearchResults(allResults);
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // البحث عند الكتابة مع تأخير
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleResultClick = (result) => {
    let path = '';
    switch (result.type) {
      case 'news':
        path = `/news/${result.id}`;
        break;
      case 'report':
        path = `/reports/${result.id}`;
        break;
      case 'section':
        path = `/sections/${result.id}`;
        break;
      default:
        return;
    }
    
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Bar */}
    

      {/* Main Header */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-container">
            {/* Logo */}
            <div className="logo">
              <Link to="/" onClick={handleLinkClick}>
                <img 
                  src={site_logo || '/logo.png'} 
                  alt={site_name || 'منظمة جاستيس'} 
                  className="logo-image"
                />
                <div className="logo-text">
                  <h1 className="logo-title">{site_name || ' منظمة جاستيس للحقوق والتنمية '}</h1>
                  <p className="logo-subtitle"></p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
              <ul className="nav-list">
                {navLinks.map((link) => (
                  <li key={link.to} className="nav-item">
                    <Link
                      to={link.to}
                      className={`nav-link ${isActiveLink(link.to) ? 'active' : ''}`}
                      onClick={handleLinkClick}
                    >
                      <span className="nav-icon">{link.icon}</span>
                      <span className="nav-label">{link.label}</span>
                    </Link>
                  </li>
                ))}
                
              </ul>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Search Toggle */}
        
              {/* Dark Mode Toggle */}
              <button
                className="dark-mode-toggle"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Admin Login */}
             {/* <Link to="/admin" className="admin-login" onClick={handleLinkClick}>
                <UserOutlined />
                <span>الإدارة</span>
              </Link>*/}

              {/* Menu Toggle */}
              <button
                className="menu-toggle"
                onClick={handleMenuToggle}
                aria-label="القائمة"
              >
                {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="search-bar">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <SearchOutlined className="search-icon" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="ابحث في الأخبار والتقارير والأقسام..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-button">
                    {isSearching ? (
                      <div className="search-spinner"></div>
                    ) : (
                      <SearchOutlined />
                    )}
                  </button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id}-${index}`}
                        className="search-result-item"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="result-icon">
                          {result.type === 'news' && <FileTextOutlined />}
                          {result.type === 'report' && <GlobalOutlined />}
                          {result.type === 'section' && <TeamOutlined />}
                        </div>
                        <div className="result-content">
                          <div className="result-title">{result.title}</div>
                          <div className="result-type">{result.typeLabel}</div>
                          {result.excerpt && (
                            <div className="result-excerpt">{result.excerpt}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
                  <div className="no-results">
                    <p>لا توجد نتائج للبحث عن "{searchQuery}"</p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Menu Overlay */}
        {menuOpen && <div className="menu-overlay" onClick={handleMenuToggle} />}
      </header>
    </>
  );
};

export default Header; 