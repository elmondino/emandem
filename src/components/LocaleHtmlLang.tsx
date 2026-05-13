'use client';

import { useEffect } from 'react';

interface Props {
  lang: string;
}

export function LocaleHtmlLang({ lang }: Props) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
