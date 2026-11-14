import { useState } from 'react';
import { BellOff, CheckCheck, CreditCard, LayoutTemplate, ServerCog, FileText, Users, X } from 'lucide-react';

import { Segmented } from '../components/primitives';
import { Button, Empty, PageHeader, Panel, cx } from '../components/ui';
import { type AppNotification, type NotificationKind } from '../data';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

const KIND_ICON: Record<NotificationKind, typeof Users> = {
  payment: CreditCard,
  team: Users,
  system: ServerCog,
  report: FileText,
  workflow: LayoutTemplate,
};

type Filter = 'all' | 'unread' | NotificationKind;

export const NotificationsPage = () => {
  const { notifications, unread, markRead, markAllRead, removeNotification, toast } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = notifications.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.kind === filter));
  const groups = (['Today', 'Yesterday', 'Earlier'] as const)
    .map((g) => ({ group: g, items: visible.filter((n) => n.group === g) }))
    .filter((g) => g.items.length > 0);

  const Item = ({ n }: { n: AppNotification }) => {
    const Icon = KIND_ICON[n.kind];
    return (
      <li className={cx(s.row, s.notif, n.read && s.notifRead)} onClick={() => markRead(n.id)} style={{ cursor: 'pointer' }}>
        <span className={s.iconTile}>
          <Icon size={16} aria-hidden />
        </span>
        <div className={s.rowMain}>
          <strong>{n.title}</strong>
          <span>{n.description}</span>
        </div>
        <div className={s.rowEnd}>
          <span className={s.muted} style={{ fontSize: '0.75rem' }}>
            {n.time}
          </span>
          {!n.read ? <span className={s.unreadDot} aria-label="Unread" /> : null}
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Dismiss ${n.title}`}
            icon={<X size={14} aria-hidden />}
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(n.id);
            }}
          />
        </div>
      </li>
    );
  };

  return (
    <Page>
      <PageHeader
        title="Notifications"
        lead={unread > 0 ? `${unread} unread` : 'You’re all caught up'}
        actions={
          <Button
            icon={<CheckCheck size={15} aria-hidden />}
            disabled={unread === 0}
            onClick={() => {
              markAllRead();
              toast({ title: 'All notifications marked as read' });
            }}
          >
            Mark all as read
          </Button>
        }
      />

      <Panel
        flush
        title="Inbox"
        actions={
          <Segmented
            label="Filter"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: `Unread${unread ? ` · ${unread}` : ''}` },
              { value: 'payment', label: 'Payments' },
              { value: 'team', label: 'Team' },
              { value: 'system', label: 'System' },
            ]}
          />
        }
      >
        {groups.length === 0 ? (
          <Empty icon={<BellOff size={18} aria-hidden />} title="Nothing here">
            {filter === 'unread' ? 'Every notification has been read.' : 'No notifications in this category.'}
          </Empty>
        ) : (
          groups.map((g) => (
            <div key={g.group}>
              <div className={s.groupLabel}>{g.group}</div>
              <ul className={s.list}>
                {g.items.map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </ul>
            </div>
          ))
        )}
      </Panel>
    </Page>
  );
};
