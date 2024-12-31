import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';

// Keyboard shortcut definitions
const SHORTCUTS = {
  // Navigation
  'mod+1': { action: 'navigate', path: '/inventory', description: 'Go to Inventory' },
  'mod+2': { action: 'navigate', path: '/store', description: 'Go to Store' },
  'mod+3': { action: 'navigate', path: '/analytics', description: 'Go to Analytics' },
  'mod+,': { action: 'navigate', path: '/settings', description: 'Go to Settings' },

  // Actions
  'mod+n': { action: 'newProduct', description: 'New Product' },
  'mod+f': { action: 'focusSearch', description: 'Focus Search' },
  'mod+s': { action: 'save', description: 'Save' },
  'mod+shift+s': { action: 'saveAll', description: 'Save All' },
  'mod+d': { action: 'duplicate', description: 'Duplicate Item' },
  'mod+backspace': { action: 'delete', description: 'Delete Item' },

  // View
  'mod+[': { action: 'collapseSidebar', description: 'Collapse Sidebar' },
  'mod+]': { action: 'expandSidebar', description: 'Expand Sidebar' },
  'mod+g': { action: 'toggleGrid', description: 'Toggle Grid View' },
  'mod+shift+g': { action: 'toggleDetail', description: 'Toggle Detail View' },
};

// Helper to check if modifier key is pressed
const isModifierPressed = (e) => navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;

// Convert key combination to string
const getKeyCombo = (e) => {
  const mod = navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
  const shift = e.shiftKey ? '⇧' : '';
  const alt = e.altKey ? '⌥' : '';
  const key = e.key.toUpperCase();
  return `${mod}${shift}${alt}${key}`;
};

export const useKeyboardShortcuts = (handlers = {}) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if input is focused
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      const mod = isModifierPressed(e);
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();
      const combo = `${mod ? 'mod+' : ''}${shift ? 'shift+' : ''}${key}`;

      const shortcut = SHORTCUTS[combo];
      if (!shortcut) return;

      e.preventDefault();

      if (handlers[shortcut.action]) {
        handlers[shortcut.action]();
      } else {
        switch (shortcut.action) {
          case 'navigate':
            navigate(shortcut.path);
            break;

          case 'focusSearch':
            const searchInput = document.querySelector('[data-shortcut="search"]');
            searchInput?.focus();
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handlers]);

  return SHORTCUTS;
};

// Helper hook for keyboard shortcut overlay
export const useKeyboardOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Show overlay when holding Command/Ctrl
      if (isModifierPressed(e) && !showOverlay) {
        setShowOverlay(true);
      }
    };

    const handleKeyUp = (e) => {
      // Hide overlay when releasing Command/Ctrl
      if (!isModifierPressed(e) && showOverlay) {
        setShowOverlay(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showOverlay]);

  return showOverlay;
};

export const KeyboardShortcutOverlay = () => {
  const showOverlay = useKeyboardOverlay();
  const shortcuts = useKeyboardShortcuts();

  if (!showOverlay) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        p: 3,
        zIndex: 9999,
        maxWidth: 480,
        width: '90%',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Keyboard Shortcuts
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(shortcuts).map(([combo, shortcut]) => (
          <Grid item xs={6} key={combo}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                sx={{
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  mr: 1,
                }}
              >
                {combo.replace('mod+', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl+')}
              </Typography>
              <Typography variant="body2" color="grey.600">
                {shortcut.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
