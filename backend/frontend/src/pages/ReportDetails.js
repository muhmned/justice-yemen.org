import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/reports/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        }
      } catch (error) {
        console.error('خطأ في جلب التقرير:', error);
      } finally {
        setLoading(false); // ✅ مهم عشان يوقف شاشة "جاري التحميل..."
      }
    };
  
    fetchReport();
  }, [id]);
  if (loading) return <div>جاري التحميل...</div>;
  if (!report) return <div>لم يتم العثور على التقرير</div>;

  return (
    <div className="report-details" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12 }}>
      <h1>{report.title}</h1>
      {report.thumbnail && <img src={report.thumbnail} alt={report.title} style={{ maxWidth: '100%', marginBottom: 16 }} />}
      <p style={{ color: '#888', marginBottom: 16 }}>{report.publishDate && report.publishDate.slice(0, 10)}</p>
      <div dangerouslySetInnerHTML={{ __html: report.content }} style={{ marginBottom: 24 }} />
      {report.pdfUrl && (
        <a 
          href={report.pdfUrl.startsWith('http') ? report.pdfUrl : `${process.env.REACT_APP_API_URL || ''}${report.pdfUrl}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="download-button"
        >
          تحميل التقرير PDF
        </a>
      )}
    </div>
  );
};

export default ReportDetails; 