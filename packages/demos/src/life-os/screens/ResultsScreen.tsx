import styles from '../life-os.module.css';
import type { JobApplication, SuggestedTask } from '../LifeOsDemo';

export interface ResultsScreenProps {
  tasks: SuggestedTask[];
  jobs: JobApplication[];
  onAddTask: (id: string, title: string) => void;
  onDismissTask: (id: string) => void;
  onAddJob: (id: string) => void;
  onDismissJob: (id: string) => void;
  snackbarMessage: string | null;
}

export default function ResultsScreen({
  tasks,
  jobs,
  onAddTask,
  onDismissTask,
  onAddJob,
  onDismissJob,
  snackbarMessage,
}: ResultsScreenProps) {
  return (
    <div className={styles.resultsContent}>
      <p className={styles.accountLine}>alex.demo@gmail.com</p>

      <h3 className={styles.sectionHeading}>Suggested Tasks ({tasks.length})</h3>
      {tasks.length === 0 ? (
        <p className={styles.emptyState}>No suggested tasks left.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className={styles.card}>
            <p className={styles.cardTitle}>{task.title}</p>
            <div className={styles.cardMetaRow}>
              <span className={styles.dueHint}>Due: {task.due}</span>
              <span className={task.priority === 'high' ? styles.priorityHigh : styles.priorityMedium}>
                {task.priority === 'high' ? 'High priority' : 'Medium priority'}
              </span>
            </div>
            <div className={styles.cardActions}>
              <button type="button" className={styles.addButton} onClick={() => onAddTask(task.id, task.title)}>
                Add
              </button>
              <button type="button" className={styles.dismissButton} onClick={() => onDismissTask(task.id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))
      )}

      <h3 className={styles.sectionHeading}>New Job Applications ({jobs.length})</h3>
      {jobs.length === 0 ? (
        <p className={styles.emptyState}>No new job applications left.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className={styles.card}>
            <div className={styles.jobCompanyRow}>
              <div>
                <p className={styles.jobCompany}>{job.company}</p>
                <p className={styles.jobRole}>{job.role}</p>
              </div>
              <span className={job.status === 'interview' ? styles.statusInterview : styles.statusRejected}>
                {job.status}
              </span>
            </div>
            <p className={styles.jobSummary}>{job.summary}</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.addButton} onClick={() => onAddJob(job.id)}>
                Add
              </button>
              <button type="button" className={styles.dismissButton} onClick={() => onDismissJob(job.id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))
      )}

      {snackbarMessage && (
        <div role="status" className={styles.snackbar}>
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}
