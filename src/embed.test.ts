import { describe, expect, it } from 'vitest';

import { getEmbedContext, getHostHomeUrl, getTitleSuffix } from './embed';

describe('getEmbedContext', () => {
  it('detects the kylypko.com mount point', () => {
    expect(getEmbedContext('/en/acme-ui/overview/')).toEqual({ basename: '/en/acme-ui', lang: 'en' });
    expect(getEmbedContext('/ua/acme-ui')).toEqual({ basename: '/ua/acme-ui', lang: 'ua' });
  });

  it('stays null for standalone and look-alike paths', () => {
    expect(getEmbedContext('/overview')).toBeNull();
    expect(getEmbedContext('/en/acme-uix/')).toBeNull();
    expect(getEmbedContext('/fr/acme-ui/')).toBeNull();
  });

  it('brands the document title with the host site only when embedded', () => {
    expect(getTitleSuffix('/en/acme-ui/overview')).toBe('Acme UI · KYLYPKO.COM');
    expect(getTitleSuffix('/overview')).toBe('Acme');
  });

  it('points back at the host home page only when embedded', () => {
    expect(getHostHomeUrl('/pl/acme-ui/bess/')).toBe('/pl/');
    expect(getHostHomeUrl('/overview')).toBeNull();
  });
});
