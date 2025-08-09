-- سكربت إنشاء مستخدم جديد لقاعدة بيانات PostgreSQL ومنحه جميع الصلاحيات على قاعدة البيانات
-- اسم المستخدم: admin
-- كلمة المرور: admin

-- إنشاء المستخدم
CREATE USER admin WITH PASSWORD 'admin';

-- منح جميع الصلاحيات على قاعدة البيانات
GRANT ALL PRIVILEGES ON DATABASE sam_organization_db TO admin; 