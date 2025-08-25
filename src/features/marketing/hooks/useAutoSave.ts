import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { ContentHistory, ContentVersion } from '../types/marketing';

interface AutoSaveOptions {
  interval?: number; // in milliseconds
  maxVersions?: number;
  enableSessionRecovery?: boolean;
  storageKey?: string;
}

interface AutoSaveState {
  isAutoSaving: boolean;
  lastSaved?: Date;
  versions: ContentVersion[];
  isDirty: boolean;
  sessionRecoveryData?: any;
}

export function useAutoSave(
  content: string,
  contentId: string | null,
  onSave: (content: string, version?: ContentVersion) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const {
    interval = 30000, // 30 seconds
    maxVersions = 10,
    enableSessionRecovery = true,
    storageKey = 'marketing-autosave'
  } = options;

  const { showToast } = useToast();
  const [state, setState] = useState<AutoSaveState>({
    isAutoSaving: false,
    versions: [],
    isDirty: false
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef<string>(content);
  const currentUserRef = useRef<string>('current-user'); // This should come from auth context

  // Create a new version
  const createVersion = useCallback((content: string, changeNote?: string): ContentVersion => {
    return {
      id: `version_${Date.now()}`,
      content,
      createdAt: new Date(),
      createdBy: currentUserRef.current,
      changeNote
    };
  }, []);

  // Save to localStorage for session recovery
  const saveToSession = useCallback((data: any) => {
    if (!enableSessionRecovery) return;
    
    try {
      const sessionData = {
        ...data,
        timestamp: new Date().toISOString(),
        contentId
      };
      localStorage.setItem(`${storageKey}_session`, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save to session storage:', error);
    }
  }, [enableSessionRecovery, storageKey, contentId]);

  // Load from localStorage for session recovery
  const loadFromSession = useCallback((): any => {
    if (!enableSessionRecovery) return null;
    
    try {
      const sessionData = localStorage.getItem(`${storageKey}_session`);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        // Only return data for the current content ID
        if (parsed.contentId === contentId) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load from session storage:', error);
    }
    return null;
  }, [enableSessionRecovery, storageKey, contentId]);

  // Clear session data
  const clearSession = useCallback(() => {
    if (!enableSessionRecovery) return;
    
    try {
      localStorage.removeItem(`${storageKey}_session`);
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }, [enableSessionRecovery, storageKey]);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!content || content === lastContentRef.current) return;

    setState(prev => ({ ...prev, isAutoSaving: true }));

    try {
      // Create a new version
      const version = createVersion(content, 'Auto-save');
      
      // Save the content
      await onSave(content, version);

      setState(prev => {
        const newVersions = [version, ...prev.versions].slice(0, maxVersions);
        return {
          ...prev,
          isAutoSaving: false,
          lastSaved: new Date(),
          versions: newVersions,
          isDirty: false
        };
      });

      lastContentRef.current = content;
      
      // Save to session storage
      saveToSession({
        content,
        versions: state.versions,
        lastSaved: new Date()
      });

    } catch (error) {
      setState(prev => ({ ...prev, isAutoSaving: false }));
      console.error('Auto-save failed:', error);
    }
  }, [content, onSave, createVersion, maxVersions, saveToSession, state.versions]);

  // Manual save function
  const saveNow = useCallback(async (changeNote?: string) => {
    if (!content) return;

    setState(prev => ({ ...prev, isAutoSaving: true }));

    try {
      const version = createVersion(content, changeNote || 'Manual save');
      await onSave(content, version);

      setState(prev => {
        const newVersions = [version, ...prev.versions].slice(0, maxVersions);
        return {
          ...prev,
          isAutoSaving: false,
          lastSaved: new Date(),
          versions: newVersions,
          isDirty: false
        };
      });

      lastContentRef.current = content;
      clearSession(); // Clear session data after successful manual save
      
      showToast({
        type: 'success',
        title: 'Content saved successfully'
      });

    } catch (error) {
      setState(prev => ({ ...prev, isAutoSaving: false }));
      showToast({
        type: 'error',
        title: 'Failed to save content'
      });
    }
  }, [content, onSave, createVersion, maxVersions, clearSession, showToast]);

  // Restore from version
  const restoreVersion = useCallback((versionId: string): string | null => {
    const version = state.versions.find(v => v.id === versionId);
    if (version) {
      showToast({
        type: 'success',
        title: 'Version restored',
        message: `Restored content from ${version.createdAt.toLocaleString()}`
      });
      return version.content;
    }
    return null;
  }, [state.versions, showToast]);

  // Delete version
  const deleteVersion = useCallback((versionId: string) => {
    setState(prev => ({
      ...prev,
      versions: prev.versions.filter(v => v.id !== versionId)
    }));
    
    showToast({
      type: 'success',
      title: 'Version deleted'
    });
  }, [showToast]);

  // Check for session recovery on mount
  useEffect(() => {
    const sessionData = loadFromSession();
    if (sessionData && sessionData.content && sessionData.timestamp) {
      const sessionTime = new Date(sessionData.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - sessionTime.getTime();
      
      // Only offer recovery if session is less than 1 hour old
      if (timeDiff < 3600000) {
        setState(prev => ({
          ...prev,
          sessionRecoveryData: sessionData,
          versions: sessionData.versions || []
        }));
      } else {
        clearSession();
      }
    }
  }, [loadFromSession, clearSession]);

  // Set up auto-save interval
  useEffect(() => {
    // Check if content has changed
    if (content !== lastContentRef.current) {
      setState(prev => ({ ...prev, isDirty: true }));
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(performAutoSave, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, interval, performAutoSave]);

  // Save to session storage when content changes (for recovery)
  useEffect(() => {
    if (content && enableSessionRecovery) {
      const debounceTimeout = setTimeout(() => {
        saveToSession({
          content,
          versions: state.versions,
          isDirty: state.isDirty
        });
      }, 1000);

      return () => clearTimeout(debounceTimeout);
    }
  }, [content, state.versions, state.isDirty, enableSessionRecovery, saveToSession]);

  // Accept session recovery
  const acceptSessionRecovery = useCallback(() => {
    if (state.sessionRecoveryData) {
      setState(prev => ({
        ...prev,
        sessionRecoveryData: undefined
      }));
      return state.sessionRecoveryData.content;
    }
    return null;
  }, [state.sessionRecoveryData]);

  // Reject session recovery
  const rejectSessionRecovery = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionRecoveryData: undefined
    }));
    clearSession();
  }, [clearSession]);

  // Force save (ignores auto-save interval)
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performAutoSave();
  }, [performAutoSave]);

  // Get time since last save
  const getTimeSinceLastSave = useCallback((): string => {
    if (!state.lastSaved) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - state.lastSaved.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }, [state.lastSaved]);

  return {
    ...state,
    saveNow,
    restoreVersion,
    deleteVersion,
    forceSave,
    acceptSessionRecovery,
    rejectSessionRecovery,
    getTimeSinceLastSave,
    hasSessionRecovery: !!state.sessionRecoveryData
  };
}