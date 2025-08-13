import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ArticleDetailsPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
        }
      } catch (error) {
        console.error('خطأ في جلب المقال:', error);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div>جاري التحميل...</div>;
  if (!article) return <div>لم يتم العثور على المقال</div>;

  return (
    <div className="article-details" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12 }}>
      <h1>{article.title}</h1>
      {article.image && (
        <img 
          src={article.image} 
          alt={article.title} 
          style={{ maxWidth: '100%', marginBottom: 16 }} 
        />
      )}
      <p style={{ color: '#888', marginBottom: 16 }}>{article.publishDate && article.publishDate.slice(0, 10)}</p>
      <div style={{ marginBottom: 16 }}>
        <b>القسم:</b> {article.Section ? article.Section.name : 'غير محدد'}
        {article.User && (
          <span style={{ marginRight: 16 }}><b>الكاتب:</b> {article.User.username}</span>
        )}
      </div>
      <div dangerouslySetInnerHTML={{ __html: article.content }} style={{ marginBottom: 24 }} />
    </div>
  );
};

export default ArticleDetailsPage; 