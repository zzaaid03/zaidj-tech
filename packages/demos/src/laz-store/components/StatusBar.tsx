import styles from '../laz-store.module.css';
import { SignalIcon, WifiIcon } from '../icons';

export interface StatusBarProps {
  time: string;
  variant?: 'full' | 'simple' | 'overlay';
}

export default function StatusBar({ time, variant = 'simple' }: StatusBarProps) {
  if (variant === 'overlay') {
    return (
      <div className={styles.statusBarOverlay} aria-hidden="true">
        <span>{time}</span>
        <span>100%</span>
      </div>
    );
  }

  return (
    <div className={styles.statusBar} aria-hidden="true">
      <span>{time}</span>
      {variant === 'full' ? (
        <div className={styles.statusIcons}>
          <SignalIcon />
          <WifiIcon />
          <span className={styles.batteryLabel}>100%</span>
        </div>
      ) : (
        <span className={styles.batteryLabel}>100%</span>
      )}
    </div>
  );
}
