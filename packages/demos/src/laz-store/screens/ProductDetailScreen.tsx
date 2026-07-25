import { useState } from 'react';
import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import AppBar from '../components/AppBar';
import PartImage from '../components/PartImage';
import SpecRow from '../components/SpecRow';
import QuantityStepper from '../components/QuantityStepper';
import { CartIcon } from '../icons';

export interface ProductDetailScreenProps {
  onBack: () => void;
  onAddToCart: () => void;
}

export default function ProductDetailScreen({ onBack, onAddToCart }: ProductDetailScreenProps) {
  const [qty, setQty] = useState(1);

  return (
    <>
      <StatusBar time="10:26" variant="simple" />
      <AppBar
        title="Product Details"
        onBack={onBack}
        titleFlex
        right={
          <span className={styles.iconStatic} aria-hidden="true">
            <CartIcon />
          </span>
        }
      />

      <div className={styles.detailContent}>
        <PartImage label="Model Y suspension strut photo" size="detail" />

        <div className={styles.dotsRow} aria-hidden="true">
          <span className={styles.dotActive} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>

        <div className={styles.detailBody}>
          <div className={styles.detailTitle}>Suspension Strut - Front</div>
          <div className={styles.detailPrice}>$210.00</div>
          <div className={styles.detailTagsRow}>
            <span className={styles.tagPill}>Model Y</span>
            <span className={styles.tagPill}>Model 3</span>
          </div>

          <div className={styles.specHeading}>Specifications</div>
          <div className={styles.specCard}>
            <SpecRow label="Position" value="Front, Left/Right" />
            <SpecRow label="Material" value="Forged Aluminum" />
            <SpecRow label="Warranty" value="24 months" />
            <SpecRow label="In Stock" value="12 units" valueClassName={styles.specValueSuccess} />
          </div>
        </div>
      </div>

      <div className={styles.detailBottomBar}>
        <QuantityStepper value={qty} onChange={setQty} label="Suspension Strut - Front" />
        <button type="button" className={styles.primaryPillBtn} onClick={onAddToCart}>
          Add to Cart
        </button>
      </div>
    </>
  );
}
