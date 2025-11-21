import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './Autocomplete.module.css';

export interface AutocompleteOption {
    id: string | number;
    label: string;
    subtitle?: string;
    icon?: string;
    data?: any;
}

interface AutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (option: AutocompleteOption) => void;
    options: AutocompleteOption[];
    loading?: boolean;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export default function Autocomplete({
    value,
    onChange,
    onSelect,
    options,
    loading = false,
    placeholder = 'Search...',
    className = '',
    debounceMs = 300,
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset selected index when options change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [options]);

    // Auto-open when typing
    useEffect(() => {
        if (value && options.length > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [value, options.length]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' && options.length > 0) {
                setIsOpen(true);
                setSelectedIndex(0);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && options[selectedIndex]) {
                    handleSelect(options[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelect = (option: AutocompleteOption) => {
        onSelect(option);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className={styles.highlight}>
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className={`${styles.container} ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (value && options.length > 0) {
                        setIsOpen(true);
                    }
                }}
                placeholder={placeholder}
                className={styles.input}
                autoComplete="off"
            />

            {loading && (
                <div className={styles.spinner}>
                    <div className={styles.spinnerIcon}>⟳</div>
                </div>
            )}

            {isOpen && options.length > 0 && (
                <ul ref={listRef} className={styles.dropdown} role="listbox">
                    {options.map((option, index) => (
                        <li
                            key={option.id}
                            className={`${styles.option} ${index === selectedIndex ? styles.selected : ''}`}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            role="option"
                            aria-selected={index === selectedIndex}
                        >
                            {option.icon && <span className={styles.icon}>{option.icon}</span>}
                            <div className={styles.optionContent}>
                                <div className={styles.label}>
                                    {highlightMatch(option.label, value)}
                                </div>
                                {option.subtitle && (
                                    <div className={styles.subtitle}>{option.subtitle}</div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && !loading && options.length === 0 && value && (
                <div className={styles.dropdown}>
                    <div className={styles.emptyState}>No results found</div>
                </div>
            )}
        </div>
    );
}
