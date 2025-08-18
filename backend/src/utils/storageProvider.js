import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// تكوين S3 Client
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

// تكوين Supabase Client (فقط إذا كان مزود التخزين هو Supabase)
let supabase = null;
if (process.env.STORAGE_PROVIDER === 'supabase') {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('تحذير: متغيرات Supabase غير محددة');
  } else {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
}

/**
 * رفع الملف إلى مزود التخزين المحدد
 * @param {Object} file - ملف multer
 * @returns {Promise<string>} رابط الملف المرفوع
 */
export const uploadFile = async (file) => {
  const storageProvider = process.env.STORAGE_PROVIDER || 'cloudinary';
  console.log("🚀 [uploadFile] STORAGE_PROVIDER =", storageProvider); // 👈 هذا يساعدنا نعرف أي مزود يستخدم
  console.log("📂 الملف المستلم:", file.originalname);

  switch (storageProvider.toLowerCase()) {
    case 'cloudinary':
      return await uploadToCloudinary(file);
    case 's3':
      return await uploadToS3(file);
    case 'supabase':
      return await uploadToSupabase(file);
    default:
      throw new Error(`مزود التخزين غير معروف: ${storageProvider}`);
  }
};
/**
 * رفع الملف إلى Cloudinary
 */
const uploadToCloudinary = async (file) => {
  try {
    // تحويل buffer إلى stream للـ Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'justice_org',
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(file.buffer);
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('خطأ في رفع الملف إلى Cloudinary:', error);
    throw new Error('فشل في رفع الملف إلى Cloudinary');
  }
};

/**
 * رفع الملف إلى Amazon S3
 */
const uploadToS3 = async (file) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME غير محدد في متغيرات البيئة');
    }
    
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `justice_org/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    
    // بناء رابط الملف
    const region = process.env.S3_REGION;
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    
    return url;
  } catch (error) {
    console.error('خطأ في رفع الملف إلى S3:', error);
    throw new Error('فشل في رفع الملف إلى S3');
  }
};

/**
 * رفع الملف إلى Supabase Storage
 */
const uploadToSupabase = async (file) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client غير مهيأ. تأكد من إعداد متغيرات Supabase');
    }
    
    const bucketName = process.env.SUPABASE_BUCKET || 'uploads';
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `justice_org/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // الحصول على الرابط العام
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('خطأ في رفع الملف إلى Supabase:', error);
    throw new Error('فشل في رفع الملف إلى Supabase');
  }
};
