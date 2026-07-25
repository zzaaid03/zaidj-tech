import { useCallback, useState, type KeyboardEvent } from 'react';
import styles from './laz-store.module.css';
import CatalogScreen from './screens/CatalogScreen';
import AiIdentifyScreen from './screens/AiIdentifyScreen';
import AiResultScreen from './screens/AiResultScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';

const SCREENS = [
  { label: 'Catalog / Home' },
  { label: 'AI Identify' },
  { label: 'AI Result' },
  { label: 'Product Detail' },
  { label: 'Cart' },
  { label: 'Order Confirmation' },
] as const;

export default function LazStoreDemo() {
  const [screen, setScreen] = useState(0);
  const [totalPaid, setTotalPaid] = useState('$341.00');

  const goTo = useCallback((next: number) => {
    setScreen(Math.max(0, Math.min(SCREENS.length - 1, next)));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(screen - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(screen + 1);
      }
    },
    [screen, goTo],
  );

  return (
    <div className="laz-store-root" onKeyDown={handleKeyDown}>
      <div className="flex flex-col items-center gap-4">
        {/* prev / next + direct-select chrome — must stay in @zaidj/ui styling, never LAZ colors */}
        <div className="flex w-full max-w-[412px] items-center justify-between font-mono text-xs text-muted">
          <button
            type="button"
            onClick={() => goTo(screen - 1)}
            disabled={screen === 0}
            aria-label="Previous screen"
            className="rounded-sm border border-border-paper px-3 py-1.5 uppercase tracking-wide text-paper outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-paper disabled:hover:text-paper"
          >
            &larr; Prev
          </button>
          <span aria-hidden="true">
            {screen + 1} of {SCREENS.length} — {SCREENS[screen].label}
          </span>
          <button
            type="button"
            onClick={() => goTo(screen + 1)}
            disabled={screen === SCREENS.length - 1}
            aria-label="Next screen"
            className="rounded-sm border border-border-paper px-3 py-1.5 uppercase tracking-wide text-paper outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-paper disabled:hover:text-paper"
          >
            Next &rarr;
          </button>
        </div>

        <div
          role="group"
          aria-label="Jump to screen"
          className="flex w-full max-w-[412px] flex-wrap justify-center gap-2"
        >
          {SCREENS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={i === screen}
              onClick={() => goTo(i)}
              className={[
                'rounded-sm border px-2.5 py-1 font-mono text-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                i === screen
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-paper text-muted hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="sr-only">
          Screen {screen + 1} of {SCREENS.length}: {SCREENS[screen].label}
        </div>

        <div className={styles.phoneScaleOuter}>
          <div className={screen === 1 ? `${styles.phone} ${styles.phoneCamera}` : styles.phone}>
            {screen === 0 && (
              <CatalogScreen onOpenStrutDetail={() => goTo(3)} onOpenIdentify={() => goTo(1)} />
            )}
            {screen === 1 && <AiIdentifyScreen onBack={() => goTo(0)} onCapture={() => goTo(2)} />}
            {screen === 2 && <AiResultScreen onBack={() => goTo(1)} />}
            {screen === 3 && (
              <ProductDetailScreen onBack={() => goTo(0)} onAddToCart={() => goTo(4)} />
            )}
            {screen === 4 && (
              <CartScreen
                onCheckout={(total) => {
                  setTotalPaid(total);
                  goTo(5);
                }}
              />
            )}
            {screen === 5 && (
              <OrderConfirmationScreen totalPaid={totalPaid} onContinueShopping={() => goTo(0)} />
            )}
          </div>
        </div>

        <p className="max-w-[412px] text-center font-mono text-xs text-muted">
          Interactive recreation of the LAZ Store interface, rebuilt for the web from the original Android
          app.
        </p>
      </div>
    </div>
  );
}
