import React from 'react';

/** Hidden field — real users never fill it; bots often do. */
export const HoneypotField: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    }}
  >
    <label htmlFor="company_website">Website</label>
    <input
      id="company_website"
      name="company_website"
      type="text"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
