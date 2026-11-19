export interface SalesAdvisor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
}

export const DEFAULT_STORE_PHONE = '+223 71 88 32 07';

export const SALES_ADVISORS: SalesAdvisor[] = [
  {
    id: 'adv-1',
    name: 'Moussa',
    role: 'Spécialiste Apple',
    avatar: '/src/assets/images/advisor_one_1795100407799.jpg',
    phone: '+223 71 88 32 07',
  },
  {
    id: 'adv-2',
    name: 'Aminata',
    role: 'Spécialiste Samsung',
    avatar: '/src/assets/images/advisor_two_1795100409164.jpg',
    phone: '+223 71 88 32 07',
  },
  {
    id: 'adv-3',
    name: 'Ibrahim',
    role: 'Spécialiste Android',
    avatar: '/src/assets/images/advisor_three_1795100409401.jpg',
    phone: '+223 71 88 32 07',
  },
];

export function resolveAdvisorTelHref(
  advisorPhone: string,
  configuredPhone?: string,
): string {
  const raw = (configuredPhone && configuredPhone.trim()) || advisorPhone || DEFAULT_STORE_PHONE;
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? `tel:+${digits}` : 'tel:+22371883207';
}
