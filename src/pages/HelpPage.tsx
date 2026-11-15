import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  Eye,
  FileSpreadsheet,
  Globe,
  Headphones,
  Landmark,
  Mail,
  Pencil,
  Plug,
  Receipt,
  Rocket,
  ThumbsUp,
  Wallet,
} from 'lucide-react';

import { Avatar, Count } from '../components/primitives';
import {
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Modal,
  SearchBox,
  Select,
  Textarea,
  cx,
} from '../components/ui';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import styles from './Help/Help.module.scss';
import {
  GUIDE_CATEGORIES,
  POPULAR_ARTICLES,
  POPULAR_TOPICS,
  SYSTEM_SERVICES,
  type GuideArticle,
} from './Help/helpData';
import s from './pages.module.scss';

const TopicChipIcon = ({ id }: { id: string }) => {
  if (id === 'funds') return <Wallet size={14} aria-hidden />;
  if (id === 'payouts') return <Landmark size={14} aria-hidden />;
  if (id === 'contacts') return <FileSpreadsheet size={14} aria-hidden />;
  if (id === 'dns') return <Globe size={14} aria-hidden />;
  return <Receipt size={14} aria-hidden />;
};

const CategoryIcon = ({ id }: { id: string }) => {
  if (id === 'getting-started') return <Rocket size={16} aria-hidden />;
  if (id === 'payments-payouts') return <Wallet size={16} aria-hidden />;
  return <Mail size={16} aria-hidden />;
};

const PopularArticleIcon = ({ id }: { id: string }) => {
  if (id === 'pop-1') return <Landmark size={15} aria-hidden />;
  if (id === 'pop-2') return <Plug size={15} aria-hidden />;
  if (id === 'pop-3') return <FileSpreadsheet size={15} aria-hidden />;
  if (id === 'pop-4') return <Globe size={15} aria-hidden />;
  return <Receipt size={15} aria-hidden />;
};

