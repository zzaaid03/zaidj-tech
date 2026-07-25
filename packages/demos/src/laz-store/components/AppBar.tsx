import type { ReactNode } from 'react';
import styles from '../laz-store.module.css';
import { BackChevronIcon } from '../icons';

export interface AppBarProps {
  title: string;
  titleSize?: 'lg' | 'md';
  titleFlex?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

export default function AppBar({ title, titleSize = 'md', titleFlex = false, onBack, right }: AppBarProps) {
  const titleClass = titleSize === 'lg' ? styles.appBarTitleLg : titleFlex ? styles.appBarTitleFlex : styles.appBarTitle;

  return (
    <div className={styles.appBar}>
      {onBack && (
        <button type="button" className={styles.iconButton} onClick={onBack} aria-label="Back">
          <BackChevronIcon />
        </button>
      )}
      <span className={titleClass}>{title}</span>
      {right}
    </div>
  );
}
