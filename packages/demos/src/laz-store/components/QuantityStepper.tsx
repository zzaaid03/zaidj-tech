import styles from '../laz-store.module.css';

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  label: string;
  size?: 'md' | 'sm';
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  label,
  size = 'md',
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  const btnClass = size === 'sm' ? styles.stepperBtnSm : styles.stepperBtn;
  const valueClass = size === 'sm' ? styles.stepperValueSm : styles.stepperValue;

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={btnClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        −
      </button>
      <span className={valueClass} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btnClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  );
}
