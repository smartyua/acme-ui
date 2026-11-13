import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, LifeBuoy, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Empty, FormField, Input, PageHeader, Panel, SearchBox, Select, Textarea } from '../components/ui';
import { FAQ } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

export const HelpPage = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('billing');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const faq = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  const scrollToForm = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Page>
      <PageHeader title="Help" lead="Answers to common questions, or get in touch with support." />

      <div className={s.helpCards}>
        <button type="button" className={s.helpCard} onClick={() => navigate('/templates')}>
          <BookOpen size={18} aria-hidden />
          <strong>Browse templates</strong>
          <span>Start from 180 tested workflows.</span>
        </button>
        <button type="button" className={s.helpCard} onClick={scrollToForm}>
          <MessageSquare size={18} aria-hidden />
          <strong>Contact support</strong>
          <span>We reply within 4 business hours.</span>
        </button>
        <button type="button" className={s.helpCard} onClick={() => toast({ title: 'All systems operational', description: 'API, workflows and billing are healthy.', tone: 'success' })}>
          <LifeBuoy size={18} aria-hidden />
          <strong>System status</strong>
          <span>Check if anything is degraded.</span>
        </button>
      </div>

      <div className={s.split}>
        <Panel title="Frequently asked" actions={<SearchBox value={query} onChange={setQuery} placeholder="Search answers" className={s.toolbarSearch} />}>
          {faq.length === 0 ? (
            <Empty title="No answers match">Try different words, or ask support below.</Empty>
          ) : (
            <div className={s.faq}>
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <ChevronDown size={16} aria-hidden />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Contact support" description="Describe the problem and we’ll get back to you by email.">
          <form
            id="contact"
            className={s.stack}
            onSubmit={(e) => {
              e.preventDefault();
              toast({ title: 'Request sent', description: 'Ticket #4821 created. We’ll reply to alex@acme.io.', tone: 'success' });
              setSubject('');
              setMessage('');
            }}
          >
            <FormField label="Topic">
              {(id) => (
                <Select id={id} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="billing">Billing & payments</option>
                  <option value="templates">Templates & workflows</option>
                  <option value="account">Account & security</option>
                  <option value="other">Something else</option>
                </Select>
              )}
            </FormField>
            <FormField label="Subject">{(id) => <Input id={id} value={subject} onChange={(e) => setSubject(e.target.value)} required />}</FormField>
            <FormField label="Message">{(id) => <Textarea id={id} value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} />}</FormField>
            <Button type="submit" variant="primary" disabled={!subject.trim() || message.trim().length < 10}>
              Send request
            </Button>
          </form>
        </Panel>
      </div>
    </Page>
  );
};
