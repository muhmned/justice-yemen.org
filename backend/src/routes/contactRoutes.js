import express from 'express';
import { body } from 'express-validator';
import { createMessage } from '../controllers/messageController.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// التحقق من صحة البيانات
const contactValidation = [
  {
    field: 'name',
    message: 'الاسم مطلوب',
    validate: (value) => value && value.trim().length >= 2
  },
  {
    field: 'email',
    message: 'البريد الإلكتروني مطلوب وصحيح',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return value && emailRegex.test(value);
    }
  },
  {
    field: 'subject',
    message: 'الموضوع مطلوب',
    validate: (value) => value && value.trim().length >= 3
  },
  {
    field: 'message',
    message: 'الرسالة مطلوبة',
    validate: (value) => value && value.trim().length >= 10
  }
];

// إرسال رسالة اتصال
router.post('/send', logActivity('contact_form', 'user', (req) => `Contact form submitted by ${req.body.email}`), async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = [];
    for (const validation of contactValidation) {
      const value = req.body[validation.field];
      if (!validation.validate(value)) {
        errors.push(validation.message);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors: errors 
      });
    }

    const { name, email, subject, message } = req.body;

    // إنشاء الرسالة في قاعدة البيانات
    await createMessage({ name, email, subject, message });

    // إرسال البريد الإلكتروني للمنظمة
    try {
      const emailData = {
        to: 'justiceorganzation@gmail.com',
        from: email,
        subject: `رسالة جديدة من موقع الويب: ${subject}`,
        text: `
          اسم المرسل: ${name}
          البريد الإلكتروني: ${email}
          الموضوع: ${subject}
          
          محتوى الرسالة:
          ${message}
          
          ---
          تم إرسال هذه الرسالة من نموذج الاتصال في موقع منظمة جاستيس للحقوق والتنمية
          تاريخ الإرسال: ${new Date().toLocaleString('ar-SA')}
        `,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">رسالة جديدة من موقع الويب</h2>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">تفاصيل المرسل:</h3>
                <p><strong>الاسم:</strong> ${name}</p>
                <p><strong>البريد الإلكتروني:</strong> ${email}</p>
                <p><strong>الموضوع:</strong> ${subject}</p>
              </div>
              
              <div style="background-color: #fff; padding: 20px; border-left: 4px solid #667eea; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">محتوى الرسالة:</h3>
                <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                  تم إرسال هذه الرسالة من نموذج الاتصال في موقع منظمة جاستيس للحقوق والتنمية
                </p>
                <p style="color: #999; font-size: 12px;">
                  تاريخ الإرسال: ${new Date().toLocaleString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        `
      };

      // محاكاة إرسال البريد الإلكتروني
      console.log('📧 تم إرسال الرسالة للمنظمة:');
      console.log('إلى:', emailData.to);
      console.log('من:', emailData.from);
      console.log('الموضوع:', emailData.subject);
      console.log('المحتوى:', message);

      // إرسال رسالة تأكيد للمرسل
      const confirmationData = {
        to: email,
        from: 'justiceorganzation@gmail.com',
        subject: 'تأكيد استلام رسالتك - منظمة جاستيس',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">شكراً لك ${name}</h2>
              
              <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
                <h3 style="color: #155724; margin-bottom: 15px;">تم استلام رسالتك بنجاح</h3>
                <p style="color: #155724; margin-bottom: 10px;">
                  <strong>الموضوع:</strong> ${subject}
                </p>
                <p style="color: #155724;">
                  سنقوم بالرد عليك في أقرب وقت ممكن
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">معلومات الاتصال:</h3>
                <p><strong>الهاتف:</strong> 04262918-771678010</p>
                <p><strong>البريد الإلكتروني:</strong> justiceorganzation@gmail.com</p>
                <p><strong>العنوان:</strong> اليمن-تعز-شارع جمال-خلف الكريمي-وسوق ديلوكس</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                  منظمة جاستيس للحقوق والتنمية
                </p>
                <p style="color: #999; font-size: 12px;">
                  تاريخ الإرسال: ${new Date().toLocaleString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        `
      };

      console.log('📧 تم إرسال رسالة التأكيد:');
      console.log('إلى:', confirmationData.to);
      console.log('الموضوع:', confirmationData.subject);

    } catch (emailError) {
      console.error('خطأ في إرسال البريد الإلكتروني:', emailError);
      // لا نريد أن نفشل العملية إذا فشل إرسال البريد الإلكتروني
    }

    // إرجاع النجاح
    res.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح وسنقوم بالرد عليك في أقرب وقت ممكن'
    });

  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى'
    });
  }
});

// جلب معلومات الاتصال
router.get('/info', async (req, res) => {
  try {
    const contactInfo = {
      phone: '04262918-771678010',
      email: 'justiceorganzation@gmail.com',
      address: 'اليمن-تعز-شارع جمال-خلف الكريمي-وسوق ديلوكس',
      description: 'نحن هنا للإجابة على استفساراتك والاستماع إلى آرائك'
    };

    res.json(contactInfo);
  } catch (error) {
    console.error('خطأ في جلب معلومات الاتصال:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب معلومات الاتصال' });
  }
});

export default router;
