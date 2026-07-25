import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import AppBar from '../components/AppBar';
import PartImage from '../components/PartImage';

export interface AiResultScreenProps {
  onBack: () => void;
}

const OTHER_LISTINGS = [
  {
    name: 'Model 3 Rear Brake Pads',
    meta: 'Ceramic · OEM Compatible',
    price: '$95.00',
  },
  {
    name: 'Brake Pad Wear Sensor',
    meta: 'Model 3 / Model Y',
    price: '$18.00',
  },
];

export default function AiResultScreen({ onBack }: AiResultScreenProps) {
  return (
    <>
      <StatusBar time="10:24" variant="simple" />
      <AppBar title="Identification Result" onBack={onBack} />

      <div className={styles.resultContent}>
        <PartImage label="captured part photo" size="result" />

        <div className={styles.confidenceCard}>
          <div className={styles.confidenceHeader}>
            <span className={styles.confidenceLabel}>Confidence</span>
            <span className={styles.confidenceValue}>96% Match</span>
          </div>
          <div className={styles.confidenceTrack}>
            <div className={styles.confidenceFill} style={{ width: '96%' }} />
          </div>
        </div>

        <div className={styles.partTitleBlock}>
          <div className={styles.partTitle}>Front Brake Pad Set</div>
          <div className={styles.partNumber}>Part No. LAZ-BRK-3021</div>
          <div className={styles.partTagsRow}>
            <span className={styles.tagPill}>Model 3</span>
            <span className={styles.tagPill}>Model Y</span>
          </div>
        </div>

        <div className={styles.sectionLabel}>Matched Listings</div>

        <div className={styles.listingItemBest}>
          <PartImage label="brake pads photo" size="thumb56" />
          <div className={styles.listingBody}>
            <div className={styles.listingTopRow}>
              <span className={styles.listingName}>Model 3 Front Brake Pads</span>
              <span className={styles.bestMatchBadge}>Best Match</span>
            </div>
            <div className={styles.listingMeta}>Ceramic · OEM Compatible</div>
            <div className={styles.listingPrice}>$89.00</div>
          </div>
        </div>

        {OTHER_LISTINGS.map((listing) => (
          <div key={listing.name} className={styles.listingItem}>
            <PartImage label="part photo" size="thumb56" />
            <div className={styles.listingBody}>
              <div className={styles.listingName}>{listing.name}</div>
              <div className={styles.listingMeta}>{listing.meta}</div>
              <div className={styles.listingPrice}>{listing.price}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
