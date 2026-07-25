import { useMemo, useState } from 'react';
import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import AppBar from '../components/AppBar';
import PartImage from '../components/PartImage';
import QuantityStepper from '../components/QuantityStepper';

export interface CartScreenProps {
  onCheckout: (total: string) => void;
}

const SHIPPING = 12;

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function CartScreen({ onCheckout }: CartScreenProps) {
  const [brakePadsQty, setBrakePadsQty] = useState(1);
  const [chargingCableQty, setChargingCableQty] = useState(2);

  const brakePadsUnit = 89;
  const chargingCableUnit = 120;

  const subtotal = useMemo(
    () => brakePadsQty * brakePadsUnit + chargingCableQty * chargingCableUnit,
    [brakePadsQty, chargingCableQty],
  );
  const total = subtotal + SHIPPING;

  return (
    <>
      <StatusBar time="10:28" variant="simple" />
      <AppBar title="Cart" />

      <div className={styles.cartContent}>
        <div className={styles.cartItemsList}>
          <div className={styles.cartItem}>
            <PartImage label="brake pads photo" size="thumb60" />
            <div style={{ flex: 1 }}>
              <div className={styles.cartItemName}>Model 3 Front Brake Pads</div>
              <div className={styles.cartItemUnit}>{formatUsd(brakePadsUnit)} each</div>
              <div className={styles.cartItemFooter}>
                <QuantityStepper
                  value={brakePadsQty}
                  onChange={setBrakePadsQty}
                  label="Model 3 Front Brake Pads"
                  size="sm"
                />
                <span className={styles.cartItemTotal}>{formatUsd(brakePadsQty * brakePadsUnit)}</span>
              </div>
            </div>
          </div>

          <div className={styles.cartItem}>
            <PartImage label="charging cable photo" size="thumb60" />
            <div style={{ flex: 1 }}>
              <div className={styles.cartItemName}>Charging Cable Type 2</div>
              <div className={styles.cartItemUnit}>{formatUsd(chargingCableUnit)} each</div>
              <div className={styles.cartItemFooter}>
                <QuantityStepper
                  value={chargingCableQty}
                  onChange={setChargingCableQty}
                  label="Charging Cable Type 2"
                  size="sm"
                />
                <span className={styles.cartItemTotal}>{formatUsd(chargingCableQty * chargingCableUnit)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summaryCard} aria-live="polite">
          <div className={styles.summaryTitle}>Order Summary</div>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{formatUsd(SHIPPING)}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryTotalRow}>
            <span>Total</span>
            <span>{formatUsd(total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.cartBottomBar}>
        <button type="button" className={styles.checkoutBtn} onClick={() => onCheckout(formatUsd(total))}>
          Checkout — {formatUsd(total)}
        </button>
      </div>
    </>
  );
}
