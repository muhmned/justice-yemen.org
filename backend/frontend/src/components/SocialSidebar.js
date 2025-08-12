import React, { useState, useEffect } from 'react';

const socialLinks = [
  {
       url: 'https://www.facebook.com/profile.php?id=61577941567624',
    iconClass: 'fab fa-facebook-f',
    color: '#1877f3',
  },
  {
 
    url: 'https://x.com/justice_org2025?t=QRSv-F26YIeCXdrQm7OXaw&s=09',
    iconClass: 'fab fa-x-twitter',
    color: '#000',
  },
  {
      url: 'https://www.instagram.com/justice_org_2025?igsh=NjdqOGJpc3EzamQ1',
    iconClass: 'fab fa-instagram',
    color: '#e4405f',
  },
  {
      url: 'https://youtube.com/channel/UCacqAU4XK_ngZsRUF7EeDew?si=PwiuaenIsTcFlRMx',
    iconClass: 'fab fa-youtube',
    color: '#ff0000',
  },
];

const getResponsiveStyles = (isMobile) => {
  return {
    iconBoxStyle: {
      display: 'flex',
      alignItems: 'center',
      minWidth: isMobile ? 38 : 56,
      height: isMobile ? 38 : 56,
      borderRadius: isMobile ? 8 : 12,
      background: '#fff',
      boxShadow: '0 2px 12px #e0e0e0',
      fontSize: isMobile ? 18 : 28,
      transition: 'all 0.2s',
      textDecoration: 'none',
      margin: isMobile ? '7px 0' : '14px 0',
      padding: isMobile ? '0 10px 0 4px' : '0 20px 0 10px',
      cursor: 'pointer',
    },
    iconStyle: {
      minWidth: isMobile ? 20 : 30,
      textAlign: 'center',
      fontSize: isMobile ? 20 : 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyle: {
      marginLeft: isMobile ? 8 : 18,
      fontWeight: 'bold',
      color: '#333',
      fontSize: isMobile ? 12 : 18,
      whiteSpace: 'nowrap',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
    },
  };
};

const SocialSidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // يجب أن يكون الشرط بعد الـ hooks
  if (window.location.pathname.startsWith('/admin')) return null;

  const { iconBoxStyle, iconStyle, textStyle } = getResponsiveStyles(isMobile);

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '20%' : '35%',
        left: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0,
      }}
    >
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          style={iconBoxStyle}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 4px 16px #bdbdbd';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = iconBoxStyle.boxShadow;
          }}
        >
          <i
            className={link.iconClass + ' fa-2x'}
            style={{
              ...iconStyle,
              color: link.color,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = link.color)}
          ></i>
          <span style={textStyle}>{link.name}</span>
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar; 