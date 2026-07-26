import styles from '../life-os.module.css';

export interface ScanScreenProps {
  scanning: boolean;
  onScan: () => void;
  dimmed?: boolean;
}

export default function ScanScreen({ scanning, onScan, dimmed }: ScanScreenProps) {
  return (
    <div aria-hidden={dimmed} className={dimmed ? styles.backdrop : undefined}>
      <div className={styles.appBar}>
        <span className={styles.appBarTitle}>Scan Inbox</span>
      </div>
      <div className={styles.scanContent}>
        <p className={styles.bodyText}>
          Let AI read your recent emails and turn them into tasks and job updates.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onScan}
          disabled={scanning || dimmed}
        >
          {scanning && <span className={styles.spinner} aria-hidden="true" />}
          {scanning ? 'Scanning...' : 'Scan my inbox'}
        </button>
      </div>
    </div>
  );
}
