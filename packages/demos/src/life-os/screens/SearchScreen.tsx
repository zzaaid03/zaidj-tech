import { useMemo, useState } from 'react';
import styles from '../life-os.module.css';
import type { StoredFile } from '../LifeOsDemo';

export interface SearchScreenProps {
  files: StoredFile[];
}

export default function SearchScreen({ files }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((file) => {
      // A private file never reached the model, so it has no AI-expanded
      // synonyms to search: only its own name and note match.
      const haystack = file.isPrivate ? [file.name, file.note] : [file.name, file.note, ...file.synonyms];
      return haystack.some((text) => text.toLowerCase().includes(q));
    });
  }, [files, query]);

  return (
    <div>
      <div className={styles.appBar}>
        <span className={styles.appBarTitle}>Search</span>
      </div>
      <div className={styles.resultsContent}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Search anything..."
          aria-label="Search your files"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <h3 className={styles.sectionHeading}>Files ({results.length})</h3>
        {results.length === 0 ? (
          <p className={styles.emptyState}>No files match &quot;{query}&quot;.</p>
        ) : (
          results.map((file) => (
            <div key={file.id} className={styles.card}>
              <div className={styles.jobCompanyRow}>
                <p className={styles.cardTitle}>{file.name}</p>
                {file.isPrivate && <span className={styles.privateBadge}>Private</span>}
              </div>
              <p className={styles.jobSummary}>{file.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
