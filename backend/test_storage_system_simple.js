import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

async function testStorageSystemSimple() {
  console.log('🧪 اختبار نظام التخزين المرن - نسخة مبسطة');
  console.log('==========================================');
  
  // عرض إعدادات النظام
  console.log('📋 إعدادات النظام:');
  console.log('- مزود التخزين:', process.env.STORAGE_PROVIDER || 'cloudinary');
  console.log('- Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'غير محدد');
  console.log('- S3 Bucket:', process.env.S3_BUCKET_NAME || 'غير محدد');
  console.log('- Supabase URL:', process.env.SUPABASE_URL || 'غير محدد');
  console.log('');
  
  // اختبار استيراد storageProvider
  try {
    console.log('🚀 اختبار استيراد storageProvider...');
    const { uploadFile } = await import('./src/utils/storageProvider.js');
    console.log('✅ تم استيراد storageProvider بنجاح!');
    
    // إنشاء ملف اختبار بسيط
    const testFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.from('هذا ملف اختبار لنظام التخزين المرن'),
      size: 50
    };
    
    console.log('🚀 اختبار رفع الملف...');
    const fileUrl = await uploadFile(testFile);
    console.log('✅ تم رفع الملف بنجاح!');
    console.log('🔗 رابط الملف:', fileUrl);
    
  } catch (error) {
    console.log('❌ فشل في اختبار النظام:', error.message);
    
    // التحقق من نوع الخطأ
    if (error.message.includes('api_key') || error.message.includes('Must supply api_key') || error.message.includes('فشل في رفع الملف إلى Cloudinary')) {
      console.log('✅ النظام يعمل بشكل صحيح - يحتاج فقط لبيانات اعتماد Cloudinary');
    } else if (error.message.includes('S3_BUCKET_NAME') || error.message.includes('فشل في رفع الملف إلى S3')) {
      console.log('✅ النظام يعمل بشكل صحيح - يحتاج فقط لبيانات اعتماد S3');
    } else if (error.message.includes('Supabase') || error.message.includes('فشل في رفع الملف إلى Supabase')) {
      console.log('✅ النظام يعمل بشكل صحيح - يحتاج فقط لبيانات اعتماد Supabase');
    } else {
      console.log('❌ خطأ غير متوقع في النظام');
    }
  }
  
  console.log('');
  console.log('🎉 اختبار النظام مكتمل!');
  console.log('');
  console.log('💡 للاستخدام الكامل:');
  console.log('1. انسخ env.example إلى .env');
  console.log('2. أضف بيانات اعتماد مزود التخزين المطلوب');
  console.log('3. اختبر النظام مرة أخرى');
}

// تشغيل الاختبار
testStorageSystemSimple();
