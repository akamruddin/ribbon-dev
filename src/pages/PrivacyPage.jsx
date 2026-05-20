import { Link } from 'react-router-dom'
import useCookieConsent from '../hooks/useCookieConsent'
import styles from './PrivacyPage.module.css'

const LAST_UPDATED = 'May 2026'

export default function PrivacyPage() {
  const { hasConsented, reset } = useCookieConsent()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>← Back</Link>

        <h1>Cookie &amp; Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

        {/* ── Data controller ── */}
        <section>
          <h2>Data Controller</h2>
          <p>
            Ribbon Communications Inc., 4 Technology Park Drive, Westford MA 01886, USA
            (<strong>"Ribbon"</strong>, <strong>"we"</strong>, <strong>"us"</strong>).
            For data-related enquiries contact{' '}
            <a href="mailto:privacy@rbbn.com" className={styles.a}>privacy@rbbn.com</a>.
          </p>
        </section>

        {/* ── What we store ── */}
        <section>
          <h2>What We Store and Why</h2>
          <p>
            This application stores data only in your browser's <code>localStorage</code>.
            No HTTP cookies are set by this site. No third-party analytics, advertising,
            or tracking scripts are loaded.
          </p>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Key</th>
                <th>Category</th>
                <th>Purpose</th>
                <th>Expiry</th>
                <th>Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>access_token</code></td>
                <td><span className={styles.badgeEssential}>Essential</span></td>
                <td>Authenticates your API requests. Contains your user ID and role — no personal data beyond that.</td>
                <td>15 minutes</td>
                <td>Contract — Art. 6(1)(b) GDPR</td>
              </tr>
              <tr>
                <td><code>refresh_token</code></td>
                <td><span className={styles.badgeEssential}>Essential</span></td>
                <td>Allows a new access token to be issued without requiring you to log in again. The token hash is stored server-side in Redis and invalidated on logout.</td>
                <td>7 days</td>
                <td>Contract — Art. 6(1)(b) GDPR</td>
              </tr>
              <tr>
                <td><code>ribbon_consent</code></td>
                <td><span className={styles.badgeEssential}>Essential</span></td>
                <td>Records your cookie preference (date, version) so we do not ask again.</td>
                <td>Persistent (until cleared)</td>
                <td>Legal obligation — Art. 6(1)(c) GDPR</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── Account data ── */}
        <section>
          <h2>Account &amp; Profile Data</h2>
          <p>
            When you create an account we collect your <strong>email address</strong>,{' '}
            <strong>username</strong>, and optionally <strong>full name</strong>,{' '}
            <strong>company</strong>, and <strong>timezone</strong>. This data is stored in
            our database solely to provide the DevCloud service. We do not sell or share
            this data with third parties.
          </p>
          <p>
            Forum posts and replies you create are associated with your username and stored
            in our database. They may be visible to other authenticated users.
          </p>
          <p>
            Legal basis: performance of a contract (Art. 6(1)(b) GDPR).
          </p>
        </section>

        {/* ── Retention ── */}
        <section>
          <h2>Retention</h2>
          <ul>
            <li>Auth tokens — expire automatically (15 min / 7 days).</li>
            <li>Account and forum data — retained for the lifetime of your account.</li>
            <li>Server logs — retained for 30 days for security monitoring, then deleted.</li>
          </ul>
        </section>

        {/* ── User rights ── */}
        <section>
          <h2>Your Rights Under GDPR</h2>
          <p>
            If you are located in the European Economic Area or the United Kingdom, you have
            the following rights:
          </p>
          <dl className={styles.rights}>
            <dt>Right of access (Art. 15)</dt>
            <dd>Request a copy of the personal data we hold about you.</dd>
            <dt>Right to rectification (Art. 16)</dt>
            <dd>Correct inaccurate data via your <Link to="/profile" className={styles.a}>profile page</Link>.</dd>
            <dt>Right to erasure (Art. 17)</dt>
            <dd>Request deletion of your account and associated data by emailing <a href="mailto:privacy@rbbn.com" className={styles.a}>privacy@rbbn.com</a>.</dd>
            <dt>Right to restriction (Art. 18)</dt>
            <dd>Ask us to restrict processing of your data while a dispute is resolved.</dd>
            <dt>Right to data portability (Art. 20)</dt>
            <dd>Request your data in a machine-readable format.</dd>
            <dt>Right to object (Art. 21)</dt>
            <dd>Object to processing based on legitimate interests.</dd>
            <dt>Right to withdraw consent</dt>
            <dd>Where processing is based on consent, withdraw it at any time (see below).</dd>
          </dl>
          <p>
            To exercise any of these rights, email{' '}
            <a href="mailto:privacy@rbbn.com" className={styles.a}>privacy@rbbn.com</a>.
            We will respond within 30 days. You also have the right to lodge a complaint
            with a supervisory authority (e.g., the ICO in the UK or your local EU DPA).
          </p>
        </section>

        {/* ── Cookie preferences ── */}
        <section>
          <h2>Cookie Preferences</h2>
          {hasConsented ? (
            <div className={styles.prefBox}>
              <p>You have recorded your cookie preference.</p>
              <button className={styles.resetBtn} onClick={reset}>
                Reset preferences (you will be asked again on next page load)
              </button>
            </div>
          ) : (
            <p>You have not yet recorded a preference. A banner will appear on your next visit to the site.</p>
          )}
          <p className={styles.note}>
            Essential storage cannot be disabled — it is required for the site to function.
            Clearing your browser's localStorage will remove all stored tokens and preferences.
          </p>
        </section>

        {/* ── Contact ── */}
        <section>
          <h2>Contact</h2>
          <p>
            Ribbon Communications Inc.<br />
            4 Technology Park Drive, Westford MA 01886, USA<br />
            <a href="mailto:privacy@rbbn.com" className={styles.a}>privacy@rbbn.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
