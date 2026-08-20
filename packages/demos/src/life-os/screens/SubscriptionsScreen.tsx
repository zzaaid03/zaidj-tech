import { useState } from 'react';
import styles from '../life-os.module.css';
import type { SubscriptionCandidate } from '../LifeOsDemo';

export interface SubscriptionsScreenProps {
  candidates: SubscriptionCandidate[];
  onAdd: (id: string) => void;
  onDismiss: (id: string) => void;
}

export default function SubscriptionsScreen({ candidates, onAdd, onDismiss }: SubscriptionsScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCycle, setEditCycle] = useState('');

  const editing = candidates.find((c) => c.id === editingId) ?? null;

  const startEdit = (candidate: SubscriptionCandidate) => {
    setEditingId(candidate.id);
    setEditName(candidate.name);
    setEditCurrency(candidate.currency ?? '');
    setEditAmount(candidate.amount != null ? candidate.amount.toFixed(2) : '');
    setEditCycle(candidate.cycle ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = () => {
    if (!editing) return;
    onAdd(editing.id);
    setEditingId(null);
  };

  if (editing) {
    return (
      <div>
        <div className={styles.appBar}>
          <span className={styles.appBarTitle}>Confirm subscription</span>
        </div>
        <div className={styles.scanContent}>
          <p className={styles.bodyText}>
            Adding a subscription always opens this editor first, pre-filled from the email. Nothing
            saves until you confirm it: the amount is exactly where a misread would put a wrong number
            on a money screen.
          </p>
          <label className={styles.fieldLabel} htmlFor="sub-name">
            Name
          </label>
          <input
            id="sub-name"
            type="text"
            className={styles.textInput}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
          />
          <div className={styles.editorRow}>
            <div className={styles.editorField}>
              <label className={styles.fieldLabel} htmlFor="sub-currency">
                Currency
              </label>
              <input
                id="sub-currency"
                type="text"
                className={styles.textInput}
                placeholder="Not stated"
                value={editCurrency}
                onChange={(event) => setEditCurrency(event.target.value)}
              />
            </div>
            <div className={styles.editorField}>
              <label className={styles.fieldLabel} htmlFor="sub-amount">
                Amount
              </label>
              <input
                id="sub-amount"
                type="text"
                className={styles.textInput}
                placeholder="Not stated"
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
              />
            </div>
          </div>
          <label className={styles.fieldLabel} htmlFor="sub-cycle">
            Billing cycle
          </label>
          <select
            id="sub-cycle"
            className={styles.textInput}
            value={editCycle}
            onChange={(event) => setEditCycle(event.target.value)}
          >
            <option value="">Not stated</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button type="button" className={styles.primaryButton} onClick={saveEdit}>
            Save subscription
          </button>
          <button type="button" className={styles.ghostButton} onClick={cancelEdit}>
            Back without saving
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsContent}>
      <p className={styles.accountLine}>Subscriptions found in your inbox</p>
      <h3 className={styles.sectionHeading}>Suggested Subscriptions ({candidates.length})</h3>
      {candidates.length === 0 ? (
        <p className={styles.emptyState}>No suggested subscriptions left.</p>
      ) : (
        candidates.map((candidate) => (
          <div key={candidate.id} className={styles.card}>
            <p className={styles.cardTitle}>{candidate.name}</p>
            <div className={styles.cardMetaRow}>
              {candidate.amount != null && candidate.currency ? (
                <span className={styles.subAmount}>
                  {candidate.currency}
                  {candidate.amount.toFixed(2)} / {candidate.cycle ?? 'cycle not stated'}
                </span>
              ) : (
                <span className={styles.amountUnstated}>Amount not stated</span>
              )}
            </div>
            <p className={styles.jobSummary}>{candidate.sourceHint}</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.addButton} onClick={() => startEdit(candidate)}>
                Add
              </button>
              <button type="button" className={styles.dismissButton} onClick={() => onDismiss(candidate.id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
