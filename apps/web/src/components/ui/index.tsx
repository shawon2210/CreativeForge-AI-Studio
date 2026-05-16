import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants: Record<string, React.CSSProperties> = {
  primary: {
    background: '#6366f1',
    color: '#ffffff',
    border: '1px solid #6366f1',
  },
  secondary: {
    background: 'rgba(255,255,255,0.05)',
    color: '#f1f5f9',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  ghost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
  },
};

const buttonSizes: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, borderRadius: 6 },
  md: { padding: '10px 16px', fontSize: 13, borderRadius: 8 },
  lg: { padding: '12px 24px', fontSize: 14, borderRadius: 8 },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 150ms ease',
    fontFamily: 'inherit',
    ...buttonVariants[variant],
    ...buttonSizes[size],
    ...style,
  };

  return (
    <button style={base} disabled={disabled || loading} {...props}>
      {loading ? '◌' : null}
      {children}
    </button>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const cardPadding: Record<string, number> = { sm: 12, md: 20, lg: 28 };

export const Card: React.FC<CardProps> = ({ children, padding = 'md', hover = false, onClick, style }) => {
  const [hovered, setHovered] = React.useState(false);

  const base: React.CSSProperties = {
    background: '#12121a',
    border: `1px solid ${hovered && hover ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 12,
    padding: cardPadding[padding],
    transition: 'border-color 150ms ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      style={base}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'new' | 'beta';
  size?: 'sm' | 'md';
}

const badgeColors: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  error: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  info: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  neutral: { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
  new: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  beta: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const colors = badgeColors[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 4,
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  const base: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 150ms ease',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{label}</label>
      )}
      <input
        style={base}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; }}
        {...props}
      />
      {error && <span style={{ color: '#ef4444', fontSize: 11 }}>{error}</span>}
    </div>
  );
};

// ─── TextArea ─────────────────────────────────────────────────────────────────

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, style, ...props }) => {
  const base: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 150ms ease',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{label}</label>
      )}
      <textarea
        style={base}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        {...props}
      />
    </div>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{label}</label>
      )}
      <select
        style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: '#f1f5f9',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#12121a', color: '#f1f5f9' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius = 4 }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #1a1a25 25%, #222233 50%, #1a1a25 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  />
);

// ─── Divider ──────────────────────────────────────────────────────────────────

export const Divider: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0', ...style }} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card padding="md" style={{ minWidth: 200, flex: 1 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{title}</span>
    </div>
    <div style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
    {subtitle && <div style={{ color: '#64748b', fontSize: 12 }}>{subtitle}</div>}
  </Card>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
    <div style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
    {description && (
      <div style={{ color: '#64748b', fontSize: 13, maxWidth: 400, lineHeight: 1.6 }}>{description}</div>
    )}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: { text: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'new' | 'beta' };
  actions?: React.ReactNode;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, actions, onBack }) => (
  <div style={{ marginBottom: 24 }}>
    {onBack && (
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#6366f1',
          cursor: 'pointer',
          fontSize: 13,
          padding: 0,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ← Back
      </button>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>{title}</h1>
      {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
      {actions && <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
    {subtitle && (
      <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{subtitle}</p>
    )}
  </div>
);

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  if (data.length === 0) {
    return <EmptyState icon="📋" title="No data" description="Nothing to show yet." />;
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1a1a25' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={keyExtractor(item)}
              style={{
                borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    color: '#f1f5f9',
                    fontSize: 13,
                  }}
                >
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          padding: '10px 16px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
          color: activeTab === tab.id ? '#f1f5f9' : '#64748b',
          fontSize: 13,
          fontWeight: activeTab === tab.id ? 600 : 400,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 150ms ease',
          marginBottom: -1,
        }}
      >
        {tab.icon && <span style={{ fontSize: 14 }}>{tab.icon}</span>}
        {tab.label}
      </button>
    ))}
  </div>
);

// ─── ProgressBar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = '#6366f1', height = 6, showLabel = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        flex: 1,
        height,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          background: color,
          borderRadius: height / 2,
          transition: 'width 300ms ease',
        }}
      />
    </div>
    {showLabel && <span style={{ color: '#94a3b8', fontSize: 11, minWidth: 35 }}>{Math.round(value)}%</span>}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 24,
          width,
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 18,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#6366f1' }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }}
  />
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            padding: '4px 8px',
            background: '#1a1a25',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            color: '#f1f5f9',
            fontSize: 11,
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
