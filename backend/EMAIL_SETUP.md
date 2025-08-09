# إعداد البريد الإلكتروني

## الحل الحالي (محاكاة)

النظام يعمل حالياً في وضع المحاكاة، حيث يتم طباعة تفاصيل الرسائل في وحدة التحكم. هذا حل مؤقت للتطوير والاختبار.

## الحلول البديلة للإنتاج

### 1. EmailJS (الأسهل - مجاني)
```javascript
// في frontend/src/pages/ContactUsPage.js
import emailjs from '@emailjs/browser';

// إعداد EmailJS
emailjs.init('YOUR_USER_ID');

// إرسال الرسالة
const sendEmail = async (formData) => {
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
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
```

### 2. SendGrid (مجاني حتى 100 رسالة/يوم)
```javascript
// تثبيت: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (contactData) => {
  const msg = {
    to: 'justiceorganzation@gmail.com',
    from: 'noreply@yourdomain.com',
    subject: `رسالة جديدة: ${contactData.subject}`,
    html: createEmailHTML(contactData)
  };
  
  return await sgMail.send(msg);
};
```

### 3. Mailgun (مجاني حتى 5000 رسالة/شهر)
```javascript
// تثبيت: npm install mailgun-js
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

const sendEmail = async (contactData) => {
  const data = {
    from: 'noreply@yourdomain.com',
    to: 'justiceorganzation@gmail.com',
    subject: `رسالة جديدة: ${contactData.subject}`,
    html: createEmailHTML(contactData)
  };
  
  return await mailgun.messages().send(data);
};
```

### 4. إعداد SMTP يدوياً مع Nodemailer

#### خطوات إعداد Gmail:
1. اذهب إلى [Google Account Settings](https://myaccount.google.com/)
2. اختر "Security" من القائمة الجانبية
3. ابحث عن "2-Step Verification" وتأكد من تفعيلها
4. ابحث عن "App passwords"
5. اختر "Mail" و "Other (Custom name)"
6. أدخل اسم مثل "Justice Organization"
7. انسخ كلمة المرور المولدة (16 حرف)

#### إنشاء ملف .env:
```env
# Email Configuration
EMAIL_USER="justiceorganzation@gmail.com"
EMAIL_PASS="your-app-password-here"
```

#### تثبيت Nodemailer:
```bash
cd backend
npm install nodemailer
```

## التبديل إلى الحل الحقيقي

### لاستخدام EmailJS:
1. سجل في [EmailJS](https://www.emailjs.com/)
2. أنشئ خدمة Gmail
3. أنشئ قالب للرسائل
4. أضف الكود في ContactUsPage.js

### لاستخدام SendGrid:
1. سجل في [SendGrid](https://sendgrid.com/)
2. احصل على API Key
3. أضف الكود في emailService.js

### لاستخدام Mailgun:
1. سجل في [Mailgun](https://www.mailgun.com/)
2. احصل على API Key
3. أضف الكود في emailService.js

## ملاحظات مهمة

- **EmailJS**: الأسهل للبدء، لا يحتاج خادم
- **SendGrid**: موثوق ومجاني، يحتاج إعداد في الخادم
- **Mailgun**: ممتاز للمشاريع الكبيرة
- **SMTP**: الحل التقليدي، يحتاج إعداد معقد

## استكشاف الأخطاء

### مشاكل npm:
```bash
# مسح cache
npm cache clean --force

# إعادة تثبيت
rm -rf node_modules package-lock.json
npm install
```

### مشاكل البريد الإلكتروني:
1. تأكد من صحة API Keys
2. تحقق من إعدادات CORS
3. راجع سجلات الخادم
4. تأكد من صحة عنوان البريد الإلكتروني

## التطوير الحالي

النظام يعمل حالياً في وضع المحاكاة، حيث:
- يتم طباعة تفاصيل الرسائل في وحدة التحكم
- يتم إرجاع رسالة نجاح للمستخدم
- يمكن اختبار النموذج بشكل كامل

للتطوير، هذا الحل كافي. للإنتاج، اختر أحد الحلول المذكورة أعلاه. 