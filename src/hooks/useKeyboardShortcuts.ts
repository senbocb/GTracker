import { useEffect } from 'react';

interface Shortcuts {
  onLogMatch?: () => void;
  onToggleTimer?: () => void;
  onFocusSearch?: () => void;
}

export const useKeyboardShortcuts = ({ onLogMatch, onToggleTimer, onFocusSearch }: Shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'n' && onLogMatch) {
        e.preventDefault();
        onLogMatch();
      }
      if (e.key.toLowerCase() === 't' && onToggleTimer) {
        e.preventDefault();
        onToggleTimer();
      }
      if (e.key === '/' && onFocusSearch) {
        e.preventDefault();
        onFocusSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLogMatch, onToggleTimer, onFocusSearch]);
};