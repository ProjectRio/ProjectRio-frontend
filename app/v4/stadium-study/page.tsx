import type { Metadata } from 'next';
import StadiumStudy from '@/components/v4/stadium-study/StadiumStudy';

export const metadata: Metadata = { title: 'Stadium material study' };

export default function Page() {
  return <StadiumStudy />;
}
