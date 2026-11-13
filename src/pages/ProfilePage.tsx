import { useState } from 'react';
import { KeyRound, Laptop, Monitor, Smartphone } from 'lucide-react';

import { Switch } from '../components/primitives';
import { Badge, Button, FormField, Input, Modal, PageHeader, Panel, Select } from '../components/ui';
import { PROFILE_USER, SESSIONS } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

const DEVICE_ICON = { laptop: Laptop, phone: Smartphone, desktop: Monitor };

export const ProfilePage = () => {
  const { toast } = useApp();
  const [profile, setProfile] = useState(PROFILE_USER);
  const [draft, setDraft] = useState(PROFILE_USER);
  const [twoFa, setTwoFa] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const dirty = JSON.stringify(profile) !== JSON.stringify(draft);
  const pwOk = pw.current.length > 0 && pw.next.length >= 8 && pw.next === pw.confirm;

  return (
    <Page>
      <PageHeader title="Profile" lead="Your identity, security and sessions." />

      <div className={s.split}>
        <Panel title="Personal details">
          <div className={s.profileHead}>
            <span className={s.bigAvatar} aria-hidden>
              {profile.initials}
            </span>
            <div className={s.rowMain}>
              <strong>{profile.name}</strong>
              <span>
                {profile.title} · {profile.role}
              </span>
              <span>Member since {profile.joined}</span>
            </div>
          </div>
          <div className={s.formGrid}>
            <FormField label="Full name">{(id) => <Input id={id} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />}</FormField>
            <FormField label="Job title">{(id) => <Input id={id} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}</FormField>
            <FormField label="Email">{(id) => <Input id={id} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />}</FormField>
            <FormField label="Phone">{(id) => <Input id={id} type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />}</FormField>
            <FormField label="Time zone">
              {(id) => (
                <Select id={id} value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Europe/Warsaw">Europe/Warsaw</option>
                  <option value="Europe/Kyiv">Europe/Kyiv</option>
                  <option value="UTC">UTC</option>
                </Select>
              )}
            </FormField>
          </div>
          <div className={s.rowEnd} style={{ justifyContent: 'flex-end' }}>
            <Button disabled={!dirty} onClick={() => setDraft(profile)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!dirty || !draft.name.trim()}
              onClick={() => {
                const initials = draft.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0].toUpperCase())
                  .join('');
                const next = { ...draft, initials };
                setProfile(next);
                setDraft(next);
                toast({ title: 'Profile updated', tone: 'success' });
              }}
            >
              Save
            </Button>
          </div>
        </Panel>

        <Panel title="Security">
          <div>
            <div className={s.settingRow}>
              <div>
                <strong>Password</strong>
                <span>Last changed 3 months ago</span>
              </div>
              <Button size="sm" icon={<KeyRound size={14} aria-hidden />} onClick={() => setPwOpen(true)}>
                Change
              </Button>
            </div>
            <div className={s.settingRow}>
              <div>
                <strong>Two-factor authentication</strong>
                <span>{twoFa ? 'Authenticator app' : 'Off — your account is less secure'}</span>
              </div>
              <Switch
                id="twofa"
                label="Two-factor authentication"
                hideLabel
                checked={twoFa}
                onChange={(v) => {
                  setTwoFa(v);
                  toast({ title: v ? '2FA enabled' : '2FA disabled', tone: v ? 'success' : 'danger' });
                }}
              />
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        flush
        title="Active sessions"
        description="Devices signed in to your account."
        actions={
          sessions.length > 1 ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setSessions((list) => list.filter((x) => x.current));
                toast({ title: 'Signed out other devices', tone: 'success' });
              }}
            >
              Sign out others
            </Button>
          ) : undefined
        }
      >
        <ul className={s.list}>
          {sessions.map((se) => {
            const Icon = DEVICE_ICON[se.kind];
            return (
              <li key={se.id} className={s.row}>
                <span className={s.iconTile}>
                  <Icon size={16} aria-hidden />
                </span>
                <div className={s.rowMain}>
                  <strong>{se.device}</strong>
                  <span>
                    {se.place} · {se.last}
                  </span>
                </div>
                <div className={s.rowEnd}>
                  {se.current ? (
                    <Badge tone="mint">This device</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSessions((list) => list.filter((x) => x.id !== se.id));
                        toast({ title: 'Session revoked', description: se.device });
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Change password"
        width="sm"
        footer={
          <>
            <Button onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!pwOk}
              onClick={() => {
                setPwOpen(false);
                setPw({ current: '', next: '', confirm: '' });
                toast({ title: 'Password changed', tone: 'success' });
              }}
            >
              Update password
            </Button>
          </>
        }
      >
        <FormField label="Current password">{(id) => <Input id={id} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />}</FormField>
        <FormField label="New password" hint="At least 8 characters.">
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}
        </FormField>
        <FormField label="Confirm new password" hint={pw.confirm && pw.confirm !== pw.next ? 'Passwords don’t match' : undefined}>
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}
        </FormField>
      </Modal>
    </Page>
  );
};
