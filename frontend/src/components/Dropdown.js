import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select...",
  disabled = false,
  className = "",
  renderValue = null,
  renderOption = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    if (renderValue) return renderValue(value);
    return value.label || value.name || value;
  };

  const getOptionDisplay = (option) => {
    if (renderOption) return renderOption(option);
    return option.label || option.name || option;
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div 
        className={`dropdown-toggle ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{getDisplayValue()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div className="dropdown-menu">
          {options.length === 0 ? (
            <div className="dropdown-item disabled">No options available</div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value || option._id || index}
                className={`dropdown-item ${
                  (value && ((option.value && value.value === option.value) || 
                   (option._id && value._id === option._id) || 
                   value === option)) ? 'selected' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {getOptionDisplay(option)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;