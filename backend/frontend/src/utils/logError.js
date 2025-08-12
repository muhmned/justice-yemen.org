export function logOperation(context, status, message, extra = {}) {
  const log = {
    context,      // مثال: "Login", "FileUpload"
    status,       // "success" أو "error"
    message,      // وصف العملية أو الخطأ
    extra,        // تفاصيل إضافية (response, request, ... إلخ)
    time: new Date().toISOString(),
  };
  // سجل في الكونسول
  if (status === "error") {
    console.error("AppError:", log);
  } else {
    console.log("AppOperation:", log);
  }
  // سجل في localStorage (احتفظ بآخر 50 عملية فقط)
  const logs = JSON.parse(localStorage.getItem("appErrors") || "[]");
  logs.push(log);
  if (logs.length > 50) logs.shift();
  localStorage.setItem("appErrors", JSON.stringify(logs));
} 