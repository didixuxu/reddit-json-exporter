import {jsonUrl, extractRows, toCsv} from './core.js';
const $ = id => document.getElementById(id);
let current, mode = 'current', loading = false, valid = false;
const buttons = ['json','csv','view'];
const hints = {current:'保留当前页面条件',new:'按发布时间排序',hot:'查看当前热门帖子',rising:'查看正在上升的讨论',top:'按得分与时间筛选',controversial:'查看争议排序的讨论',search:'在当前社区搜索'};
function selectedUrl() { return jsonUrl(current, $('limit').value, {mode, time:$('time').value, query:$('query').value, sort:$('sort').value}); }
function busy(value) {
  loading = value;
  for (const id of buttons) $(id).disabled = value || !valid;
  for (const el of document.querySelectorAll('.mode, select, input')) el.disabled = value || !current;
}
function update() {
  document.body.dataset.mode = mode;
  $('time-field').hidden = !['top','controversial','search'].includes(mode);
  $('search-fields').hidden = mode !== 'search';
  $('mode-hint').textContent = mode === 'search' && !new URL(current).pathname.startsWith('/r/') ? '在全站搜索' : hints[mode];
  for (const button of document.querySelectorAll('.mode')) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  try { $('target').textContent = selectedUrl(); valid = true; }
  catch(error) { $('target').textContent = error.message; valid = false; }
  busy(loading);
}
for (const button of document.querySelectorAll('.mode')) button.addEventListener('click', () => {
  mode = button.dataset.mode;
  $('status').textContent = ''; $('status').dataset.error = 'false'; update();
  if (mode === 'search') $('query').focus();
});
for (const id of ['limit','time','sort','query']) $(id).addEventListener('input', () => { if(current) update(); });
function save(text, filename, mime) {
  const objectUrl = URL.createObjectURL(new Blob([text], {type:mime}));
  const anchor = document.createElement('a');
  anchor.href = objectUrl; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
}
async function download(format) {
  busy(true); $('status').dataset.error = 'false'; $('status').textContent = '正在采集这份讨论…';
  try {
    const url = selectedUrl();
    const response = await fetch(url, {credentials:'include', signal:AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error(`Reddit 返回 HTTP ${response.status}。可能需要登录、访问授权，或请求受到限制。`);
    let data;
    try { data = await response.json(); } catch { throw new Error('返回的不是 JSON，可能是登录或访问限制页面。'); }
    const listings = Array.isArray(data) ? data : [data];
    if (!listings.length || !listings.every(x => x?.kind === 'Listing' && Array.isArray(x?.data?.children))) throw new Error('返回内容不是预期的 Reddit 帖子或评论列表。');
    const rows = extractRows(data);
    if (!rows.length) throw new Error('此次返回没有可导出的帖子或评论。请检查筛选条件。');
    const community = rows[0]?.subreddit?.replace(/[^a-zA-Z0-9_-]/g, '') || 'reddit';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tag = mode === 'current' ? 'current' : `${mode}${['top','controversial','search'].includes(mode) ? '_'+$('time').value : ''}`;
    save(format === 'json' ? JSON.stringify(data, null, 2) : toCsv(rows), `${community}_${tag}_${stamp}.${format}`, format === 'json' ? 'application/json' : 'text/csv;charset=utf-8');
    const posts = rows.filter(x => x.type === 'post').length;
    $('status').textContent = `已发起下载 · ${posts} 条帖子 / ${rows.length - posts} 条评论\n保留原帖链接，可上传给 AI 分析。`;
  } catch (error) {
    $('status').dataset.error = 'true';
    $('status').textContent = error.name === 'TimeoutError' ? '请求超时。请稍后手动重试。' : (error.message || '下载失败。');
  } finally { busy(false); }
}
$('json').addEventListener('click', () => download('json'));
$('csv').addEventListener('click', () => download('csv'));
$('view').addEventListener('click', async () => {
  try { await chrome.tabs.create({url:selectedUrl()}); }
  catch(error) { $('status').textContent = error.message; }
});
try {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  jsonUrl(tab?.url || '');
  current = tab.url; $('page').textContent = current;
  const parsed = new URL(current);
  const community = parsed.pathname.match(/^\/r\/([^/]+)/)?.[1];
  $('community').textContent = community ? 'r/' + community : (parsed.pathname.includes('/comments/') ? '帖子与评论' : 'Reddit 全站搜索');
  $('query').value = parsed.searchParams.get('q') || '';
  update();
} catch(error) { $('page').textContent = '请打开社区、搜索或帖子页面'; $('status').textContent = error.message; $('status').dataset.error = 'true'; busy(false); }
