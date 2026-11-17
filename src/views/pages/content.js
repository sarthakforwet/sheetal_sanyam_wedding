// Story and families.

import { html, raw } from '../../lib/html.js';
import { layout } from '../layout.js';
import { icon } from '../motifs.js';
import { pageHead, avatar, contactsCard } from '../components.js';

export function storyPage(c) {
  const { t, tr, config } = c;
  const s = config.story;
  const body = html`
<div class="container">
  ${pageHead(t('story_title'), tr(s.intro), { eyebrow: config.hashtag })}
  <ol class="timeline">
    ${s.timeline.map((m, i) => html`
    <li class="tl-item reveal ${i % 2 ? 'right' : 'left'}">
      <span class="tl-dot" aria-hidden="true"></span>
      <figure class="polaroid tl-card">
        <img src="${m.image}" alt="${tr(m.alt)}" loading="${i ? 'lazy' : 'eager'}" decoding="async" width="546" height="820">
        <figcaption>
          ${m.year ? html`<span class="tl-year">${m.year}</span>` : ''}
          <span class="tl-title">${tr(m.title)}</span>
          ${m.body ? html`<span class="tl-body">${tr(m.body)}</span>` : ''}
        </figcaption>
      </figure>
    </li>`)}
  </ol>
  <section aria-labelledby="gal">
    <h2 id="gal" class="sec-title">${t('moments')}</h2>
    <p class="sec-sub">${t('moments_sub')}</p>
    <ul class="gallery" data-lightbox>
      ${s.gallery.map((g, i) => html`<li><a class="polaroid" href="${g.src}" data-index="${i}"><img src="${g.thumb}" alt="${tr(g.alt)}" loading="lazy" decoding="async" width="480" height="600"><span>${tr(g.caption)}</span></a></li>`)}
    </ul>
  </section>
</div>`;
  return layout(c, { body, page: 'story', title: t('story_title') });
}

export function familyPage(c) {
  const { t, tr, config } = c;
  const families = config.families.filter((f) => f.about || f.members?.length);
  const body = html`
<div class="container">
  ${pageHead(t('family_title'))}
  ${config.families.filter((f) => f.customs).map((f) => html`<aside class="card custom">
    <h3>${icon('heart')} ${t('family_customs')}</h3>
    <p>${tr(f.customs)}</p>
  </aside>`)}
  ${families.map((f) => html`
  <section class="family reveal" aria-labelledby="fam-${f.id}">
    <h2 id="fam-${f.id}" class="sec-title">${tr(f.title)}</h2>
    ${f.about ? html`<p class="lede center">${tr(f.about)}</p>` : ''}
    ${f.members?.length ? html`<h3 class="sub-title">${t('whos_who')}</h3>
    <ul class="people">
      ${f.members.map((m) => html`<li class="person">
        ${avatar(tr(m.name), m.photo)}
        <p class="person-name">${tr(m.name)}</p>
        <p class="person-rel">${tr(m.relation)}</p>
        ${m.note ? html`<p class="person-note">${tr(m.note)}</p>` : ''}
      </li>`)}
    </ul>` : ''}
  </section>`)}
  <section aria-labelledby="queries">
    <h2 id="queries" class="sec-title">${t('queries')}</h2>
    ${contactsCard(c)}
  </section>
</div>`;
  return layout(c, { body, page: 'family', title: t('family_title') });
}
