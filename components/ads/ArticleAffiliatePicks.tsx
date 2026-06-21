import { getArticleAffiliates } from '@/lib/articleAffiliates';

export default function ArticleAffiliatePicks({ articleSlug }: { articleSlug: string }) {
  const picks = getArticleAffiliates(articleSlug);
  if (!picks.length) return null;
  return (
    <aside aria-label="Recommended tools" style={{ margin: '2rem 0', padding: '1rem 1.25rem', border: '1px solid #eee', borderRadius: 12 }}>
      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, margin: '0 0 .75rem' }}>
        Recommended tools · affiliate
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.75rem' }}>
        {picks.map((p) => (
          <li key={p.slug}>
            <a href={`/go/${p.slug}/`} rel="sponsored nofollow" style={{ fontWeight: 600 }}>
              {p.anchorText}
            </a>
            {p.blurb ? <span style={{ opacity: 0.75 }}> — {p.blurb}</span> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
