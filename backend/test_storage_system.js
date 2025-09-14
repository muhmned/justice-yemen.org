import { uploadFile } from './src/utils/storageProvider.js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء ملف اختبار بسيط
const testFile = {
  originalname: 'test.txt',
  mimetype: 'text/plain',
  buffer: Buffer.from('هذا ملف اختبار لنظام التخزين المرن'),
  size: 50
};

async function testStorageSystem() {
  console.log('🧪 اختبار نظام التخزين المرن');
  console.log('==============================');
  
  // عرض إعدادات النظام
  console.log('📋 إعدادات النظام:');
  console.log('- مزود التخزين:', process.env.STORAGE_PROVIDER || 'cloudinary');
  console.log('- Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'غير محدد');
  console.log('- S3 Bucket:', process.env.S3_BUCKET_NAME || 'غير محدد');
  console.log('- Supabase URL:', process.env.SUPABASE_URL || 'غير محدد');
  console.log('');
  
  try {
    console.log('🚀 بدء اختبار رفع الملف...');
    const fileUrl = await uploadFile(testFile);
    console.log('✅ تم رفع الملف بنجاح!');
    console.log('🔗 رابط الملف:', fileUrl);
    console.log('');
    console.log('🎉 النظام يعمل بشكل صحيح!');
  } catch (error) {
    console.error('❌ فشل في رفع الملف:', error.message);
    console.log('');
    console.log('💡 نصائح للتصحيح:');
    console.log('1. تأكد من إعداد متغيرات البيئة في ملف .env');
    console.log('2. تأكد من صحة بيانات الاعتماد للمزود المحدد');
    console.log('3. تأكد من وجود اتصال بالإنترنت');
    console.log('4. راجع سجلات الخطأ للحصول على مزيد من التفاصيل');
  }
}

// تشغيل الاختبار
testStorageSystem();

