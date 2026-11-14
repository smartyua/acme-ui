import { useState } from 'react';

import { Switch } from '../components/primitives';
import { Button, FormField, Input, PageHeader, Panel, Select, cx } from '../components/ui';
import { Page } from '../layout/Page';
import { useApp, type ThemePref } from '../lib/app';
import s from './pages.module.scss';

type Prefs = {
  workspace: string;
  domain: string;
  timezone: string;
  language: string;
  emailDigest: boolean;
  paymentAlerts: boolean;
  productNews: boolean;
  requireSso: boolean;
  enforce2fa: boolean;
  sessionTimeout: string;
};

const INITIAL: Prefs = {
  workspace: 'Acme',
  domain: 'acme.io',
  timezone: 'Europe/Berlin',
  language: 'en',
  emailDigest: true,
  paymentAlerts: true,
  productNews: false,
  requireSso: false,
  enforce2fa: true,
  sessionTimeout: '12h',
};

const THEMES: Array<{ value: ThemePref; label: string; swatch: string }> = [
  { value: 'light', label: 'Light', swatch: s.swatchLight },
  { value: 'dark', label: 'Dark', swatch: s.swatchDark },
  { value: 'system', label: 'System', swatch: s.swatchSystem },
];

type ToggleKey = 'emailDigest' | 'paymentAlerts' | 'productNews' | 'requireSso' | 'enforce2fa';

const SettingToggle = ({
  k,
  title,
  hint,
  checked,
  onChange,
}: {
  k: ToggleKey;
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className={s.settingRow}>
    <div>
      <strong>{title}</strong>
      <span>{hint}</span>
    </div>
    <Switch id={`set-${k}`} label={title} hideLabel checked={checked} onChange={onChange} />
  </div>
);

export const SettingsPage = () => {
  const { themePref, setThemePref, toast } = useApp();
  const [saved, setSaved] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = JSON.stringify(saved) !== JSON.stringify(form);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Page>
      <PageHeader title="Settings" lead="Workspace preferences, appearance and security." />

      <div className={s.stack}>
        <Panel title="Workspace" description="Shown to teammates and on invoices.">
          <div className={s.formGrid}>
            <FormField label="Workspace name">{(id) => <Input id={id} value={form.workspace} onChange={(e) => set('workspace', e.target.value)} />}</FormField>
            <FormField label="Company domain" hint="New sign-ups from this domain join automatically.">
              {(id) => <Input id={id} value={form.domain} onChange={(e) => set('domain', e.target.value)} />}
            </FormField>
            <FormField label="Time zone">
              {(id) => (
                <Select id={id} value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Europe/Warsaw">Europe/Warsaw</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="America/Los_Angeles">America/Los Angeles</option>
                </Select>
              )}
            </FormField>
            <FormField label="Language">
              {(id) => (
                <Select id={id} value={form.language} onChange={(e) => set('language', e.target.value)}>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="pl">Polski</option>
                  <option value="uk">Українська</option>
                </Select>
              )}
            </FormField>
          </div>
        </Panel>

        <Panel title="Appearance" description="Applies instantly on this device.">
          <div className={s.choiceGrid} role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.value} type="button" role="radio" aria-checked={themePref === t.value} className={cx(s.choice, themePref === t.value && s.choiceActive)} onClick={() => setThemePref(t.value)}>
                <span className={cx(s.swatch, t.swatch)} aria-hidden />
                {t.label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Email notifications">
          <div>
            <SettingToggle k="emailDigest" title="Weekly digest" hint="Revenue, signups and template usage every Monday." checked={form.emailDigest} onChange={(v) => set('emailDigest', v)} />
            <SettingToggle k="paymentAlerts" title="Payment alerts" hint="Failed payments and disputes as they happen." checked={form.paymentAlerts} onChange={(v) => set('paymentAlerts', v)} />
            <SettingToggle k="productNews" title="Product news" hint="New templates and features, about once a month." checked={form.productNews} onChange={(v) => set('productNews', v)} />
          </div>
        </Panel>

        <Panel title="Security">
          <div>
            <SettingToggle k="requireSso" title="Require single sign-on" hint="Members must sign in with your identity provider." checked={form.requireSso} onChange={(v) => set('requireSso', v)} />
            <SettingToggle k="enforce2fa" title="Enforce two-factor authentication" hint="Applies to everyone with admin access." checked={form.enforce2fa} onChange={(v) => set('enforce2fa', v)} />
            <div className={s.settingRow}>
              <div>
                <strong>Session timeout</strong>
                <span>Sign out inactive members automatically.</span>
              </div>
              <Select value={form.sessionTimeout} onChange={(e) => set('sessionTimeout', e.target.value)} aria-label="Session timeout">
                <option value="1h">1 hour</option>
                <option value="12h">12 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </Select>
            </div>
          </div>
        </Panel>
      </div>

      {dirty ? (
        <div className={s.saveBar} role="region" aria-label="Unsaved changes">
          <span>You have unsaved changes</span>
          <div>
            <Button onClick={() => setForm(saved)}>Discard</Button>
            <Button
              variant="primary"
              disabled={!form.workspace.trim()}
              onClick={() => {
                setSaved(form);
                toast({ title: 'Settings saved', description: 'Your preferences have been updated.', tone: 'success' });
              }}
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </Page>
  );
};
