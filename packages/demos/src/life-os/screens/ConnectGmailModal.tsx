import styles from '../life-os.module.css';
import ScanScreen from './ScanScreen';

export interface ConnectGmailModalProps {
  onNotNow: () => void;
  onConnect: () => void;
}

export default function ConnectGmailModal({ onNotNow, onConnect }: ConnectGmailModalProps) {
  return (
    <>
      <ScanScreen scanning={false} onScan={() => undefined} dimmed />
      <div className={styles.modalOverlay}>
        <div role="dialog" aria-modal="true" aria-labelledby="life-os-connect-title" className={styles.modalCard}>
          <h3 id="life-os-connect-title" className={styles.modalTitle}>
            Connect Gmail
          </h3>
          <p className={styles.modalBody}>
            Life OS needs read access to your recent mail to find tasks and job updates.
          </p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalGhostButton} onClick={onNotNow}>
              Not now
            </button>
            <button type="button" className={styles.modalPrimaryButton} onClick={onConnect}>
              Connect Gmail
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
