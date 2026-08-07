import { useState } from 'react';
import styles from '../life-os.module.css';

export interface AddFileScreenProps {
  onAdd: (note: string, isPrivate: boolean) => void;
}

export default function AddFileScreen({ onAdd }: AddFileScreenProps) {
  const [note, setNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div>
      <div className={styles.appBar}>
        <span className={styles.appBarTitle}>Add a file</span>
      </div>
      <div className={styles.scanContent}>
        <div className={styles.filePreviewRow}>
          <span className={styles.fileIcon} aria-hidden="true">
            📄
          </span>
          <span className={styles.filePreviewName}>lease_signed_2026.pdf</span>
        </div>
        <p className={styles.bodyText}>
          The AI can&apos;t see inside a file, so it can&apos;t tell what this one is on its own.
          One line describing it is what makes it findable later.
        </p>
        <label className={styles.fieldLabel} htmlFor="life-os-file-note">
          What is this file?
        </label>
        <input
          id="life-os-file-note"
          type="text"
          className={styles.textInput}
          placeholder="My flat lease"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <label className={styles.toggleRow}>
          <span>Private, never send to AI</span>
          <input
            type="checkbox"
            className={styles.toggleInput}
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.target.checked)}
          />
        </label>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={note.trim().length === 0}
          onClick={() => onAdd(note.trim(), isPrivate)}
        >
          Add file
        </button>
      </div>
    </div>
  );
}
