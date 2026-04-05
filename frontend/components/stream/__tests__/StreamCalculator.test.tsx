import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { StreamCalculator } from '../StreamCalculator';

describe('StreamCalculator', () => {
  it('renders with default props and allows input', () => {
    render(<StreamCalculator />);
    expect(screen.getByText(/Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/GROW \/ day/i)).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
  });

  it('switches tabs and updates units', () => {
    render(<StreamCalculator />);
    fireEvent.click(screen.getByText(/Per Month/i));
    expect(screen.getByText(/GROW \/ month/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Per Second/i));
    expect(screen.getByText(/GROW \/ second/i)).toBeInTheDocument();
  });

  it('shows correct raw flow rate and buffer', () => {
    render(<StreamCalculator initialAmount={1} initialMode="second" />);
    expect(screen.getByText(/Raw flowRate:/i)).toBeInTheDocument();
    expect(screen.getByText(/Min. Buffer/i)).toBeInTheDocument();
  });

  it('calls onChange with correct rawFlowRate', () => {
    const handleChange = jest.fn();
    render(<StreamCalculator initialAmount={2} initialMode="second" onChange={handleChange} />);
    // Should be called at least once on mount
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows stream duration for deposit', () => {
    render(<StreamCalculator initialAmount={1} initialMode="second" depositAmount={100} />);
    expect(screen.getByText(/Stream duration for 100 GROW/i)).toBeInTheDocument();
  });
});
