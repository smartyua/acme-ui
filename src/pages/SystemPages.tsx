import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui';
import { Page } from '../layout/Page';
import s from './pages.module.scss';

export const SignedOutPage = () => {
  const navigate = useNavigate();
  return (
    <div className={s.center}>
      <div className={s.centerCard}>
        <span className={s.bigAvatar} aria-hidden>
          A
        </span>
        <h1>You’re signed out</h1>
        <p>Thanks for using Acme. Sign in again to get back to your workspace.</p>
        <Button variant="primary" block onClick={() => navigate('/overview')}>
          Sign in again
        </Button>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Page>
      <div className={s.centerCard} style={{ margin: '3rem auto' }}>
        <h1>Page not found</h1>
        <p>This page doesn’t exist or was moved.</p>
        <Button variant="primary" onClick={() => navigate('/overview')}>
          Back to Overview
        </Button>
      </div>
    </Page>
  );
};
