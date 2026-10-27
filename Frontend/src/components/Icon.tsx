import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  bank: <><path d="M3 9h18L12 4 3 9Z" /><path d="M5 10v7m4-7v7m6-7v7m4-7v7M3 19h18M2 21h20" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.4-3 2.3-4.5 5.5-4.5s5.1 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.8m1 3.2c2.2.5 3.4 2 3.7 4.5" /></>,
  wallet: <><rect x="3.5" y="5.5" width="17" height="14" rx="2.5" /><path d="M3.5 9h17m-5 5h2M6.5 5.5V4.7A1.7 1.7 0 0 1 8.2 3h10.3" /></>,
  coins: <><circle cx="8" cy="8" r="4" /><circle cx="16" cy="16" r="4" /><path d="M8 6v4m-1.5-1h3m5.5 6v4m-1.5-1h3" /></>,
  pulse: <path d="M3 12h4l2.5-6 4.5 12 2.5-6H21" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m5-4 4-4-4-4m4 4H9" />,
  search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></>,
  lock: <><rect x="4.5" y="10" width="15" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
}

export default function Icon({ name }: { name: string }) {
  return (
    <svg className={`icon icon-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
