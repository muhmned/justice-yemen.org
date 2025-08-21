import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("📌 جلب التقرير بالـ id:", id); // ✅ تتبع

        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/reports/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log("📊 البيانات القادمة من السيرفر:", data); // ✅ تتبع
          setReport(data);
        } else {
          console.error("❌ لم يتم العثور على التقرير. الكود:", response.status);
        }
      } catch (error) {
        console.error('خطأ في جلب التقرير:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div>جاري التحميل...</div>;
  if (!report) return <div>لم يتم العثور على التقرير</div>;

  return (
    <div className="report-details" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12 }}>
      {/* عنوان التقرير */}
      <h1 style={{ marginBottom: 16 }}>{report.title}</h1>

      {/* الصورة المصغرة */}
      {report.thumbnail && (
        <img
          src={report.thumbnail.startsWith('http') ? report.thumbnail : `${process.env.REACT_APP_API_URL || ''}${report.thumbnail}`}
          alt={report.title}
          style={{ maxWidth: '100%', marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* تاريخ الإنشاء */}
      <p style={{ color: '#888', marginBottom: 16 }}>
        {report.createdAt
          ? new Date(report.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : ''}
      </p>

      {/* المحتوى */}
      <div
        dangerouslySetInnerHTML={{ __html: report.content || '' }}
        style={{ marginBottom: 24, lineHeight: 1.8, fontSize: 16, color: '#333' }}
      />

      {/* زر تحميل PDF */}
      {report.pdfUrl && (
        <a
          href={report.pdfUrl.startsWith('http') ? report.pdfUrl : `${process.env.REACT_APP_API_URL || ''}${report.pdfUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="download-button"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: '#1e3c72',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          تحميل التقرير PDF
        </a>
      )}
    </div>
  );
};

export default ReportDetails;
