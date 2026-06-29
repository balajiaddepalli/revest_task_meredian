import { useEffect } from 'react';

const BASE = 'Meridian Admin';

export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE;
    return () => {
      document.title = BASE;
    };
  }, [title]);
  return null;
}
