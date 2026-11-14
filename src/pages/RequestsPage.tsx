import { useMemo, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';

import { Count } from '../components/primitives';
import { Badge, Button, Drawer, Empty, FormField, Input, Modal, PageHeader, Panel, PillTabs, SearchBox, Select, TableWrap, Textarea, tableClass } from '../components/ui';
import {
  PRIORITY_LABEL,
  REQUEST_STATUS_META,
  REQUEST_TYPE_LABEL,
  USER_REQUESTS,
  type RequestStatus,
  type RequestType,
  type UserRequest,
} from '../content/account';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

type StatusFilter = RequestStatus | 'all';
type TypeFilter = RequestType | 'all';

const STATUSES = Object.keys(REQUEST_STATUS_META) as RequestStatus[];
const TYPES = Object.keys(REQUEST_TYPE_LABEL) as RequestType[];

export const RequestsPage = () => {
  const { toast } = useApp();
  const [requests, setRequests] = useState<UserRequest[]>(USER_REQUESTS);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [newType, setNewType] = useState<RequestType>('support');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => status === 'all' || r.status === status)
      .filter((r) => type === 'all' || r.type === type)
      .filter((r) => !q || [r.title, r.id, r.requester].some((value) => value.toLowerCase().includes(q)));
  }, [requests, status, type, query]);

  const selected = requests.find((r) => r.id === openId) ?? null;
  const count = (st: StatusFilter) => (st === 'all' ? requests.length : requests.filter((r) => r.status === st).length);

  const setRequestStatus = (request: UserRequest, next: RequestStatus) => {
    setRequests((list) => list.map((r) => (r.id === request.id ? { ...r, status: next, updatedAt: 'Just now' } : r)));
    toast({ title: `${request.id} · ${REQUEST_STATUS_META[next].label.toLowerCase()}`, description: request.title, tone: next === 'rejected' ? 'danger' : 'success' });
    setOpenId(null);
  };

  const reset = () => {
    setStatus('all');
    setType('all');
    setQuery('');
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setTitle('');
    setSummary('');
    setNewType('support');
  };

  const valid = title.trim().length >= 4;

  const submit = () => {
    const next = Math.max(...requests.map((r) => Number(r.id.replace('REQ-', '')))) + 1;
    const request: UserRequest = {
      id: `REQ-${next}`,
      title: title.trim(),
      type: newType,
      status: 'open',
      priority: 'medium',
      submittedAt: 'Jul 12, 2026',
      updatedAt: 'Just now',
      requester: 'Alex Morgan',
      assignee: 'Support',
      summary: summary.trim() || 'No details provided.',
    };
    setRequests((list) => [request, ...list]);
    toast({ title: 'Request submitted', description: `${request.id} is queued for review.`, tone: 'success' });
    closeCreate();
  };

  return (
    <Page>
      <PageHeader
        title="Requests"
        lead="Access, refund, limit and support tickets from your workspace."
        actions={
          <Button variant="primary" icon={<Plus size={15} aria-hidden />} onClick={() => setCreateOpen(true)}>
            New request
          </Button>
        }
      />

      <Panel flush title="Inbox" description={`${rows.length} request${rows.length === 1 ? '' : 's'} in view`}>
        <div className={s.toolbar}>
          <PillTabs
            label="Request status"
            value={status}
            onChange={setStatus}
            items={[{ value: 'all', label: 'All', count: count('all') }, ...STATUSES.map((st) => ({ value: st, label: REQUEST_STATUS_META[st].label, count: count(st) }))]}
          />
        </div>
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search title, ID or requester" className={s.toolbarSearch} />
          <Select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
            <option value="all">All types</option>
            {TYPES.map((key) => (
              <option key={key} value={key}>
                {REQUEST_TYPE_LABEL[key]}
              </option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <Empty icon={<ClipboardList size={18} aria-hidden />} title="No requests match">
            <Button size="sm" onClick={reset}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Status</th>
                  <th className={s.hideSm}>Type</th>
                  <th className={s.hideMd}>Priority</th>
                  <th className={`${s.num} ${s.hideSm}`}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={s.rowBtn} onClick={() => setOpenId(row.id)}>
                    <td>
                      <div className={i.titleCell}>
                        <span>{row.title}</span>
                        <span>
                          {row.id} · {row.requester}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Count value={REQUEST_STATUS_META[row.status].label} tone={REQUEST_STATUS_META[row.status].tone} />
                    </td>
                    <td className={s.hideSm}>
                      <Badge>{REQUEST_TYPE_LABEL[row.type]}</Badge>
                    </td>
                    <td className={s.hideMd}>{PRIORITY_LABEL[row.priority]}</td>
                    <td className={`${s.num} ${s.hideSm} ${s.muted}`}>{row.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="New request"
        description="Describe what you need — billing, access or product."
        footer={
          <>
            <Button onClick={closeCreate}>Cancel</Button>
            <Button variant="primary" disabled={!valid} onClick={submit}>
              Submit request
            </Button>
          </>
        }
      >
        <div className={s.stack}>
          <FormField label="Title" hint={title && !valid ? 'Use at least 4 characters.' : undefined}>
            {(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" />}
          </FormField>
          <FormField label="Type">
            {(id) => (
              <Select id={id} value={newType} onChange={(e) => setNewType(e.target.value as RequestType)}>
                {TYPES.map((key) => (
                  <option key={key} value={key}>
                    {REQUEST_TYPE_LABEL[key]}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="Details">
            {(id) => <Textarea id={id} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Context for the assignee" rows={4} />}
          </FormField>
        </div>
      </Modal>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setOpenId(null)}
        title={selected ? `Request ${selected.id}` : ''}
        footer={
          selected && (selected.status === 'open' || selected.status === 'in_review') ? (
            <>
              <Button variant="danger" onClick={() => setRequestStatus(selected, 'rejected')}>
                Reject
              </Button>
              {selected.status === 'open' ? <Button onClick={() => setRequestStatus(selected, 'in_review')}>Mark in review</Button> : null}
              <Button variant="primary" onClick={() => setRequestStatus(selected, 'approved')}>
                Approve
              </Button>
            </>
          ) : undefined
        }
      >
        {selected ? (
          <>
            <div className={i.chips}>
              <Count value={REQUEST_STATUS_META[selected.status].label} tone={REQUEST_STATUS_META[selected.status].tone} />
              <Badge>{REQUEST_TYPE_LABEL[selected.type]}</Badge>
              <Badge>{PRIORITY_LABEL[selected.priority]} priority</Badge>
            </div>
            <div className={i.titleCell}>
              <strong>{selected.title}</strong>
            </div>
            <p className={i.summary}>{selected.summary}</p>
            <dl className={s.dl}>
              <dt>Requester</dt>
              <dd>{selected.requester}</dd>
              <dt>Assignee</dt>
              <dd>{selected.assignee}</dd>
              <dt>Submitted</dt>
              <dd>{selected.submittedAt}</dd>
              <dt>Updated</dt>
              <dd>{selected.updatedAt}</dd>
            </dl>
          </>
        ) : null}
      </Drawer>
    </Page>
  );
};
