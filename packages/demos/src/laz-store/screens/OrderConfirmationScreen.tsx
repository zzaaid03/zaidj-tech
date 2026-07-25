import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import { CheckIcon } from '../icons';

export interface OrderConfirmationScreenProps {
  totalPaid: string;
  onContinueShopping: () => void;
}

export default function OrderConfirmationScreen({ totalPaid, onContinueShopping }: OrderConfirmationScreenProps) {
  return (
    <>
      <StatusBar time="10:31" variant="simple" />

      <div className={styles.confirmContent}>
        <div className={styles.successRingOuter}>
          <div className={styles.successRingInner}>
            <CheckIcon />
          </div>
        </div>
        <div className={styles.confirmTitle}>Order Placed Successfully!</div>
        <div className={styles.confirmSubtitle}>
          Your parts are being prepared for shipment. We'll notify you when they're on the way.
        </div>

        <div className={styles.orderCard}>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Order ID</span>
            <span className={styles.orderValue}>#LAZ-20481</span>
          </div>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Estimated Delivery</span>
            <span className={styles.orderValue}>Jul 29 - Aug 1</span>
          </div>
          <div className={styles.orderRowLast}>
            <span className={styles.orderLabel}>Total Paid</span>
            <span className={styles.orderValueLg}>{totalPaid}</span>
          </div>
        </div>

        <button type="button" className={styles.continueBtn} onClick={onContinueShopping}>
          Continue Shopping
        </button>
      </div>
    </>
  );
}
