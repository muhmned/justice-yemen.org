import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export { default as ReportsManagement } from './ReportsManagement';

export default function AdminIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/login');
  }, [navigate]);
  return null;
} 