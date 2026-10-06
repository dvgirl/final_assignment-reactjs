import React from 'react';

/**
 * ============================================================================
 * STATS CARD COMPONENT (Dashboard Metric Card)
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. Purpose: Reusable KPI metric card used across Dashboard and Reports.
 * 2. Props:
 *    - `title`: Short label (e.g. "Total Visitors", "On-Site Now").
 *    - `value`: Number or main string displayed prominently.
 *    - `icon`: Lucide-React icon component.
 *    - `subtitle` / `change`: Additional contextual text (e.g. "+12% this week").
 *    - `color`: Theme accent ('blue', 'green', 'amber', 'purple', 'red').
 */
const StatsCard = ({ title, value, icon, change, subtitle, color = 'blue' }) => {
  // Classy light color definitions for cards
  const colorMap = {
    blue: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#2563eb',
      iconBg: '#2563eb',
    },
    green: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#059669',
      iconBg: '#059669',
    },
    amber: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#d97706',
      iconBg: '#d97706',
    },
    purple: {
      bg: '#f5f3ff',
      border: '#ddd6fe',
      text: '#7c3aed',
      iconBg: '#7c3aed',
    },
    red: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626',
      iconBg: '#dc2626',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
          {value}
        </div>
        {(subtitle || change) && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {change && (
              <span style={{ color: scheme.text, fontWeight: 700 }}>
                {change}
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        )}
      </div>

      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: scheme.iconBg,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
        }}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
