import { useMemo, useState } from 'react';
import { Bell, ChevronDown, CircleCheck, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Segmented } from '../components/primitives';
import { Button, Empty, PageHeader, Panel } from '../components/ui';
import { ACTIVITY_FAQ, ACTIVITY_MESSAGES, type ActivityMessage } from '../content/insights';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

type Filter = 'all' | 'team' | 'system';

const matches = (message: ActivityMessage, filter: Filter) =>
  filter === 'all' || (filter === 'system' ? message.kind === 'system' : message.kind !== 'system');

export const ActivityPage = () => {
  const { notifications, unread, markRead, toast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const feed = useMemo(() => ACTIVITY_MESSAGES.filter((message) => matches(message, filter)), [filter]);
  const latest = notifications.slice(0, 4);

  return (
    <Page>
      <PageHeader
        title="Activity"
        lead="Workspace events, team messages and system notifications as they happen."
        actions={
          <Button icon={<Bell size={15} aria-hidden />} onClick={() => navigate('/notifications')}>
            Open notifications
          </Button>
        }
      />

      <div className={s.split}>
        <Panel
          title="Live feed"
          description={`${feed.length} events today`}
          actions={
            <Segmented
              label="Feed filter"
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'team', label: 'Team' },
                { value: 'system', label: 'System' },
              ]}
            />
          }
        >
          <span className={i.dayMark}>Today</span>
          <ol className={i.feed} aria-label="Activity feed">
            {feed.map((message) => (
              <li key={message.id} className={`${i.msg} ${message.kind === 'you' ? i.msgOwn : ''}`}>
                <Avatar initials={message.initials} size="sm" />
                <div className={i.msgBody}>
                  {message.kind === 'you' ? null : <span className={i.msgAuthor}>{message.author}</span>}
                  <span className={i.bubble}>{message.body}</span>
                  <span className={i.msgTime}>{message.time}</span>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <div className={s.stack}>
          <Panel title="Team channel" description="Latest comment from your team">
            <div className={i.msg}>
              <Avatar initials="AK" size="sm" />
              <div className={i.msgBody}>
                <span className={i.msgAuthor}>Alex Kim</span>
                <span className={i.bubble}>Conversion chart looks clearer after the spacing pass — ship when ready.</span>
                <span className={i.msgTime}>Just now</span>
              </div>
            </div>
            <span className={i.statusLine}>
              <CircleCheck size={15} aria-hidden />
              All services operational · 99.9% uptime
            </span>
          </Panel>

          <Panel flush title="Recent alerts" description={unread > 0 ? `${unread} unread` : 'All caught up'}>
            {latest.length === 0 ? (
              <Empty icon={<Inbox size={18} aria-hidden />} title="No alerts">
                New alerts will show up here.
              </Empty>
            ) : (
              <ul className={s.list}>
                {latest.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      className={`${s.row} ${s.notif} ${note.read ? s.notifRead : ''}`}
                      onClick={() => {
                        if (note.read) return navigate('/notifications');
                        markRead(note.id);
                        toast({ title: 'Marked as read', description: note.title });
                      }}
                    >
                      <span className={s.rowMain}>
                        <strong>{note.title}</strong>
                        <span>{note.description}</span>
                      </span>
                      {note.read ? null : <span className={s.unreadDot} aria-label="Unread" role="img" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="How activity works" description="Common questions about tracking and alert thresholds">
        <div className={s.faq}>
          {ACTIVITY_FAQ.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <ChevronDown size={16} aria-hidden />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Panel>
    </Page>
  );
};
