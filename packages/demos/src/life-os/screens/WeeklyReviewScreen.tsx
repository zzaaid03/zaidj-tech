import styles from '../life-os.module.css';

const FINISHED_TASKS = [
  'Reply to Beacon Software to confirm your interview time',
  'Pay your electric bill, $84.12 due',
  'Renew car insurance',
];

const SLIPPED_TASKS = [
  'Cancel or confirm your streaming subscription renewal',
  'Collect your parcel before it is returned to sender',
];

const JOBS_ADDED = ['Meridian Financial, Product Manager', 'Nimbus Labs, Associate Product Manager'];

const JOBS_QUIET = ['Vertex Design, Product Manager, applied 16 days ago with no update since'];

const JOB_STATUS_COUNTS: Array<[string, number]> = [
  ['Applied', 5],
  ['Viewed', 3],
  ['Interview', 1],
  ['Rejected', 4],
  ['Accepted', 0],
];

const SUBSCRIPTION_TOTALS: Array<[string, string]> = [
  ['EUR', '€32.97 a month'],
  ['USD', '$14.99 a month'],
];

const GOALS = [
  { title: 'Get fit', done: 3, total: 5 },
  { title: 'Learn Spanish', done: 1, total: 4 },
];

export default function WeeklyReviewScreen() {
  return (
    <div className={styles.resultsContent}>
      <p className={styles.accountLine}>Your week, reviewed</p>
      <p className={styles.reviewWeekLabel}>Last week, now ended</p>

      <h3 className={styles.sectionHeading}>Tasks</h3>
      <div className={styles.card}>
        <p className={styles.reviewRowLabel}>Finished ({FINISHED_TASKS.length})</p>
        <ul className={styles.reviewList}>
          {FINISHED_TASKS.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
        <p className={styles.reviewRowLabel}>Slipped, still open ({SLIPPED_TASKS.length})</p>
        <ul className={styles.reviewList}>
          {SLIPPED_TASKS.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </div>

      <h3 className={styles.sectionHeading}>Job hunt</h3>
      <div className={styles.card}>
        <p className={styles.reviewRowLabel}>Added this week ({JOBS_ADDED.length})</p>
        <ul className={styles.reviewList}>
          {JOBS_ADDED.map((job) => (
            <li key={job}>{job}</li>
          ))}
        </ul>
        <p className={styles.reviewRowLabel}>Gone quiet, 14+ days with no update ({JOBS_QUIET.length})</p>
        <ul className={styles.reviewList}>
          {JOBS_QUIET.map((job) => (
            <li key={job}>{job}</li>
          ))}
        </ul>
        <p className={styles.reviewRowLabel}>Current status counts</p>
        <div className={styles.statusCountGrid}>
          {JOB_STATUS_COUNTS.map(([label, count]) => (
            <span key={label} className={styles.statusCountChip}>
              {label}: {count}
            </span>
          ))}
        </div>
      </div>

      <h3 className={styles.sectionHeading}>Subscriptions</h3>
      <div className={styles.card}>
        <p className={styles.bodyText}>
          Each currency totals on its own line. There is no exchange rate in the app, so nothing here
          is ever combined into one number.
        </p>
        {SUBSCRIPTION_TOTALS.map(([code, line]) => (
          <p key={code} className={styles.currencyLine}>
            {line}
          </p>
        ))}
      </div>

      <h3 className={styles.sectionHeading}>Goals</h3>
      {GOALS.map((goal) => (
        <div key={goal.title} className={styles.card}>
          <p className={styles.cardTitle}>{goal.title}</p>
          <p className={styles.reviewRowLabel}>
            {goal.done} of {goal.total} linked tasks done
          </p>
        </div>
      ))}
    </div>
  );
}
