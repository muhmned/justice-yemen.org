import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/reports/${id}`)
      .then(res => res.json())
      .then(data => {
        setReport(data.report || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        <button
          className="btn"
          onClick={async (e) => {
            console.log("تم الضغط على زر تحميل التقرير PDF");
            try {
              // تسجيل الرابط الأصلي
              console.log("الرابط الأصلي من قاعدة البيانات:", report.pdfUrl);
              // تحديد الرابط النهائي
              const pdfUrl = report.pdfUrl.startsWith('http')
                ? report.pdfUrl
                : `http://localhost:5000${report.pdfUrl}`;
              // تسجيل الرابط النهائي
              console.log("الرابط النهائي المستخدم للتحميل:", pdfUrl);
              // محاولة التحميل
              const response = await fetch(pdfUrl, { method: 'GET' });
              // تسجيل حالة الاستجابة
              console.log("حالة الاستجابة:", response.status);
              if (!response.ok) {
                throw new Error(`فشل التحميل. كود الاستجابة: ${response.status}`);
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = report.pdfUrl.split('/').pop();
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              // تسجيل نجاح التحميل
              console.log("تم التحميل بنجاح");
            } catch (err) {
              // تسجيل الخطأ
              console.error("حدث خطأ أثناء تحميل الملف:", err);
              alert('حدث خطأ أثناء تحميل الملف: ' + err.message);
            }
          }}
        >
          تحميل التقرير PDF
        </button>
      )}
    </div>
  );
};

export default ReportDetails; 