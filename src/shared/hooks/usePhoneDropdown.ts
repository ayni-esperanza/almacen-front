import { useCallback, useLayoutEffect, useRef, useState } from 'react';

interface UsePhoneDropdownOptions {
  isOpen: boolean;
  fieldCount: number;
  maxHeight?: number;
  gap?: number;
  theme?: 'light' | 'dark';
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface UsePhoneDropdownResult {
  registerField: (index: number) => (node: HTMLDivElement | null) => void;
  getDropdownStyle: (index: number) => React.CSSProperties;
  handleChange: (
    index: number,
    phone: string,
    countryIso: string | undefined,
    onValue: (cleaned: string) => void
  ) => void;
}

// Centraliza posicionamiento, cierre y tema del dropdown de PhoneInput
export const usePhoneDropdown = (
  { isOpen, fieldCount, maxHeight = 240, gap = 6, theme }: UsePhoneDropdownOptions,
): UsePhoneDropdownResult => {
  const phoneFieldRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [dropdownPositions, setDropdownPositions] = useState<Record<number, DropdownPosition>>({});

  const resolveTheme = () => {
    if (theme) return theme;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  };

  const getColors = () => {
    const resolved = resolveTheme();
    return resolved === 'dark'
      ? { backgroundColor: '#0f172a', color: '#e2e8f0', borderColor: '#334155' }
      : { backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#d1d5db' };
  };

  const updateDropdownPositions = useCallback(() => {
    const next: Record<number, DropdownPosition> = {};
    const viewportHeight = window.innerHeight;

    phoneFieldRefs.current.forEach((node, idx) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const downTop = rect.bottom + gap;
      const wouldOverflow = downTop + maxHeight > viewportHeight;
      const upTop = Math.max(rect.top - gap - maxHeight, 8);
      next[idx] = {
        top: wouldOverflow ? upTop : downTop,
        left: rect.left,
        width: rect.width,
      };
    });

    setDropdownPositions(prev => {
      const sameKeys = Object.keys(next).length === Object.keys(prev).length;
      const isSame =
        sameKeys &&
        Object.entries(next).every(([key, value]) => {
          const prevValue = prev[Number(key)];
          return prevValue &&
            prevValue.top === value.top &&
            prevValue.left === value.left &&
            prevValue.width === value.width;
        });
      return isSame ? prev : next;
    });
  }, [gap, maxHeight]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPositions();
    handleReposition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, fieldCount, updateDropdownPositions]);

  const registerField = (index: number) => (node: HTMLDivElement | null) => {
    if (!node) {
      phoneFieldRefs.current.delete(index);
      return;
    }
    phoneFieldRefs.current.set(index, node);
  };

  const closeDropdown = (index: number) => {
    const node = phoneFieldRefs.current.get(index);
    const activeButton = node?.querySelector<HTMLButtonElement>('.country-selector-button--active');
    if (!activeButton) return;
    requestAnimationFrame(() => activeButton.click());
  };

  const getDropdownStyle = (index: number) => {
    const dropdownStyle = dropdownPositions[index];
    const colors = getColors();
    return dropdownStyle
      ? {
          position: 'fixed' as const,
          top: dropdownStyle.top,
          left: dropdownStyle.left,
          width: dropdownStyle.width,
          maxHeight: `${maxHeight}px`,
          ...colors,
        }
      : { position: 'fixed' as const, ...colors };
  };

  const handleChange = (
    index: number,
    phone: string,
    countryIso: string | undefined,
    onValue: (cleaned: string) => void,
  ) => {
    onValue(phone || '');
    if (countryIso) closeDropdown(index);
  };

  return {
    registerField,
    getDropdownStyle,
    handleChange,
  };
};