export const HelpPage = () => {
  const { toast } = useApp();

  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [popularRange, setPopularRange] = useState<'week' | 'month' | 'all'>('week');

  const [activeGuide, setActiveGuide] = useState<GuideArticle | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const [topic, setTopic] = useState('payouts');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUIDE_CATEGORIES;
    return GUIDE_CATEGORIES.map((cat) => ({
      ...cat,
      guides: cat.guides.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.guides.length > 0);
  }, [query]);

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_ARTICLES;
    return POPULAR_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [query]);

  const handleTopicClick = (topicId: string, topicQuery: string) => {
    if (activeTopic === topicId) {
      setActiveTopic(null);
      setQuery('');
      return;
    }
    setActiveTopic(topicId);
    setQuery(topicQuery);
  };

  return (
    <Page>
      <div className={styles.breadcrumbs}>
        <span>Workspace</span>
        <ChevronRight size={14} aria-hidden />
        <span>Settings</span>
        <ChevronRight size={14} aria-hidden />
        <strong>Help &amp; support</strong>
      </div>

      <header className={styles.headerRow}>
        <div className={styles.headingBlock}>
          <h1>Help &amp; support</h1>
          <p>Guides, answers and a real person when you need one.</p>
        </div>

        <div className={styles.headerActions}>
          <Button
            icon={<CircleCheck size={15} aria-hidden />}
            onClick={() =>
              toast({
                title: '3 of 4 systems operational',
                description: 'Instant payouts are experiencing a ~40 minute partner delay.',
              })
            }
          >
            Status
          </Button>

          <Button
            variant="primary"
            icon={<Headphones size={15} aria-hidden />}
            onClick={() => setContactOpen(true)}
          >
            Contact support
          </Button>
        </div>
      </header>

      {/* ── Hero search card ───────────────────────────────────────────── */}
      <section className={styles.heroCard} aria-label="Search help guides">
        <div className={styles.heroLeft}>
          <span className={styles.heroIconTile} aria-hidden>
            <BookOpen size={18} aria-hidden />
          </span>
          <div className={styles.heroCopy}>
            <h2>How can we help, Jordan?</h2>
            <p>Search 120+ guides or browse a topic below.</p>
          </div>
        </div>

        <div className={styles.heroRight}>
          <SearchBox
            value={query}
            onChange={(next) => {
              setQuery(next);
              if (!next) setActiveTopic(null);
            }}
            placeholder="Search guides, e.g. 'connect Stripe'"
            shortcut="/"
          />

          <div className={styles.popularRow}>
            <span>Popular:</span>
            {POPULAR_TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cx(
                  styles.topicChip,
                  activeTopic === item.id && styles.topicChipActive,
                )}
                onClick={() => handleTopicClick(item.id, item.query)}
              >
                <TopicChipIcon id={item.id} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-column guide categories ──────────────────────────────────── */}
      {filteredCategories.length === 0 ? (
        <Empty icon={<BookOpen size={18} aria-hidden />} title="No guides match your search">
          <Button
            size="sm"
            onClick={() => {
              setQuery('');
              setActiveTopic(null);
            }}
          >
            Clear search
          </Button>
        </Empty>
      ) : (
        <div className={styles.categoryGrid}>
          {filteredCategories.map((cat) => (
            <section key={cat.id} className={styles.categoryCard} aria-label={cat.title}>
              <div>
                <div className={styles.catHeader}>
                  <span
                    className={cx(styles.catTile, styles[`catTile-${cat.tone}`])}
                    aria-hidden
                  >
                    <CategoryIcon id={cat.id} />
                  </span>
                  <div className={styles.catTitleBlock}>
                    <h2>{cat.title}</h2>
                    <span>{cat.subtitle}</span>
                  </div>
                </div>

                <ul className={styles.guideList}>
                  {cat.guides.map((guide) => (
                    <li key={guide.id} className={styles.guideItem}>
                      <button
                        type="button"
                        className={styles.guideBtn}
                        onClick={() => setActiveGuide(guide)}
                      >
                        <div className={styles.guideBtnText}>
                          <strong>{guide.title}</strong>
                          <span>{guide.readTime}</span>
                        </div>
                        <ChevronRight size={14} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() =>
                  toast({
                    title: `${cat.title} collection`,
                    description: `Loaded all ${cat.totalGuides} guides in ${cat.title}.`,
                  })
                }
              >
                <span>View all {cat.totalGuides} guides</span>
                <ChevronRight size={14} aria-hidden />
              </button>
            </section>
          ))}
        </div>
      )}

      {/* ── Bottom split: Popular articles + Contact & status ──────────── */}
      <div className={styles.bottomGrid}>
        <section className={styles.panelCard} aria-label="Popular articles">
          <div className={styles.panelTop}>
            <div className={styles.panelHeading}>
              <h2>Popular articles</h2>
              <p>Most read by Loopo workspaces this week</p>
            </div>

            <Select
              aria-label="Popular articles time window"
              value={popularRange}
              onChange={(e) =>
                setPopularRange(e.target.value as 'week' | 'month' | 'all')
              }
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </Select>
          </div>

          <ul className={styles.popularList}>
            {filteredPopular.map((art) => (
              <li key={art.id} className={styles.popularRowItem}>
                <button
                  type="button"
                  className={styles.popularItemBtn}
                  onClick={() => setActiveGuide(art)}
                >
                  <div className={styles.popularLeft}>
                    <span
                      className={cx(
                        styles.popularIcon,
                        styles[`catTile-${art.tone ?? 'sky'}`],
                      )}
                      aria-hidden
                    >
                      <PopularArticleIcon id={art.id} />
                    </span>
                    <div className={styles.guideBtnText}>
                      <strong>{art.title}</strong>
                      <span>
                        {art.category} · {art.readTime}
                      </span>
                    </div>
                  </div>

                  <span className={styles.popularViews}>
                    <Eye size={14} aria-hidden />
                    <span>{art.views}</span>
                    <ChevronRight size={14} aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panelCard} aria-label="Contact and system status">
          <div className={styles.panelTop}>
            <div className={styles.panelHeading}>
              <h2>Contact &amp; status</h2>
              <p>All systems checked 2 min ago</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Compose support message"
              onClick={() => setContactOpen(true)}
            >
              <Pencil size={15} aria-hidden />
            </Button>
          </div>

          <div className={styles.supportBanner}>
            <div className={styles.supportLeft}>
              <Avatar initials="SO" />
              <div className={styles.supportCopy}>
                <strong>Sam Okafor and the support team</strong>
                <span>Mon–Fri 6 AM – 6 PM PT · Sat 8 AM – 2 PM PT</span>
              </div>
            </div>

            <div className={styles.supportReply}>
              <strong>under 2 h</strong>
              <span>avg. first reply</span>
            </div>
          </div>

          <div className={styles.statusHeaderRow}>
            <span>System status</span>
            <span>Last 30 days</span>
          </div>

          <ul className={styles.statusList}>
            {SYSTEM_SERVICES.map((srv) => (
              <li key={srv.id} className={styles.statusRow}>
                <span className={styles.serviceName}>
                  <span
                    className={
                      srv.status === 'operational'
                        ? styles.statusDotOk
                        : styles.statusDotWarn
                    }
                    aria-hidden
                  />
                  {srv.name}
                </span>

                <div className={styles.uptimeStrip} aria-hidden>
                  {srv.bars.map((state, idx) => (
                    <span
                      key={idx}
                      className={
                        state === 'up'
                          ? styles.uptimeTickUp
                          : styles.uptimeTickWarn
                      }
                    />
                  ))}
                </div>

                {srv.status === 'operational' ? (
                  <span className={styles.operationalLabel}>{srv.statusLabel}</span>
                ) : (
                  <Count tone="lemon" value={srv.statusLabel} />
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Guide reader drawer */}
      <Drawer
        open={Boolean(activeGuide)}
        onClose={() => setActiveGuide(null)}
        title={activeGuide ? activeGuide.title : 'Guide'}
        footer={
          activeGuide ? (
            <Button
              icon={<ThumbsUp size={15} aria-hidden />}
              onClick={() => {
                toast({
                  title: 'Feedback recorded',
                  description: `Marked "${activeGuide.title}" as helpful.`,
                  tone: 'success',
                });
                setActiveGuide(null);
              }}
            >
              Mark guide helpful
            </Button>
          ) : undefined
        }
      >
        {activeGuide ? (
          <div className={styles.drawerBody}>
            <dl className={s.dl}>
              <dt>Topic</dt>
              <dd>{activeGuide.category}</dd>
              <dt>Reading time</dt>
              <dd>{activeGuide.readTime}</dd>
            </dl>
            <p>{activeGuide.summary}</p>
            <div>
              <h3>Step-by-step walkthrough</h3>
              <ol className={styles.stepList}>
                {activeGuide.steps.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Contact support modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contact support"
        description="Sam Okafor and the support team reply in under 2 hours."
        footer={
          <>
            <Button onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!subject.trim() || message.trim().length < 10}
              onClick={() => {
                setContactOpen(false);
                setSubject('');
                setMessage('');
                toast({
                  title: 'Support ticket created',
                  description: 'Ticket #4821 assigned to Sam Okafor. Reply coming to jordan@loopo.io.',
                  tone: 'success',
                });
              }}
            >
              Send request
            </Button>
          </>
        }
      >
        <div className={styles.drawerBody}>
          <FormField label="Topic">
            {(id) => (
              <Select
                id={id}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="payouts">Payments &amp; payouts</option>
                <option value="dns">Sending domain &amp; DNS</option>
                <option value="contacts">Audience &amp; CSV imports</option>
                <option value="other">Something else</option>
              </Select>
            )}
          </FormField>

          <FormField label="Subject">
            {(id) => (
              <Input
                id={id}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Instant payout pending since 09:30"
              />
            )}
          </FormField>

          <FormField label="Message" hint="At least 10 characters.">
            {(id) => (
              <Textarea
                id={id}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include any payout ID, domain or order reference…"
              />
            )}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
