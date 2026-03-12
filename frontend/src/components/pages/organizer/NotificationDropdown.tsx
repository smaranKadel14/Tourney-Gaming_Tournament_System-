import React, { useEffect, useState, useRef } from "react";
import "./NotificationDropdown.css";
import { Bell, Check, Clock, Info } from "lucide-react";
import { getToken } from "../../../utils/auth";

export type NotificationType = "registration" | "payment" | "tournament_update" | "system";

export interface INotification {
  _id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = getToken();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Close on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token, onClose]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "m ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return Math.floor(seconds) + "s ago";
    } catch {
      return "just now";
    }
  };

  return (
    <div className="nd" ref={dropdownRef}>
      <div className="nd__header">
        <h3 className="nd__title">Notifications</h3>
        <button className="nd__readAll" onClick={markAllAsRead}>Mark all read</button>
      </div>

      <div className="nd__list">
        {loading ? (
          <div className="nd__loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="nd__empty">
            <Bell size={40} className="nd__emptyIcon" />
            <p>No new notifications</p>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>We'll notify you here when things happen.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={`nd__item ${n.isRead ? "" : "nd__item--unread"}`}>
              <div className="nd__icon">
                {n.type === "registration" ? <Bell size={18} /> : <Info size={18} />}
              </div>
              <div className="nd__content">
                <p className="nd__message">{n.message}</p>
                <div className="nd__meta">
                  <span className="nd__time">
                    <Clock size={12} /> {getTimeAgo(n.createdAt)}
                  </span>
                  {!n.isRead && (
                    <button className="nd__action" onClick={() => markAsRead(n._id)}>
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="nd__footer">
        <button className="nd__viewAll">View All Notifications</button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
