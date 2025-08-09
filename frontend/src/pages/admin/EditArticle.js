import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Upload, message, Card, Row, Col, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const { Option } = Select;
const { TextArea } = Input;

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [sections, setSections] = useState([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // دالة تنظيف المحتوى من HTML المعقد
  const cleanContent = (content) => {
    if (!content) return '';
    
    let cleaned = content;
    
    // إزالة console-group و console-message
    cleaned = cleaned.replace(/<div[^>]*class="console-group[^"]*"[^>]*>.*?<\/div>/gs, '');
    cleaned = cleaned.replace(/<div[^>]*class="console-message[^"]*"[^>]*>.*?<\/div>/gs, '');
    
    // إزالة div فارغة متعددة
    cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');
    
    // تنظيف المسافات الزائدة
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  // دالة تشخيص شاملة للمشاكل
  const diagnoseAndFix = (data, type) => {
    // تأكد أن المحتوى نصي
    data.content = typeof data.content === 'string' ? data.content : (data.content ? String(data.content) : '');
    console.log(`=== تشخيص ${type} ===`);
    
    const issues = [];
    const fixes = {};

    // تشخيص المحتوى
    if (data.content) {
      console.log('فحص المحتوى...');
      
      // فحص HTML معقد
      if (data.content.includes('console-group') || data.content.includes('console-message')) {
        issues.push('المحتوى يحتوي على HTML معقد من console');
        fixes.content = cleanContent(data.content);
        console.log('تم تنظيف المحتوى من HTML المعقد');
      }
      
      // فحص عناصر خطيرة
      if (data.content.includes('<script') || data.content.includes('<iframe')) {
        issues.push('المحتوى يحتوي على عناصر خطيرة');
        fixes.content = (fixes.content || data.content).replace(/<script.*?>.*?<\/script>/gi, '');
        fixes.content = fixes.content.replace(/<iframe.*?>.*?<\/iframe>/gi, '');
        console.log('تم إزالة العناصر الخطيرة');
      }
      
      // فحص طول المحتوى
      if (data.content.length > 10000) {
        issues.push('المحتوى طويل جداً');
        console.log('تحذير: المحتوى طويل جداً');
      }
      
      // فحص محتوى فارغ
      if (!data.content.trim()) {
        issues.push('المحتوى فارغ');
        fixes.content = 'محتوى المقال';
        console.log('تم إضافة محتوى افتراضي');
      }
    }

    // تشخيص العنوان
    if (data.title) {
      if (!data.title.trim()) {
        issues.push('العنوان فارغ');
        fixes.title = 'عنوان المقال';
        console.log('تم إضافة عنوان افتراضي');
      }
      
      if (data.title.length > 200) {
        issues.push('العنوان طويل جداً');
        fixes.title = data.title.substring(0, 200);
        console.log('تم تقصير العنوان');
      }
    }

    // تشخيص القسم
    if (data.sectionId) {
      if (!data.sectionId || data.sectionId === '') {
        issues.push('لم يتم اختيار قسم');
        if (sections.length > 0) {
          fixes.sectionId = sections[0].id;
          console.log('تم اختيار القسم الأول افتراضياً');
        }
      }
    }

    // تشخيص الصورة
    if (data.image) {
      if (typeof data.image === 'string' && !data.image.startsWith('/uploads/') && !data.image.startsWith('http')) {
        issues.push('مسار الصورة غير صحيح');
        console.log('تحذير: مسار الصورة غير صحيح');
      }
    }

    // طباعة النتائج
    if (issues.length > 0) {
      console.log('المشاكل المكتشفة:', issues);
      console.log('الإصلاحات المطبقة:', fixes);
    } else {
      console.log('لا توجد مشاكل مكتشفة');
    }

    // تطبيق الإصلاحات
    const fixedData = { ...data };
    Object.keys(fixes).forEach(key => {
      fixedData[key] = fixes[key];
    });

    return { issues, fixes, fixedData };
  };

  // دالة تشخيص حالة المحرر
  const diagnoseEditor = () => {
    console.log('=== تشخيص حالة المحرر ===');
    
    const editorIssues = [];
    
    // فحص وجود المحرر
    const editorElement = document.querySelector('.tox-tinymce');
    if (!editorElement) {
      editorIssues.push('المحرر غير موجود في DOM');
    } else {
      console.log('المحرر موجود في DOM');
    }
    
    // فحص حالة المحتوى
    if (content) {
      console.log('المحتوى الحالي:', content.substring(0, 100) + '...');
      console.log('طول المحتوى:', content.length);
    } else {
      editorIssues.push('المحتوى فارغ');
    }
    
    // فحص حالة النموذج
    const formValues = form.getFieldsValue();
    console.log('قيم النموذج:', formValues);
    
    if (editorIssues.length > 0) {
      console.log('مشاكل المحرر:', editorIssues);
    } else {
      console.log('المحرر يعمل بشكل طبيعي');
    }
    
    return editorIssues;
  };

  // دالة تشخيص معوقات التحديث
  const diagnoseUpdateIssues = async (values) => {
    console.log('🔍 === بدء تشخيص معوقات التحديث ===');
    
    const issues = [];
    const warnings = [];
    const data = {};

    try {
      // 1. فحص البيانات الأساسية
      console.log('📋 فحص البيانات الأساسية...');
      
      data.title = values.title || '';
      data.content = content || values.content || '';
      data.sectionId = values.sectionId || '';
      
      console.log('العنوان:', data.title);
      console.log('طول المحتوى:', data.content.length);
      console.log('القسم:', data.sectionId);

      // فحص العنوان
      if (!data.title.trim()) {
        issues.push('❌ العنوان فارغ');
      } else if (data.title.length > 200) {
        warnings.push('⚠️ العنوان طويل جداً (أكثر من 200 حرف) - قد يتم تقصيره');
      }

      // فحص المحتوى
      if (!data.content.trim()) {
        issues.push('❌ المحتوى فارغ');
      } else if (data.content.length > 50000) {
        warnings.push('⚠️ المحتوى طويل جداً (أكثر من 50,000 حرف) - قد يستغرق التحديث وقتاً أطول');
      }

      // فحص القسم
      if (!data.sectionId) {
        issues.push('❌ لم يتم اختيار قسم');
      }

      // 2. فحص المحتوى HTML
      console.log('🔍 فحص محتوى HTML...');
      
      if (data.content.includes('console-group')) {
        warnings.push('⚠️ المحتوى يحتوي على console-group - سيتم تنظيفه تلقائياً');
      }
      
      if (data.content.includes('console-message')) {
        warnings.push('⚠️ المحتوى يحتوي على console-message - سيتم تنظيفه تلقائياً');
      }
      
      if (data.content.includes('<script')) {
        warnings.push('⚠️ المحتوى يحتوي على عناصر script - سيتم إزالتها تلقائياً');
      }
      
      if (data.content.includes('<iframe')) {
        warnings.push('⚠️ المحتوى يحتوي على عناصر iframe - سيتم إزالتها تلقائياً');
      }

      // 3. فحص التوكن
      console.log('🔑 فحص التوكن...');
      const token = localStorage.getItem('admin_token');
      if (!token) {
        issues.push('❌ لا يوجد توكن مصادقة');
      } else {
        console.log('✅ التوكن موجود');
        // فحص صلاحية التوكن
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          if (tokenData.exp < now) {
            issues.push('❌ التوكن منتهي الصلاحية');
          } else {
            console.log('✅ التوكن صالح');
          }
        } catch (e) {
          warnings.push('⚠️ لا يمكن فحص صلاحية التوكن');
        }
      }

      // 4. فحص الاتصال بالخادم (اختياري)
      console.log('🌐 فحص الاتصال بالخادم...');
      try {
        const testResponse = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          timeout: 3000
        });
        if (testResponse.ok) {
          console.log('✅ الخادم متاح');
        } else {
          warnings.push('⚠️ الخادم غير متاح (خطأ في الاستجابة)');
        }
      } catch (error) {
        warnings.push('⚠️ لا يمكن الاتصال بالخادم - سيتم المحاولة لاحقاً');
        console.log('تفاصيل خطأ الاتصال:', error.message);
      }

      // 5. فحص حجم البيانات
      console.log('📊 فحص حجم البيانات...');
      const formDataSize = new Blob([data.content]).size;
      console.log('حجم المحتوى:', formDataSize, 'bytes');
      
      if (formDataSize > 1024 * 1024) { // 1MB
        warnings.push('⚠️ حجم المحتوى كبير جداً (أكثر من 1MB) - قد يستغرق التحديث وقتاً أطول');
      }

      // 6. فحص الصورة
      if (imageFile) {
        console.log('🖼️ فحص الصورة...');
        console.log('اسم الصورة:', imageFile.name);
        console.log('حجم الصورة:', imageFile.size, 'bytes');
        console.log('نوع الصورة:', imageFile.type);
        
        if (imageFile.size > 2 * 1024 * 1024) {
          warnings.push('⚠️ حجم الصورة كبير جداً (أكثر من 2MB) - قد يستغرق الرفع وقتاً أطول');
        }
        
        if (!imageFile.type.startsWith('image/')) {
          issues.push('❌ الملف ليس صورة');
        }
      }

      // 7. فحص حالة النموذج
      console.log('📝 فحص حالة النموذج...');
      const formErrors = form.getFieldsError();
      if (formErrors.length > 0) {
        warnings.push('⚠️ النموذج يحتوي على أخطاء - سيتم التحقق من صحة البيانات');
        formErrors.forEach(error => {
          console.log('خطأ في الحقل:', error.name, '-', error.errors);
        });
      }

      // 8. فحص حالة المحرر
      console.log('✏️ فحص حالة المحرر...');
      const editorElement = document.querySelector('.tox-tinymce');
      if (!editorElement) {
        warnings.push('⚠️ المحرر غير موجود في الصفحة - قد يكون في حالة تحميل');
      } else {
        console.log('✅ المحرر موجود');
      }

    } catch (error) {
      issues.push('❌ خطأ في التشخيص: ' + error.message);
    }

    // طباعة التقرير النهائي
    console.log('\n📋 === تقرير التشخيص النهائي ===');
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ لا توجد معوقات للتحديث');
    } else {
      console.log('🚨 المعوقات المكتشفة:');
      issues.forEach(issue => console.log(issue));
      
      if (warnings.length > 0) {
        console.log('\n⚠️ التحذيرات:');
        warnings.forEach(warning => console.log(warning));
      }
    }

    console.log('\n📊 ملخص البيانات:');
    console.log('العنوان:', data.title ? `"${data.title}"` : 'غير محدد');
    console.log('طول المحتوى:', data.content.length, 'حرف');
    console.log('القسم:', data.sectionId || 'غير محدد');
    console.log('صورة:', imageFile ? imageFile.name : 'لا توجد صورة جديدة');

    return {
      canProceed: issues.length === 0,
      issues,
      warnings,
      data
    };
  };

  console.log('EditArticle - ID:', id);

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      console.log('جاري تحميل المقال:', id);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('استجابة جلب المقال:', res.status, res.statusText);

      if (res.ok) {
        const articleData = await res.json();
        console.log('بيانات المقال:', articleData);
        
        // تشخيص وإصلاح بيانات المقال
        const { issues, fixes, fixedData } = diagnoseAndFix(articleData, 'تحميل المقال');
        
        // تنظيف المحتوى من HTML المعقد
        let rawContent = fixedData.content || '';
        let cleaned = cleanContent(rawContent);
        console.log('المحتوى بعد التنظيف:', cleaned);
        
        setArticle(fixedData);
        setContent(cleaned);
        
        if (fixedData.image) {
          const imageUrl = `http://localhost:5000${fixedData.image}`;
          setImagePreview(imageUrl);
          console.log('تم تعيين صورة المقال الحالية:', imageUrl);
        } else {
          console.log('المقال لا يحتوي على صورة');
        }
      } else {
        const errorData = await res.json();
        console.error('خطأ في جلب المقال:', errorData);
        
        if (res.status === 404) {
          message.error('المقال غير موجود');
        } else if (res.status === 401) {
          message.error('يجب تسجيل الدخول أولاً');
          navigate('/admin/login');
        } else {
          message.error(errorData.error || 'تعذر جلب المقال');
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل المقال:', error);
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchSections = async () => {
    try {
      console.log('جاري تحميل الأقسام...');
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/sections/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('استجابة جلب الأقسام:', res.status, res.statusText);

      if (res.ok) {
        const sectionsData = await res.json();
        console.log('الأقسام المحملة:', sectionsData);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } else {
        const errorData = await res.json();
        console.error('خطأ في جلب الأقسام:', errorData);
        
        if (res.status === 401) {
          message.error('يجب تسجيل الدخول أولاً');
          navigate('/admin/login');
        } else {
          message.error(errorData.error || 'تعذر جلب الأقسام');
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الأقسام:', error);
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    if (id) {
      fetchSections();
      loadArticle();
    }
  }, [id, loadArticle]);

  // تعبئة النموذج فقط عند تغيير بيانات المقال
  useEffect(() => {
    if (article && !loading) {
      console.log('تعبئة النموذج ببيانات المقال:', article);
      const currentValues = form.getFieldsValue();
      if (!currentValues.title || currentValues.title !== article.title) {
        // تشخيص وإصلاح بيانات المقال
        const { issues, fixes, fixedData } = diagnoseAndFix(article, 'تعبئة النموذج');
        
        // تنظيف المحتوى قبل تعبئة النموذج
        let clean = cleanContent(fixedData.content || '');
        
        form.setFieldsValue({
          title: fixedData.title,
          content: clean,
          sectionId: fixedData.sectionId
        });
        console.log('تم تعبئة النموذج بنجاح');
      } else {
        console.log('النموذج مملوء بالفعل، لا حاجة لإعادة التعبئة');
      }
    }
  }, [article, loading, form]);

  // معالجة حالة عدم وجود ID
  if (!id) {
    console.error('لا يوجد ID للمقال');
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>خطأ في تحميل المقال</h2>
        <p>لم يتم تحديد معرف المقال</p>
        <Button type="primary" onClick={() => navigate('/admin/articles')}>
          العودة لقائمة المقالات
        </Button>
      </div>
    );
  }

  const handleImageChange = (info) => {
    console.log('تغيير الصورة:', info);
    
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      console.log('تم اختيار صورة جديدة:', file.name, 'حجم:', file.size);
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        message.error('يسمح فقط بملفات الصور');
        return;
      }
      
      // التحقق من حجم الملف (2MB)
      if (file.size > 2 * 1024 * 1024) {
        message.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      console.log('تم تحديث الصورة بنجاح');
    } else if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      if (file) {
        console.log('تم اختيار صورة من fileList:', file.name);
        
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          message.error('يسمح فقط بملفات الصور');
          return;
        }
        
        // التحقق من حجم الملف (2MB)
        if (file.size > 2 * 1024 * 1024) {
          message.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
          return;
        }
        
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        console.log('تم تحديث الصورة من fileList بنجاح');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // تشخيص معوقات التحديث أولاً
      console.log('🔍 بدء تشخيص معوقات التحديث...');
      const diagnosis = await diagnoseUpdateIssues(values);
      
      if (!diagnosis.canProceed) {
        console.log('❌ تم اكتشاف معوقات خطيرة، لا يمكن المتابعة');
        console.log('المعوقات:', diagnosis.issues);
        message.error('تم اكتشاف مشاكل خطيرة في البيانات. راجع Console للتفاصيل.');
        setLoading(false);
        return;
      }
      
      // عرض التحذيرات إذا وجدت
      if (diagnosis.warnings && diagnosis.warnings.length > 0) {
        console.log('⚠️ تحذيرات:', diagnosis.warnings);
        message.warning('تم اكتشاف تحذيرات. سيتم المتابعة مع إصلاح المشاكل تلقائياً.');
      }

      console.log('✅ لا توجد معوقات، متابعة التحديث...');

      // تشخيص وإصلاح البيانات قبل الإرسال
      const submitData = {
        title: values.title,
        content: content || values.content || '',
        sectionId: values.sectionId
      };
      
      const { issues, fixes, fixedData } = diagnoseAndFix(submitData, 'إرسال المقال');

      // تنظيف المحتوى
      let rawContent = fixedData.content || '';
      let cleaned = cleanContent(rawContent);

      // فحص إضافي: إزالة أي عناصر غير مرغوبة
      cleaned = cleaned.replace(/<script.*?>.*?<\/script>/gi, '');
      cleaned = cleaned.replace(/<iframe.*?>.*?<\/iframe>/gi, '');
      
      // تنظيف إضافي للمحتوى
      cleaned = cleaned.replace(/console-group[^>]*>.*?<\/div>/gs, '');
      cleaned = cleaned.replace(/console-message[^>]*>.*?<\/div>/gs, '');
      
      // إزالة div فارغة متعددة
      cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');
      
      // تنظيف المسافات الزائدة
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      // تأكد من الحقول المطلوبة
      if (!fixedData.title || !fixedData.title.trim()) {
        message.error('العنوان مطلوب');
        setLoading(false);
        return;
      }
      
      // إذا كان العنوان قصير جداً، أضف عنوان افتراضي
      if (fixedData.title.length < 3) {
        fixedData.title = 'عنوان المقال';
        console.log('تم إضافة عنوان افتراضي');
      }
      
      if (!cleaned || !cleaned.trim()) {
        message.error('المحتوى مطلوب');
        setLoading(false);
        return;
      }
      
      // إذا كان المحتوى قصير جداً، أضف محتوى افتراضي
      if (cleaned.length < 10) {
        cleaned = '<p>محتوى المقال</p>';
        console.log('تم إضافة محتوى افتراضي');
      }
      
      // إذا لم يتم اختيار قسم، استخدم القسم الأول المتاح
      if (!fixedData.sectionId && sections.length > 0) {
        fixedData.sectionId = sections[0].id;
        console.log('تم اختيار القسم الأول افتراضياً:', sections[0].name);
      }
      
      if (!fixedData.sectionId) {
        message.error('لا توجد أقسام متاحة. يرجى إضافة قسم أولاً.');
        setLoading(false);
        return;
      }
      
      // تأكد من أن القسم صالح
      const selectedSection = sections.find(s => s.id === fixedData.sectionId);
      if (!selectedSection) {
        console.log('القسم المختار غير صالح، استخدام القسم الأول');
        if (sections.length > 0) {
          fixedData.sectionId = sections[0].id;
        } else {
          message.error('لا توجد أقسام متاحة. يرجى إضافة قسم أولاً.');
          setLoading(false);
          return;
        }
      }

      // سجل المحتوى النهائي
      console.log('📤 المحتوى النهائي المرسل:', cleaned);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('title', fixedData.title);
      formData.append('content', cleaned);
      formData.append('sectionId', fixedData.sectionId);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      console.log('🚀 إرسال البيانات إلى الخادم...');
      const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('📥 استجابة الخادم:', res.status, res.statusText);

      if (res.ok) {
        const result = await res.json();
        console.log('✅ تم تحديث المقال بنجاح:', result);
        message.success('تم تحديث المقال بنجاح');
        navigate('/admin/articles');
      } else {
        const errorData = await res.json();
        console.error('❌ خطأ في تحديث المقال:', errorData);
        
        // تشخيص إضافي للخطأ
        console.log('🔍 تشخيص خطأ الخادم:');
        console.log('رمز الخطأ:', res.status);
        console.log('رسالة الخطأ:', errorData.error);
        console.log('تفاصيل الخطأ:', errorData);
        
        message.error(errorData.error || 'تعذر تحديث المقال');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث المقال:', error);
      console.log('🔍 تفاصيل الخطأ:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !article) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>جاري تحميل المقال...</p>
        <p>ID المقال: {id}</p>
      </div>
    );
  }

  if (!article && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>المقال غير موجود</h2>
        <p>تعذر العثور على المقال المطلوب</p>
        <p>ID المقال: {id}</p>
        <Button type="primary" onClick={() => navigate('/admin/articles')}>
          العودة لقائمة المقالات
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/articles')}
              style={{ marginRight: '8px' }}
            >
              عودة
            </Button>
            تعديل المقال
          </div>
        }
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ title: '', content: '', sectionId: '' }}
        >
          {/* زر التشخيص */}
          <div style={{ marginBottom: '16px', textAlign: 'right' }}>
            <Button 
              type="dashed" 
              onClick={() => {
                diagnoseEditor();
                const formValues = form.getFieldsValue();
                diagnoseAndFix(formValues, 'فحص النموذج');
              }}
              icon={<SearchOutlined />}
              style={{ marginLeft: '8px' }}
            >
              تشخيص المشاكل
            </Button>
            <Button 
              type="primary" 
              danger
              onClick={async () => {
                const formValues = form.getFieldsValue();
                await diagnoseUpdateIssues(formValues);
              }}
              icon={<SearchOutlined />}
            >
              تشخيص معوقات التحديث
            </Button>
          </div>

          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="عنوان المقال"
                rules={[
                  { required: true, message: 'يرجى إدخال عنوان المقال' },
                  { min: 5, message: 'يجب أن يكون العنوان 5 أحرف على الأقل' },
                  { max: 100, message: 'يجب أن لا يتجاوز العنوان 100 حرف' }
                ]}
              >
                <Input placeholder="أدخل عنوان المقال" />
              </Form.Item>

              <Form.Item
                name="sectionId"
                label="القسم"
                rules={[{ required: true, message: 'يرجى اختيار القسم' }]}
              >
                <Select placeholder="اختر القسم">
                  {sections.map(section => (
                    <Option key={section.id} value={section.id}>
                      {section.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="content"
                label="محتوى المقال"
                rules={[{ required: true, message: 'يرجى إدخال محتوى المقال' }]}
              >
                <Editor
                  apiKey='22zijbip010v9lxhdxb3yov0dd6lqug7j04lrsxyob7pa60x'
                  value={content}
                  onEditorChange={(newContent) => {
                    setContent(newContent);
                    form.setFieldsValue({ content: newContent });
                  }}
                  init={{
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
                    height: 400,
                    language: 'ar',
                    directionality: 'rtl',
                    content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
                    images_upload_url: 'http://localhost:5000/api/upload',
                    images_upload_handler: async (blobInfo, progress) => {
                      try {
                        const formData = new FormData();
                        formData.append('image', blobInfo.blob(), blobInfo.filename());
                        
                        const response = await fetch('http://localhost:5000/api/upload/image', {
                          method: 'POST',
                          body: formData
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          return result.url;
                        } else {
                          throw new Error('فشل في رفع الصورة');
                        }
                      } catch (error) {
                        console.error('خطأ في رفع الصورة:', error);
                        throw error;
                      }
                    },
                    file_picker_callback: (callback, value, meta) => {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      
                      input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('image', file);
                            
                            const response = await fetch('http://localhost:5000/api/upload/image', {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              callback(result.url, { title: file.name });
                            } else {
                              throw new Error('فشل في رفع الصورة');
                            }
                          } catch (error) {
                            console.error('خطأ في رفع الصورة:', error);
                          }
                        }
                      };
                      
                      input.click();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="صورة المقال">
                <div style={{ marginBottom: '16px' }}>
                  {article.image && !imageFile && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        الصورة الحالية:
                      </p>
                      <img 
                        src={`http://localhost:5000${article.image}`} 
                        alt="صورة المقال الحالية"
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #d9d9d9'
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={imagePreview} 
                        alt="preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(255,255,255,0.8)',
                          border: 'none'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                          console.log('تم إزالة الصورة');
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>رفع صورة</div>
                    </div>
                  )}
                </Upload>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  الصورة اختيارية. إذا لم ترفع صورة جديدة، سيتم الاحتفاظ بالصورة الحالية.
                </p>
                {imageFile && (
                  <p style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>
                    ✓ تم اختيار صورة جديدة: {imageFile.name}
                  </p>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ marginRight: '8px' }}
            >
              تحديث المقال
            </Button>
            <Button 
              onClick={() => navigate('/admin/articles')}
              size="large"
            >
              إلغاء
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditArticle;
