/**
 * إعدادات خاصة بـ Render
 * يضمن أن التطبيق يعمل بشكل صحيح على Render
 */

export const renderConfig = {
  // إعدادات البورت - Render يتطلب PORT محدد
  port: process.env.PORT,
  
  // إعدادات الـ host
  host: '0.0.0.0',
  
  // إعدادات البيئة
  environment: process.env.NODE_ENV || 'development',
  
  // التحقق من صحة الإعدادات
  validateConfig() {
    const errors = [];
    
    // التحقق من وجود PORT - مطلوب دائماً
    if (!process.env.PORT) {
      errors.push('PORT environment variable is required');
    } else {
      // التحقق من أن PORT رقم صحيح
      const portNum = parseInt(process.env.PORT);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        errors.push('PORT must be a valid number between 1 and 65535');
      }
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
    console.log(`📋 Port: ${process.env.PORT}`);
    console.log(`📋 Host: ${this.host}`);
    console.log(`📋 Environment: ${this.environment}`);
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
