import { useLogbook } from "../hooks/useStore";
import { formatWhen } from "../lib/format";

export function AlertsPage() {
  const { store, deleteReminder, setBrowserAlerts, setEmailAlerts, setQuietHours } = useLogbook();
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Alerts</p>
      <h1>Alerts</h1>
      <p className="lede">A reminder only fires while this site is open. Email is saved with the account and is not delivered until the notification service is connected.</p>
      <label className="check">
        <input
          type="checkbox"
          checked={store.alerts.browser}
          onChange={async (event) => {
            if (event.target.checked && "Notification" in window) await Notification.requestPermission();
            setBrowserAlerts(event.target.checked);
          }}
        />
        Browser notifications for reminders due while this tab is open
      </label>
      <label className="check">
        <input type="checkbox" checked={store.alerts.email} onChange={(event) => setEmailAlerts(event.target.checked)} />
        Email me when a watched satellite or an announced event matches this station
      </label>
      <form
        className="row"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setQuietHours(String(data.get("start")), String(data.get("end")));
        }}
      >
        <label>Quiet from<input type="time" name="start" defaultValue={store.alerts.quietStart} /></label>
        <label>until<input type="time" name="end" defaultValue={store.alerts.quietEnd} /></label>
        <button type="submit">Save quiet hours</button>
      </form>
      <h2>Scheduled reminders</h2>
      {store.reminders.length === 0 && <p className="muted">None yet. Use Remind me on a pass.</p>}
      <ul className="logs">
        {store.reminders.map((reminder) => (
          <li key={reminder.id}>
            <div>
              <strong>{reminder.label}</strong>
              <span>Pass {formatWhen(reminder.passAos, store.profile.timeZone)} · remind {formatWhen(reminder.fireAt, store.profile.timeZone)}</span>
            </div>
            <button type="button" className="ghost" onClick={() => deleteReminder(reminder.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
