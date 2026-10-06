import test from 'node:test';
import assert from 'node:assert/strict';
import {jsonUrl, extractRows, toCsv} from '../extension/core.js';

test('all seven modes preserve or reset pagination deliberately',()=>{
  for(const mode of ['current','new','hot','rising','top','controversial','search']) {
    const u=new URL(jsonUrl('https://www.reddit.com/r/example/?after=t3_cursor',50,{mode,time:'month',query:'sofa & 安装',sort:'comments'}));
    assert.equal(u.searchParams.get('limit'),'50');
    assert.equal(u.searchParams.get('raw_json'),'1');
    if(mode==='current')assert.equal(u.searchParams.get('after'),'t3_cursor');
    else {
      assert.equal(u.searchParams.has('after'),false);
      assert.equal(u.pathname,`/r/example/${mode}.json`);
    }
    assert.equal(u.searchParams.has('t'),['top','controversial','search'].includes(mode));
    if(mode==='search'){
      assert.equal(u.searchParams.get('q'),'sofa & 安装');
      assert.equal(u.searchParams.get('restrict_sr'),'on');
      assert.equal(u.searchParams.get('sort'),'comments');
    }
  }
});

test('global search is unrestricted; post modes use its community',()=>{
  const global=new URL(jsonUrl('https://www.reddit.com/search/?q=books',100,{mode:'search',query:'lamp'}));
  assert.equal(global.searchParams.has('restrict_sr'),false);
  assert.equal(global.pathname,'/search.json');
  assert.equal(new URL(jsonUrl('https://www.reddit.com/r/example/comments/abc/title/',100,{mode:'new'})).pathname,'/r/example/new.json');
});

test('unsupported sites, routes and empty search are rejected',()=>{
  for(const u of ['http://www.reddit.com/r/example/','https://reddit.com.evil.example/r/example/','https://example.com/r/example/','https://www.reddit.com/settings'])assert.throws(()=>jsonUrl(u));
  assert.throws(()=>jsonUrl('https://www.reddit.com/r/example/',100,{mode:'search',query:' '}));
  assert.throws(()=>jsonUrl('https://www.reddit.com/r/example/',100,{mode:'top',time:'invalid'}));
});

test('nested comments deduplicate while keeping post association and source',()=>{
  const reply={kind:'t1',data:{name:'t1_reply',id:'reply',link_id:'t3_post',body:'nested',permalink:'/r/example/comments/post/title/reply/'}};
  const comment={kind:'t1',data:{name:'t1_comment',id:'comment',link_id:'t3_post',body:'parent',replies:{kind:'Listing',data:{children:[reply]}}}};
  const payload=[{kind:'Listing',data:{children:[{kind:'t3',data:{name:'t3_post',id:'post',title:'Example',selftext:'Text',num_comments:999}}]}},{kind:'Listing',data:{children:[comment,reply,{kind:'more',data:{children:['not-loaded']}}]}}];
  const rows=extractRows(payload);
  assert.equal(rows.length,3);
  assert.equal(rows.filter(r=>r.type==='comment').length,2);
  assert.equal(rows.find(r=>r.id==='t1_reply').post_id,'t3_post');
  assert.equal(rows.find(r=>r.id==='t1_reply').source_url,'https://www.reddit.com/r/example/comments/post/title/reply/');
  assert.equal(rows[0].num_comments,999);
  assert.equal(extractRows({kind:'Listing',data:{children:[]}}).length,0);
});

test('CSV preserves multiline quotes and neutralizes spreadsheet formulas',()=>{
  const csv=toCsv([{type:'post',id:'t3_example',title:'A "quoted" title',text:'=1+1\nsecond line'}]);
  assert.ok(csv.startsWith('\ufeff'));
  assert.ok(csv.includes('"A ""quoted"" title"'));
  assert.ok(csv.includes('"\'=1+1\nsecond line"'));
  assert.ok(csv.includes('source_url'));
});
