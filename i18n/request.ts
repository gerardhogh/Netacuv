import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async () => {
  const [cookieStore, headersList] = await Promise.all([
    cookies(),
    headers(),
  ]);

  const localeFromHeader = headersList.get('x-locale');
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;

  const candidateLocale = (localeFromHeader || localeFromCookie) as string;

  const locale: Locale = locales.includes(candidateLocale as Locale)
    ? (candidateLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
