import styles from '../laz-store.module.css';
import StatusBar from '../components/StatusBar';
import PartImage from '../components/PartImage';
import { SearchIcon, CartIcon, CartIconMuted, HomeIcon, AccountIcon, CameraFabIcon } from '../icons';

export interface CatalogProduct {
  name: string;
  model: string;
  price: string;
  imageLabel: string;
  interactive?: boolean;
}

const PRODUCTS: CatalogProduct[] = [
  { name: 'Model 3 Front Brake Pads', model: 'Model 3', price: '$89.00', imageLabel: 'brake pads photo' },
  { name: 'Cabin Air Filter (HEPA)', model: 'Model Y', price: '$34.00', imageLabel: 'cabin filter photo' },
  { name: 'Wiper Blade Set', model: 'Model S', price: '$42.00', imageLabel: 'wiper blades photo' },
  { name: 'Charging Cable Type 2', model: 'Model X', price: '$120.00', imageLabel: 'charging cable photo' },
  { name: '12V Auxiliary Battery', model: 'Model 3', price: '$175.00', imageLabel: 'battery photo' },
  {
    name: 'Suspension Strut (Front)',
    model: 'Model Y',
    price: '$210.00',
    imageLabel: 'strut photo',
    interactive: true,
  },
];

const CATEGORIES = ['All', 'Brakes', 'Filters', 'Charging', 'Suspension'];

export interface CatalogScreenProps {
  onOpenStrutDetail: () => void;
  onOpenIdentify: () => void;
}

export default function CatalogScreen({ onOpenStrutDetail, onOpenIdentify }: CatalogScreenProps) {
  return (
    <>
      <StatusBar time="10:22" variant="full" />
      <div className={styles.appBar}>
        <span className={styles.appBarTitleLg}>LAZ Store</span>
        <span className={styles.iconStatic} aria-hidden="true">
          <SearchIcon color="#FFFFFF" />
        </span>
        <span className={styles.iconStatic} aria-hidden="true">
          <CartIcon />
        </span>
      </div>

      <div className={styles.catalogContent}>
        <div className={styles.searchBar}>
          <SearchIcon />
          <span className={styles.searchPlaceholder}>Search Tesla parts...</span>
        </div>

        <div className={styles.chipsRow}>
          {CATEGORIES.map((category, i) => (
            <div key={category} className={i === 0 ? `${styles.chip} ${styles.chipActive}` : styles.chip}>
              {category}
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {PRODUCTS.map((product) =>
            product.interactive ? (
              <button
                key={product.name}
                type="button"
                className={styles.productCardButton}
                onClick={onOpenStrutDetail}
              >
                <PartImage label={product.imageLabel} size="grid" />
                <div className={styles.productBody}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productMeta}>{product.model}</div>
                  <div className={styles.productPrice}>{product.price}</div>
                </div>
              </button>
            ) : (
              <div key={product.name} className={styles.productCard}>
                <PartImage label={product.imageLabel} size="grid" />
                <div className={styles.productBody}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productMeta}>{product.model}</div>
                  <div className={styles.productPrice}>{product.price}</div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className={styles.bottomNav}>
        <div className={styles.navItemActive}>
          <HomeIcon />
          <span className={styles.navLabelActive}>Home</span>
        </div>
        <div className={styles.navItem}>
          <SearchIcon color="#9B9B9B" />
          <span className={styles.navLabel}>Search</span>
        </div>
        <button type="button" className={styles.navFab} onClick={onOpenIdentify} aria-label="Identify a part with AI">
          <CameraFabIcon />
        </button>
        <div className={styles.navItem}>
          <CartIconMuted />
          <span className={styles.navLabel}>Orders</span>
        </div>
        <div className={styles.navItem}>
          <AccountIcon />
          <span className={styles.navLabel}>Account</span>
        </div>
      </div>
    </>
  );
}
