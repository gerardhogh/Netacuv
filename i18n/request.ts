import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['fr', 'en', 'es', 'zh'];
export const defaultLocale = 'fr';

export default getRequestConfig(async () => {
  // Use the NEXT_LOCALE cookie if it exists
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  const locale: string = locales.includes(localeFromCookie as string) 
    ? (localeFromCookie as string) 
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
