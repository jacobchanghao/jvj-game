// 做客人回饋頁：按中控台這個鍵，做出一頁客人回饋表給第一位客人填。
// 做好的東西：
//   成品/客人回饋頁.html   客人填星等、寫回饋，按一下複製成一段字，用 LINE 貼回給老闆
//   資料/回饋紀錄.json     客人回饋的資料（還沒有回饋時先放空的名單）
//   資料/最近的客人回饋.md 中控台第八區「最近的客人回饋」顯示的檔，從回饋紀錄算出來
// 並且把回饋頁登記進 公司/公司資料.json 的 成品。

'use strict';
const fs = require('fs');
const path = require('path');

const 根 = path.join(__dirname, '..');

function 讀JSON(檔) {
  return JSON.parse(fs.readFileSync(path.join(根, 檔), 'utf8'));
}
function 寫JSON(檔, 資料) {
  fs.writeFileSync(path.join(根, 檔), JSON.stringify(資料, null, 2) + '\n', 'utf8');
}

/* ---------- 1. 做出客人回饋頁 ---------- */

const 回饋頁HTML = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>星星快遞 · 客人回饋</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{font-family:-apple-system,"PingFang TC","Microsoft JhengHei",sans-serif;background:#0b0e2a;color:#fff;
       min-height:100vh;display:flex;justify-content:center;padding:18px 14px calc(18px + env(safe-area-inset-bottom));}
  .card{width:100%;max-width:430px;background:rgba(255,255,255,.06);border:1px solid rgba(174,185,255,.25);
        border-radius:18px;padding:22px 18px;display:flex;flex-direction:column;gap:18px;}
  h1{font-size:22px;letter-spacing:.06em;text-align:center;}
  .sub{color:#aeb9ff;font-size:14px;line-height:1.7;text-align:center;}
  .q{font-size:16px;font-weight:700;color:#ffe9a8;}
  .stars{display:flex;gap:10px;justify-content:center;font-size:38px;line-height:1;}
  .stars button{background:none;border:0;font-size:38px;cursor:pointer;padding:4px 6px;filter:grayscale(1);opacity:.35;}
  .stars button.on{filter:none;opacity:1;transform:scale(1.08);}
  .opts{display:flex;gap:8px;flex-wrap:wrap;}
  .opts button{flex:1;min-width:88px;padding:10px 8px;border-radius:12px;border:1px solid rgba(174,185,255,.4);
               background:rgba(255,255,255,.05);color:#fff;font-size:15px;cursor:pointer;}
  .opts button.on{background:linear-gradient(180deg,#ffe27a,#ffb43a);color:#10123a;font-weight:700;border-color:transparent;}
  textarea{width:100%;min-height:96px;border-radius:12px;border:1px solid rgba(174,185,255,.4);
           background:rgba(255,255,255,.05);color:#fff;font-size:15px;font-family:inherit;padding:10px;resize:vertical;}
  .btn{padding:14px;border-radius:999px;border:0;font-size:17px;font-weight:700;cursor:pointer;
       color:#10123a;background:linear-gradient(180deg,#ffe27a,#ffb43a);
       box-shadow:0 5px 0 #b97b17;}
  .btn:active{transform:translateY(3px);box-shadow:0 2px 0 #b97b17;}
  .msg{text-align:center;font-size:14px;color:#7ee787;min-height:20px;}
  .copybox{display:none;background:rgba(0,0,0,.35);border-radius:12px;padding:12px;font-size:14px;
           white-space:pre-wrap;line-height:1.7;color:#dfe6ff;}
  .hint{font-size:12px;color:#8a93c9;text-align:center;}
</style>
</head>
<body>
<div class="card">
  <div>
    <h1>🌟 星星快遞 · 客人回饋</h1>
    <p class="sub">你剛剛玩完星星快遞，<br>花不到一分鐘告訴作者你的感覺，謝謝你！</p>
  </div>

  <div>
    <p class="q">給幾顆星？（最高四顆）</p>
    <div class="stars" id="stars">
      <button data-v="1">⭐</button><button data-v="2">⭐</button>
      <button data-v="3">⭐</button><button data-v="4">⭐</button>
    </div>
  </div>

  <div>
    <p class="q">1. 你覺得這關會不會玩太久？</p>
    <div class="opts" id="q1">
      <button data-v="不會，剛剛好">不會，剛剛好</button>
      <button data-v="有一點">有一點</button>
      <button data-v="會，太久了">會，太久了</button>
    </div>
  </div>

  <div>
    <p class="q">2. 你會想再玩一次嗎？</p>
    <div class="opts" id="q2">
      <button data-v="會">會</button>
      <button data-v="看心情">看心情</button>
      <button data-v="不會">不會</button>
    </div>
  </div>

  <div>
    <p class="q">想說的話（可以不填）</p>
    <textarea id="txt" placeholder="例如：第二關有點難、畫面可愛⋯"></textarea>
  </div>

  <button class="btn" id="copy">複製我的回饋</button>
  <p class="msg" id="msg"></p>
  <div class="copybox" id="copybox"></div>
  <p class="hint">按複製之後，把字貼到 LINE 傳給作者就可以了。</p>
</div>

<script>
(function(){
'use strict';
var 星=0, 玩太久='', 想再玩='';
var $=function(id){return document.getElementById(id);};

function pick(boxId, set){
  var box=$(boxId);
  box.addEventListener('click', function(e){
    var b=e.target.closest('button'); if(!b)return;
    Array.prototype.forEach.call(box.children, function(c){c.classList.remove('on');});
    b.classList.add('on'); set(b.getAttribute('data-v'));
    $('msg').textContent='';
  });
}
pick('stars', function(v){星=+v;});
pick('q1', function(v){玩太久=v;});
pick('q2', function(v){想再玩=v;});

function buildText(){
  var s='';
  for(var i=0;i<4;i++) s += (i<星?'⭐':'▫️');
  var lines=['【星星快遞 客人回饋】',
             '星星：'+s+'（'+(星||'沒選')+'/4）',
             '玩太久：'+(玩太久||'沒選'),
             '想再玩：'+(想再玩||'沒選')];
  var t=$('txt').value.trim();
  if(t) lines.push('想說的話：'+t);
  var d=new Date();
  lines.push('日期：'+d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate());
  return lines.join('\\n');
}

function fallbackCopy(text){
  var ta=document.createElement('textarea');
  ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  var ok=false;
  try{ ok=document.execCommand('copy'); }catch(e){ ok=false; }
  document.body.removeChild(ta);
  return ok;
}

$('copy').addEventListener('click', function(){
  if(!星){ $('msg').textContent='先選星星再複製喔'; $('msg').style.color='#ffb4b4'; return; }
  var text=buildText();
  var box=$('copybox');
  box.textContent=text; box.style.display='block';
  function done(ok){
    if(ok){ $('msg').textContent='已複製！打開 LINE 貼給作者就好'; }
    else{ $('msg').textContent='按不了複製的話，長按下面的字全選再複製'; }
    $('msg').style.color=ok?'#7ee787':'#ffe9a8';
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){done(true);}, function(){done(fallbackCopy(text));});
  } else { done(fallbackCopy(text)); }
});
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(根, '成品', '客人回饋頁.html'), 回饋頁HTML, 'utf8');

/* ---------- 2. 回饋紀錄資料檔（還沒有才建） ---------- */

const 紀錄檔 = '資料/回饋紀錄.json';
if (!fs.existsSync(path.join(根, 紀錄檔))) {
  寫JSON(紀錄檔, { 說明: '還沒有客人回饋', 回饋: [] });
}

/* ---------- 3. 從回饋紀錄做出中控台第八區顯示的檔 ---------- */

function 做回饋摘要() {
  let 資料;
  try { 資料 = 讀JSON(紀錄檔); } catch (e) { 資料 = { 說明: '還沒有客人回饋', 回饋: [] }; }
  const 清單 = Array.isArray(資料.回饋) ? 資料.回饋 : [];
  let md;
  if (清單.length === 0) {
    md = '# 最近的客人回饋\n\n還沒有客人回饋。\n\n（客人填完成品/客人回饋頁.html、把複製的字用 LINE 傳回來之後，把內容交給 AI 登記進 資料/回饋紀錄.json，再按一次「做客人回饋頁」這裡就會更新。）\n';
  } else {
    const 平均 = 清單.reduce((a, r) => a + (r.星等 || 0), 0) / 清單.length;
    md = '# 最近的客人回饋\n\n';
    md += '收到 **' + 清單.length + '** 則，平均 **' + 平均.toFixed(1) + '** 星。\n\n';
    清單.forEach(function (r, i) {
      md += '## ' + (i + 1) + '. ' + (r.星等 || 0) + ' 星（' + (r.日期 || '') + '）\n\n';
      md += '- 玩太久：' + (r.玩太久 || '沒填') + '\n';
      md += '- 想再玩：' + (r.想再玩 || '沒填') + '\n';
      md += '- 想說的話：' + (r.想說的話 || '沒填') + '\n\n';
    });
  }
  fs.writeFileSync(path.join(根, '資料', '最近的客人回饋.md'), md, 'utf8');
}
做回饋摘要();

/* ---------- 4. 把回饋頁登記進成品（還沒登記才登記） ---------- */

const 公司檔 = '公司/公司資料.json';
const 公司 = 讀JSON(公司檔);
if (!Array.isArray(公司.成品)) 公司.成品 = [];
const 已有 = 公司.成品.some(function (c) { return c.檔案 === '成品/客人回饋頁.html'; });
if (!已有) {
  公司.成品.push({
    名稱: '客人回饋頁',
    檔案: '成品/客人回饋頁.html',
    版本: 1,
    說明: '給第一位客人填的回饋表：選 1 到 4 星、回答「會不會玩太久」「會不會想再玩」、寫想說的話，按一下把回饋複製成一段字，用 LINE 貼回給老闆。',
    對到標準: [3]
  });
  寫JSON(公司檔, 公司);
}

console.log('做好了：客人回饋頁在 成品/客人回饋頁.html，回饋紀錄與摘要也在 資料/，已登記進成品櫃');
