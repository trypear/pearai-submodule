import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { SERVER_URL } from "../../../core/util/parameters";
import * as vscode from 'vscode';

export default function UsageWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  // TODO: get logged in user token 
  const token = "";
  const url = `${SERVER_URL}/get-usage`;

  const getMessage = async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        console.log('Error fetching usage data');
        return;
      }

      const { warning_message } = await res.json();
      if (warning_message) {
        setMessage(warning_message);
        setIsVisible(true); 
        vscode.window.showWarningMessage(warning_message);
      } else {
        setMessage("");
        setIsVisible(false); 
      }
    } catch (error) {
      console.log('Error fetching usage data:', error);
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null; 

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 250, 220, 0.97)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '12px 16px',
        maxWidth: '300px',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      }}
    >
      <div style={{ position: 'relative', paddingRight: '24px' }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
          }}
          aria-label="Close warning"
        >
          <X
            size={18}
            style={{
              color: '#92400e',
            }}
          />
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <AlertTriangle
            size={20}
            style={{
              color: '#d97706',
              marginRight: '12px',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div
            style={{
              flex: 1,
              fontSize: '12px',
              fontWeight: 500,
              color: '#92400e',
            }}
          >
            {message}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        button:hover {
          background-color: rgba(251, 191, 36, 0.2);
        }
      `}</style>
    </div>
  );
}
