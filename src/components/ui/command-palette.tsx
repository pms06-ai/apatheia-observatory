'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const sections = [
  { name: 'Overview', href: '/' },
  { name: 'Actors', href: '/actors' },
  { name: 'Accountability', href: '/accountability' },
  { name: 'Contradictions', href: '/contradictions' },
  { name: 'Evidence', href: '/evidence' },
  { name: 'Explainers', href: '/explainers' },
  { name: 'Framing', href: '/framing' },
  { name: 'Sources', href: '/sources' },
  { name: 'Bias Spectrum', href: '/bias' },
  { name: 'Blind Spots', href: '/blind-spots' },
];

const explainerTerms = [
  { name: 'War Powers Act', id: 'war-powers-act' },
  { name: 'AUMF (2001)', id: 'aumf-2001' },
  { name: 'AUMF (2002)', id: 'aumf-2002' },
  { name: 'Article II Powers', id: 'article-ii-powers' },
  { name: 'Imminent Threat Doctrine', id: 'imminent-threat-doctrine' },
  { name: 'OPSEC', id: 'operational-security' },
  { name: 'Nuclear Breakout Time', id: 'nuclear-breakout-time' },
  { name: 'JCPOA', id: 'jcpoa' },
  { name: 'IRGC', id: 'irgc' },
  { name: 'Maximum Pressure', id: 'maximum-pressure' },
  { name: 'Manufactured Consent', id: 'manufactured-consent' },
  { name: 'Whataboutism', id: 'whataboutism' },
  { name: 'Proxy War', id: 'proxy-war' },
  { name: 'Deterrence', id: 'deterrence' },
];

const quickActors = [
  { name: 'Donald Trump', id: 'donald-trump' },
  { name: 'Hakeem Jeffries', id: 'hakeem-jeffries' },
  { name: 'Bernie Sanders', id: 'bernie-sanders' },
  { name: 'Marco Rubio', id: 'marco-rubio' },
  { name: 'Chuck Schumer', id: 'chuck-schumer' },
  { name: 'Angus King', id: 'angus-king' },
  { name: 'Fox News', id: 'fox-news' },
  { name: 'CNN', id: 'cnn' },
  { name: 'MSNBC', id: 'msnbc' },
  { name: 'The New York Times', id: 'the-new-york-times' },
  { name: 'Jake Tapper', id: 'jake-tapper' },
  { name: 'Rachel Maddow', id: 'rachel-maddow' },
  { name: 'Tucker Carlson', id: 'tucker-carlson' },
  { name: 'Sean Hannity', id: 'sean-hannity' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative w-full max-w-lg rounded-lg border border-line bg-bg-secondary shadow-2xl"
        label="Command palette"
      >
        <Command.Input
          placeholder="Search sections, officials, outlets, journalists…"
          className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-faint outline-none"
        />
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="px-4 py-6 text-center text-sm text-text-faint">
            No results found.
          </Command.Empty>

          <Command.Group heading="Sections" className="mb-2">
            {sections.map((s) => (
              <Command.Item
                key={s.href}
                value={s.name}
                onSelect={() => navigate(s.href)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted data-[selected=true]:bg-gold/10 data-[selected=true]:text-gold"
              >
                {s.name}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Explainers" className="mb-2">
            {explainerTerms.map((t) => (
              <Command.Item
                key={t.id}
                value={`explainer ${t.name}`}
                onSelect={() => navigate(`/explainers#${t.id}`)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted data-[selected=true]:bg-gold/10 data-[selected=true]:text-gold"
              >
                <span className="text-text-faint">◎</span> {t.name}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actors & Media" className="mb-2">
            {quickActors.map((a) => (
              <Command.Item
                key={a.id}
                value={a.name}
                onSelect={() => navigate(`/actors/${a.id}`)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted data-[selected=true]:bg-gold/10 data-[selected=true]:text-gold"
              >
                {a.name}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
