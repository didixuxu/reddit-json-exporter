const hosts = new Set(['www.reddit.com', 'old.reddit.com', 'reddit.com']);

export function jsonUrl(input, limit = 100, options = {}) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || !hosts.has(url.hostname)) throw new Error('请先打开一个 HTTPS Reddit 社区、搜索或帖子页面。');
  let path = url.pathname.replace(/\/+$/, '').replace(/\.json$/, '').replace(/\/+$/, '');
  if (!/^\/(?:r\/[^/]+(?:\/(?:hot|new|top|rising|controversial|search))?|r\/[^/]+\/comments\/[^/]+(?:\/[^/]+)?(?:\/[^/]+)?|comments\/[^/]+(?:\/[^/]+)?(?:\/[^/]+)?|search)$/.test(path)) {
    throw new Error('目前支持社区、社区排序页、搜索页和帖子详情页。请在这些页面使用。');
  }
  const mode = options.mode || 'current';
  if (!['current','new','hot','rising','top','controversial','search'].includes(mode)) throw new Error('请选择支持的采集方式。');
  const community = path.match(/^\/r\/([^/]+)/)?.[1];
  if (mode !== 'current') {
    if (!community && mode !== 'search') throw new Error('请在一个社区页面使用此采集方式。');
    const base = community ? `/r/${community}` : '';
    url.search = '';
    path = `${base}/${mode}`;
    if (['top','controversial','search'].includes(mode)) {
      const time = options.time || 'all';
      if (!['hour','day','week','month','year','all'].includes(time)) throw new Error('请选择有效的时间范围。');
      url.searchParams.set('t', time);
    }
    if (mode === 'search') {
      const query = String(options.query || '').trim();
      if (!query) throw new Error('先输入你想搜索的关键词。');
      const sort = options.sort || 'relevance';
      if (!['relevance','hot','top','new','comments'].includes(sort)) throw new Error('请选择有效的搜索排序。');
      url.searchParams.set('q', query);
      if (community) url.searchParams.set('restrict_sr', 'on');
      url.searchParams.set('sort', sort);
    }
  }
  url.pathname = path + '.json';
  url.hash = '';
  // Preserve sorting, search and pagination parameters already in the page URL.
  url.searchParams.set('limit', String(Math.min(100, Math.max(1, Number(limit) || 100))));
  url.searchParams.set('raw_json', '1');
  return url.href;
}

export function extractRows(payload) {
  const rows = [], seen = new Set();
  function walk(listing, parentPost = '') {
    for (const item of listing?.data?.children || []) {
      const d = item.data || {};
      if (item.kind === 't3' || item.kind === 't1') {
        const id = d.name || `${item.kind}_${d.id || ''}`;
        if (!seen.has(id)) {
          seen.add(id);
          const permalink = typeof d.permalink === 'string' && d.permalink.startsWith('/') ? 'https://www.reddit.com' + d.permalink : '';
          rows.push({type:item.kind === 't3' ? 'post' : 'comment', id, post_id:item.kind === 't3' ? id : (d.link_id || parentPost), subreddit:d.subreddit || '', title:d.title || '', text:item.kind === 't3' ? (d.selftext || '') : (d.body || ''), created_utc:d.created_utc || '', score:d.score ?? '', num_comments:item.kind === 't3' ? (d.num_comments ?? '') : '', source_url:permalink});
        }
        if (d.replies && typeof d.replies === 'object') walk(d.replies, d.link_id || parentPost);
      }
    }
  }
  for (const listing of Array.isArray(payload) ? payload : [payload]) {
    walk(listing, rows.find(r => r.type === 'post')?.id || '');
  }
  return rows;
}

export function toCsv(rows) {
  const keys = ['type','id','post_id','subreddit','title','text','created_utc','score','num_comments','source_url'];
  const escape = value => {
    let str = String(value ?? '');
    // Neutralize spreadsheet formulas in untrusted Reddit text.
    if (/^\s*[=+@-]/.test(str)) str = "'" + str;
    return '"' + str.replace(/"/g, '""') + '"';
  };
  return '\ufeff' + [keys.join(','), ...rows.map(row => keys.map(key => escape(row[key])).join(','))].join('\r\n');
}
