import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import { BackChevronIcon, GalleryIcon, FlipCameraIcon, FlashIcon } from '../icons';

export interface AiIdentifyScreenProps {
  onBack: () => void;
  onCapture: () => void;
}

export default function AiIdentifyScreen({ onBack, onCapture }: AiIdentifyScreenProps) {
  return (
    <div className={styles.cameraBg}>
      <StatusBar time="10:23" variant="overlay" />

      <div className={styles.cameraTopBar}>
        <button type="button" className={styles.roundIconBtnInteractive} onClick={onBack} aria-label="Back">
          <BackChevronIcon />
        </button>
        <span className={styles.cameraTitle}>Identify a Part</span>
        <span className={styles.roundIconBtn} aria-hidden="true">
          <FlashIcon />
        </span>
      </div>

      <div className={styles.framingGuide}>
        <div className={styles.cornerTL} />
        <div className={styles.cornerTR} />
        <div className={styles.cornerBL} />
        <div className={styles.cornerBR} />
        <div className={styles.scanline} />
      </div>

      <div className={styles.centerHint}>
        <span className={styles.centerHintText}>Center the part inside the frame</span>
      </div>

      <div className={styles.bottomSheet}>
        <div className={styles.bottomSheetHint}>AI will scan the part and match it against the LAZ catalog</div>
        <div className={styles.captureRow}>
          <span className={styles.sideButton} aria-hidden="true">
            <GalleryIcon />
          </span>
          <button
            type="button"
            className={styles.captureButton}
            onClick={onCapture}
            aria-label="Capture photo and identify part"
          >
            <span className={styles.captureButtonInner} />
          </button>
          <span className={styles.sideButton} aria-hidden="true">
            <FlipCameraIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
