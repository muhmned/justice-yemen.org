/**
 * إعدادات خاصة بـ Render
 * يضمن أن التطبيق يعمل بشكل صحيح على Render
 */

export const renderConfig = {
  // إعدادات البورت
  port: process.env.PORT || 5000,
  
  // إعدادات الـ host
  host: '0.0.0.0',
  
  // إعدادات البيئة
  environment: process.env.NODE_ENV || 'development',
  
  // التحقق من صحة الإعدادات
  validateConfig() {
    const errors = [];
    
    // التحقق من وجود PORT في الإنتاج
    if (this.environment === 'production' && !process.env.PORT) {
      errors.push('PORT environment variable is required in production');
    }
    
    // التحقق من وجود متغيرات مطلوبة
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET environment variable is required');
    }
    
    if (errors.length > 0) {
      console.error('❌ Configuration errors:');
      errors.forEach(error => console.error(`   - ${error}`));
      throw new Error('Invalid configuration for Render deployment');
    }
    
    console.log('✅ Render configuration validated successfully');
    return true;
  },
  
  // معلومات التشخيص
  getDiagnosticInfo() {
    return {
      port: this.port,
      host: this.host,
      environment: this.environment,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      isProduction: this.environment === 'production',
      isRender: process.env.RENDER === 'true'
    };
  }
};

export default renderConfig;
