import React, { useState } from 'react';
import { Card, Typography, Button, List, Tag } from 'antd';

const { Title, Text } = Typography;

const Logs = () => {
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appErrors') || '[]').reverse();
    } catch {
      return [];
    }
  });

  const clearLogs = () => {
    localStorage.removeItem('appErrors');
    setLogs([]);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <Card bordered>
        <Title level={3}>سجل العمليات والأخطاء</Title>
        <Button danger onClick={clearLogs} style={{ marginBottom: 16 }}>
          مسح السجل
        </Button>
        {logs.length === 0 ? (
          <Text type="secondary">لا يوجد أخطاء أو عمليات مسجلة.</Text>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={logs}
            renderItem={(item, idx) => (
              <List.Item key={idx}>
                <Card type="inner" style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color={item.status === 'success' ? 'green' : 'red'}>{item.status === 'success' ? 'نجاح' : 'خطأ'}</Tag>
                      <Tag color="blue">{item.context}</Tag>
                    </div>
                    <Text type="secondary">{item.time}</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <b>الرسالة:</b> <Text>{item.message}</Text>
                  </div>
                  {item.extra && Object.keys(item.extra).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <b>تفاصيل إضافية:</b>
                      <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4 }}>
                        {JSON.stringify(item.extra, null, 2)}
                      </pre>
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Logs; 