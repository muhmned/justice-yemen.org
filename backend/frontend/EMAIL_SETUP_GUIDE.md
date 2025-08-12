# دليل إعداد إرسال البريد الإلكتروني الحقيقي

## المشكلة الحالية
النظام يعمل حالياً في وضع المحاكاة، مما يعني أن الرسائل لا تُرسل فعلياً إلى المنظمة أو للمرسل.

## الحلول المتاحة

### 1. EmailJS (الأسهل والأسرع) ⭐

#### الخطوات:
1. **سجل في EmailJS:**
   - اذهب إلى [EmailJS.com](https://www.emailjs.com/)
   - أنشئ حساب مجاني
   - احصل على User ID

2. **أنشئ خدمة Gmail:**
   - في لوحة التحكم، اذهب إلى "Email Services"
   - اختر "Gmail"
   - أدخل بريد المنظمة: `justiceorganzation@gmail.com`
   - احصل على Service ID

3. **أنشئ قالب للرسائل:**
   - اذهب إلى "Email Templates"
   - أنشئ قالب جديد
   - استخدم هذا المحتوى:

```html
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">رسالة جديدة من موقع الويب</h2>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #667eea; margin-bottom: 15px;">تفاصيل المرسل:</h3>
      <p><strong>الاسم:</strong> {{from_name}}</p>
      <p><strong>البريد الإلكتروني:</strong> {{from_email}}</p>
      <p><strong>الموضوع:</strong> {{subject}}</p>
    </div>
    
    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #667eea; margin-bottom: 20px;">
      <h3 style="color: #2c3e50; margin-bottom: 15px;">محتوى الرسالة:</h3>
      <p style="line-height: 1.6; color: #555;">{{message}}</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        تم إرسال هذه الرسالة من نموذج الاتصال في موقع منظمة جاستيس للحقوق والتنمية
      </p>
    </div>
  </div>
</div>
```

4. **احصل على Template ID**

5. **تثبيت EmailJS:**
```bash
cd frontend
npm install @emailjs/browser
```

6. **تحديث الكود:**
```javascript
// في ContactUsPage.js
import emailjs from '@emailjs/browser';

// إعداد EmailJS
emailjs.init('YOUR_USER_ID');

// تحديث دالة sendEmailViaService
const sendEmailViaService = async (formData) => {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID', // من EmailJS
      'YOUR_TEMPLATE_ID', // من EmailJS
      {
        to_email: 'justiceorganzation@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message
      }
    );
    
    console.log('تم إرسال الرسالة بنجاح:', result);
    return { success: true };
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    throw new Error('فشل في إرسال البريد الإلكتروني');
  }
};
```

### 2. Formspree (بديل سريع)

#### الخطوات:
1. اذهب إلى [Formspree.io](https://formspree.io/)
2. أنشئ حساب مجاني
3. أنشئ نموذج جديد
4. احصل على Form ID
5. استخدم هذا الكود:

```javascript
const sendEmailViaService = async (formData) => {
  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      throw new Error('فشل في إرسال الرسالة');
    }
  } catch (error) {
    throw error;
  }
};
```

### 3. SendGrid (للإنتاج)

#### الخطوات:
1. سجل في [SendGrid](https://sendgrid.com/)
2. احصل على API Key
3. تثبيت المكتبة:
```bash
cd backend
npm install @sendgrid/mail
```

4. تحديث emailService.js:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendContactEmail = async (contactData) => {
  const msg = {
    to: 'justiceorganzation@gmail.com',
    from: 'noreply@yourdomain.com', // يجب أن يكون مسجل في SendGrid
    subject: `رسالة جديدة: ${contactData.subject}`,
    html: createEmailHTML(contactData)
  };
  
  return await sgMail.send(msg);
};
```

## التطبيق السريع (EmailJS)

### 1. تثبيت EmailJS:
```bash
cd frontend
npm install @emailjs/browser
```

### 2. تحديث ContactUsPage.js:
```javascript
import emailjs from '@emailjs/browser';

// إضافة في بداية الملف
emailjs.init('YOUR_USER_ID');

// تحديث دالة sendEmailViaService
const sendEmailViaService = async (formData) => {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: 'justiceorganzation@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message
      }
    );
    
    console.log('تم إرسال الرسالة بنجاح:', result);
    return { success: true };
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    throw new Error('فشل في إرسال البريد الإلكتروني');
  }
};
```

## اختبار النظام

### بعد الإعداد:
1. اذهب إلى صفحة "اتصل بنا"
2. املأ النموذج
3. اضغط "إرسال الرسالة"
4. تحقق من:
   - رسالة النجاح في الموقع
   - وصول الرسالة إلى `justiceorganzation@gmail.com`
   - وصول رسالة التأكيد للمرسل

## ملاحظات مهمة

### EmailJS:
- ✅ مجاني تماماً
- ✅ لا يحتاج خادم
- ✅ إعداد سريع
- ✅ يدعم HTML templates
- ❌ محدودية في عدد الرسائل (200/شهر مجاناً)

### Formspree:
- ✅ مجاني
- ✅ إعداد بسيط جداً
- ✅ لا يحتاج خادم
- ❌ تخصيص محدود

### SendGrid:
- ✅ موثوق ومستقر
- ✅ 100 رسالة/يوم مجاناً
- ✅ تخصيص كامل
- ❌ يحتاج إعداد في الخادم

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ في API Key:** تأكد من صحة المفاتيح
2. **خطأ في Template:** تأكد من صحة متغيرات القالب
3. **خطأ في CORS:** تأكد من إعدادات الخادم
4. **خطأ في Network:** تحقق من الاتصال بالإنترنت

### للتطوير السريع:
استخدم **EmailJS** لأنه الأسهل والأسرع في الإعداد. 