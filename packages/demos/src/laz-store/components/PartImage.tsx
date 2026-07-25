import styles from '../laz-store.module.css';

export type PartImageSize = 'grid' | 'result' | 'detail' | 'thumb56' | 'thumb60';

const SIZE_CLASS: Record<PartImageSize, string> = {
  grid: styles.hatchGrid,
  result: styles.hatchResult,
  detail: styles.hatchDetail,
  thumb56: styles.hatchThumb56,
  thumb60: styles.hatchThumb60,
};

// Every product image in the source design is a diagonal-hatch placeholder.
// Real photos can replace the hatch here later without touching any call site.
const VISIBLE_LABEL_SIZES: PartImageSize[] = ['grid', 'result', 'detail'];

export interface PartImageProps {
  label: string;
  size: PartImageSize;
  className?: string;
}

export default function PartImage({ label, size, className }: PartImageProps) {
  const showVisibleLabel = VISIBLE_LABEL_SIZES.includes(size);
  return (
    <div className={[SIZE_CLASS[size], className].filter(Boolean).join(' ')}>
      {showVisibleLabel ? label : <span className={styles.srOnly}>{label}</span>}
    </div>
  );
}
