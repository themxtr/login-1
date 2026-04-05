import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, 
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import type { Notification } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: 'true' } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'REVENUE_ADDED': return { icon: <TrendingUp className="text-success" />, color: '#10b981', label: 'Revenue' };
      case 'EXPENSE_ADDED': return { icon: <TrendingDown className="text-danger" />, color: '#ef4444', label: 'Expense' };
      case 'LOW_BALANCE': return { icon: <AlertTriangle className="text-warning" />, color: '#f59e0b', label: 'Low Balance' };
      case 'HIGH_SPENDING': return { icon: <AlertTriangle className="text-danger" />, color: '#ef4444', label: 'High Spending' };
      default: return { icon: <Bell className="text-primary" />, color: '#3b82f6', label: 'System' };
    }
  };

  if (loading) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.isRead === 'false').length;

  return (
    <div className="card-layout max-w-4xl mx-auto">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-box primary">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="section-title">Notifications Center</h2>
            <p className="section-subtitle">
              You have {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary btn-sm" onClick={() => notifications.forEach(n => n.isRead === 'false' && markAsRead(n.id))}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card text-center" style={{ padding: '4rem' }}
            >
              <div style={{ opacity: 0.1, marginBottom: '1.5rem' }}>
                <ShieldCheck size={80} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Everything looks good</h3>
              <p style={{ color: '#6b7280' }}>We'll notify you when something important happens.</p>
            </motion.div>
          ) : (
            notifications.map((notif, idx) => {
              const styles = getTypeStyles(notif.type);
              const isUnread = notif.isRead === 'false';
              
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`card notification-card ${isUnread ? 'unread' : ''}`}
                  style={{ 
                    padding: '1.25rem',
                    borderLeft: `4px solid ${isUnread ? styles.color : 'transparent'}`,
                    background: isUnread ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    cursor: isUnread ? 'pointer' : 'default'
                  }}
                  onClick={() => isUnread && markAsRead(notif.id)}
                >
                  <div className="notif-icon" style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: 'white',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {styles.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: styles.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {styles.label}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={10} />
                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontWeight: isUnread ? 700 : 500, color: isUnread ? '#111827' : '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="unread-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: styles.color, marginTop: '0.5rem' }}></div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
