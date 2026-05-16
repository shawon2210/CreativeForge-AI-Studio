# CreativeForge AI Studio: Modern UI Component Plan

## Design System Foundation
### Inspired by: RunwayML, Leonardo AI, Linear, Figma
### Core Principles (from your UX preferences):
- Mobile-first responsive (360px/768px/1024px+ breakpoints)
- 48x48px minimum tap targets
- Thumb-zone primary actions (bottom 40% on mobile)
- High-contrast text (WCAG AA compliant)
- Skeleton loaders over spinners
- No performance-hurting animations

---

## 1. Design Tokens (packages/config/themes.ts)
```typescript
export const theme = {
  colors: {
    // Premium dark base
    background: {
      primary: '#0a0a0f',
      secondary: '#12121a',
      tertiary: '#1a1a25'
    },
    // Glassmorphism accents
    glass: {
      light: 'rgba(255,255,255,0.05)',
      medium: 'rgba(255,255,255,0.1)',
      border: 'rgba(255,255,255,0.15)'
    },
    // AI futuristic accents
    accent: {
      primary: '#6366f1', // Indigo-500
      secondary: '#8b5cf6', // Violet-500
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    text: {
      primary: '#f8fafc', // High contrast white
      secondary: '#94a3b8',
      muted: '#64748b'
    }
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px'
  },
  breakpoints: {
    mobile: '360px',
    tablet: '768px',
    desktop: '1024px'
  },
  animation: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
}
```

---

## 2. Component Hierarchy (Atomic Design)
### Atoms (packages/ui/src/atoms/)
- `Button` - 48x48px min, primary/secondary/ghost variants
- `Input` - Text, password, search with icon support
- `Badge` - Status indicators (generating, complete, error)
- `Skeleton` - Card, text, image skeletons
- `Toast` - Notification toasts
- `Icon` - Lucide React wrapper with size variants
- `Toggle` - Theme, sidebar, panel toggles

### Molecules (packages/ui/src/molecules/)
- `FormField` - Label + input + validation message
- `GenerationCard` - Image/text preview with actions
- `ProgressRing` - Circular progress for AI generation
- `ModelSelector` - Dropdown for AI model selection
- `ParameterSlider` - CFG scale, steps, strength controls
- `DropZone` - Drag-and-drop image upload

### Organisms (packages/ui/src/organisms/)
- `Sidebar` - Collapsible navigation with workspace switcher
- `TopBar` - Search, notifications, user menu, command palette
- `WorkspacePanel` - Dockable/resizeable work area
- `GenerationHistory` - Scrollable list of past generations
- `WorkflowEditor` - Node-based AI pipeline editor
- `AssetManager` - Grid/list view of project assets

### Templates (packages/ui/src/templates/)
- `DashboardLayout` - Sidebar + top bar + main content
- `AuthLayout` - Centered card for login/register
- `WorkspaceLayout` - Full-screen creative workspace
- `SettingsLayout` - Tabbed settings panels

---

## 3. State Management (Zustand Slices)
### Store Structure (apps/web/src/store/)
```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
}

// generationStore.ts
interface GenerationState {
  activeGenerations: Generation[];
  history: Generation[];
  startGeneration: (params) => Promise<void>;
  cancelGeneration: (id) => void;
}

// uiStore.ts
interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  activePanel: string | null;
  toggleTheme: () => void;
}
```

---

## 4. Routing Plan (React Router v7)
```
/ --> Dashboard (redirect to /dashboard if authenticated)
/login --> Login page
/register --> Registration page
/dashboard --> Project dashboard with recent generations
/workspace/:projectId --> Main creative workspace
/workspace/:projectId/text --> Text generation panel
/workspace/:projectId/image --> Image generation panel
/workspace/:projectId/remix --> Image remix panel
/workspace/:projectId/workflow --> Node-based workflow editor
/projects --> Project management
/assets --> Asset manager
/settings --> User/team settings
```

---

## 5. Animation Strategy (Framer Motion)
- **Page transitions**: Fade + slide (300ms cubic-bezier)
- **Panel docking**: Smooth resize with spring physics
- **Generation progress**: Animated progress rings
- **Skeleton loaders**: Shimmer animation (CSS only for performance)
- **No excessive animations**: Only functional/feedback animations
- **Reduced motion support**: `prefers-reduced-motion` media query

---

## 6. Responsive Behavior
| Breakpoint | Layout | Interactions |
|------------|--------|--------------|
| 360px (Mobile) | Single column, bottom nav | Thumb-zone buttons, swipe gestures |
| 768px (Tablet) | Two-column, collapsible sidebar | Touch + mouse, dockable panels |
| 1024px+ (Desktop) | Three-column, full sidebar | Mouse/keyboard, drag-and-drop, keyboard shortcuts |

---

## 7. Accessibility Features
- 48x48px minimum touch targets
- High contrast text (4.5:1 ratio)
- Keyboard navigation for all interactive elements
- Focus-visible glow effects
- Screen reader friendly labels
- Reduced motion support