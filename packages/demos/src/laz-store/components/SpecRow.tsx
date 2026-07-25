import styles from '../laz-store.module.css';

export interface SpecRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export default function SpecRow({ label, value, valueClassName }: SpecRowProps) {
  return (
    <div className={styles.specRow}>
      <span className={styles.specLabel}>{label}</span>
      <span className={valueClassName ?? styles.specValue}>{value}</span>
    </div>
  );
}
