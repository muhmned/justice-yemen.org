// حل بديل للبريد الإلكتروني بدون nodemailer
// يمكن استخدام خدمات البريد الإلكتروني المجانية مثل EmailJS أو إعداد SMTP يدوياً

// وظيفة إرسال رسالة اتصال (محاكاة)
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;

    // محاكاة إرسال البريد الإلكتروني
    console.log('📧 إرسال رسالة اتصال:');
    console.log('من:', email);
    console.log('إلى: justiceorganzation@gmail.com');
    console.log('الموضوع:', subject);
    console.log('المحتوى:', message);

    // في الإنتاج، يمكن استخدام:
    // 1. EmailJS (مجاني)
    // 2. SendGrid (مجاني حتى 100 رسالة/يوم)
    // 3. Mailgun (مجاني حتى 5000 رسالة/شهر)
    // 4. إعداد SMTP يدوياً

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    throw new Error('فشل في إرسال البريد الإلكتروني');
  }
};

// وظيفة إرسال تأكيد للمرسل (محاكاة)
const sendConfirmationEmail = async (contactData) => {
  try {
    const { name, email, subject } = contactData;

    console.log('📧 إرسال تأكيد للمرسل:');
    console.log('من: justiceorganzation@gmail.com');
    console.log('إلى:', email);
    console.log('الموضوع: تأكيد استلام رسالتك - منظمة جاستيس');

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      messageId: `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('خطأ في إرسال تأكيد للمرسل:', error);
    return { success: false };
  }
};

// وظيفة لإنشاء محتوى HTML للرسالة
const createEmailHTML = (contactData, isConfirmation = false) => {
  const { name, email, subject, message } = contactData;

  if (isConfirmation) {
    return `
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
    `;
  }

  return `
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
  `;
};

module.exports = {
  sendContactEmail,
  sendConfirmationEmail,
  createEmailHTML
}; 