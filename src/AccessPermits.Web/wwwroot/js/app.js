/* ═══════════════════════════════════════════════════════════
   نظام تصاريح الدخول - Client Application Engine
   Fully Integrated with ASP.NET Core MVC & Web API Backend
   ═══════════════════════════════════════════════════════════ */

/* ═══════ CONSTANTS ═══════ */
const S={name:'نظام تصاريح دخول المجمع',logo:null,theme:null};
const DB_VERSION='4.0';
const LK={
nationalities:['سعودي','إماراتي','قطري','كويتي','بحريني','عماني','يمني','مصري','سوداني','أردني','لبناني','سوري','عراقي','فلسطيني','مغربي','تونسي','جزائري','ليبي','باكستاني','هندي','بنغلاديشي','سريلانكي','نيبالي','فلبيني','إندونيسي','ماليزي','صيني','ياباني','كوري','تايلاندي','تركي','إيراني','أمريكي','بريطاني','فرنسي','ألماني','إيطالي','إسباني','هولندي','بلجيكي','سويسري','سويدي','نرويجي','دنماركي','فنلندي','نمساوي','إيرلندي','برتغالي','أسترالي','كندي','روسي','أوكراني','بولندي','يوناني','أخرى'],
personTypes:['مواطن','مقيم','زائر','دبلوماسي'],
idTypes:['هوية وطنية','إقامة','جواز سفر','هوية خليجية'],
visitTypes:['زيارة عمل','صيانة','توريد','اجتماع','تدريب','زيارة رسمية','أخرى'],
devices:['📱 جوال','💻 كمبيوتر محمول','🖥️ جهاز مكتبي','🖨️ طابعة','🎥 كاميرا','📷 كاميرا احترافية','🔬 معدات فنية','🧰 حقيبة عمل','🔌 أجهزة كهربائية','📁 ملفات','📦 طرود','🔧 قطع غيار'],
vehicleTypes:['سيدان','دفع رباعي','شاحنة نقل','دراجة نارية','حافلة','معدات ثقيلة'],
vehicleColors:['أبيض','أسود','فضي','رمادي','أحمر','أزرق','أخضر','أصفر','بني','بيج','برتقالي','ذهبي','كحلي','وردي','بنفسجي'],
vehicleMakes:{'تويوتا':['كورولا','كامري','لاندكروزر','هايلكس','ياريس'],'هيونداي':['إلنترا','أكسنت','سوناتا','توسان'],'نيسان':['ألتيما','باترول','صني'],'فورد':['إكسبلورر','F-150'],'مرسيدس':['E-Class','S-Class'],'BMW':['الفئة الثالثة','X3','X5'],'لكزس':['ES','LS','LX'],'كيا':['سيراتو','سبورتاج'],'أخرى':['أخرى']},
gateLocations:['المدخل الرئيسي','مدخل الخدمات','مدخل الموظفين','مدخل الطوارئ','مدخل الزوار'],
exitItemCategories:['💻 إلكترونيات','📱 هواتف','🖨️ طابعات','🪑 أثاث','📄 مستندات','📦 أخرى'],
exitItemTypes:{'💻 إلكترونيات':['لابتوب','تابلت','شاشة'],'📱 هواتف':['iPhone','Samsung'],'🖨️ طابعات':['HP','Canon'],'🪑 أثاث':['كرسي','مكتب'],'📄 مستندات':['ملفات','عقود'],'📦 أخرى':['أخرى']},
buildingTypes:['مبنى إداري','مبنى تشغيلي','مبنى تقني','مبنى خدمات','مستودع','مبنى أمني']};

const SCR=[
{id:'dashboard',n:'🏠 لوحة التحكم'},{id:'new-request',n:'➕ طلب تصريح'},{id:'vehicle',n:'🚗 تصريح مركبة'},
{id:'exit-permit',n:'🚪 تصريح خروج'},{id:'registry',n:'🧑 سجل الأشخاص'},{id:'my-requests',n:'📋 طلباتي'},
{id:'permitslog',n:'📋 سجل التصاريح'},{id:'approvals',n:'📨 طلبات التصريح'},{id:'gate',n:'🛡️ الاستعلام'},
{id:'querylog',n:'🧾 سجل الاستعلامات'},{id:'cardprint',n:'🖨️ طباعة البطاقات'},{id:'blacklist',n:'⛔ القائمة السوداء'},
{id:'branches',n:'🏢 الفروع'},{id:'buildings',n:'🏬 المباني'},{id:'paths',n:'🛣️ البوابات والمسارات'},
{id:'departments',n:'🏛️ الإدارات'},{id:'lookups',n:'📚 قوائم الاختيار'},{id:'users',n:'👤 المستخدمون'},
{id:'cardtemplate',n:'🪪 تصميم البطاقة'},{id:'systemsettings',n:'🛠️ الإعدادات'},{id:'auditlog',n:'📜 سجل النظام'},
{id:'reports',n:'📊 التقارير'}];

const ROLES=[
{id:'admin',n:'مدير النظام',i:'👑',c:'bbl',d:'كل الصلاحيات'},
{id:'approver',n:'مدير التصاريح',i:'✅',c:'bact',d:'اعتماد الطلبات'},
{id:'requester',n:'مقدم الطلب',i:'📝',c:'bpri-normal',d:'إنشاء طلبات'},
{id:'guard',n:'حارس أمن',i:'🛡️',c:'bgry',d:'استعلام فقط'}];

const PRESETS={
admin:SCR.map(s=>s.id),
approver:['dashboard','new-request','vehicle','exit-permit','registry','my-requests','permitslog','approvals','auditlog','reports'],
requester:['dashboard','new-request','vehicle','exit-permit','registry','my-requests','permitslog'],
guard:['gate','querylog','cardprint']};

window.WEEK_DAYS=[
{key:'sun',label:'الأحد',short:'أحد'},
{key:'mon',label:'الاثنين',short:'اثنين'},
{key:'tue',label:'الثلاثاء',short:'ثلاثاء'},
{key:'wed',label:'الأربعاء',short:'أربعاء'},
{key:'thu',label:'الخميس',short:'خميس'},
{key:'fri',label:'الجمعة',short:'جمعة'},
{key:'sat',label:'السبت',short:'سبت'}];

/* ═══════ STATE & DATA STORE ═══════ */
let BR=[],BN={},BL=[],GP={},PD=[],DP=[],US=[],PE=[],PH={},BLD=[],BNB={},AU=[],QL=[],CN={},EX={},PQ=[];
let CU=null,CB='riyadh',_rc=100;
let WS={step:1,mode:'single',persons:[],perPerson:{},attachments:[],renewFrom:null,editFrom:null};
let EPI=null,EII=[];
let myRt='single',myRs='all',pf='all',qlf='all',uSF2='all';
let selGatesPath=[],gMode='person',_ari=null,_ara=null;
let cardCT='barcode',_gk='',_gt=0;
const PERSON_ATTACH={personal:null,idPhoto:null,others:[]};

/* ═══════ DATES ═══════ */
const TD=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const addD=(s,n)=>{const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const statusFromExpiry=e=>e>=TD()?'active':'expired';
const getPS=p=>{if(p.status==='suspended')return'suspended';return statusFromExpiry(p.expiry||p.expiryDate)};

/* ═══════ UTILS ═══════ */
function toast(m,t){const M={'⚠️':'⚠️ يرجى استكمال الحقول','✅':'✅ تمت العملية','🗑':'🗑 تم الحذف','⏸️':'⏸️ تم التعطيل','▶️':'▶️ تم التفعيل'};m=M[m]||m;t=t||(/^(⚠|⛔|❌)/.test(m)?'err':'ok');const e=document.getElementById('toast');if(!e)return;e.textContent=m;e.className='toast '+t+' show';clearTimeout(window._tt);window._tt=setTimeout(()=>e.classList.remove('show'),3000)}
function openModal(id){const el=document.getElementById(id);if(el)el.classList.add('open');setTimeout(applySearchableToAll,80)}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open')}
function nAr(s){return String(s==null?'':s).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\s+/g,' ').trim()}
function smatch(h,q){const terms=nAr(q).split(' ').filter(Boolean);if(!terms.length)return true;const hay=nAr(Array.isArray(h)?h.map(x=>x==null?'':x).join(' '):h);return terms.every(t=>hay.includes(t))}
function PSF(p){const ids=[].concat(p.personIds||[],p.driverId?[p.driverId]:[]);const ps=ids.map(id=>PE.find(x=>x.id===id)).filter(Boolean);return [p.no||p.permitNumber,p.title,p.sub||p.subtitle,p.idMasked,p.plateNums,p.plateLetters,p.requestingDept,p.branchName,p.buildingName,p.pathName,p.visitDate,p.expiry||p.expiryDate,p.notes,(p.devices||[]).map(d=>d.deviceName||d).join(' '),ps.map(x=>x.name+' '+(x.idNumber||x.idNo||'')).join(' ')]}
function xesc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function xmask(s){s=String(s||'');return s.length>6?s.slice(0,4)+'••••'+s.slice(-2):s}
function gB(i){return BL.find(b=>b.id===i)}
function gBF(b){return BL.filter(x=>x.branchId===b)}
function gGB(b){const br=gB(b)?.branchId;return(GP[br]||[]).filter(g=>g.buildingId===b)}
function gD(i){return DP.find(d=>d.id===i)}
function gDB(b){return DP.filter(d=>d.branchId===b)}
function gDP(i){const p=[];let c=i;while(c){const d=gD(c);if(!d)break;p.unshift(d.name);c=d.parentId}return p.join(' ← ')||'—'}
function getFI(t,n){if(t&&t.includes('pdf')||(n&&n.endsWith('.pdf')))return'📄';if(t&&t.startsWith('image/'))return'🖼️';return'📎'}
function fmtSize(b){if(b<1024)return b+' B';if(b<1024*1024)return(b/1024).toFixed(1)+' KB';return(b/(1024*1024)).toFixed(2)+' MB'}

/* ═══════ BACKEND SYNC ═══════ */
async function loadInitialDataFromServer(){
  try{
    const [bRes, lkRes, stRes] = await Promise.all([
      fetch('/api/organization/branches').then(r=>r.json()),
      fetch('/api/settings/lookups').then(r=>r.json()),
      fetch('/api/settings').then(r=>r.json())
    ]);

    if(bRes.success && bRes.data && bRes.data.length){
      BR = bRes.data;
      BN = {};
      BR.forEach(b => { BN[b.id] = b.name; });
    }

    if(lkRes.success && lkRes.data){
      Object.assign(LK, lkRes.data);
    }

    if(stRes.success && stRes.data){
      if(stRes.data.SystemName) S.name = stRes.data.SystemName;
    }

    // Load buildings, gates, paths, depts, users, persons, permits
    await syncAllFromDb();
  }catch(err){
    console.warn('API sync fallback to local demo data:', err);
  }
}

async function syncAllFromDb(){
  try{
    const [blRes, gRes, pRes, dRes, uRes, peRes, reqRes, permRes, qlRes] = await Promise.all([
      fetch('/api/organization/buildings').then(r=>r.json()),
      fetch('/api/organization/gates').then(r=>r.json()),
      fetch('/api/organization/paths').then(r=>r.json()),
      fetch('/api/organization/departments').then(r=>r.json()),
      fetch('/api/account/users').then(r=>r.json()),
      fetch('/api/registry/persons').then(r=>r.json()),
      fetch('/api/permits/requests').then(r=>r.json()),
      fetch('/api/permits/issued').then(r=>r.json()),
      fetch('/api/gate/logs').then(r=>r.json())
    ]);

    if(blRes.success) BL = blRes.data;
    if(gRes.success){
      GP = {};
      BR.forEach(b => { GP[b.id] = []; });
      gRes.data.forEach(g => {
        if(!GP[g.branchId]) GP[g.branchId] = [];
        // Normalize devices: backend sends macAddress, client code uses mac
        g.devices = (g.devices||[]).map(d => ({
          id: d.id, name: d.name||'', mac: d.macAddress||d.mac||'', lastSeen: d.lastSeen||null
        }));
        GP[g.branchId].push(g);
      });
    }

    // normalize paths: add branch alias so rp() and rnp() work with both field names
    if(pRes.success) PD = pRes.data.map(p => ({ ...p, branch: p.branchId, buildingId: p.buildingId, gates: p.gates || [] }));

    if(dRes.success) DP = dRes.data;
    if(uRes.success) US = uRes.data;
    if(peRes.success){
      PE = peRes.data.map(p => ({
        id: p.id,
        branch: p.branchId,
        name: p.name,
        idNo: p.idNumber,
        sub: p.maskedId,
        entity: p.entity,
        type: p.personType,
        idType: p.idType,
        nat: p.nationality,
        addedBy: p.addedByUserId,
        status: p.status,
        workingHours: p.workingHoursDays ? { days: p.workingHoursDays.split(','), from: p.workingHoursFrom, to: p.workingHoursTo } : null
      }));
      PH = {};
      peRes.data.forEach(p => {
        if(p.personalPhotoBase64 || p.idPhotoBase64){
          PH[p.id] = {
            personal: p.personalPhotoBase64 ? { data: p.personalPhotoBase64, name: 'personal.jpg' } : null,
            idPhoto: p.idPhotoBase64 ? { data: p.idPhotoBase64, name: 'id.jpg' } : null,
            others: p.otherAttachments || []
          };
        }
      });
    }

    if(permRes.success){
      EX = {};
      permRes.data.forEach(p => {
        EX[p.permitNumber] = {
          no: p.permitNumber,
          mode: p.mode,
          title: p.title,
          sub: p.subtitle,
          idMasked: p.idMasked,
          requestingDept: p.requestingDept,
          departmentId: p.departmentId,
          personIds: (p.persons||[]).map(x => x.personId),
          visitDate: p.visitDate,
          expiry: p.expiryDate,
          branch: p.branchId,
          branchName: p.branchName,
          buildingId: p.buildingId,
          buildingName: p.buildingName,
          pathName: p.pathName,
          devices: (p.devices||[]).map(d => d.deviceName || d),
          notes: p.notes,
          guardNotes: p.guardNotes,
          submitterId: p.submitterId,
          status: p.status,
          suspendReason: p.suspendReason,
          plateNums: p.plateNums,
          plateLetters: p.plateLetters,
          driverId: p.driverId,
          groupRef: p.groupRef,
          relatedEntryPermit: p.relatedEntryPermit,
          cardNumber: p.cardNumber,
          exitItems: p.exitItems || []
        };
      });
    }

    if(reqRes.success){
      PQ = reqRes.data.map(r => ({
        id: r.id,
        mode: r.mode,
        title: r.title,
        sub: r.subtitle,
        entity: r.requestingDept,
        departmentId: r.departmentId,
        departmentName: r.departmentName,
        path: r.defaultPath,
        submitter: r.submitterName,
        submitterId: r.submitterId,
        persons: (r.persons||[]).map(p => ({ id: p.personId, name: p.personName, sub: p.personSub })),
        perPerson: (r.persons||[]).reduce((acc, p) => {
          acc[p.personId] = {
            path: p.customPath,
            dateFrom: p.dateFrom,
            dateTo: p.dateTo,
            timeFrom: p.timeFrom,
            timeTo: p.timeTo,
            days: p.customDays ? p.customDays.split(',') : null,
            devices: p.customDevices ? p.customDevices.split(',') : null
          };
          return acc;
        }, {}),
        devices: (r.devices||[]).map(d => d.deviceName),
        visitDate: r.visitDate,
        expiry: r.expiryDate,
        branch: r.branchId,
        buildingId: r.buildingId,
        buildingName: r.buildingName,
        requestingDept: r.requestingDept,
        notes: r.requesterNotes,
        guardNotes: r.guardNotes,
        status: r.status,
        exitItems: r.exitItems || [],
        attachments: (r.attachments||[]).map(a => ({ name: a.fileName, size: a.fileSize, type: a.contentType, data: a.base64Data })),
        isRenewal: r.isRenewal,
        originalPermitNumber: r.originalPermitNumber
      }));
    }

    if(qlRes.success){
      QL = qlRes.data.map(q => ({
        time: q.queryTime,
        val: q.queryValue,
        name: q.subjectName,
        rt: q.resultType,
        rl: q.resultLabel,
        officer: q.officerName,
        nat: q.nationality,
        gate: q.gateName,
        branch: q.branchName
      }));
    }
  }catch(err){
    console.error('Error in syncAllFromDb:', err);
  }
}

/* ═══════ PAGINATION ═══════ */
const PG={};
function renderPager(key){
  const el=document.getElementById(key+'Pager');if(!el)return;
  const p=PG[key]||{page:1,size:10,total:0};
  const total=p.total||0,pages=Math.max(1,Math.ceil(total/p.size));
  if(p.page>pages)p.page=pages;
  const from=total?((p.page-1)*p.size)+1:0,to=Math.min(p.page*p.size,total);
  let nav=`<button class="pager-btn" ${p.page<=1?'disabled':''} onclick="pagerGo('${key}',1)">«</button>`;
  nav+=`<button class="pager-btn" ${p.page<=1?'disabled':''} onclick="pagerGo('${key}',${p.page-1})">السابق</button>`;
  const around=[];
  for(let i=1;i<=pages;i++){if(i===1||i===pages||Math.abs(i-p.page)<=1)around.push(i);else if(around[around.length-1]!=='...')around.push('...')}
  around.forEach(n=>{if(n==='...')nav+=`<span class="pager-dots">…</span>`;else nav+=`<button class="pager-btn ${n===p.page?'active':''}" onclick="pagerGo('${key}',${n})">${n}</button>`});
  nav+=`<button class="pager-btn" ${p.page>=pages?'disabled':''} onclick="pagerGo('${key}',${p.page+1})">التالي</button>`;
  nav+=`<button class="pager-btn" ${p.page>=pages?'disabled':''} onclick="pagerGo('${key}',${pages})">»</button>`;
  el.innerHTML=`<div class="pager-info">عرض <b>${from}</b>–<b>${to}</b> من <b>${total}</b></div><div class="pager-size"><span>لكل صفحة</span><select onchange="pagerSize('${key}',this.value)">${[10,20,50,'all'].map(s=>`<option value="${s}" ${s==p.size?'selected':''}>${s==='all'?'الكل':s}</option>`).join('')}</select></div><div class="pager-nav">${nav}</div>`;
}
function pagerGo(key,n){PG[key].page=n;rerenderPager(key)}
function pagerSize(key,v){PG[key].size=v==='all'?99999:+v;PG[key].page=1;rerenderPager(key)}
function setPagerData(key,rows,renderFn){if(!PG[key])PG[key]={page:1,size:10};PG[key].rows=rows;PG[key].total=rows.length;PG[key].render=renderFn;rerenderPager(key)}
function rerenderPager(key){const p=PG[key];if(!p||!p.render)return;const start=(p.page-1)*p.size;p.render(p.rows.slice(start,start+p.size));renderPager(key)}

/* ═══════ PERMISSIONS ═══════ */
function hasPerm(type){if(!CU)return false;if(CU.role==='admin')return true;if(CU.role==='approver')return type==='add'||type==='edit';if(CU.role==='requester')return type==='add';return false}
function applyPermButtons(){document.querySelectorAll('[data-perm="add"]').forEach(b=>b.style.display=hasPerm('add')?'':'none');document.querySelectorAll('[data-perm="edit"]').forEach(b=>b.style.display=hasPerm('edit')?'':'none');document.querySelectorAll('[data-perm="del"]').forEach(b=>b.style.display=hasPerm('del')?'':'none')}

/* ═══════ LOGIN ═══════ */
function togglePasswordVisibility(){const i=document.getElementById('loginPassword');i.type=i.type==='password'?'text':'password'}
async function doLogin(){
  const u=document.getElementById('loginUsername').value.trim();
  const p=document.getElementById('loginPassword').value;
  const e=document.getElementById('loginError');

  try{
    const res = await fetch('/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json());

    if(!res.success || !res.data){
      e.textContent = res.message || '⚠️ بيانات الدخول غير صحيحة';
      e.style.display = 'block';
      return;
    }

    const user = res.data;
    CU = user;
    e.style.display = 'none';
    document.getElementById('screenLogin').style.display = 'none';
    document.getElementById('mainTopbar').style.display = 'flex';
    document.getElementById('mainAppBody').style.display = 'flex';
    document.getElementById('topUserAvatar').textContent = user.avatar || user.name.substring(0, 2);
    document.getElementById('topUserName').textContent = user.name;
    CB = (user.branches && user.branches[0]) || BR[0].id;
    applyPerms();
    popBranch();
    setBranch(CB);
    goto(user.permissions[0] || 'dashboard', null);
    toast('✅ أهلاً بك يا ' + user.name);
  }catch(err){
    console.warn('Backend login fallback:', err);
    // Local fallback
    const user = US.find(x => x.username === u && (x.password === p || x.passwordHash === p));
    if(!user){ e.textContent = '⚠️ بيانات الدخول غير صحيحة'; e.style.display = 'block'; return; }
    CU = user;
    document.getElementById('screenLogin').style.display = 'none';
    document.getElementById('mainTopbar').style.display = 'flex';
    document.getElementById('mainAppBody').style.display = 'flex';
    document.getElementById('topUserAvatar').textContent = user.avatar || user.name.substring(0, 2);
    document.getElementById('topUserName').textContent = user.name;
    CB = (user.branches && user.branches[0]) || BR[0].id;
    applyPerms();
    popBranch();
    setBranch(CB);
    goto(user.permissions[0] || 'dashboard', null);
    toast('✅ أهلاً ' + user.name);
  }
}

function fillDemo(r){
  document.getElementById('loginUsername').value = r;
  document.getElementById('loginPassword').value = { admin: 'admin123', approver: 'appr123', requester: 'req123', guard: 'guard123' }[r];
  document.getElementById('loginError').style.display = 'none';
}

async function doLogout(){
  if(!confirm('هل تود تسجيل الخروج من النظام؟')) return;
  try{ await fetch('/api/account/logout', { method: 'POST' }); }catch(e){}
  CU = null;
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('mainTopbar').style.display = 'none';
  document.getElementById('mainAppBody').style.display = 'none';
  document.getElementById('screenLogin').style.display = 'flex';
}

function applyPerms(){
  if(!CU) return;
  const bn = BN[CU.branches[0]] || '';
  document.getElementById('topUserRoleLabel').textContent = (ROLES.find(r => r.id === CU.role) || { n: CU.role }).n + (bn ? ' — ' + bn : '');
  document.querySelectorAll('.sb-item').forEach(el => {
    const s = el.dataset.screen;
    if(!s){ el.style.display = ''; return; }
    el.style.display = CU.permissions.includes(s) ? '' : 'none';
  });
  document.querySelectorAll('.tnav').forEach(el => {
    const s = el.dataset.screen;
    if(!s){ el.style.display = ''; return; }
    el.style.display = CU.permissions.includes(s) ? '' : 'none';
  });
  document.querySelectorAll('.sb-group').forEach(g => {
    g.style.display = [...g.querySelectorAll('.sb-item')].some(i => i.style.display !== 'none') ? '' : 'none';
  });
  const w = document.getElementById('branchPickerWrap');
  if(w) w.style.display = CU.branches.length > 1 ? 'flex' : 'none';
  applyPermButtons();
}

function popBranch(){
  const sel = document.getElementById('branchSwitcher');
  if(!sel || !CU) return;
  const ub = BR.filter(b => (CU.role === 'admin' || (CU.branches && CU.branches.includes(b.id))) && b.status === 'active');
  sel.innerHTML = ub.map(b => `<option value="${b.id}" ${b.id === CB ? 'selected' : ''}>${b.name}</option>`).join('');
  sel.value = CB;
  refreshBds();
}

function setBranch(v){
  if(!v) return;
  CB = v;
  const sw = document.getElementById('branchSwitcher');
  if(sw && sw.value !== v) sw.value = v;

  ['visitBranch','vehicleBranch','exitBranch','newPathBranch','pathsScreenBranchSelect','buildingsBranchSelect','depsBranchSelect','bldgBranch','gateBranch','depBranchSelectModal'].forEach(id => {
    const el = document.getElementById(id);
    if(el && el.value !== v) el.value = v;
  });

  refreshPB();
  if(typeof renderBuildingSelect === 'function') renderBuildingSelect();
  if(typeof renderVehicleBuilding === 'function') renderVehicleBuilding();
  if(typeof renderExitBuilding === 'function') renderExitBuilding();

  pgq();
  rp();
  rg();
  ugt();

  if(typeof rb === 'function') rb();
  if(typeof rde === 'function') rde();
  if(typeof rpq === 'function') rpq();
  if(typeof rmr === 'function') rmr();
  if(typeof rre === 'function') rre();
  if(typeof rbl === 'function') rbl();
  if(typeof rbc === 'function') rbc();
  if(typeof rpl === 'function') rpl();
  if(typeof rql === 'function') rql();
  if(typeof rd === 'function') rd();
  if(typeof rr === 'function') rr();

  if(CU){
    const br = BN[v] || '';
    const topRole = document.getElementById('topUserRoleLabel');
    if(topRole) topRole.textContent = (ROLES.find(r => r.id === CU.role) || { n: CU.role }).n + (br ? ' — ' + br : '');
    const dashSub = document.getElementById('dashSub');
    if(dashSub && br) dashSub.textContent = 'نظرة عامة — ' + br;
  }
}

function goto(n,b){
  if(!CU){ toast('يرجى تسجيل الدخول أولاً'); return; }
  if(!CU.permissions.includes(n)){ toast('🔒 لا تملك صلاحية لهذه الشاشة'); return; }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + n);
  if(!el) return;
  el.classList.add('active');
  document.querySelectorAll('.tnav').forEach(x => x.classList.remove('active'));
  if(b) b.classList.add('active');
  else{
    const tb = document.querySelector('.tnav[data-screen="' + n + '"]');
    if(tb) tb.classList.add('active');
  }
  document.querySelectorAll('.sb-item').forEach(s => s.classList.toggle('active', s.dataset.screen === n));
  document.querySelector('.sidebar')?.classList.remove('open');

  if(n === 'dashboard') rd();
  if(n === 'paths'){ rg(); rp(); }
  if(n === 'buildings') rb();
  if(n === 'new-request') rpc2();
  if(n === 'cardtemplate') rct();
  if(n === 'vehicle'){ refreshPB(); rvp(); }
  if(n === 'querylog') rql();
  if(n === 'approvals') rpq();
  if(n === 'gate'){ pgq(); ugt(); if(!document.getElementById('gateResult').children.length) document.getElementById('gateResult').innerHTML = xidle(); }
  if(n === 'reports') rr();
  if(n === 'blacklist'){ rbc(); rbl(); }
  if(n === 'users') rut();
  if(n === 'branches') rbr();
  if(n === 'departments') rde();
  if(n === 'lookups') rlk();
  if(n === 'permitslog') rpl();
  if(n === 'my-requests') rmr();
  if(n === 'registry') rre();
  if(n === 'auditlog') ral();
  if(n === 'systemsettings') rebuildSettingsScreen();

  window.scrollTo(0, 0);
  setTimeout(applySearchableToAll, 150);
}

function setSb(el){
  document.querySelectorAll('.sb-item').forEach(s => s.classList.remove('active'));
  if(el){
    el.classList.add('active');
    const g = el.closest('.sb-group');
    if(g) g.classList.remove('collapsed');
  }
}

function ugt(){
  const el = document.getElementById('gateSubtitle');
  if(!el || !CU) return;
  if(CU.role === 'guard' && CU.gates && CU.gates.length){
    const my = CU.gates.filter(g => g.startsWith(CB + '::')).map(g => g.split('::')[1]);
    el.textContent = my.length ? '🚪 ' + my.join('، ') : '⚠️ لا بوابات مخصصة';
  } else if(CU.role === 'approver'){
    const b = (CU.buildings || []).length;
    el.textContent = '✅ ' + (b ? b + ' مبنى مصرح' : 'كل المباني');
  } else {
    el.textContent = 'فحص أمني لحظي بالـ MAC';
  }
}

/* ═══════ AUDIT ═══════ */
function xau(type, msg, detail){
  AU.unshift({
    id: 'log' + Date.now() + Math.random().toString(36).slice(2, 6),
    time: new Date().toLocaleString('ar-SA'),
    type,
    msg,
    detail: detail || '',
    user: CU ? CU.name : '—'
  });
  if(AU.length > 500) AU.pop();
}

function ral(){
  const t = document.getElementById('auditLogTbody');
  if(!t) return;
  const q = (document.getElementById('auditLogSearch')?.value || '').trim().toLowerCase();
  const tf = document.getElementById('auditLogType')?.value || 'all';
  let r = AU.filter(l => {
    if(tf !== 'all' && l.type !== tf) return false;
    if(q && !smatch([l.msg, l.detail, l.user, l.time], q)) return false;
    return true;
  });
  const tm = { add: { l: '➕ إضافة', c: 'bact' }, edit: { l: '✏️ تعديل', c: 'bor2' }, del: { l: '❌ حذف', c: 'bexp' } };
  const render = rows => {
    document.getElementById('auditLogEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map((l, i) => {
      const m = tm[l.type] || { l: l.type, c: 'bgry' };
      return `<tr><td>${i + 1}</td><td style="font-size:11px">${xesc(l.time)}</td><td><span class="badge ${m.c}">${m.l}</span></td><td><b>${xesc(l.msg)}</b></td><td style="font-size:11px;color:var(--g500)">${xesc(l.detail || '—')}</td><td>${xesc(l.user)}</td></tr>`;
    }).join('');
  };
  setPagerData('auditLog', r, render);
}

function printAudit(){
  const w = window.open('', '_blank');
  const rows = AU.map((l, i) => `<tr><td>${i + 1}</td><td>${xesc(l.time)}</td><td>${xesc(l.type)}</td><td>${xesc(l.msg)}</td><td>${xesc(l.detail || '—')}</td><td>${xesc(l.user)}</td></tr>`).join('');
  w.document.write(`<html dir="rtl"><head><title>سجل التدقيق</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}th{background:#15573a;color:#fff}</style></head><body><h1>📜 سجل النظام والتدقيق</h1><table><thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>العملية</th><th>التفاصيل</th><th>المستخدم</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function exportAuditExcel(){
  let csv = '\ufeff#\tالتاريخ\tالنوع\tالعملية\tالتفاصيل\tالمستخدم\n';
  AU.forEach((l, i) => { csv += `${i + 1}\t${l.time}\t${l.type}\t${l.msg}\t${l.detail || '—'}\t${l.user}\n`; });
  const b = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u;
  a.download = 'audit.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(u), 1500);
  toast('📊 تم تصدير السجل');
}

/* ═══════ BLACKLIST & BANNED NATIONALITIES ═══════ */
function rbc(){
  const w = document.getElementById('bannedNatChips');
  if(!w) return;
  const a = BNB[CB] || [];
  w.innerHTML = a.map((n, i) => `<div class="dept-chip" style="background:var(--redb);border-color:var(--redl)"><span class="dept-chip-name" style="color:var(--red)">⛔ ${xesc(n)}</span><button class="chip-remove" onclick="rmBn(${i})">✕</button></div>`).join('') || '<div class="hint">لا جنسيات ممنوعة في هذا الفرع</div>';
}

async function addBn(){
  const v = await xdlg({ title: 'منع جنسية في الفرع', ico: '⛔', danger: 1, fields: [{ id: 'n', label: 'الجنسية', type: 'select', options: LK.nationalities }], ok: '⛔ منع' });
  if(!v) return;
  if(!BNB[CB]) BNB[CB] = [];
  if(BNB[CB].includes(v.n)){ toast('⚠️ الجنسية مضافة مسبقاً'); return; }
  BNB[CB].push(v.n);

  try{
    await fetch('/api/registry/banned-nationalities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId: CB, nationality: v.n })
    });
  }catch(e){}

  rbc();
  xau('add', 'منع جنسية', v.n);
  toast('⛔ تم حظر الجنسية');
}

async function rmBn(i){
  const nat = BNB[CB][i];
  BNB[CB].splice(i, 1);
  try{
    await fetch(`/api/registry/banned-nationalities?branchId=${CB}&nationality=${encodeURIComponent(nat)}`, { method: 'DELETE' });
  }catch(e){}
  rbc();
}

function rbl(){
  const t = document.getElementById('blacklistTbody');
  if(!t) return;
  const l = document.getElementById('blBranchLabel');
  if(l) l.textContent = BN[CB] || '';
  const _bq = (document.getElementById('blacklistSearch')?.value || '').trim();
  let r = BLD.filter(b => b.branch === CB && (!_bq || smatch([b.name, b.idNo, b.reason], _bq)));
  const render = rows => {
    document.getElementById('blacklistEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map(b => `<tr><td><b>${xesc(xmask(b.idNo))}</b></td><td>${xesc(b.name)}</td><td style="font-size:11px">${xesc(b.reason)}</td><td><button class="btn bg2 bxs" onclick="rmBl('${b.id}')">حذف</button></td></tr>`).join('');
  };
  setPagerData('blacklist', r, render);
}

function openAddBlacklist(){
  document.getElementById('blModalBranch').textContent = BN[CB] || '';
  ['blIdNo','blName','blReason'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('blNat').value = 'سعودي';
  openModal('modalAddBlacklist');
}

async function saveBlacklist(){
  const i = document.getElementById('blIdNo').value.trim();
  const n = document.getElementById('blName').value.trim();
  const r = document.getElementById('blReason').value.trim();
  const nat = document.getElementById('blNat').value;

  if(!i || !n || !r){ toast('⚠️ يرجى تعبئة الحقول المطلوبة'); return; }

  const entry = { id: 'bl' + Date.now(), branch: CB, idNo: i, name: n, nat: nat, reason: r, addedBy: CU ? CU.id : 'system' };
  BLD.push(entry);

  try{
    await fetch('/api/registry/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId: CB, idNumber: i, name: n, nationality: nat, reason: r })
    });
  }catch(e){}

  xau('add', 'قائمة سوداء', n);
  toast('⛔ تم حظر الشخص بنجاح');
  closeModal('modalAddBlacklist');
  rbl();
}

async function rmBl(id){
  if(!confirm('هل تود إزالة هذا الشخص من القائمة السوداء؟')) return;
  BLD = BLD.filter(b => b.id !== id);
  try{ await fetch(`/api/registry/blacklist/${id}`, { method: 'DELETE' }); }catch(e){}
  rbl();
  toast('🗑 تم الحذف بنجاح');
}

/* ═══════ REGISTRY ═══════ */
function rre(){
  const t = document.getElementById('registryTbody');
  if(!t) return;
  const l = document.getElementById('registryBranchLabel');
  if(l) l.textContent = BN[CB] || '';
  const q = (document.getElementById('registrySearch')?.value || '').trim().toLowerCase();
  let r = PE.filter(p => p.branch === CB);
  if(CU && CU.role === 'requester') r = r.filter(p => p.addedBy === CU.id);
  if(q) r = r.filter(p => smatch([p.name, p.sub, p.idNo, p.entity, p.nat, p.type, p.idType], q));

  const render = rows => {
    document.getElementById('registryEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map(p => {
      const ad = US.find(u => u.id === p.addedBy);
      const ph = PH[p.id];
      const av = ph && ph.personal ? `<img src="${ph.personal.data}">` : (ph && ph.data ? `<img src="${ph.data}">` : `${p.name.split(' ').slice(0, 2).map(x => x[0]).join('')}`);
      return `<tr><td><div class="ur-avatar" style="width:42px;height:42px;font-size:13px">${av}</div></td><td><b>${xesc(p.name)}</b><div style="font-size:10.5px;color:var(--g400)">${xesc(p.sub)}</div></td><td>${xesc(p.entity || '—')}</td><td>${xesc(p.type)}</td><td>${xesc(p.idType)}</td><td>🌍 ${xesc(p.nat)}</td><td style="font-size:11px;color:var(--g400)">${ad ? xesc(ad.name) : '—'}</td><td><button class="btn bg2 bxs" onclick="openAddPerson('${p.id}')">تعديل</button></td></tr>`;
    }).join('');
    applyPermButtons();
  };
  setPagerData('registry', r, render);
}

/* ═══════ BUILDINGS ═══════ */
function rb(){
  const g = document.getElementById('buildingsGrid');
  if(!g) return;
  const bs = gBF(CB);
  document.getElementById('buildingsEmpty').style.display = bs.length ? 'none' : 'block';
  g.innerHTML = bs.map(b => {
    const gs = gGB(b.id);
    return `<div class="bldg-card"><div class="bldg-card-head"><div><div class="bldg-card-name">🏬 ${xesc(b.name)}</div><div class="bldg-card-meta">🏷️ ${xesc(b.type || '—')}</div></div><span class="bldg-card-code">${xesc(b.code)}</span></div><div class="bldg-card-meta">👤 ${xesc(b.manager || '—')}</div><div class="bldg-card-meta">🏢 ${b.floors} دور</div><div class="bldg-card-badges"><span class="badge bbl">🚪 ${gs.length} بوابات</span></div><div style="display:flex;gap:6px;margin-top:12px"><button class="btn bg2 bxs" data-perm="edit" onclick="eb('${b.id}')">تعديل</button><button class="btn bg2 bxs" data-perm="add" onclick="agb('${b.id}')">➕ بوابة</button><button class="btn bred bxs" data-perm="del" onclick="db('${b.id}')">حذف</button></div></div>`;
  }).join('');
  applyPermButtons();
}

function fillBldgType(){
  const s = document.getElementById('bldgType');
  if(!s) return;
  s.innerHTML = LK.buildingTypes.map(t => `<option>${t}</option>`).join('');
}

function openAddBuilding(){
  document.getElementById('buildingModalTitle').textContent = '🏬 مبنى جديد';
  document.getElementById('bldgId').value = '';
  ['bldgName','bldgCode','bldgManager','bldgPhone'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('bldgFloors').value = '1';
  fillBldgType();
  rbBd(CB);
  openModal('modalBuilding');
}

function eb(id){
  const b = gB(id);
  if(!b) return;
  document.getElementById('buildingModalTitle').textContent = '✏️ ' + b.name;
  document.getElementById('bldgId').value = b.id;
  document.getElementById('bldgName').value = b.name;
  document.getElementById('bldgCode').value = b.code;
  document.getElementById('bldgFloors').value = b.floors || 1;
  document.getElementById('bldgManager').value = b.manager || '';
  document.getElementById('bldgPhone').value = b.phone || '';
  fillBldgType();
  rbBd(b.branchId);
  if(b.type) document.getElementById('bldgType').value = b.type;
  openModal('modalBuilding');
}

function rbBd(s){
  const sel = document.getElementById('bldgBranch');
  if(!sel) return;
  sel.innerHTML = BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}" ${b.id === s ? 'selected' : ''}>${b.name}</option>`).join('');
}

async function saveBuilding(){
  const e  = document.getElementById('bldgId').value;
  const n  = document.getElementById('bldgName').value.trim();
  const c  = document.getElementById('bldgCode').value.trim().toUpperCase();
  const ty = document.getElementById('bldgType').value;
  const fl = parseInt(document.getElementById('bldgFloors').value) || 1;
  const br = document.getElementById('bldgBranch').value || CB;
  const mg = document.getElementById('bldgManager').value.trim();
  const ph = document.getElementById('bldgPhone').value.trim();

  if(!n || !c){ toast('⚠️ يرجى إكمال الحقول المطلوبة (الاسم والكود)'); return; }
  if(!br){ toast('⚠️ اختر الفرع'); return; }

  const dto = { id: e || null, name: n, code: c, branchId: br, type: ty, floors: fl, manager: mg, phone: ph, status: 'active' };

  try{
    const resp = await fetch('/api/organization/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    let res;
    try { res = await resp.json(); } catch(_){
      toast('⛔ خطأ في الاتصال بالسيرفر (' + resp.status + ')');
      return;
    }

    if(res && typeof res.success !== 'undefined'){
      if(!res.success){ toast('⛔ ' + (res.message || 'فشل حفظ المبنى')); return; }
      if(e){ const b = gB(e); if(b) Object.assign(b, res.data); }
      else BL.push(res.data);
    } else if(res && res.errors){
      toast('⛔ ' + (res.title || Object.values(res.errors).flat().join(' — ')));
      return;
    } else {
      // fallback محلي
      if(e){ const b = gB(e); if(b) Object.assign(b, dto); }
      else BL.push({ ...dto, id: 'bldg-' + Date.now().toString(36) });
    }
  }catch(err){
    console.warn('API error, saving building locally:', err);
    if(e){ const b = gB(e); if(b) Object.assign(b, { name:n, code:c, type:ty, floors:fl, branchId:br, manager:mg, phone:ph }); }
    else BL.push({ id:'bldg-'+Date.now().toString(36), name:n, code:c, branchId:br, type:ty, floors:fl, manager:mg, phone:ph, status:'active' });
  }

  xau(e ? 'edit' : 'add', 'مبنى', n);
  toast('✅ تم حفظ المبنى بنجاح');
  closeModal('modalBuilding');
  refreshBds();
  if(typeof renderBuildingSelect === 'function') renderBuildingSelect();
  if(typeof renderVehicleBuilding === 'function') renderVehicleBuilding();
  if(typeof renderExitBuilding === 'function') renderExitBuilding();
  rb(); rg();
  if(typeof rd === 'function') rd();
}


async function db(id){
  const b = gB(id);
  if(!b) return;
  if(!confirm('هل تود حذف «' + b.name + '»؟')) return;

  try{ await fetch(`/api/organization/buildings/${id}`, { method: 'DELETE' }); }catch(e){}

  GP[b.branchId] = (GP[b.branchId] || []).filter(g => g.buildingId !== id);
  PD = PD.filter(p => p.buildingId !== id);
  BL = BL.filter(x => x.id !== id);

  xau('del', 'مبنى', b.name);
  toast('🗑 تم حذف المبنى');
  rb();
  rg();
  rp();
  pgq();
}

function agb(bid){
  const b = gB(bid);
  if(!b) return;
  document.getElementById('gateModalTitle').textContent = '🚪 بوابة في ' + b.name;
  if(document.getElementById('gateId')) document.getElementById('gateId').value = '';
  let nextNum = ((GP[b.branchId] || []).length + 1);
  while((GP[b.branchId] || []).some(g => g.name === 'بوابة ' + nextNum)) { nextNum++; }
  document.getElementById('gateName').value = 'بوابة ' + nextNum;
  fgLoc();
  rgBd(b.branchId);
  document.getElementById('gateBuilding').innerHTML = gBF(b.branchId).map(x => `<option value="${x.id}" ${x.id === bid ? 'selected' : ''}>${x.name}</option>`).join('');
  if(typeof gdLoad === 'function') gdLoad(null);

  openModal('modalGate');
}

function fgLoc(){
  const s = document.getElementById('gateLocation');
  if(!s) return;
  s.innerHTML = LK.gateLocations.map(t => `<option>${t}</option>`).join('');
}

function rgBd(s){
  const sel = document.getElementById('gateBranch');
  if(!sel) return;
  sel.innerHTML = BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}" ${b.id === s ? 'selected' : ''}>${b.name}</option>`).join('');
  refreshBuildingForGate();
}

function refreshBuildingForGate(){
  const br = document.getElementById('gateBranch').value;
  const s = document.getElementById('gateBuilding');
  if(!s) return;
  const bl = gBF(br);
  s.innerHTML = bl.length ? bl.map(b => `<option value="${b.id}">${b.name}</option>`).join('') : '<option value="">⚠️ لا مباني</option>';
}

/* ═══════ PATHS ═══════ */
function setPathsTab(t, el){
  document.querySelectorAll('#screen-paths .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  ['gates','paths','devices'].forEach(x => {
    const p = document.getElementById('pathsTab-' + x);
    if(p) p.style.display = x === t ? 'block' : 'none';
  });
  if(t === 'gates') rg();
  if(t === 'paths') rp();
  if(t === 'devices' && typeof rdv === 'function') rdv();
}

function addGate(){
  const bs = gBF(CB);
  if(!bs.length){ toast('⚠️ يرجى إضافة مبنى أولاً'); return; }
  document.getElementById('gateModalTitle').textContent = '🚪 بوابة جديدة';
  if(document.getElementById('gateId')) document.getElementById('gateId').value = '';
  let nextNum = ((GP[CB] || []).length + 1);
  while((GP[CB] || []).some(g => g.name === 'بوابة ' + nextNum)) { nextNum++; }
  document.getElementById('gateName').value = 'بوابة ' + nextNum;
  fgLoc();
  rgBd(CB);
  document.getElementById('gateBuilding').innerHTML = bs.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  if(typeof gdLoad === 'function') gdLoad(null);

  openModal('modalGate');
}

async function dgs(id){
  const g = (GP[CB] || []).find(x => x.id === id);
  if(!g) return;
  if(!confirm('هل تود حذف «' + g.name + '»؟')) return;

  try{ await fetch(`/api/organization/gates/${id}`, { method: 'DELETE' }); }catch(e){}

  GP[CB] = GP[CB].filter(x => x.id !== id);
  PD.forEach(p => { if(p.branch === CB) p.gates = p.gates.filter(n => n !== g.name); });

  xau('del', 'بوابة', g.name);
  rg();
  rp();
  pgq();
  rb();
  toast('🗑 تم حذف البوابة');
}

function rp(){
  const w = document.getElementById('pathsContainer');
  if(!w) return;
  w.innerHTML = '';
  const ps = PD.filter(p => (p.branchId || p.branch) === CB);
  if(!ps.length){
    w.innerHTML = '<div class="hint" style="padding:28px;text-align:center;border:1.5px dashed var(--g200);border-radius:12px">لا توجد مسارات محددة</div>';
    return;
  }
  const g = document.createElement('div');
  g.className = 'grid2';
  w.appendChild(g);
  ps.forEach(p => {
    const b = gB(p.buildingId);
    const c = document.createElement('div');
    c.className = 'card';
    c.style.padding = '16px';
    c.style.borderRight = '4px solid var(--gm)';
    c.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:13.5px;font-weight:800">${xesc(p.name)}</div>
        <div style="display:flex;gap:6px">
          <button class="btn bg2 bxs" onclick="rnp('${p.id}')">تعديل</button>
          <button class="btn bred bxs" onclick="dp('${p.id}')">حذف</button>
        </div>
      </div>
      <div style="font-size:11px;color:var(--g400)">🏬 ${b ? xesc(b.name) : '—'}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
        ${p.gates.map(gt => `<span class="badge bbl">🚪 ${xesc(gt)}</span>`).join('')}
      </div>`;
    g.appendChild(c);
  });
  applyPermButtons();
}

async function rnp(id){
  const p = PD.find(x => x.id === id);
  if(!p) return;
  const n = prompt('اسم المسار الجديد:', p.name);
  if(!n || n === p.name) return;
  p.name = n;
  try{
    await fetch('/api/organization/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, name: n, branchId: p.branch, buildingId: p.buildingId, gates: p.gates })
    });
  }catch(e){}
  xau('edit', 'مسار', n);
  toast('✅ تم تحديث المسار');
  rp();
}

async function dp(id){
  const p = PD.find(x => x.id === id);
  if(!p) return;
  if(!confirm('هل تود حذف المسار؟')) return;
  try{ await fetch(`/api/organization/paths/${id}`, { method: 'DELETE' }); }catch(e){}
  PD = PD.filter(x => x.id !== id);
  xau('del', 'مسار', p.name);
  rp();
  rg();
  toast('🗑 تم حذف المسار');
}

function openAddPath(){
  document.getElementById('newPathName').value = '';
  refreshNBd();
  document.getElementById('newPathBranch').value = CB;
  onNewPathBranchChange();
  document.getElementById('pathStep1').style.display = 'block';
  document.getElementById('pathStep2').style.display = 'none';
  selGatesPath = [];
  rgcp();
  openModal('modalAddPath');
}

function refreshNBd(){
  const s = document.getElementById('newPathBranch');
  if(!s) return;
  s.innerHTML = BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}">${b.name}</option>`).join('');
}

function onNewPathBranchChange(){
  const br = document.getElementById('newPathBranch').value;
  const s = document.getElementById('newPathBuilding');
  if(!s) return;
  const bl = gBF(br);
  s.innerHTML = bl.length ? bl.map(b => `<option value="${b.id}">${b.name}</option>`).join('') : '<option value="">⚠️ لا مباني</option>';
}

function backPathStep1(){
  document.getElementById('pathStep1').style.display = 'block';
  document.getElementById('pathStep2').style.display = 'none';
}

function goPathStep2(){
  const n = document.getElementById('newPathName').value.trim();
  const bid = document.getElementById('newPathBuilding').value;
  if(!n || !bid){ toast('⚠️ يرجى كتابة اسم المسار واختيار المبنى'); return; }
  document.getElementById('pathNameDisplay').textContent = n;
  document.getElementById('pathStep1').style.display = 'none';
  document.getElementById('pathStep2').style.display = 'block';
}

function searchGatesForPath(q){
  const b = document.getElementById('gateSearchForPathResults');
  const bid = document.getElementById('newPathBuilding').value;
  const bd = gB(bid);
  if(!bd || !q){ b.style.display = 'none'; return; }
  const pool = (GP[bd.branchId] || []).filter(g => g.buildingId === bid);
  const m = pool.filter(g => !selGatesPath.includes(g.name) && g.name.includes(q.trim()));
  if(!m.length){
    b.innerHTML = '<div style="padding:12px;text-align:center;color:var(--g400)">لا توجد بوابات مطابقة</div>';
    b.style.display = 'block';
    return;
  }
  b.innerHTML = m.map(g => `
    <div class="search-result-item" onclick="agp('${xesc(g.name)}')">
      <span>🚪</span>
      <div class="sr-info"><div class="sr-name">${xesc(g.name)}</div></div>
      <span style="color:var(--gm)">+</span>
    </div>`).join('');
  b.style.display = 'block';
}

function showAllGatesForPath(){
  const bid = document.getElementById('newPathBuilding').value;
  const bd = gB(bid);
  if(!bd) return;
  const pool = (GP[bd.branchId] || []).filter(g => g.buildingId === bid && !selGatesPath.includes(g.name));
  const b = document.getElementById('gateSearchForPathResults');
  if(!pool.length){
    b.innerHTML = '<div style="padding:12px;text-align:center;color:var(--g400)">لا توجد بوابات متاحة</div>';
    b.style.display = 'block';
    return;
  }
  b.innerHTML = pool.map(g => `
    <div class="search-result-item" onclick="agp('${xesc(g.name)}')">
      <span>🚪</span>
      <div class="sr-info"><div class="sr-name">${xesc(g.name)}</div></div>
      <span style="color:var(--gm)">+</span>
    </div>`).join('');
  b.style.display = 'block';
}

function agp(n){
  if(selGatesPath.includes(n)) return;
  selGatesPath.push(n);
  document.getElementById('gateSearchForPath').value = '';
  document.getElementById('gateSearchForPathResults').style.display = 'none';
  rgcp();
}

function rgp(n){
  selGatesPath = selGatesPath.filter(g => g !== n);
  rgcp();
}

function rgcp(){
  const w = document.getElementById('selectedGatesChips');
  const h = document.getElementById('noGatesHint');
  if(!w) return;
  if(!selGatesPath.length){
    w.innerHTML = '';
    if(h) h.style.display = 'block';
    return;
  }
  if(h) h.style.display = 'none';
  w.innerHTML = selGatesPath.map(g => `
    <div class="dept-chip">
      <span class="dept-chip-name">🚪 ${xesc(g)}</span>
      <button class="chip-remove" onclick="rgp('${xesc(g)}')">✕</button>
    </div>`).join('');
}

async function savePath(){
  if(!selGatesPath.length){ toast('⚠️ اختر بوابة واحدة على الأقل'); return; }
  const n = document.getElementById('newPathName').value.trim();
  const br = document.getElementById('newPathBranch').value;
  const bid = document.getElementById('newPathBuilding').value;

  const dto = { id: 'p' + Date.now(), name: n, branchId: br, buildingId: bid, gates: [...selGatesPath] };

  try{
    await fetch('/api/organization/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
  }catch(e){}

  PD.push(dto);
  xau('add', 'مسار', n);
  closeModal('modalAddPath');
  toast('✅ تم حفظ المسار');
  rp();
  rg();
}

/* ═══════ DEPARTMENTS ═══════ */
const DLI={1:'🏛️',2:'📂',3:'📁'},DLN={1:'رئيسية',2:'فرعية',3:'قسم'};

function rde(){
  const c = document.getElementById('depsTreeContainer');
  if(!c) return;
  const ds = gDB(CB);
  if(!ds.length){
    c.innerHTML = '<div class="hint" style="padding:40px;text-align:center">لا توجد إدارات مسجلة</div>';
    return;
  }
  const r = ds.sort((a,b) => a.level - b.level);
  c.innerHTML = `
    <div class="tbl-wrap" style="box-shadow:none;border:none">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>الكود</th>
            <th>المستوى</th>
            <th>الأعلى</th>
            <th>المدير</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${r.map((d, i) => {
            const p = DP.find(x => x.id === d.parentId);
            const lc = d.level === 1 ? 'bbl' : d.level === 2 ? 'bor2' : 'bpri-normal';
            return `<tr>
              <td>${i + 1}</td>
              <td><b>${DLI[d.level]} ${xesc(d.name)}</b></td>
              <td><span class="badge bgry">${xesc(d.code)}</span></td>
              <td><span class="badge ${lc}">${DLN[d.level]}</span></td>
              <td>${p ? xesc(p.name) : '—'}</td>
              <td>${xesc(d.manager || '—')}</td>
              <td style="display:flex;gap:4px">
                <button class="btn bg2 bxs" onclick="ede('${d.id}')">تعديل</button>
                <button class="btn bred bxs" onclick="dde('${d.id}')">حذف</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  applyPermButtons();
}

function openAddDepartment(pid){
  document.getElementById('depModalTitle').textContent = '🏛️ إدارة جديدة';
  document.getElementById('depId').value = '';
  ['depName','depCode','depManager','depEmail'].forEach(id => document.getElementById(id).value = '');
  rDBd(CB);
  const p = pid ? DP.find(d => d.id === pid) : null;
  const nl = p ? (p.level < 3 ? p.level + 1 : 3) : 1;
  document.getElementById('depLevel').value = nl;
  rDPD(nl, pid);
  openModal('modalDepartment');
}

function ede(id){
  const d = DP.find(x => x.id === id);
  if(!d) return;
  document.getElementById('depModalTitle').textContent = '✏️ ' + d.name;
  document.getElementById('depId').value = d.id;
  document.getElementById('depName').value = d.name;
  document.getElementById('depCode').value = d.code;
  document.getElementById('depLevel').value = d.level;
  document.getElementById('depManager').value = d.manager || '';
  document.getElementById('depEmail').value = d.email || '';
  rDBd(d.branchId);
  rDPD(d.level, d.parentId);
  openModal('modalDepartment');
}

function rDBd(s){
  const sel = document.getElementById('depBranchSelectModal');
  if(!sel) return;
  sel.innerHTML = BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}" ${b.id === s ? 'selected' : ''}>${b.name}</option>`).join('');
}

function rDPD(l, s){
  const w = document.getElementById('depParentWrap');
  const sel = document.getElementById('depParentId');
  if(l === 1){ w.style.display = 'none'; sel.innerHTML = ''; return; }
  w.style.display = 'block';
  const pl = l - 1;
  const br = document.getElementById('depBranchSelectModal').value;
  const c = DP.filter(d => d.level === pl && d.branchId === br);
  sel.innerHTML = c.map(d => `<option value="${d.id}" ${d.id === s ? 'selected' : ''}>${d.name}</option>`).join('');
}

function onDepLevelChange(){
  const l = parseInt(document.getElementById('depLevel').value);
  rDPD(l, null);
}

async function saveDepartment(){
  const e = document.getElementById('depId').value;
  const n = document.getElementById('depName').value.trim();
  const c = document.getElementById('depCode').value.trim().toUpperCase();
  const l = parseInt(document.getElementById('depLevel').value);
  const br = document.getElementById('depBranchSelectModal').value;
  const pid = l === 1 ? null : document.getElementById('depParentId').value;
  const mg = document.getElementById('depManager').value.trim();
  const em = document.getElementById('depEmail').value.trim();

  if(!n || !c){ toast('⚠️ يرجى إدخال اسم الإدارة والكود'); return; }

  const dto = { id: e || null, name: n, code: c, level: l, parentId: pid || null, branchId: br, manager: mg, email: em, status: 'active' };

  try{
    const resp = await fetch('/api/organization/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    let res;
    try { res = await resp.json(); } catch(_){
      toast('⛔ خطأ في الاتصال بالسيرفر (' + resp.status + ')'); return;
    }

    if(res && typeof res.success !== 'undefined'){
      if(!res.success){ toast('⛔ ' + (res.message || 'فشل حفظ الإدارة')); return; }
      if(e){ const d = DP.find(x => x.id === e); if(d) Object.assign(d, res.data); }
      else DP.push(res.data);
    } else if(res && res.errors){
      toast('⛔ ' + (res.title || Object.values(res.errors).flat().join(' — '))); return;
    } else {
      if(e){ const d = DP.find(x => x.id === e); if(d) Object.assign(d, dto); }
      else DP.push({ ...dto, id: 'dep-' + Date.now().toString(36) });
    }
  }catch(err){
    console.warn('API error saveDepartment, fallback local:', err);
    if(e){ const d = DP.find(x => x.id === e); if(d) Object.assign(d, dto); }
    else DP.push({ ...dto, id: 'dep-' + Date.now().toString(36) });
  }

  xau(e ? 'edit' : 'add', 'إدارة', n);
  toast('✅ تم حفظ الإدارة بنجاح');
  closeModal('modalDepartment');
  rde();
}


async function dde(id){
  const d = DP.find(x => x.id === id);
  if(!d) return;
  if(DP.some(x => x.parentId === id)){ toast('⛔ لا يمكن حذف إدارة تحتوي على إدارات فرعية'); return; }
  if(!confirm('هل تود حذف «' + d.name + '»؟')) return;

  try{ await fetch(`/api/organization/departments/${id}`, { method: 'DELETE' }); }catch(e){}
  DP = DP.filter(x => x.id !== id);
  xau('del', 'إدارة', d.name);
  rde();
  toast('🗑 تم حذف الإدارة');
}

/* ═══════ LOOKUPS ═══════ */
function rlk(){
  const g = document.getElementById('lookupsGrid');
  if(!g) return;
  const cards = [
    { key: 'nationalities', title: '🌍 الجنسيات', ico: '🌍', type: 'list' },
    { key: 'personTypes', title: '👤 أنواع الأشخاص', ico: '👤', type: 'list' },
    { key: 'idTypes', title: '🆔 أنواع الهويات', ico: '🆔', type: 'list' },
    { key: 'visitTypes', title: '📅 أنواع الزيارات', ico: '📅', type: 'list' },
    { key: 'devices', title: '📱 الأجهزة المصرحة', ico: '📱', type: 'list' },
    { key: 'vehicleTypes', title: '🚗 تصنيفات المركبات', ico: '🚗', type: 'list' },
    { key: 'vehicleColors', title: '🎨 ألوان المركبات', ico: '🎨', type: 'list' },
    { key: 'vehicleMakes', title: '🏭 الماركات والموديلات', ico: '🏭', type: 'group' },
    { key: 'gateLocations', title: '📍 مواقع البوابات', ico: '📍', type: 'list' },
    { key: 'exitItemCategories', title: '📦 تصنيفات الخروج', ico: '📦', type: 'list' },
    { key: 'exitItemTypes', title: '🏷️ أصول الخروج', ico: '🏷️', type: 'group' },
    { key: 'buildingTypes', title: '🏬 أنواع المباني', ico: '🏬', type: 'list' }
  ];

  g.innerHTML = cards.map(c => {
    if(c.type === 'list'){
      const a = LK[c.key] || [];
      return `<div class="lookup-card">
        <div class="lookup-card-head"><div class="lookup-card-ico">${c.ico}</div><div class="lookup-card-title">${c.title}</div><div class="lookup-card-count">${a.length}</div></div>
        <div class="lookup-list">${a.map((x, i) => `<div class="lookup-item"><span>${xesc(x)}</span>${hasPerm('del') ? `<button class="lookup-item-x" onclick="rli('${c.key}',${i})">✕</button>` : ''}</div>`).join('')}</div>
        ${hasPerm('add') ? `<div class="lookup-add-row"><button class="btn bg2 bsm btn-block" style="justify-content:center" onclick="ali('${c.key}')">➕ إضافة</button></div>` : ''}
      </div>`;
    }
    const o = LK[c.key] || {};
    const k = Object.keys(o);
    return `<div class="lookup-card">
      <div class="lookup-card-head"><div class="lookup-card-ico">${c.ico}</div><div class="lookup-card-title">${c.title}</div><div class="lookup-card-count">${k.length}</div></div>
      <div class="lookup-list" style="max-height:340px">${k.map(mk => `<div class="lookup-sub-group"><div class="lookup-sub-group-title">${xesc(mk)} ${hasPerm('add') ? `<span class="lookup-item-x" style="margin-right:auto" onclick="agm('${c.key}','${xesc(mk)}')">➕</span>` : ''}</div><div class="lookup-sub-chips">${o[mk].map(m => `<span class="lookup-sub-chip">${xesc(m)}</span>`).join('')}</div></div>`).join('')}</div>
      ${hasPerm('add') ? `<div class="lookup-add-row"><button class="btn bg2 bsm btn-block" style="justify-content:center" onclick="agi('${c.key}')">➕ إضافة مجموعة</button></div>` : ''}
    </div>`;
  }).join('');
}

async function ali(k){
  const v = await xdlg({ title: 'إضافة عنصر جديد', ico: '📚', fields: [{ id: 'n', label: 'القيمة', req: 1 }], ok: '➕ إضافة' });
  if(!v) return;
  if(LK[k].includes(v.n)){ toast('⚠️ القيمة مضافة مسبقاً'); return; }
  LK[k].push(v.n);
  try{
    await fetch('/api/settings/lookups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: k, value: v.n })
    });
  }catch(e){}
  rlk();
  rfl();
  toast('✅ تمت الإضافة');
}

async function rli(k, i){
  if(!confirm('هل تود حذف هذا العنصر؟')) return;
  const val = LK[k][i];
  LK[k].splice(i, 1);
  try{ await fetch(`/api/settings/lookups?category=${k}&value=${encodeURIComponent(val)}`, { method: 'DELETE' }); }catch(e){}
  rlk();
  rfl();
}

async function agi(k){
  const v = await xdlg({ title: 'مجموعة جديدة', ico: '📦', fields: [{ id: 'n', label: 'الاسم', req: 1 }, { id: 'm', label: 'العناصر الأولية (مفصولة بفاصلة)' }], ok: '➕ حفظ' });
  if(!v) return;
  if(LK[k][v.n]){ toast('⚠️ المجموعة موجودة مسبقاً'); return; }
  LK[k][v.n] = v.m ? v.m.split(/[,،]/).map(s => s.trim()).filter(Boolean) : ['أخرى'];
  rlk();
  rfl();
  toast('✅ تمت إضافة المجموعة');
}

async function agm(k, g){
  const v = await xdlg({ title: 'إضافة إلى «' + g + '»', ico: '➕', fields: [{ id: 'n', label: 'الاسم', req: 1 }], ok: '➕ إضافة' });
  if(!v) return;
  if(LK[k][g].includes(v.n)){ toast('⚠️ موجود مسبقاً'); return; }
  LK[k][g].push(v.n);
  rlk();
  rfl();
  toast('✅ تمت الإضافة');
}

function rfl(){
  fillNats(); fillPTypes(); fillIdTypes(); fillVTypes(); fillDevs(); fillVCols(); fillVTypes2(); fillGLocs(); fillBldgTypes(); popMakes();
}

function fillNats(){
  ['newPersonNat','blNat'].forEach(id => {
    const s = document.getElementById(id);
    if(!s) return;
    const c = s.value;
    s.innerHTML = LK.nationalities.map(n => `<option>${n}</option>`).join('');
    if(c && [...s.options].some(o => o.value === c)) s.value = c;
  });
}

function fillPTypes(){
  const s = document.getElementById('newPersonType');
  if(!s) return;
  s.innerHTML = LK.personTypes.map(p => `<option>${p}</option>`).join('');
}

function fillIdTypes(){
  const s = document.getElementById('newPersonIdType');
  if(!s) return;
  s.innerHTML = LK.idTypes.map(p => `<option>${p}</option>`).join('');
}

function fillVTypes(){
  const s = document.getElementById('visitType');
  if(!s) return;
  s.innerHTML = LK.visitTypes.map(p => `<option>${p}</option>`).join('');
}

function fillDevs(){
  const w = document.getElementById('wizDeviceChecklist');
  if(!w) return;
  w.innerHTML = LK.devices.map((d, i) => `<label class="check-item"><input type="checkbox" ${i === 0 ? 'checked' : ''} value="${xesc(d)}">${xesc(d)}</label>`).join('');
}

function fillVCols(){
  const s = document.getElementById('vehicleColorInput');
  if(!s) return;
  s.innerHTML = LK.vehicleColors.map(c => `<option>${c}</option>`).join('');
}

function fillVTypes2(){
  const s = document.getElementById('vehicleTypeSelect');
  if(!s) return;
  s.innerHTML = LK.vehicleTypes.map(t => `<option>${t}</option>`).join('');
}

function fillGLocs(){
  const s = document.getElementById('gateLocation');
  if(!s) return;
  s.innerHTML = LK.gateLocations.map(t => `<option>${t}</option>`).join('');
}

function fillBldgTypes(){
  const s = document.getElementById('bldgType');
  if(!s) return;
  s.innerHTML = LK.buildingTypes.map(t => `<option>${t}</option>`).join('');
}

function popMakes(){
  const s = document.getElementById('vehicleMakeSelect');
  if(!s) return;
  s.innerHTML = Object.keys(LK.vehicleMakes).map(m => `<option>${m}</option>`).join('');
  onMakeChange();
}

function onMakeChange(){
  const m = document.getElementById('vehicleMakeSelect').value;
  const s = document.getElementById('vehicleModelSelect');
  if(!s) return;
  s.innerHTML = (LK.vehicleMakes[m] || []).map(x => `<option>${x}</option>`).join('');
  rvp();
}

async function addDevice(){
  const v = await xdlg({ title: 'إضافة غرض مصرح بدخوله', ico: '📱', fields: [{ id: 'n', label: 'الاسم', req: 1 }], ok: '➕ إضافة' });
  if(!v) return;
  if(LK.devices.includes(v.n)){ toast('⚠️ الغرض موجود مسبقاً'); return; }
  LK.devices.push(v.n);
  rfl();
  const g = document.getElementById('wizDeviceChecklist');
  if(g){
    const l = document.createElement('label');
    l.className = 'check-item';
    l.innerHTML = `<input type="checkbox" checked value="${xesc(v.n)}">${xesc(v.n)}`;
    g.appendChild(l);
  }
  toast('✅ تم إضافة الغرض');
}

async function addMake(){
  const v = await xdlg({ title: 'إضافة ماركة جديدة', ico: '🏭', fields: [{ id: 'n', label: 'الاسم', req: 1 }], ok: '➕ حفظ' });
  if(!v) return;
  if(LK.vehicleMakes[v.n]){ toast('⚠️ موجودة مسبقاً'); return; }
  LK.vehicleMakes[v.n] = ['أخرى'];
  popMakes();
  toast('✅ تم إضافة الماركة');
}

async function addModel(){
  const v = await xdlg({ title: 'إضافة موديل', ico: '🚙', fields: [{ id: 'm', label: 'الماركة', type: 'select', options: Object.keys(LK.vehicleMakes), value: document.getElementById('vehicleMakeSelect').value }, { id: 'n', label: 'اسم الموديل', req: 1 }], ok: '➕ حفظ' });
  if(!v) return;
  if((LK.vehicleMakes[v.m] || []).includes(v.n)){ toast('⚠️ موجود مسبقاً'); return; }
  LK.vehicleMakes[v.m].push(v.n);
  popMakes();
  toast('✅ تم إضافة الموديل');
}

/* ═══════ BRANCHES ═══════ */
function rbr(){
  const g = document.getElementById('branchesGrid');
  if(!g) return;
  g.innerHTML = BR.map(b => {
    const bc = BL.filter(x => x.branchId === b.id).length;
    const pc = PD.filter(p => (p.branchId || p.branch) === b.id).length;

    const gc = (GP[b.id] || []).length;
    const uc = US.filter(u => (u.branches || []).includes(b.id)).length;
    const wh = b.workingHours || { days: (b.workingHoursDays || '').split(','), from: b.workingHoursFrom || '07:00', to: b.workingHoursTo || '17:00' };
    return `<div class="card" style="padding:16px;border-right:4px solid var(--gm)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:13.5px;font-weight:800">🏢 ${xesc(b.name)} <span class="badge bgry">${xesc(b.code)}</span></div>
        <div style="display:flex;gap:5px">
          <button class="btn bg2 bxs" onclick="ebr('${b.id}')">تعديل</button>
          <button class="btn bred bxs" onclick="dbr('${b.id}')">حذف</button>
        </div>
      </div>
      <div style="font-size:10.5px;color:var(--g400)">📍 ${xesc(b.city || '—')} • 👤 ${xesc(b.manager || '—')}</div>
      <div style="font-size:10.5px;color:var(--g500);margin-top:6px;padding:5px 8px;background:var(--gp);border-radius:6px;display:flex;align-items:center;gap:5px">
        ⏰ <b>${wh.from}</b> → <b>${wh.to}</b> <span style="color:var(--g400);margin-right:auto">${formatDaysLabel(wh.days)}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        <span class="badge bbl">🏬 ${bc}</span>
        <span class="badge bbl">🚪 ${gc}</span>
        <span class="badge bbl">🛣️ ${pc}</span>
        <span class="badge bbl">👥 ${uc}</span>
      </div>
    </div>`;
  }).join('');

  document.getElementById('branchesCount').textContent = BR.length;
  document.getElementById('branchesBuildingsCount').textContent = BL.length;
  document.getElementById('branchesGatesCount').textContent = Object.values(GP).reduce((a, g) => a + g.length, 0);
  document.getElementById('branchesPathsCount').textContent = PD.length;
  applyPermButtons();
}

function openAddBranch(){
  document.getElementById('branchModalTitle').textContent = '🏢 فرع جديد';
  document.getElementById('branchId').value = '';
  ['branchName','branchCode','branchCity','branchManager','branchPhone'].forEach(id => document.getElementById(id).value = '');
  openModal('modalBranch');
}

function ebr(id){
  const b = BR.find(x => x.id === id);
  if(!b) return;
  document.getElementById('branchModalTitle').textContent = '✏️ ' + b.name;
  document.getElementById('branchId').value = b.id;
  document.getElementById('branchName').value = b.name;
  document.getElementById('branchCode').value = b.code;
  document.getElementById('branchCity').value = b.city || '';
  document.getElementById('branchManager').value = b.manager || '';
  document.getElementById('branchPhone').value = b.phone || '';
  openModal('modalBranch');
}

async function saveBranch(){
  const e  = document.getElementById('branchId').value;
  const n  = document.getElementById('branchName').value.trim();
  const c  = document.getElementById('branchCode').value.trim();
  const ci = document.getElementById('branchCity').value.trim();
  const mg = document.getElementById('branchManager').value.trim();
  const ph = document.getElementById('branchPhone').value.trim();

  if(!n || !c){ toast('⚠️ يرجى إكمال الحقول المطلوبة (الاسم والكود)'); return; }

  const dto = { id: e || null, name: n, code: c, city: ci, manager: mg, phone: ph, status: 'active' };

  try{
    const resp = await fetch('/api/organization/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    let res;
    try { res = await resp.json(); } catch(_){
      toast('⛔ خطأ في الاتصال بالسيرفر (' + resp.status + ')');
      return;
    }

    if(res && typeof res.success !== 'undefined'){
      if(!res.success){ toast('⛔ ' + (res.message || 'فشل حفظ الفرع')); return; }
      if(e){
        const b = BR.find(x => x.id === e);
        if(b) Object.assign(b, res.data);
        BN[e] = res.data.name || n;
      } else {
        BR.push(res.data);
        BN[res.data.id] = res.data.name;
        GP[res.data.id] = [];
      }
    } else if(res && res.errors){
      toast('⛔ ' + (res.title || Object.values(res.errors).flat().join(' — ')));
      return;
    } else {
      // fallback محلي
      if(e){
        const b = BR.find(x => x.id === e);
        if(b) Object.assign(b, { name:n, code:c, city:ci, manager:mg, phone:ph });
        BN[e] = n;
      } else {
        const fid = 'br-' + Date.now().toString(36);
        BR.push({ id:fid, name:n, code:c, city:ci, manager:mg, phone:ph, status:'active' });
        BN[fid] = n; GP[fid] = [];
      }
    }
  }catch(err){
    console.warn('API error saveBranch, fallback local:', err);
    if(e){
      const b = BR.find(x => x.id === e);
      if(b) Object.assign(b, { name:n, code:c, city:ci, manager:mg, phone:ph });
      BN[e] = n;
    } else {
      const fid = 'br-' + Date.now().toString(36);
      BR.push({ id:fid, name:n, code:c, city:ci, manager:mg, phone:ph, status:'active' });
      BN[fid] = n; GP[fid] = [];
    }
  }

  xau(e ? 'edit' : 'add', 'فرع', n);
  toast('✅ تم حفظ الفرع بنجاح');
  closeModal('modalBranch');
  popBranch();
  rbr();
  refreshBds();
}


async function dbr(id){
  const b = BR.find(x => x.id === id);
  if(!b) return;
  if(BR.length <= 1){ toast('⚠️ لا يمكن حذف الفرع الوحيد في النظام'); return; }
  if(!confirm('هل تود حذف «' + b.name + '» وكل متعلقاته؟')) return;

  try{ await fetch(`/api/organization/branches/${id}`, { method: 'DELETE' }); }catch(e){}

  BR = BR.filter(x => x.id !== id);
  BL = BL.filter(x => x.branchId !== id);
  PD = PD.filter(p => (p.branchId || p.branch) !== id);

  DP = DP.filter(d => d.branchId !== id);
  delete GP[id];

  if(CB === id) CB = BR[0].id;
  popBranch();
  setBranch(CB);
  xau('del', 'فرع', b.name);
  toast('🗑 تم حذف الفرع');
  rbr();
  refreshBds();
}

function refreshBds(){
  const h = BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  ['visitBranch','newPathBranch','pathsScreenBranchSelect','buildingsBranchSelect','depsBranchSelect'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = h;
    if(BR.some(b => b.id === CB)) el.value = CB;
  });
  refreshPB();
}

/* ═══════ CARD & VEHICLE ═══════ */
function setCardCode(t){
  cardCT = t;
  document.getElementById('codeBtn-qr').classList.toggle('active', t === 'qr');
  document.getElementById('codeBtn-barcode').classList.toggle('active', t === 'barcode');
  rct();
}

function cci(pn){
  if(cardCT === 'barcode') return `<div class="id-card-v-barcode"><div class="bars"></div><div class="bnum">${xesc(pn || '')}</div></div>`;
  return '<div class="id-card-v-qr">🔳</div>';
}

function gcn(k){
  if(!k) k = 'TMP';
  if(!CN[k]) CN[k] = 'CRD-' + (20260000 + Object.keys(CN).length + 1);
  return CN[k];
}

function ric(o){
  const b = o.bh || (o.sc === 'active' ? '<span class="badge bact"><span class="pulse-dot"></span> مفعّل</span>' : o.sc === 'expired' ? '<span class="badge bexp">⏱ منتهي</span>' : '<span class="badge bpnd">' + (o.sl || '—') + '</span>');
  const cn = o.cardNo || o.pn;
  const sl = o.cardNo ? (o.pn ? 'التصريح: ' + o.pn : '') : (o.bn || '');
  const ph = o.pp ? `<div class="id-card-v-photo"><img src="${o.pp}"></div>` : `<div class="id-card-v-photo id-card-v-photo-empty">🧑</div>`;
  const lg = S.logo ? `<img src="${S.logo}">` : '🛡️';
  return `<div class="id-card-v">
    <div class="id-card-v-watermark">${o.wm || '🛡️'}</div>
    <div class="id-card-v-status">${b}</div>
    <div class="id-card-v-top">
      <div class="id-card-v-logo">${lg}</div>
      <div>
        <div class="id-card-v-title">${xesc(o.title || 'تصريح دخول')}</div>
        <div class="id-card-v-name">${xesc(o.name)}</div>
      </div>
      ${o.spp ? ph : ''}
    </div>
    <div class="id-card-v-sub">${xesc(o.sub)}</div>
    <div class="id-card-v-grid">${o.rows.map(r => `<div><span>${xesc(r[0])}</span><b>${xesc(r[1])}</b></div>`).join('')}</div>
    <div class="id-card-v-footrow">
      <div>
        <div class="id-card-v-permno">${xesc(cn)}</div>
        <div class="id-card-v-branch">${xesc(sl)}</div>
      </div>
      <div class="id-card-v-code">${cci(cn)}</div>
    </div>
  </div>`;
}

function rct(){
  const b = document.getElementById('cardTemplatePreviewBox');
  if(!b) return;
  b.innerHTML = ric({
    sc: 'active',
    title: 'تصريح دخول المجمع',
    name: 'فيصل عبدالله المطيري',
    sub: 'شركة النخبة',
    rows: [['رقم الهوية', '1023 •••• 56'], ['الجنسية', 'سعودي'], ['المسار', 'مسار الشرقي'], ['من', addD(TD(), -5)], ['إلى', addD(TD(), 15)], ['التصريح', 'TSR-2026-08341']],
    pn: 'TSR-2026-08341',
    bn: 'مجمع الرياض',
    spp: true,
    pp: PH['p1']?.personal?.data || null
  });
}

function rvp(){
  const b = document.getElementById('vehicleCardPreviewBox');
  if(!b) return;
  const mk = document.getElementById('vehicleMakeSelect')?.value || '—';
  const md = document.getElementById('vehicleModelSelect')?.value || '—';
  const yr = document.getElementById('vehicleYearSelect')?.value || '2020';
  const cl = document.getElementById('vehicleColorInput')?.value || '—';
  const nm = document.getElementById('vehiclePlateNums')?.value || '—';
  const lt = document.getElementById('vehiclePlateLetters')?.value || '—';
  b.innerHTML = ric({
    sc: 'pending',
    sl: 'بانتظار الاعتماد',
    title: 'تصريح مركبة',
    name: mk + ' ' + md,
    sub: 'موديل ' + yr,
    rows: [['اللوحة', nm + ' ' + lt], ['اللون', cl]],
    pn: 'TSR-V-2026-XXXX',
    bn: BN[CB] || '',
    wm: '🚗'
  });
}

function popYear(){
  const s = document.getElementById('vehicleYearSelect');
  if(!s) return;
  let o = '';
  for(let y = 2026; y >= 1998; y--) o += `<option ${y === 2020 ? 'selected' : ''}>${y}</option>`;
  s.innerHTML = o;
}

/* ═══════ WIZARD ═══════ */
function newReq(){
  WS = { step: 1, mode: 'single', persons: [], perPerson: {}, attachments: [], renewFrom: null, editFrom: null };
  document.getElementById('modeCard-single').classList.add('selected');
  document.getElementById('modeCard-multi').classList.remove('selected');
  document.getElementById('newReqTitle').textContent = '➕ طلب تصريح جديد';
  refreshPB();
  fillReqDept();
  const bn = document.getElementById('requesterDeptBanner');
  const mn = document.getElementById('manualDeptBlock');
  if(CU && CU.role === 'requester'){
    bn.style.display = 'flex';
    mn.style.display = 'none';
    const d = gD(CU.departmentId);
    document.getElementById('requesterDeptName').textContent = d ? d.name : '—';
  } else {
    bn.style.display = 'none';
    mn.style.display = 'block';
  }
  ['wizRequesterNotes','wizGuardNotes','personSearchInput'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('visitDate').value = TD();
  document.getElementById('visitExpiry').value = addD(TD(), 15);
  document.getElementById('wizAttachmentsList').innerHTML = '';
  fillDevs();
  const o = document.getElementById('requestingDeptOther');
  o.style.display = 'none';
  o.value = '';
  rpc();
  rwa();
}

function setMode(m){
  WS.mode = m;
  document.getElementById('modeCard-single').classList.toggle('selected', m === 'single');
  document.getElementById('modeCard-multi').classList.toggle('selected', m === 'multi');
  if(m === 'single' && WS.persons.length > 1){
    WS.persons = [WS.persons[0]];
  }
  rpc();
  rpc2();
}

function searchPersons(q){
  const b = document.getElementById('personSearchResults');
  if(!q || !q.trim()){ b.style.display = 'none'; return; }
  const qq = q.trim().toLowerCase();
  let pool = PE.filter(p => p.branch === CB);
  if(CU.role === 'requester') pool = pool.filter(p => p.addedBy === CU.id);
  const m = pool.filter(p => !WS.persons.some(s => s.id === p.id) && (p.name.toLowerCase().includes(qq) || p.sub.toLowerCase().includes(qq) || (p.idNo || '').includes(qq)));
  if(!m.length){
    b.innerHTML = '<div style="padding:12px;text-align:center;color:var(--g400)">لا توجد نتائج</div>';
    b.style.display = 'block';
    return;
  }
  b.innerHTML = m.map(p => {
    const ph = PH[p.id]?.personal?.data;
    const av = ph ? `<img src="${ph}">` : `${p.name.split(' ').slice(0, 2).map(x => x[0]).join('')}`;
    return `<div class="search-result-item" onclick="app('${p.id}')">
      <div class="ur-avatar">${av}</div>
      <div class="sr-info"><div class="sr-name">${xesc(p.name)}</div><div class="sr-sub">${xesc(p.sub)}</div></div>
      <span style="color:var(--gm)">+</span>
    </div>`;
  }).join('');
  b.style.display = 'block';
}

function app(id){
  const p = PE.find(x => x.id === id);
  if(!p) return;
  if(WS.mode === 'single'){
    WS.persons = [p];
  } else {
    if(!WS.persons.some(x => x.id === id)) WS.persons.push(p);
  }
  document.getElementById('personSearchInput').value = '';
  document.getElementById('personSearchResults').style.display = 'none';
  rpc();
  rpc2();
}

function rpp(id){
  WS.persons = WS.persons.filter(p => p.id !== id);
  rpc();
  rpc2();
}

function rpc(){
  const w = document.getElementById('selectedPersonsChips');
  const h = document.getElementById('noPersonsHint');
  if(!w) return;
  if(!WS.persons.length){
    w.innerHTML = '';
    h.style.display = 'block';
    return;
  }
  h.style.display = 'none';
  w.innerHTML = WS.persons.map(p => {
    const ph = PH[p.id]?.personal?.data;
    const av = ph ? `<img src="${ph}">` : `${p.name.split(' ').slice(0, 2).map(x => x[0]).join('')}`;
    return `<div class="user-chip">
      <div class="ur-avatar">${av}</div>
      <span class="user-chip-name">${xesc(p.name)}</span>
      <button class="chip-remove" onclick="rpp('${p.id}')">✕</button>
    </div>`;
  }).join('');
}

function rpc2(){
  const br = document.getElementById('visitBranch')?.value || CB;
  const bid = document.getElementById('visitBuilding')?.value || '';
  const b = document.getElementById('pathChecklist');
  if(!b) return;
  let ps = PD.filter(p => (p.branchId || p.branch) === br && (!bid || p.buildingId === bid));
  if(!ps.length && bid){
    const branchPs = PD.filter(p => (p.branchId || p.branch) === br);
    if(branchPs.length) ps = branchPs;
  }

  b.innerHTML = ps.length ? ps.map(p => `<option value="${xesc(p.name)}">${xesc(p.name)}</option>`).join('') : '<option value="">— لا مسار متاح —</option>';
  if(typeof window.renderMultiTable === 'function') window.renderMultiTable(ps);
}


function applyDefaultToAll(){
  const defPath = document.getElementById('pathChecklist').value;
  if(!defPath) return;
  WS.persons.forEach(p => {
    if(!WS.perPerson[p.id]) WS.perPerson[p.id] = {};
    if(!WS.perPerson[p.id].path) WS.perPerson[p.id].path = defPath;
  });
  const br = document.getElementById('visitBranch')?.value || CB;
  const bid = document.getElementById('visitBuilding')?.value || '';
  const ps = PD.filter(p => (p.branchId || p.branch) === br && (!bid || p.buildingId === bid));

  if(typeof window.renderMultiTable === 'function') window.renderMultiTable(ps);
}

function rwa(){
  for(let i = 1; i <= 4; i++){
    document.getElementById('wizPage' + i).style.display = i === WS.step ? 'block' : 'none';
    const s = document.querySelector('.wiz-step[data-step="' + i + '"]');
    if(s){
      s.classList.remove('done', 'active');
      if(i < WS.step) s.classList.add('done');
      else if(i === WS.step) s.classList.add('active');
    }
  }
  document.getElementById('wizBackBtn').style.display = WS.step > 1 ? 'inline-flex' : 'none';
  document.getElementById('wizNextBtn').style.display = WS.step < 4 ? 'inline-flex' : 'none';
  document.getElementById('wizSendBtn').style.display = WS.step === 4 ? 'inline-flex' : 'none';
  if(WS.step === 4) xreview();
  if(WS.step === 2) rpc2();
}

function wizNext(){
  const v = id => document.getElementById(id).value;
  if(WS.step === 1){
    if(!WS.persons.length){ toast('⚠️ اختر شخصاً واحداً على الأقل'); return; }
    if(WS.mode === 'multi' && WS.persons.length < 2){ toast('⚠️ يجب اختيار شخصين أو أكثر في الطلب المتعدد'); return; }
    if(CU.role !== 'requester' && v('requestingDept') === 'other' && !v('requestingDeptOther').trim()){ toast('⚠️ اكتب اسم الجهة'); return; }
  }
  if(WS.step === 2){
    if(!v('visitBranch') || !v('visitBuilding')){ toast('⚠️ يرجى اختيار الفرع والمبنى'); return; }
    if(!v('pathChecklist')){ toast('⚠️ اختر المسار'); return; }
    if(!v('visitDate') || !v('visitExpiry') || v('visitExpiry') < v('visitDate')){ toast('⚠️ تأكد من صحة التواريخ'); return; }
  }
  if(WS.step < 4){
    WS.step++;
    rwa();
  }
}

function wizBack(){
  if(WS.step > 1){
    WS.step--;
    rwa();
  }
}

function handleAttach(files){
  if(!files || !files.length) return;
  Array.from(files).forEach(f => {
    if(f.size > 5 * 1024 * 1024){ toast('⚠️ حجم الملف كبير'); return; }
    const r = new FileReader();
    r.onload = e => {
      WS.attachments.push({ name: f.name, size: f.size, type: f.type || 'file', data: e.target.result });
      rwa2();
    };
    r.readAsDataURL(f);
  });
}

function rwa2(){
  const list = document.getElementById('wizAttachmentsList');
  if(!list) return;
  list.innerHTML = WS.attachments.map((a, i) => `
    <div class="attach-item">
      <div class="attach-icon">${a.type.startsWith('image/') ? `<img src="${a.data}">` : getFI(a.type, a.name)}</div>
      <div class="attach-info"><div class="attach-name">${xesc(a.name)}</div><div class="attach-size">${fmtSize(a.size)}</div></div>
      <div class="attach-actions"><button class="btn bred bxs" onclick="rwaR(${i})">حذف</button></div>
    </div>`).join('');
}

function rwaR(i){
  WS.attachments.splice(i, 1);
  rwa2();
}

function xchk(p, br){
  const q = PE.find(x => x.id === p.id) || p;
  const bl = BLD.find(b => b.branch === br && b.idNo && b.idNo === q.idNo);
  if(bl) return { bad: 1, t: '⛔ محظور' };
  if((BNB[br] || []).includes(q.nat)) return { bad: 1, t: '⛔ جنسية ممنوعة' };
  return { bad: 0, t: '✔ سليم' };
}

function xreview(){
  const v = id => document.getElementById(id).value;
  const br = v('visitBranch');
  const dP = v('pathChecklist');
  const dF = v('visitDate');
  const dT = v('visitExpiry');
  const dev = document.querySelectorAll('#wizDeviceChecklist input:checked').length;
  let bad = 0;
  const rows = WS.persons.map((p, i) => {
    const pp = WS.perPerson[p.id] || {};
    const c = xchk(p, br);
    const f = pp.dateFrom || dF, t = pp.dateTo || dT;
    const er = t < f;
    if(c.bad || er) bad++;
    return `<tr>
      <td>${i + 1}</td>
      <td><b>${xesc(p.name)}</b></td>
      <td>${xesc(pp.path || dP)}</td>
      <td>${f} ← ${t}</td>
      <td>${(pp.devices || []).length || dev}</td>
      <td><span class="badge ${c.bad || er ? 'bexp' : 'bact'}">${er ? '⛔ تاريخ غير صحيح' : c.t}</span></td>
    </tr>`;
  }).join('');

  WS.blocked = bad;
  document.getElementById('wizPage4').innerHTML = `
    <div class="alert-banner ${bad ? 'warn' : 'success'}">
      <div class="alert-ico">${bad ? '⛔' : '✔'}</div>
      <div><div class="alert-text-title">${bad ? bad + ' تعارضات أمنية مكتشفة' : 'جاهز للإرسال للاعتماد'}</div></div>
    </div>
    <div class="detail-block">
      <div class="detail-row"><span>نوع الطلب</span><b>${WS.mode === 'multi' && WS.persons.length > 1 ? '👥 متعدد (' + WS.persons.length + ' أشخاص)' : '🧑 فردي'}</b></div>
      <div class="detail-row"><span>الفرع / المبنى</span><b>${xesc(BN[br] || '')} / ${xesc((gB(v('visitBuilding')) || {}).name || '—')}</b></div>
      <div class="detail-row"><span>المرفقات</span><b>${WS.attachments.length} ملفات</b></div>
    </div>
    <div class="people-table">
      <table>
        <thead><tr><th>#</th><th>الشخص</th><th>المسار</th><th>الفترة</th><th>المسموح</th><th>الفحص الأمني</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  document.getElementById('wizSendBtn').disabled = !!bad;
}

async function submitPermit(){
  if(WS.blocked){ toast('⛔ يوجد تعارض أمني يمنع الإرسال'); return; }
  const v = id => document.getElementById(id).value;
  const rdp = gD(CU.departmentId);
  let rq, dId = CU.departmentId || '';

  if(CU.role === 'requester' && rdp) rq = rdp.name;
  else {
    const r = v('requestingDept');
    if(r === 'external'){ rq = 'جهة خارجية'; dId = ''; }
    else if(r === 'other'){ rq = v('requestingDeptOther').trim(); dId = ''; }
    else { const d = gD(r); rq = d ? d.name : ''; dId = r; }
  }

  if(!rq){ toast('⚠️ اختر الجهة الطالبة'); return; }

  const dev = [...document.querySelectorAll('#wizDeviceChecklist input:checked')].map(c => c.value);
  const bid = v('visitBuilding');
  const bd = gB(bid);
  const im = WS.mode === 'multi' && WS.persons.length > 1;

  const reqDto = {
    mode: im ? 'multi' : 'single',
    title: im ? 'طلب متعدد — ' + rq : WS.persons[0].name,
    subtitle: im ? WS.persons.length + ' أشخاص' : (WS.persons[0].sub || '—'),
    requestingDept: rq,
    departmentId: dId,
    branchId: v('visitBranch'),
    buildingId: bid,
    defaultPath: v('pathChecklist') || '—',
    visitDate: v('visitDate'),
    expiryDate: v('visitExpiry'),
    requesterNotes: v('wizRequesterNotes').trim() || '—',
    guardNotes: v('wizGuardNotes').trim() || '—',
    personIds: WS.persons.map(p => p.id),
    perPerson: WS.perPerson || {},
    devices: dev,
    attachments: WS.attachments || [],
    isRenewal: !!WS.renewFrom,
    originalPermitNumber: WS.renewFrom
  };

  try{
    const resp = await fetch('/api/permits/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqDto)
    });

    let res;
    try { res = await resp.json(); } catch(_){ res = null; }

    if(res && typeof res.success !== 'undefined'){
      if(res.success){ reqDto.id = res.data; }
      else { console.warn('submitPermit:', res.message); reqDto.id = 'req' + (++_rc); }
    } else {
      reqDto.id = 'req' + (++_rc);
    }
  }catch(err){
    console.warn('API error submitPermit, saving locally:', err);
    reqDto.id = 'req' + (++_rc);
  }


  PQ.push({
    ...reqDto,
    submitter: CU.name,
    submitterId: CU.id,
    persons: WS.persons.map(p => ({ id: p.id, name: p.name, sub: p.sub || '' })),
    status: 'pending',
    buildingName: bd ? bd.name : '—',
    entity: rq,
    path: reqDto.defaultPath
  });

  xau('add', 'طلب تصريح', reqDto.title);
  newReq();
  rpq();
  toast('✅ تم إرسال الطلب للاعتماد بنجاح');
  setTimeout(() => goto('my-requests', null), 500);
}

/* ═══════ VEHICLE & EXIT ═══════ */
async function submitVehicle(){
  const v = id => document.getElementById(id).value.trim();
  const mk = v('vehicleMakeSelect');
  const md = v('vehicleModelSelect');
  const yr = v('vehicleYearSelect');
  const cl = v('vehicleColorInput');
  const nm = v('vehiclePlateNums');
  const lt = v('vehiclePlateLetters');
  const f = v('vehicleFrom');
  const t = v('vehicleTo');
  const br = v('vehicleBranch');
  const bid = v('vehicleBuilding');
  const pt = v('vehiclePathSelect');

  const drv = PE.find(p => p.id === document.getElementById('vehicleDriverSelect').value);
  if(!drv){ toast('⚠️ اختر السائق'); return; }
  if(!/^\d{1,4}$/.test(nm) || !lt){ toast('⚠️ تحقق من صحة اللوحة (أرقام وحروف)'); return; }
  if(!f || !t || t < f || t < TD()){ toast('⚠️ تحقق من التواريخ'); return; }

  const bd = gB(bid);
  const rdp = gD(CU.departmentId);

  const dto = {
    mode: 'vehicle',
    title: mk + ' ' + md + ' — ' + cl,
    subtitle: 'لوحة ' + nm + ' ' + lt,
    vehicleMake: mk,
    vehicleModel: md,
    vehicleYear: yr,
    vehicleColor: cl,
    plateNums: nm,
    plateLetters: lt,
    driverId: drv.id,
    driverName: drv.name,
    requestingDept: rdp ? rdp.name : '—',
    departmentId: CU.departmentId,
    branchId: br,
    buildingId: bid,
    defaultPath: pt,
    visitDate: f,
    expiryDate: t,
    requesterNotes: 'موديل ' + yr,
    guardNotes: '—'
  };

  try{
    await fetch('/api/permits/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
  }catch(e){}

  PQ.push({
    id: 'req' + (++_rc),
    ...dto,
    path: pt,
    submitter: CU.name,
    submitterId: CU.id,
    status: 'pending',
    persons: [],
    devices: [],
    buildingName: bd ? bd.name : '—'
  });

  xau('add', 'طلب تصريح مركبة', mk + ' ' + md);
  rpq();
  toast('✅ تم إرسال طلب تصريح المركبة');
}

function openExit(){
  EPI = null;
  EII = [];
  document.getElementById('exitPersonSearch').value = '';
  document.getElementById('exitPersonResults').style.display = 'none';
  document.getElementById('exitPersonCheck').innerHTML = '';
  document.getElementById('exitDate').value = TD();
  document.getElementById('exitItemsTbody').innerHTML = '';
  document.getElementById('exitNotes').value = '';
  document.getElementById('exitImagesList').innerHTML = '';
  refreshPB();
  addExitItem();
  goto('exit-permit', null);
}

function searchPersonForExit(q){
  const b = document.getElementById('exitPersonResults');
  if(!q || !q.trim()){ b.style.display = 'none'; return; }
  let pool = PE.filter(p => p.branch === CB);
  if(CU.role === 'requester') pool = pool.filter(p => p.addedBy === CU.id);
  const m = pool.filter(p => p.name.includes(q.trim()) || p.sub.includes(q.trim()) || (p.idNo || '').includes(q.trim()));
  if(!m.length){
    b.innerHTML = '<div style="padding:12px;text-align:center;color:var(--g400)">لا توجد نتائج</div>';
    b.style.display = 'block';
    return;
  }
  b.innerHTML = m.map(p => {
    const ph = PH[p.id]?.personal?.data;
    const av = ph ? `<img src="${ph}">` : '🧑';
    return `<div class="search-result-item" onclick="spEx('${p.id}')">
      <div class="ur-avatar">${av}</div>
      <div class="sr-info"><div class="sr-name">${xesc(p.name)}</div><div class="sr-sub">${xesc(p.sub)}</div></div>
    </div>`;
  }).join('');
  b.style.display = 'block';
}

function spEx(id){
  const p = PE.find(x => x.id === id);
  if(!p) return;
  EPI = id;
  document.getElementById('exitPersonSearch').value = p.name;
  document.getElementById('exitPersonResults').style.display = 'none';
  revalidateExit();
}

function perAct(id, d){
  let best = null;
  for(const [no, p] of Object.entries(EX)){
    if(p.mode !== 'single') continue;
    if(p.personIds && p.personIds.includes(id) && p.status !== 'suspended' && p.visitDate <= d && d <= (p.expiry || p.expiryDate)){
      if(!best || (p.expiry || p.expiryDate) > (best.p.expiry || best.p.expiryDate)) best = { no, p };
    }
  }
  return best ? { ok: true, pn: best.no, p: best.p } : { ok: false };
}

function revalidateExit(){
  const b = document.getElementById('exitPersonCheck');
  if(!EPI){ b.innerHTML = ''; return; }
  const p = PE.find(x => x.id === EPI);
  const d = document.getElementById('exitDate').value;
  const c = perAct(EPI, d);
  if(c.ok){
    b.innerHTML = `
      <div class="alert-banner success">
        <div class="alert-ico">✔</div>
        <div>
          <div class="alert-text-title">${xesc(p.name)} لديه تصريح دخول ساري (${c.pn})</div>
          <div class="alert-text-sub">${c.p.visitDate} ← ${c.p.expiry || c.p.expiryDate}</div>
        </div>
      </div>`;
  } else {
    b.innerHTML = `
      <div class="alert-banner warn">
        <div class="alert-ico">⛔</div>
        <div><div class="alert-text-title">لا يوجد تصريح دخول ساري المفعول لهذا اليوم</div></div>
      </div>`;
  }
}

function addExitItem(){
  const t = document.getElementById('exitItemsTbody');
  const tr = document.createElement('tr');
  const c = LK.exitItemCategories.map(x => `<option>${x}</option>`).join('');
  tr.innerHTML = `<td><select class="eiCat" onchange="onEiCat(this)" data-no-search="1">${c}</select></td><td><select class="eiType" data-no-search="1"></select></td><td><input type="number" class="eiQty" value="1" min="1" style="width:70px"></td><td><input type="text" class="eiDetail" placeholder="الرقم التسلسلي أو الوصف"></td><td><button class="btn bred bxs" onclick="this.closest('tr').remove()">✕</button></td>`;
  t.appendChild(tr);
  onEiCat(tr.querySelector('.eiCat'));
}

function onEiCat(s){
  const tr = s.closest('tr');
  const ts = tr.querySelector('.eiType');
  const c = s.value;
  ts.innerHTML = (LK.exitItemTypes[c] || ['أخرى']).map(x => `<option>${x}</option>`).join('');
}

function handleExitImages(files){
  if(!files || !files.length) return;
  Array.from(files).forEach(f => {
    if(f.size > 5 * 1024 * 1024){ toast('⚠️ حجم الصورة كبير'); return; }
    const r = new FileReader();
    r.onload = e => {
      EII.push({ name: f.name, size: f.size, type: f.type, data: e.target.result });
      rEI();
    };
    r.readAsDataURL(f);
  });
}

function rEI(){
  const l = document.getElementById('exitImagesList');
  if(!l) return;
  l.innerHTML = EII.map((a, i) => `
    <div class="attach-item">
      <div class="attach-icon"><img src="${a.data}"></div>
      <div class="attach-info"><div class="attach-name">${xesc(a.name)}</div><div class="attach-size">${fmtSize(a.size)}</div></div>
      <div class="attach-actions"><button class="btn bred bxs" onclick="rEI2(${i})">حذف</button></div>
    </div>`).join('');
}

function rEI2(i){
  EII.splice(i, 1);
  rEI();
}

async function submitExit(){
  if(!EPI){ toast('⚠️ اختر الشخص'); return; }
  const p = PE.find(x => x.id === EPI);
  const d = document.getElementById('exitDate').value;
  if(!d){ toast('⚠️ حدد تاريخ الخروج'); return; }
  const c = perAct(EPI, d);
  if(!c.ok){ toast('⛔ لا يوجد تصريح دخول ساري لهذا الشخص اليوم'); return; }

  const rows = [...document.querySelectorAll('#exitItemsTbody tr')];
  const items = rows.map(tr => ({
    category: tr.querySelector('.eiCat').value,
    type: tr.querySelector('.eiType').value,
    qty: tr.querySelector('.eiQty').value || '1',
    detail: tr.querySelector('.eiDetail').value.trim()
  })).filter(i => i.detail || i.type);

  if(!items.length){ toast('⚠️ أدخل أصول الخروج المصرح بها'); return; }

  const rd = gD(CU.departmentId);
  const br = document.getElementById('exitBranch').value;
  const bid = document.getElementById('exitBuilding').value;
  const bd = gB(bid);

  const dto = {
    mode: 'exit',
    title: p.name,
    subtitle: items.length + ' أصل مصرح',
    requestingDept: 'تصريح خروج',
    departmentId: CU.departmentId,
    branchId: br,
    buildingId: bid,
    defaultPath: '—',
    visitDate: d,
    expiryDate: d,
    personIds: [p.id],
    exitItems: items,
    attachments: EII,
    relatedEntryPermitNo: c.pn,
    requesterNotes: document.getElementById('exitNotes').value.trim() || '—',
    guardNotes: '—'
  };

  try{
    await fetch('/api/permits/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
  }catch(e){}

  PQ.push({
    id: 'req' + (++_rc),
    ...dto,
    submitter: CU.name,
    submitterId: CU.id,
    persons: [{ id: p.id, name: p.name, sub: p.sub }],
    status: 'pending',
    buildingName: bd ? bd.name : '—'
  });

  xau('add', 'طلب خروج', p.name);
  rpq();
  toast('✅ تم إرسال طلب تصريح الخروج للاعتماد');
  goto('dashboard', null);
}

/* ═══════ QUERY LOG ═══════ */
function rql(){
  const t = document.getElementById('queryLogTbody');
  if(!t) return;
  const q = (document.getElementById('queryLogSearch')?.value || '').trim().toLowerCase();
  let r = QL.filter(x => {
    if(qlf !== 'all' && x.rt !== qlf) return false;
    if(q && !smatch([x.val, x.name, x.nat, x.gate, x.rl, x.time], q)) return false;
    return true;
  });
  const bm = { active: 'bact', expired: 'bexp', blacklist: 'bexp', notfound: 'bgry', exit: 'bbl', 'exit-expired': 'bor2' };
  const render = rows => {
    document.getElementById('queryLogEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map(x => `
      <tr>
        <td>${xesc(x.time)}</td>
        <td><b>${xesc(x.val)}</b></td>
        <td>${xesc(x.name)}</td>
        <td>🌍 ${xesc(x.nat || '—')}</td>
        <td>🚪 ${xesc(x.gate || '—')}</td>
        <td><span class="badge ${bm[x.rt] || 'bgry'}">${xesc(x.rl)}</span></td>
      </tr>`).join('');
  };
  setPagerData('queryLog', r, render);
}

function setQueryLogFilter(f, el){
  qlf = f;
  document.querySelectorAll('#queryLogTags .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  rql();
}

function logQ(val, name, rt, rl, nat){
  const gs = document.getElementById('gateSelectAtQuery');
  const gn = gs && gs.value ? gs.value : '—';
  QL.unshift({
    time: new Date().toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
    val,
    name: name || '—',
    rt,
    rl,
    officer: CU ? CU.name : '—',
    nat: nat || '—',
    gate: gn,
    branch: BN[CB]
  });
  if(QL.length > 300) QL.pop();
}

/* ═══════ DASHBOARD ═══════ */
const BC=['green','gold','blue','red','purple','teal'];

function getVP(){
  let a = Object.entries(EX).map(([no, p]) => ({ no, ...p }));
  if(!CU) return a;
  if(CB) a = a.filter(p => !p.branch || p.branch === CB);
  if(CU.role === 'admin') return a;
  if(CU.role === 'approver'){
    if(CU.branches && CU.branches.length) a = a.filter(p => CU.branches.includes(p.branch));
    if(CU.buildings && CU.buildings.length) a = a.filter(p => !p.buildingId || CU.buildings.includes(p.buildingId));
  } else if(CU.role === 'requester'){
    if(CU.branches && CU.branches.length) a = a.filter(p => CU.branches.includes(p.branch));
    a = a.filter(p => !p.submitterId || p.submitterId === CU.id);
  } else if(CU.role === 'guard'){
    if(CU.branches && CU.branches.length) a = a.filter(p => CU.branches.includes(p.branch));
  }
  return a;
}

function getVPQ(){
  let r = [...PQ];
  if(!CU) return r;
  if(CB) r = r.filter(x => !x.branch || x.branch === CB);
  if(CU.role === 'admin') return r;
  if(CU.role === 'approver'){
    if(CU.branches && CU.branches.length) r = r.filter(x => !x.branch || CU.branches.includes(x.branch));
    if(CU.buildings && CU.buildings.length) r = r.filter(x => !x.buildingId || CU.buildings.includes(x.buildingId));
  } else if(CU.role === 'requester'){
    r = r.filter(x => !x.submitterId || x.submitterId === CU.id);
  } else if(CU.role === 'guard'){
    return [];
  }
  return r;
}

function getMP(){
  let a = Object.entries(EX).map(([no, p]) => ({ no, ...p }));
  if(!CU) return a;
  if(CB) a = a.filter(p => !p.branch || p.branch === CB);
  if(CU.role === 'requester') a = a.filter(p => !p.submitterId || p.submitterId === CU.id);
  if(CU.branches && CU.branches.length) a = a.filter(p => CU.branches.includes(p.branch));
  return a;
}

function rd(){
  if(!CU) return;
  const all = getVP();
  const ac = all.filter(p => getPS(p) === 'active' && p.status !== 'suspended');
  const ex = all.filter(p => getPS(p) === 'expired');
  const pc = getVPQ().length;

  const branchQL = QL.filter(q => !CB || q.branch === BN[CB] || q.branch === CB);

  document.getElementById('dashKpis').innerHTML = `
    <div class="stat-box"><div class="stat-ico">🪪</div><div class="stat-val" style="color:var(--gm)">${ac.length}</div><div class="stat-lbl">تصاريح نشطة</div></div>
    <div class="stat-box"><div class="stat-ico">📋</div><div class="stat-val" style="color:var(--or)">${pc}</div><div class="stat-lbl">بانتظار الاعتماد</div></div>
    <div class="stat-box"><div class="stat-ico">⏱️</div><div class="stat-val" style="color:var(--red)">${ex.length}</div><div class="stat-lbl">تصاريح منتهية</div></div>
    <div class="stat-box"><div class="stat-ico">🔍</div><div class="stat-val" style="color:var(--blue)">${branchQL.length}</div><div class="stat-lbl">استعلامات أمنية</div></div>`;

  const branchBuildings = BL.filter(b => !CB || b.branchId === CB);
  const branchGates = (CB ? (GP[CB] || []) : Object.values(GP).flat());
  const branchPaths = PD.filter(p => !CB || (p.branchId || p.branch) === CB);

  const branchDeps = DP.filter(d => !CB || d.branchId === CB);

  document.getElementById('dashBranchesCount').textContent = BR.length;
  document.getElementById('dashBuildingsCount').textContent = branchBuildings.length;
  document.getElementById('dashGatesCount').textContent = branchGates.length;
  document.getElementById('dashPathsCount').textContent = branchPaths.length;
  document.getElementById('dashDepsCount').textContent = branchDeps.length;

  const stT = ac.length + ex.length + pc || 1;
  document.getElementById('dashStatusChart').innerHTML = `
    <div class="bar-row"><div class="bar-label">✅ نشطة</div><div class="bar-track"><div class="bar-fill green" style="width:${Math.round(ac.length / stT * 100)}%">${ac.length}</div></div><div class="bar-val">${ac.length}</div></div>
    <div class="bar-row"><div class="bar-label">📋 بانتظار</div><div class="bar-track"><div class="bar-fill gold" style="width:${Math.round(pc / stT * 100)}%">${pc}</div></div><div class="bar-val">${pc}</div></div>
    <div class="bar-row"><div class="bar-label">⏱ منتهية</div><div class="bar-track"><div class="bar-fill red" style="width:${Math.round(ex.length / stT * 100)}%">${ex.length}</div></div><div class="bar-val">${ex.length}</div></div>`;

  const byB = {};
  BR.forEach(b => { byB[b.id] = { name: b.name, count: 0 }; });
  all.forEach(p => { if(byB[p.branch]) byB[p.branch].count++; });
  getVPQ().forEach(r => { if(byB[r.branch]) byB[r.branch].count++; });
  const bE = Object.values(byB).filter(x => x.count > 0).sort((a, b) => b.count - a.count);
  const mB = Math.max(...bE.map(x => x.count), 1);
  document.getElementById('dashBranchChart').innerHTML = bE.length ? bE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏢 ${xesc(x.name)}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x.count / mB * 100)}%">${x.count}</div></div>
      <div class="bar-val">${x.count}</div>
    </div>`).join('') : '<div class="hint">لا توجد بيانات</div>';

  const byBl = {};
  all.forEach(p => { const n = p.buildingName || '—'; byBl[n] = (byBl[n] || 0) + 1; });
  const blE = Object.entries(byBl).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const mBl = Math.max(...blE.map(x => x[1]), 1);
  document.getElementById('dashBuildingChart').innerHTML = blE.length ? blE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏬 ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mBl * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا توجد بيانات</div>';

  const byD = {};
  all.forEach(p => {
    const d = gD(p.departmentId);
    const n = d ? d.name : (p.requestingDept || '—');
    byD[n] = (byD[n] || 0) + 1;
  });
  const dE = Object.entries(byD).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const mD = Math.max(...dE.map(x => x[1]), 1);
  document.getElementById('dashDeptChart').innerHTML = dE.length ? dE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏛️ ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mD * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا توجد بيانات</div>';

  const pl = getVPQ();
  document.getElementById('dashPendingCount').textContent = pl.length;
  document.getElementById('dashPendingEmpty').style.display = pl.length ? 'none' : 'block';
  document.getElementById('dashPendingTable').innerHTML = pl.slice(0, 5).map(r => {
    const tl = r.mode === 'vehicle' ? '🚗' : r.mode === 'exit' ? '🚪' : r.mode === 'multi' ? '👥' : '🧑';
    return `<tr>
      <td><b>${xesc(r.title)}</b></td>
      <td><span class="badge bgry">${tl}</span></td>
      <td>🏢 ${xesc(BN[r.branch] || '—')}<div style="font-size:10px;color:var(--g400)">🏬 ${xesc(r.buildingName || '—')}</div></td>
    </tr>`;
  }).join('');

  document.getElementById('dashGreeting').textContent = '👋 مرحباً، ' + CU.name.split(' ')[0];
  const bn = BN[CB] || '';
  const dn = CU.departmentId ? (gD(CU.departmentId)?.name || '') : '';
  document.getElementById('dashSub').textContent = (ROLES.find(r => r.id === CU.role) || { n: CU.role }).n + (dn ? ' — ' + dn : '') + (bn ? ' — ' + bn : '');
}

function pgq(){
  const sel = document.getElementById('gateSelectAtQuery');
  if(!sel) return;
  let g = GP[CB] || [];
  if(CU && CU.role === 'guard'){
    const al = (CU.gates || []).filter(x => x.startsWith(CB + '::')).map(x => x.split('::')[1]);
    g = g.filter(x => al.includes(x.name));
  }
  sel.innerHTML = g.length ? g.map(x => {
    const b = gB(x.buildingId);
    return `<option value="${xesc(x.name)}">${xesc(x.name)}${b ? ' — ' + xesc(b.name) : ''}</option>`;
  }).join('') : '<option value="">لا توجد بوابات</option>';
}

/* ═══════ PERMITS LOG & MY REQUESTS ═══════ */
function setPermitsLogFilter(f, el){
  pf = f;
  document.querySelectorAll('#permitsLogTags .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  rpl();
}

function refreshPLB(){
  const bs = document.getElementById('permitsLogBranch');
  if(!bs) return;
  const c = bs.value || 'all';
  bs.innerHTML = '<option value="all">🏢 كل الفروع</option>' + BR.map(b => `<option value="${b.id}">🏢 ${xesc(b.name)}</option>`).join('');
  bs.value = c;
  const bls = document.getElementById('permitsLogBuilding');
  if(!bls) return;
  const cb = bls.value || 'all';
  bls.innerHTML = '<option value="all">🏬 كل المباني</option>' + BL.map(b => `<option value="${b.id}">🏬 ${xesc(b.name)}</option>`).join('');
  bls.value = cb;
}

function rpl(){
  const t = document.getElementById('permitsLogTbody');
  if(!t) return;
  refreshPLB();
  const q = (document.getElementById('permitsLogSearch')?.value || '').trim().toLowerCase();
  const tf = document.getElementById('permitsLogType')?.value || 'all';
  const bf = document.getElementById('permitsLogBranch')?.value || 'all';
  const bdf = document.getElementById('permitsLogBuilding')?.value || 'all';

  let r = getVP();
  if(tf !== 'all') r = r.filter(p => p.mode === tf);
  if(bf !== 'all') r = r.filter(p => p.branch === bf);
  if(bdf !== 'all') r = r.filter(p => p.buildingId === bdf);
  if(pf !== 'all') r = r.filter(p => getPS(p) === pf);
  if(q) r = r.filter(p => smatch(PSF(p), q));

  const render = rows => {
    document.getElementById('permitsLogEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map(p => {
      const st = getPS(p);
      const sL = st === 'active' ? '✅ نشط' : st === 'expired' ? '⏱ منتهي' : '⏸️ موقوف';
      const sC = st === 'active' ? 'bact' : st === 'expired' ? 'bexp' : 'bsusp';
      const tl = p.mode === 'vehicle' ? '🚗 مركبة' : p.mode === 'exit' ? '🚪 خروج' : '🧑 فرد';
      const tC = p.mode === 'vehicle' ? 'bbl' : p.mode === 'exit' ? 'bpurple' : 'bgry';
      return `<tr>
        <td><b>${xesc(p.no || p.permitNumber)}</b></td>
        <td>${xesc(p.title)}</td>
        <td><span class="badge ${tC}">${tl}</span></td>
        <td>🏢 ${xesc(p.branchName || '—')}</td>
        <td>🏬 ${xesc(p.buildingName || '—')}</td>
        <td>🛣️ ${xesc(p.pathName || '—')}</td>
        <td>${xesc(p.expiry || p.expiryDate)}</td>
        <td><span class="badge ${sC}">${sL}</span></td>
        <td><button class="btn bg2 bxs" onclick="vp('${p.no || p.permitNumber}')">عرض</button></td>
      </tr>`;
    }).join('');
  };
  setPagerData('permitsLog', r, render);
}

function setMyReqType(t, el){
  myRt = t;
  document.querySelectorAll('#myReqTypeTags .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  rmr();
}

function setMyReqStatus(s, el){
  myRs = s;
  document.querySelectorAll('#myReqStatusTags .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  rmr();
}

function permitKindBadge(isGroup, mode){
  if(mode === 'vehicle') return '<span style="color:var(--g400)">—</span>';
  return isGroup ? '<span class="badge bbl">👥 مجموعة</span>' : '<span class="badge bgry">🧑 فرد</span>';
}

function rmr(){
  const t = document.getElementById('myRequestsTbody');
  if(!t) return;
  const q = (document.getElementById('myReqSearch')?.value || '').trim().toLowerCase();
  let r = getMP();

  if(myRt !== 'all') r = r.filter(p => p.mode === myRt);
  if(myRs === 'active') r = r.filter(p => getPS(p) === 'active');
  if(myRs === 'expired') r = r.filter(p => getPS(p) === 'expired');
  if(myRs === 'suspended') r = r.filter(p => getPS(p) === 'suspended');
  if(q) r = r.filter(p => smatch(PSF(p), q));

  const pend = getVPQ().filter(x => {
    if(q && !smatch([x.title, x.sub, x.entity, x.departmentName, x.path, x.buildingName, x.visitDate, x.expiry, x.id], q)) return false;
    if(myRt === 'single') return x.mode === 'single' || x.mode === 'multi';
    if(myRt === 'exit') return x.mode === 'exit';
    if(myRt === 'vehicle') return x.mode === 'vehicle';
    return true;
  });

  let allRows = [];
  if(myRs === 'all' || myRs === 'pending') allRows = allRows.concat(pend.map(x => ({ type: 'pending', data: x })));
  if(myRs === 'all' || myRs !== 'pending') allRows = allRows.concat(r.map(p => ({ type: 'permit', data: p })));

  const render = rows => {
    document.getElementById('myRequestsEmpty').style.display = allRows.length ? 'none' : 'block';
    t.innerHTML = rows.map(item => {
      if(item.type === 'pending'){
        const x = item.data;
        const canEdit = x.mode === 'multi' || x.mode === 'single';
        return `<tr style="background:rgba(254,249,195,.3)">
          <td><i>قيد المراجعة</i></td>
          <td>${xesc(x.title)}</td>
          <td>${permitKindBadge(x.mode === 'multi', x.mode)}</td>
          <td>🏢 ${xesc(BN[x.branch] || '—')}</td>
          <td>🏬 ${xesc(x.buildingName || '—')}</td>
          <td>${xesc(x.path)}</td>
          <td>${xesc(x.visitDate)}</td>
          <td>${xesc(x.expiry)}</td>
          <td><span class="badge bpnd">🆕 قيد المراجعة</span></td>
          <td style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn bg2 bxs" onclick="vpr('${x.id}')">عرض</button>
            ${canEdit ? `<button class="btn bgold bxs" onclick="cloneForEdit('${x.id}')">تعديل</button>` : ''}
          </td>
        </tr>`;
      }
      const p = item.data;
      const st = getPS(p);
      const sL = st === 'active' ? '✅ نشط' : st === 'expired' ? '⏱ منتهي' : '⏸️ موقوف';
      const sC = st === 'active' ? 'bact' : st === 'expired' ? 'bexp' : 'bsusp';
      const cr = st === 'active' || st === 'expired';
      const cs = st === 'active';
      const cr2 = st === 'suspended';
      const pn = p.no || p.permitNumber;

      return `<tr>
        <td><b>${xesc(pn)}</b>${p.groupRef ? `<div style="font-size:10px;color:var(--g400)">ضمن ${xesc(p.groupRef)}</div>` : ''}</td>
        <td>${xesc(p.title)}</td>
        <td>${permitKindBadge(!!p.groupRef, p.mode)}</td>
        <td>🏢 ${xesc(p.branchName || '—')}</td>
        <td>🏬 ${xesc(p.buildingName || '—')}</td>
        <td>🛣️ ${xesc(p.pathName || '—')}</td>
        <td>${xesc(p.visitDate)}</td>
        <td>${xesc(p.expiry || p.expiryDate)}</td>
        <td><span class="badge ${sC}">${sL}</span></td>
        <td style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn bg2 bxs" onclick="vp('${pn}')">عرض</button>
          ${cr ? `<button class="btn bgold bxs" onclick="renewPermit('${pn}')">🔄 تمديد</button>` : ''}
          ${cs ? `<button class="btn bred bxs" onclick="qs('${pn}')">تعطيل</button>` : ''}
          ${cr2 ? `<button class="btn bgreen bxs" onclick="qrs('${pn}')">تفعيل</button>` : ''}
        </td>
      </tr>`;
    }).join('');
  };
  setPagerData('myReq', allRows, render);
}

function cloneForEdit(reqId){
  const r = PQ.find(x => x.id === reqId);
  if(!r) return;
  if(r.mode !== 'multi' && r.mode !== 'single'){ toast('⚠️ التعديل متاح للتصاريح الفردية والمتعددة فقط'); return; }

  WS = {
    step: 1,
    mode: r.mode,
    persons: (r.persons || []).map(p => PE.find(x => x.id === p.id) || { id: p.id, name: p.name, sub: p.sub || '' }).filter(Boolean),
    perPerson: JSON.parse(JSON.stringify(r.perPerson || {})),
    attachments: JSON.parse(JSON.stringify(r.attachments || [])),
    renewFrom: null,
    editFrom: r.id
  };

  document.getElementById('modeCard-single').classList.toggle('selected', r.mode === 'single');
  document.getElementById('modeCard-multi').classList.toggle('selected', r.mode === 'multi');
  document.getElementById('newReqTitle').textContent = '✏️ تعديل الطلب — ' + r.title;
  document.getElementById('visitBranch').value = r.branch || CB;
  renderBuildingSelect();
  document.getElementById('visitBuilding').value = r.buildingId || '';
  rpc2();
  document.getElementById('pathChecklist').value = r.path || '';
  document.getElementById('visitDate').value = r.visitDate || TD();
  document.getElementById('visitExpiry').value = r.expiry || TD();

  const devSet = r.devices || [];
  document.querySelectorAll('#wizDeviceChecklist input').forEach(c => c.checked = devSet.includes(c.value));

  document.getElementById('wizRequesterNotes').value = r.notes && r.notes !== '—' ? r.notes : '';
  document.getElementById('wizGuardNotes').value = r.guardNotes && r.guardNotes !== '—' ? r.guardNotes : '';

  rwa2();
  rpc();
  rpc2();
  goto('new-request', null);
  toast('✏️ تم فتح بيانات الطلب للتعديل');
}

async function qs(pn){
  const d = EX[pn];
  if(!d) return;
  const r = prompt('يرجى كتابة سبب التعطيل:', '');
  if(r === null) return;
  if(!r.trim()){ toast('⚠️ اكتب السبب'); return; }

  try{
    await fetch(`/api/permits/issued/${pn}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: r.trim() })
    });
  }catch(e){}

  d.status = 'suspended';
  d.suspendReason = r.trim();
  xau('edit', 'تعطيل تصريح', pn);
  toast('⏸️ تم تعطيل التصريح');
  rmr();
  rpl();
}

async function qrs(pn){
  const d = EX[pn];
  if(!d) return;
  if(!confirm('هل تود إعادة تفعيل هذا التصريح؟')) return;

  try{
    await fetch(`/api/permits/issued/${pn}/resume`, { method: 'POST' });
  }catch(e){}

  d.status = 'active';
  d.suspendReason = null;
  xau('edit', 'تفعيل تصريح', pn);
  toast('▶️ تم إعادة تفعيل التصريح');
  rmr();
  rpl();
}

/* ═══════ APPROVALS ═══════ */
function rpq(){
  const t = document.getElementById('approvalsBody');
  if(!t) return;
  const rs = getVPQ();
  document.getElementById('tnavApprovalCount').textContent = rs.length;
  document.getElementById('sbApprCount').textContent = rs.length;

  const render = rows => {
    document.getElementById('approvalsEmpty').style.display = rs.length ? 'none' : 'block';
    t.innerHTML = rows.map(r => {
      const tl = r.mode === 'vehicle' ? '🚗 مركبة' : r.mode === 'exit' ? '🚪 خروج' : r.mode === 'multi' ? '👥 متعدد' : '🧑 فرد';
      const tC = r.mode === 'vehicle' ? 'bbl' : r.mode === 'exit' ? 'bpurple' : 'bgry';
      const nb = (r.notes && r.notes !== '—') ? '<span class="badge bor2" style="font-size:10px">📝</span>' : '';
      return `<tr>
        <td><b>${xesc(r.title)}</b> ${nb}</td>
        <td><span class="badge ${tC}">${tl}</span></td>
        <td>${xesc(r.departmentName || r.entity || '—')}</td>
        <td>🏢 ${xesc(BN[r.branch] || '—')}</td>
        <td>🏬 ${xesc(r.buildingName || '—')}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="btn bg2 bxs" onclick="va('${r.id}')">تفاصيل</button>
          <button class="btn bp bxs" onclick="oaa('${r.id}','approve')">اعتماد</button>
          <button class="btn bred bxs" onclick="oaa('${r.id}','reject')">رفض</button>
        </td>
      </tr>`;
    }).join('');
  };
  setPagerData('approvals', rs, render);
}

function va(id){
  if(typeof window.va === 'function') window.va(id);
}

function vpr(id){
  if(typeof window.vpr === 'function') window.vpr(id);
}

function oaa(id, a){
  _ari = id;
  _ara = a;
  const r = PQ.find(x => x.id === id);
  if(!r) return;
  const m = {
    approve: { t: '✅ اعتماد التصريح', i: '✔', s: 'اعتماد الطلب: ' + r.title, b: 'btn bp', bt: '✅ تأكيد الاعتماد', rq: false, c: 'info' },
    reject: { t: '❌ رفض الطلب', i: '✕', s: 'رفض الطلب: ' + r.title, b: 'btn bred', bt: '❌ تأكيد الرفض', rq: true, c: 'warn' }
  }[a];

  document.getElementById('apaTitle').textContent = m.t;
  document.getElementById('apaIco').textContent = m.i;
  document.getElementById('apaSub').textContent = m.s;
  document.getElementById('apaNoteLabel').textContent = 'ملاحظة ' + (m.rq ? '(مطلوبة للرفض)' : '(اختيارية)');
  document.getElementById('apaBanner').className = 'alert-banner ' + m.c;
  document.getElementById('apaNote').value = '';
  const cb = document.getElementById('apaConfirmBtn');
  cb.className = m.b;
  cb.textContent = m.bt;
  openModal('modalApprovalAction');
}

/* ═══════ VIEW PERMIT ═══════ */
function vp(pn){
  const d = EX[pn];
  if(!d){ toast('⚠️ التصريح غير موجود'); return; }
  document.getElementById('viewPermitTitleTop').textContent = pn;
  const st = getPS(d), ia = st === 'active';
  const tc = d.mode === 'vehicle' ? 'تصريح مركبة' : d.mode === 'exit' ? 'تصريح خروج' : 'تصريح دخول';

  let nh = (d.notes && d.notes !== '—') ? `<div class="notes-box"><div class="notes-box-title">📝 ملاحظات مقدم الطلب</div><div class="notes-box-content">${xesc(d.notes)}</div></div>` : '';
  let gh = (d.guardNotes && d.guardNotes !== '—') ? `<div class="notes-box blue"><div class="notes-box-title">🛡️ لموظف الاستعلام</div><div class="notes-box-content">${xesc(d.guardNotes)}</div></div>` : '';

  let eh = '';
  if(d.mode === 'exit' && d.exitItems && d.exitItems.length){
    eh = `<div class="sdv">📦 الأصول المصرح بخروجها</div>
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>التصنيف</th><th>النوع</th><th>العدد</th></tr></thead>
        <tbody>${d.exitItems.map(i => `<tr><td>${xesc(i.category)}</td><td>${xesc(i.type || i.itemType || '—')}</td><td>${i.qty || i.quantity}</td></tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  let dv = (d.devices && d.devices.length) ? `<div class="sdv">📱 الأجهزة المصرحة</div><div class="check-grid">${d.devices.map(x => `<div class="check-item" style="cursor:default">${xesc(x)}</div>`).join('')}</div>` : '';

  const cn = d.cardNumber || gcn('perByPermit-' + pn);
  const sp = d.personIds && d.personIds[0];

  let ch = ric({
    sc: ia ? 'active' : 'expired',
    title: tc,
    name: d.title,
    sub: d.sub || d.subtitle,
    rows: [['رقم الهوية', d.idMasked], ['الجهة', d.requestingDept], ['المسار', d.pathName], ['حتى', d.expiry || d.expiryDate]],
    cardNo: cn,
    pn,
    bn: d.branchName,
    spp: d.mode !== 'vehicle',
    pp: sp && PH[sp]?.personal?.data || null
  });

  document.getElementById('modalViewPermitBody').innerHTML = `
    ${ch}${nh}${gh}
    <div class="sdv" style="margin-top:18px">📋 البيانات المسجلة</div>
    <div class="detail-block">
      <div class="detail-row"><span>رقم التصريح</span><b>${xesc(pn)}</b></div>
      <div class="detail-row"><span>الاسم</span><b>${xesc(d.title)}</b></div>
      <div class="detail-row"><span>🏢 الفرع</span><b>${xesc(d.branchName || '—')}</b></div>
      <div class="detail-row"><span>🏬 المبنى</span><b>${xesc(d.buildingName || '—')}</b></div>
      <div class="detail-row"><span>🛣️ المسار</span><b>${xesc(d.pathName || '—')}</b></div>
      <div class="detail-row"><span>📅 من</span><b>${xesc(d.visitDate)}</b></div>
      <div class="detail-row"><span>📅 إلى</span><b>${xesc(d.expiry || d.expiryDate)}</b></div>
    </div>
    ${dv}${eh}
    <div class="bgrp" style="margin-top:18px;border-top:1px solid var(--g100);padding-top:16px">
      <button class="btn bg2" onclick="closeModal('modalViewPermit')">إغلاق</button>
      <button class="btn bgold" onclick="closeModal('modalViewPermit');renewPermit('${pn}')">🔄 تمديد التصريح</button>
    </div>`;

  openModal('modalViewPermit');
}

/* ═══════ GATE VERIFICATION ═══════ */
const RK=['active','exit','wronggate','suspended','upcoming','expired'];
const XST={
  active:['qh-active','✓','🛡️'],
  exit:['qh-exit','🚪','🚪'],
  expired:['qh-expired','!','⏱️'],
  suspended:['qh-expired','⏸','⏸️'],
  upcoming:['qh-expired','🕒','🕒'],
  wronggate:['qh-expired','!','🚧'],
  blacklist:['qh-blacklist','✕','⛔'],
  notfound:['qh-notfound','?','❓'],
  choose:['qh-notfound','👥','👥']
};

const xidle=()=>`<div class="card gidle" style="grid-column:1/-1"><div class="gradar"><i></i><i></i><i></i><span>🛡️</span></div><div class="gidle-t">جاهز للاستعلام</div><div class="hint">${gMode==='vehicle'?'أدخل أرقام اللوحة':'اكتب آخر 4 أرقام من الهوية أو امسح الباركود/QR'}</div></div>`;

function setGateMode(m){
  gMode = m;
  document.getElementById('gmPerson').classList.toggle('active', m === 'person');
  document.getElementById('gmVehicle').classList.toggle('active', m === 'vehicle');
  document.getElementById('gmExit').classList.toggle('active', m === 'exit');
  const l = document.getElementById('gateSearchLabel');
  const h = document.getElementById('gateHint');
  if(m === 'person'){ l.textContent = 'آخر 4 أرقام'; h.innerHTML = '💡 جرّب: 0056 (ساري) أو 0021 (منتهي) أو 0009 (محظور)'; }
  else if(m === 'vehicle'){ l.textContent = 'رقم اللوحة'; h.innerHTML = '💡 جرّب: 1234'; }
  else { l.textContent = 'آخر 4 أرقام'; h.innerHTML = '💡 جرّب: 0056'; }
  document.getElementById('gateResult').innerHTML = xidle();
  _gk = '';
}

function xClear(){
  const i = document.getElementById('gateSearch');
  i.value = '';
  _gk = '';
  document.getElementById('gateResult').innerHTML = xidle();
  i.focus();
}

function xGate(){ return document.getElementById('gateSelectAtQuery').value; }

async function gateLookup(){
  const val = document.getElementById('gateSearch').value.trim();
  if(!val) return;
  const gate = xGate();
  if(!gate){ toast('⚠️ يرجى اختيار البوابة أولاً'); return; }

  const k = gMode + val + gate;
  const now = Date.now();
  if(k === _gk && now - _gt < 2500) return;
  _gk = k;
  _gt = now;

  document.getElementById('gateResult').innerHTML = '<div class="card gscan" style="grid-column:1/-1"><div class="gscan-laser"></div><div class="gscan-ico">🔍</div><div class="gscan-t">جاري التحقق الأمني<span class="dots"></span></div></div>';

  try{
    const res = await fetch('/api/gate/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateName: gate, queryValue: val, mode: gMode, branchId: CB })
    }).then(r => r.json());

    if(res.success && res.data){
      const r = res.data;
      xShow({
        st: r.status,
        title: r.title,
        name: r.name,
        sub: r.subtitle,
        photo: r.photo,
        nat: r.nationality,
        permit: r.permitNumber,
        notes: [r.notes, r.guardNotes],
        devices: r.devices,
        items: r.items,
        facts: r.facts || [],
        choices: r.choices,
        val: val,
        rt: r.resultType,
        rl: r.resultLabel,
        warningMessage: r.warningMessage
      });
      xRecent();
      return;
    }
  }catch(err){
    console.warn('Backend gate query fallback to client evaluator:', err);
  }

  // Fallback to client-side evaluation
  setTimeout(() => {
    const r = gMode === 'vehicle' ? xVeh(val, gate) : xPerson(val, gate, gMode === 'exit');
    if(r.st !== 'choose') logQ(val, r.name, r.rt, r.rl, r.nat);
    xShow(r);
    xRecent();
  }, 600);
}

function xPG(x){
  const p = PD.find(y => y.name === x.pathName && y.branch === x.branch);
  return p ? p.gates : [];
}

function xJudge(x, gate, b){
  const T = TD();
  if(x.status === 'suspended') return { ...b, st: 'suspended', title: '⏸️ تصريح موقوف', sub: x.suspendReason || '', rt: 'expired', rl: '⏸️ موقوف' };
  if(x.visitDate > T) return { ...b, st: 'upcoming', title: '🕒 لم تبدأ الصلاحية', sub: 'يبدأ بتاريخ ' + x.visitDate, rt: 'expired', rl: '🕒' };
  if((x.expiry || x.expiryDate) < T) return { ...b, st: 'expired', title: '⚠️ منتهي الصلاحية', sub: 'انتهى في ' + (x.expiry || x.expiryDate), rt: 'expired', rl: '⏱' };
  if(x.mode !== 'exit' && !xPG(x).includes(gate)) return { ...b, st: 'wronggate', title: '⚠️ بوابة غير مسموحة', sub: 'المسار المصرح به لا يشمل ' + gate, rt: 'expired', rl: '🚧' };
  const ex = x.mode === 'exit';
  return { ...b, st: ex ? 'exit' : 'active', title: ex ? '✅ خروج مصرح' : '✅ تصريح ساري المفعول', rt: ex ? 'exit' : 'active', rl: ex ? '🚪' : '✔' };
}

const xNF=(t,n,s,w,v)=>({st:'notfound',title:t,name:n,sub:s,facts:[],rt:'notfound',rl:'❓',val:v});

function xPeople(v){ return PE.filter(p => p.branch === CB && p.idNo && p.idNo.endsWith(v)); }

function xPerson(v, gate, exit){
  const bl = BLD.find(b => b.branch === CB && b.idNo && b.idNo.endsWith(v));
  if(bl) return { st: 'blacklist', title: '⛔ ممنوع من الدخول', name: bl.name, sub: bl.reason, facts: [['الهوية', xmask(bl.idNo)], ['الجنسية', '🌍 ' + (bl.nat || '—')]], rt: 'blacklist', rl: '⛔', nat: bl.nat, val: v };

  const ps = xPeople(v);
  if(!ps.length) return xNF('لا يوجد شخص مسجل', '—', 'تحقق من الأرقام المدخلة', 0, v);
  if(ps.length > 1) return { st: 'choose', title: 'أكثر من تطابق', name: ps.length + ' أشخاص', sub: 'يرجى الاختيار', choices: ps, val: v };

  const p = ps[0];
  if((BNB[CB] || []).includes(p.nat)) return { st: 'blacklist', title: '⛔ جنسية محظورة', name: p.name, sub: p.nat, facts: [['الهوية', p.sub], ['الجنسية', '🌍 ' + p.nat]], rt: 'blacklist', rl: '⛔', nat: p.nat, val: v };

  const all = Object.entries(EX).filter(([n, x]) => x.mode === (exit ? 'exit' : 'single') && x.personIds && x.personIds.includes(p.id)).map(([n, x]) => ({ n, ...x }));
  if(!all.length) return { ...xNF('لا يوجد تصريح نشط', p.name, '—', 0, v), photo: PH[p.id]?.personal?.data, nat: p.nat, facts: [['الهوية', p.sub], ['الجنسية', '🌍 ' + p.nat]] };

  const js = all.map(x => xJudge(x, gate, {
    name: p.name,
    sub: p.entity,
    photo: PH[p.id]?.personal?.data,
    nat: p.nat,
    val: v,
    permit: x.n,
    notes: [x.notes, x.guardNotes],
    devices: x.devices,
    items: exit ? x.exitItems : null,
    facts: [['رقم التصريح', x.n], ['المسار', x.pathName], ['المبنى', x.buildingName], ['تاريخ الانتهاء', x.expiry || x.expiryDate]]
  })).sort((a, b) => RK.indexOf(a.st) - RK.indexOf(b.st));

  return js[0];
}

function xVeh(v, gate){
  const m = Object.entries(EX).filter(([n, x]) => x.mode === 'vehicle' && x.plateNums === v).map(([n, x]) => ({ n, ...x }));
  if(!m.length) return xNF('لا يوجد تصريح للمركبة', 'لوحة ' + v, '', 0, v);
  const js = m.map(x => {
    const d = PE.find(p => p.id === x.driverId);
    return xJudge(x, gate, {
      name: x.title,
      sub: d ? 'السائق: ' + d.name : '',
      vehicle: 1,
      val: v,
      permit: x.n,
      facts: [['رقم التصريح', x.n], ['اللوحة', x.plateNums + ' ' + (x.plateLetters || '')], ['المبنى', x.buildingName]]
    });
  }).sort((a, b) => RK.indexOf(a.st) - RK.indexOf(b.st));

  return js[0];
}

function xShow(r){
  window._gcur = r;
  const [cls, ic, wm] = XST[r.st] || XST.notfound;
  const box = document.getElementById('gateResult');
  const ini = (r.name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const ph = r.vehicle ? '🚗' : r.st === 'exit' ? '🚪' : (r.photo ? `<img src="${r.photo}">` : ini);
  const ico = (r.st === 'active' || r.st === 'exit')
    ? '<svg viewBox="0 0 52 52" class="gchk"><circle cx="26" cy="26" r="24" class="gc"/><path d="M14 27l8 8 16-17" class="gp"/></svg>'
    : `<span>${ic}</span>`;

  let ex = '';
  const n1 = r.notes && r.notes[0] && r.notes[0] !== '—' ? r.notes[0] : '';
  const n2 = r.notes && r.notes[1] && r.notes[1] !== '—' ? r.notes[1] : '';
  const ok = r.st === 'active' || r.st === 'exit';

  if(r.choices){
    ex = `<div class="card gextra" style="padding:18px;grid-column:1/-1">
      ${r.choices.map(p => `<button class="btn bg2 btn-block" style="margin-bottom:8px;justify-content:space-between" onclick="xPick('${p.idNo || p.idNumber}')"><b>${xesc(p.name)}</b><span>${xesc(p.sub || p.maskedId)}</span></button>`).join('')}
    </div>`;
  } else if(ok || n1 || n2){
    ex = `<div class="card gextra" style="padding:18px;grid-column:1/-1">
      ${n1 ? `<div class="notes-box" style="margin-bottom:10px"><div class="notes-box-title">📝 ملاحظات مقدم الطلب</div><div class="notes-box-content">${xesc(n1)}</div></div>` : ''}
      ${n2 ? `<div class="notes-box blue" style="margin-bottom:10px"><div class="notes-box-title">🛡️ لموظف الاستعلام</div><div class="notes-box-content">${xesc(n2)}</div></div>` : ''}
      ${r.devices && r.devices.length ? `<div class="sdv">المسموح بدخوله</div><div class="check-grid" style="grid-template-columns:1fr 1fr">${r.devices.map(d => `<div class="check-item" style="cursor:default">${xesc(d)}</div>`).join('')}</div>` : ''}
      ${r.items && r.items.length ? `<div class="sdv">📦 الأصول المصرحة</div><div class="check-grid" style="grid-template-columns:1fr 1fr">${r.items.map(i => `<div class="check-item" style="cursor:default">${xesc(i.category)} — ${xesc(i.type || i.itemType)} × ${i.qty || i.quantity}</div>`).join('')}</div>` : ''}
      ${ok ? `<div class="bgrp" style="justify-content:flex-start"><button class="btn bp" onclick="xLog(this)">${r.st === 'exit' ? '🚪 تسجيل خروج' : '🟢 تسجيل دخول'}</button></div>` : ''}
    </div>`;
  }

  box.innerHTML = `
    <div class="query-hero ${cls} ghero" style="grid-column:1/-1">
      <div class="qh-watermark">${wm}</div>
      <div class="qh-layout">
        ${ph ? `<div class="gpop"><div class="qh-photo-big">${ph}</div></div>` : ''}
        <div class="qh-info">
          <div class="gico ${r.st}">${ico}</div>
          <div class="qh-title">${r.title}</div>
          <div class="qh-name">${xesc(r.name)}</div>
          <div class="qh-sub">${xesc(r.sub || '')}</div>
          <div class="qh-facts">${(r.facts || []).map(f => `<div class="qh-fact"><span>${xesc(f[0])}</span><b>${xesc(f[1])}</b></div>`).join('')}</div>
        </div>
      </div>
    </div>${ex}`;

  if(navigator.vibrate) navigator.vibrate(r.st === 'active' || r.st === 'exit' ? 60 : [90, 60, 90]);
}

function xPick(id){
  document.getElementById('gateSearch').value = id;
  _gk = '';
  gateLookup();
}

async function xLog(b){
  const r = window._gcur;
  if(!r) return;
  const t = new Date().toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  const direction = r.st === 'exit' ? 'خروج' : 'دخول';

  QL.unshift({
    time: t,
    val: r.val,
    name: r.name,
    rt: r.rt,
    rl: r.st === 'exit' ? '🚪 خروج' : '🟢 دخول',
    officer: CU.name,
    nat: r.nat || '—',
    gate: xGate(),
    branch: BN[CB]
  });

  try{
    await fetch('/api/gate/movement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitNumber: r.permit || '—',
        direction: direction,
        gateName: xGate(),
        branchName: BN[CB] || CB,
        notes: r.name
      })
    });
  }catch(e){}

  xau('add', direction, r.name);
  b.disabled = true;
  b.classList.add('gdone');
  b.textContent = '✔ سُجّل بنجاح';
  xRecent();
  toast('✅ تم تسجيل الحركة بنجاح');
}

function xRecent(){
  const b = document.getElementById('gateRecent');
  if(!b) return;
  const c = { active: '#16a34a', exit: '#2563eb', expired: '#ea580c', blacklist: '#dc2626', 'exit-expired': '#d97706' };
  b.innerHTML = QL.slice(0, 6).map(x => `
    <div class="grec">
      <span class="gdot" style="background:${c[x.rt] || '#94a3b8'}"></span>
      <b>${xesc(x.name)}</b>
      <span class="gtm">${xesc(x.time)}</span>
      <em>${xesc(x.rl)}</em>
    </div>`).join('') || '<div class="hint" style="padding:14px;text-align:center">لا استعلامات حديثة</div>';
}

function xQR(){
  const g = document.getElementById('gateResult');
  g.innerHTML = '<div class="card gscan" style="grid-column:1/-1"><div class="gframe"><b></b><b></b><b></b><b></b><div class="gscan-laser"></div></div><div class="gscan-t">وجّه رمز البطاقة أو الـ QR<span class="dots"></span></div></div>';
  setTimeout(() => {
    const T = TD();
    let v;
    if(gMode === 'vehicle'){
      const x = Object.values(EX).find(x => x.mode === 'vehicle' && x.status !== 'suspended');
      v = x && x.plateNums;
    } else {
      const x = Object.values(EX).find(x => x.mode === (gMode === 'exit' ? 'exit' : 'single') && x.personIds && x.status !== 'suspended' && x.visitDate <= T && T <= (x.expiry || x.expiryDate));
      const p = x && PE.find(q => q.id === x.personIds[0]);
      v = p && (p.idNo || p.idNumber).slice(-4);
    }
    if(!v){
      g.innerHTML = xidle();
      toast('⚠️ لم يتم التعرف على الرمز');
      return;
    }
    document.getElementById('gateSearch').value = v;
    _gk = '';
    gateLookup();
  }, 1200);
}

/* ═══════ CARD PRINT ═══════ */
function searchForCard(q){
  const b = document.getElementById('cardPrintResults');
  if(!q || !q.trim()){ b.style.display = 'none'; return; }
  const m = PE.filter(p => p.branch === CB).filter(p => p.name.includes(q.trim()) || p.sub.includes(q.trim()) || (p.idNo || '').includes(q.trim()));
  if(!m.length){
    b.innerHTML = '<div style="padding:12px;text-align:center;color:var(--g400)">لا توجد نتائج</div>';
    b.style.display = 'block';
    return;
  }
  b.innerHTML = m.map(p => {
    const ph = PH[p.id]?.personal?.data;
    const av = ph ? `<img src="${ph}">` : '🧑';
    return `<div class="search-result-item" onclick="spCard('${p.id}')">
      <div class="ur-avatar">${av}</div>
      <div class="sr-info"><div class="sr-name">${xesc(p.name)}</div><div class="sr-sub">${xesc(p.sub)}</div></div>
    </div>`;
  }).join('');
  b.style.display = 'block';
}

function spCard(pid){
  const p = PE.find(x => x.id === pid);
  if(!p) return;
  document.getElementById('cardPrintSearch').value = p.name;
  document.getElementById('cardPrintResults').style.display = 'none';
  const cn = gcn(pid);
  const ph = PH[pid]?.personal?.data || null;
  let lp = null;
  for(const [no, perm] of Object.entries(EX)){
    if(perm.personIds && perm.personIds.includes(pid)){
      if(!lp || (perm.expiry || perm.expiryDate) > (lp.expiry || lp.expiryDate)) lp = { ...perm, no };
    }
  }
  const dep = lp ? gDP(lp.departmentId) : '—';
  const rows = [
    ['رقم الهوية', p.sub],
    ['الجنسية', p.nat],
    ['🏢 الفرع', lp ? lp.branchName : BN[CB] || '—'],
    ['🏬 المبنى', lp ? lp.buildingName : '—'],
    ['🏛️ الإدارة', dep],
    ['🛣️ المسار', lp ? lp.pathName : '—']
  ];
  if(lp){
    rows.push(['📅 آخر تصريح', lp.no]);
    rows.push(['حتى', lp.expiry || lp.expiryDate]);
  }
  document.getElementById('cardPrintSelectedInfo').innerHTML = `<b>${xesc(p.name)}</b> — ${xesc(cn)}`;
  document.getElementById('cardPrintBox').innerHTML = ric({
    sc: 'active',
    title: 'بطاقة دخول أمنية',
    name: p.name,
    sub: p.entity || '—',
    rows,
    cardNo: cn,
    pn: lp ? lp.no : null,
    bn: BN[CB],
    spp: true,
    pp: ph
  });
  document.getElementById('cardPrintBtn').style.display = 'block';
}

function printCard(){
  const b = document.getElementById('cardPrintBox');
  const w = window.open('', '_blank');
  w.document.write('<html dir="rtl"><head><title>طباعة البطاقة</title><style>body{margin:0;padding:20px;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}' + document.querySelector('style, link[rel="stylesheet"]').textContent + '</style></head><body>' + b.innerHTML + '</body></html>');
  w.document.close();
  setTimeout(() => w.print(), 500);
}

/* ═══════ USERS ═══════ */
function openAddUser(){
  document.getElementById('userModalTitle').textContent = '👤 مستخدم جديد';
  document.getElementById('userId').value = '';
  ['userFullName','userUsername','userEmail','userPassword','userPasswordConfirm','userPhone','userJobTitle'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('userStatusToggle').checked = true;
  const sb = document.getElementById('userMainBranch');
  sb.innerHTML = '<option value="">— اختر الفرع —</option>' + BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  sb.value = '';
  resetUD();
  rURC('requester');
  rUPG(PRESETS.requester);
  openModal('modalUser');
}

function resetUD(){
  document.getElementById('userMainDept').innerHTML = '<option value="">— اختر الفرع —</option>';
  document.getElementById('userSubDept').innerHTML = '<option value="">— بدون —</option>';
  document.getElementById('userSectionDept').innerHTML = '<option value="">— بدون —</option>';
}

function onUserBranchChange(){
  const b = document.getElementById('userMainBranch').value;
  const md = document.getElementById('userMainDept');
  if(!b){ resetUD(); return; }
  const m = DP.filter(d => d.branchId === b && d.level === 1);
  md.innerHTML = '<option value="">— اختر الإدارة —</option>' + m.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  document.getElementById('userSubDept').innerHTML = '<option value="">— بدون —</option>';
  document.getElementById('userSectionDept').innerHTML = '<option value="">— بدون —</option>';
  xUG();
}

function onUserMainDeptChange(){
  const m = document.getElementById('userMainDept').value;
  const sd = document.getElementById('userSubDept');
  if(!m){ sd.innerHTML = '<option value="">— بدون —</option>'; document.getElementById('userSectionDept').innerHTML = '<option value="">— بدون —</option>'; return; }
  const s = DP.filter(d => d.parentId === m && d.level === 2);
  sd.innerHTML = '<option value="">— بدون —</option>' + s.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  document.getElementById('userSectionDept').innerHTML = '<option value="">— بدون —</option>';
}

function onUserSubDeptChange(){
  const s = document.getElementById('userSubDept').value;
  const sc = document.getElementById('userSectionDept');
  if(!s){ sc.innerHTML = '<option value="">— بدون —</option>'; return; }
  const ss = DP.filter(d => d.parentId === s && d.level === 3);
  sc.innerHTML = '<option value="">— بدون —</option>' + ss.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function openEditUser(uid){
  const u = US.find(x => x.id === uid);
  if(!u) return;
  document.getElementById('userModalTitle').textContent = '✏️ ' + u.name;
  document.getElementById('userId').value = u.id;
  document.getElementById('userFullName').value = u.name;
  document.getElementById('userUsername').value = u.username;
  document.getElementById('userEmail').value = u.email || '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userPasswordConfirm').value = '';
  document.getElementById('userPhone').value = u.phone || '';
  document.getElementById('userJobTitle').value = u.jobTitle || '';
  document.getElementById('userStatusToggle').checked = u.status === 'active';
  const sb = document.getElementById('userMainBranch');
  sb.innerHTML = '<option value="">— اختر الفرع —</option>' + BR.filter(b => b.status === 'active').map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  sb.value = (u.branches && u.branches[0]) || '';
  onUserBranchChange();

  if(u.departmentId){
    const d = gD(u.departmentId);
    if(d){
      if(d.level === 1) document.getElementById('userMainDept').value = d.id;
      else if(d.level === 2){
        document.getElementById('userMainDept').value = d.parentId;
        onUserMainDeptChange();
        document.getElementById('userSubDept').value = d.id;
      }
      else if(d.level === 3){
        const p = gD(d.parentId);
        if(p){
          document.getElementById('userMainDept').value = p.parentId;
          onUserMainDeptChange();
          document.getElementById('userSubDept').value = p.id;
          onUserSubDeptChange();
          document.getElementById('userSectionDept').value = d.id;
        }
      }
    }
  }

  rURC(u.role);
  rUPG(u.permissions);
  xUG(u.gates || []);
  openModal('modalUser');
}

function rURC(sel){
  const b = document.getElementById('userRoleCards');
  b.innerHTML = ROLES.map(r => `
    <div class="action-card ${r.id === sel ? 'selected' : ''}" data-role="${r.id}" onclick="sUR('${r.id}')">
      <div class="action-radio"></div>
      <div class="action-ico">${r.i}</div>
      <div class="action-body"><div class="action-title">${r.n}</div><div class="action-sub">${r.d}</div></div>
    </div>`).join('');
}

function sUR(r){
  document.querySelectorAll('#userRoleCards .action-card').forEach(c => c.classList.toggle('selected', c.dataset.role === r));
  arp();
  xUG();
}

function gUR(){
  const s = document.querySelector('#userRoleCards .action-card.selected');
  return s ? s.dataset.role : 'requester';
}

function arp(){
  const r = gUR();
  rUPG(PRESETS[r] || []);
}

function rUPG(sel){
  document.getElementById('userPermissionsGrid').innerHTML = SCR.map(s => `
    <label class="check-item"><input type="checkbox" value="${s.id}" ${sel.includes(s.id) ? 'checked' : ''}>${s.n}</label>`).join('');
}

function toggleAllPerms(v){
  document.querySelectorAll('#userPermissionsGrid input').forEach(c => c.checked = v);
}

function xUG(sel){
  const w = document.getElementById('userGatesWrap');
  if(!w) return;
  const role = gUR(), br = document.getElementById('userMainBranch').value;
  w.style.display = role === 'guard' && br ? 'block' : 'none';
  if(role !== 'guard' || !br) return;
  const cur = sel || [...document.querySelectorAll('#userGatesGrid input:checked')].map(c => c.value);
  document.getElementById('userGatesGrid').innerHTML = (GP[br] || []).map(g => {
    const k = br + '::' + g.name;
    return `<label class="check-item"><input type="checkbox" value="${xesc(k)}" ${cur.includes(k) ? 'checked' : ''}>🚪 ${xesc(g.name)}</label>`;
  }).join('') || '<div class="hint">لا بوابات متاحة في هذا الفرع</div>';
}

async function saveUser(){
  const e = document.getElementById('userId').value;
  const n = document.getElementById('userFullName').value.trim();
  const u = document.getElementById('userUsername').value.trim();
  const em = document.getElementById('userEmail').value.trim();
  const ph = document.getElementById('userPhone').value.trim();
  const pwd = document.getElementById('userPassword').value;
  const pwdc = document.getElementById('userPasswordConfirm').value;
  const r = gUR();
  const br = document.getElementById('userMainBranch').value;
  const deptId = document.getElementById('userSectionDept').value || document.getElementById('userSubDept').value || document.getElementById('userMainDept').value || '';
  const jt = document.getElementById('userJobTitle').value.trim();
  const perms = [...document.querySelectorAll('#userPermissionsGrid input:checked')].map(c => c.value);
  const st = document.getElementById('userStatusToggle').checked ? 'active' : 'inactive';
  const gates = [...document.querySelectorAll('#userGatesGrid input:checked')].map(c => c.value);

  if(!n || !u){ toast('⚠️ اكتب الاسم واسم المستخدم'); return; }
  if(!br){ toast('⚠️ اختر الفرع الرئيسي'); return; }
  if(!e && (!pwd || pwd.length < 6)){ toast('⚠️ كلمة المرور 6 أحرف على الأقل'); return; }
  if(pwd && pwd !== pwdc){ toast('⚠️ كلمتا المرور غير متطابقتين'); return; }

  const dto = {
    id: e || null,
    name: n,
    username: u,
    password: pwd || null,
    email: em,
    phone: ph,
    role: r,
    branchId: br,
    departmentId: deptId,
    jobTitle: jt,
    status: st,
    permissions: perms,
    gates: gates
  };

  try{
    const resp = await fetch('/api/account/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    let res;
    try { res = await resp.json(); } catch(_){
      toast('⛔ خطأ في الاتصال بالسيرفر (' + resp.status + ')'); return;
    }

    if(res && typeof res.success !== 'undefined'){
      if(!res.success){ toast('⛔ ' + (res.message || 'فشل حفظ المستخدم')); return; }
      if(e){ const x = US.find(usr => usr.id === e); if(x) Object.assign(x, res.data); }
      else US.push(res.data);
    } else if(res && res.errors){
      toast('⛔ ' + (res.title || Object.values(res.errors).flat().join(' — '))); return;
    } else {
      // fallback محلي
      if(e){ const x = US.find(usr => usr.id === e); if(x) Object.assign(x, { name:n, username:u, email:em, phone:ph, role:r, departmentId:deptId, jobTitle:jt, permissions:perms, status:st, gates }); }
      else US.push({ id:'u'+Date.now().toString(36), name:n, username:u, email:em, phone:ph, role:r, branches:[br], departmentId:deptId, jobTitle:jt, permissions:perms, status:st, gates, avatar:n.split(' ').map(w=>w[0]).slice(0,2).join('') });
    }
  }catch(err){
    console.warn('API error saveUser, fallback local:', err);
    if(e){ const x = US.find(usr => usr.id === e); if(x) Object.assign(x, { name:n, username:u, email:em, phone:ph, role:r, departmentId:deptId, jobTitle:jt, permissions:perms, status:st, gates }); }
    else US.push({ id:'u'+Date.now().toString(36), name:n, username:u, email:em, phone:ph, role:r, branches:[br], departmentId:deptId, jobTitle:jt, permissions:perms, status:st, gates, avatar:n.split(' ').map(w=>w[0]).slice(0,2).join('') });
  }

  xau(e ? 'edit' : 'add', 'مستخدم', n);
  toast('✅ تم حفظ المستخدم بنجاح');
  closeModal('modalUser');
  rut();
}


function setUserStatusFilter(f, el){
  uSF2 = f;
  document.querySelectorAll('#userStatusTags .filter-tag').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  rut();
}

function rut(){
  const t = document.getElementById('usersTbody');
  if(!t) return;
  const rf = document.getElementById('userRoleFilter');
  const _rv0 = rf.value;
  rf.innerHTML = '<option value="">كل الأدوار</option>' + ROLES.map(x => `<option value="${x.id}">${x.i} ${x.n}</option>`).join('');
  const bf = document.getElementById('userBranchFilter');
  const _bv0 = bf.value;
  bf.innerHTML = '<option value="">كل الفروع</option>' + BR.map(x => `<option value="${x.id}">🏢 ${x.name}</option>`).join('');
  const q = (document.getElementById('userSearch').value || '').trim().toLowerCase();
  rf.value = _rv0;
  bf.value = _bv0;
  const rv = rf.value, bv = bf.value;

  let r = US.filter(u => {
    if(uSF2 !== 'all' && u.status !== uSF2) return false;
    if(rv && u.role !== rv) return false;
    if(bv && !u.branches.includes(bv)) return false;
    if(q && !smatch([u.name, u.username, u.email, (ROLES.find(r => r.id === u.role) || {}).n], q)) return false;
    return true;
  });

  const render = rows => {
    document.getElementById('usersEmpty').style.display = r.length ? 'none' : 'block';
    t.innerHTML = rows.map(u => {
      const ro = ROLES.find(x => x.id === u.role) || { n: u.role, i: '👤', c: 'bgry' };
      const dep = gD(u.departmentId);
      const dp = dep ? gDP(u.departmentId) : '—';
      const bh = (u.branches || []).map(bid => {
        const b = BR.find(x => x.id === bid);
        return b ? `<span class="badge bgry" style="margin:2px">🏢 ${xesc(b.name)}</span>` : '';
      }).join('');
      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:9px">
            <div class="ur-avatar">${xesc(u.avatar || '؟')}</div>
            <div><b>${xesc(u.name)}</b><div style="font-size:10.5px;color:var(--g400)">${xesc(u.email || '—')}</div></div>
          </div>
        </td>
        <td><b style="font-family:monospace">${xesc(u.username)}</b></td>
        <td><span class="badge ${ro.c}">${ro.i} ${ro.n}</span></td>
        <td>${dep ? `<div><span class="badge bbl">🏛️ ${xesc(dp)}</span></div>` : ''}${bh}</td>
        <td><span class="badge bbl">${(u.permissions || []).length}/${SCR.length}</span></td>
        <td><span class="badge ${u.status === 'active' ? 'bact' : 'bexp'}">${u.status === 'active' ? '✅ نشط' : '⏸️ موقوف'}</span></td>
        <td style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="btn bg2 bxs" onclick="openEditUser('${u.id}')">تعديل</button>
          <button class="btn bred bxs" onclick="du('${u.id}')">حذف</button>
        </td>
      </tr>`;
    }).join('');
    applyPermButtons();
  };
  setPagerData('users', r, render);
  document.getElementById('usersTotalCount').textContent = US.length;
  document.getElementById('usersActiveCount').textContent = US.filter(u => u.status === 'active').length;
  document.getElementById('usersInactiveCount').textContent = US.filter(u => u.status !== 'active').length;
  document.getElementById('usersAdminCount').textContent = US.filter(u => u.role === 'admin').length;
}

async function du(id){
  const u = US.find(x => x.id === id);
  if(!u) return;
  if(CU && u.id === CU.id){ toast('⛔ لا يمكنك حذف حسابك الشخصي'); return; }
  if(!confirm('هل تود حذف المستخدم «' + u.name + '»؟')) return;

  try{ await fetch(`/api/account/users/${id}`, { method: 'DELETE' }); }catch(e){}

  US = US.filter(x => x.id !== id);
  xau('del', 'مستخدم', u.name);
  rut();
  toast('🗑 تم حذف المستخدم');
}

/* ═══════ THEMES & SETTINGS ═══════ */
const THEME_PRESETS={
  default:{name:'الأخضر التقليدي',colors:{gd:'#0f2d1f',gm:'#15573a',gmi:'#1e7a4f',gp:'#edf7f2',glight:'#d6f0e2',au:'#a07820',aul:'#c9941e',aub:'#fdf8ee'}},
  royal:{name:'الأزرق الملكي',colors:{gd:'#0c1e3d',gm:'#1a3a6c',gmi:'#2a5aa0',gp:'#eef4fc',glight:'#d6e4f7',au:'#b8860b',aul:'#d4a017',aub:'#fef8ec'}},
  burgundy:{name:'العنابي',colors:{gd:'#3d0c1e',gm:'#6c1a3a',gmi:'#a02a5a',gp:'#fceef4',glight:'#f7d6e4',au:'#c9941e',aul:'#d9a52a',aub:'#fef8ec'}},
  navy:{name:'الكحلي',colors:{gd:'#0f172a',gm:'#1e293b',gmi:'#334155',gp:'#f1f5f9',glight:'#e2e8f0',au:'#c9941e',aul:'#d9a52a',aub:'#fdf8ee'}},
  emerald:{name:'الزمردي',colors:{gd:'#064e3b',gm:'#065f46',gmi:'#059669',gp:'#ecfdf5',glight:'#d1fae5',au:'#a16207',aul:'#ca8a04',aub:'#fefce8'}},
  purple:{name:'البنفسجي',colors:{gd:'#2e1065',gm:'#4c1d95',gmi:'#7c3aed',gp:'#f5f3ff',glight:'#ede9fe',au:'#c9941e',aul:'#d9a52a',aub:'#fdf8ee'}}
};

function applyTheme(key, custom){
  const theme = key === 'custom' ? { colors: custom } : THEME_PRESETS[key];
  if(!theme) return;
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([k, v]) => root.style.setProperty('--' + k, v));
  try{ localStorage.setItem('permits_theme', JSON.stringify({ key, colors: theme.colors })); }catch(e){}
  S.theme = { key, colors: theme.colors };
  rct();
  rvp();
  applyLogo();
}

function loadTheme(){
  try{
    const s = localStorage.getItem('permits_theme');
    if(s){
      const t = JSON.parse(s);
      applyTheme(t.key, t.colors);
    }
  }catch(e){}
}

function selectTheme(key){
  document.querySelectorAll('.theme-preset').forEach(el => el.classList.remove('active'));
  const presets = document.querySelectorAll('.theme-preset');
  const keys = Object.keys(THEME_PRESETS);
  const idx = keys.indexOf(key);
  if(presets[idx]) presets[idx].classList.add('active');
  applyTheme(key);
  toast('🎨 تم تطبيق ثيم: ' + THEME_PRESETS[key].name);
}

function applyCustomTheme(){
  const c = {
    gd: document.getElementById('colorGd').value,
    gm: document.getElementById('colorGm').value,
    gmi: document.getElementById('colorGm').value,
    gp: document.getElementById('colorGp').value,
    glight: document.getElementById('colorGlight').value,
    au: document.getElementById('colorAu').value,
    aul: document.getElementById('colorAul').value,
    aub: document.getElementById('colorAu').value
  };
  document.querySelectorAll('.theme-preset').forEach(el => el.classList.remove('active'));
  applyTheme('custom', c);
}

function handleSysLogo(f){
  if(!f || !f[0]) return;
  const r = new FileReader();
  r.onload = e => {
    S.logo = e.target.result;
    const b = document.getElementById('sysLogoBox');
    if(b) b.innerHTML = `<img src="${S.logo}" style="max-height:140px">`;
    applyLogo();
    rct();
  };
  r.readAsDataURL(f[0]);
}

function removeLogo(){
  S.logo = null;
  const b = document.getElementById('sysLogoBox');
  if(b) b.innerHTML = '<span style="color:var(--g400);font-size:12px">اضغط لرفع الشعار</span>';
  applyLogo();
  rct();
  toast('🗑 تم حذف الشعار');
}

async function saveSettings(){
  applyName();
  try{
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'SystemName', value: S.name })
    });
  }catch(e){}
  xau('edit', 'إعدادات النظام', '');
  toast('✅ تم حفظ الإعدادات');
}

function applyName(){
  const el = document.getElementById('sysSystemName');
  if(!el) return;
  const n = el.value.trim() || S.name;
  S.name = n;
  document.getElementById('topbarSystemName').textContent = n.length > 25 ? 'تصاريح الدخول' : n;
  document.getElementById('loginTitle').textContent = n;
  document.title = n;
}

function applyLogo(){
  const e = document.getElementById('topbarLogoIco');
  const l = document.getElementById('loginLogo');
  if(!e || !l) return;
  if(S.logo){
    e.innerHTML = `<img src="${S.logo}">`;
    l.innerHTML = `<img src="${S.logo}">`;
    l.classList.remove('no-logo');
  } else {
    e.innerHTML = '🛡️';
    l.innerHTML = '';
    l.classList.add('no-logo');
  }
}

function exportDatabase(){
  window.location.href = '/api/settings/export-backup';
  toast('📥 جاري تنزيل النسخة الاحتياطية من السيرفر...');
}

function importDatabase(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async e => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try{
      const res = await fetch('/api/settings/import-backup', { method: 'POST', body: formData }).then(r => r.json());
      if(res.success){
        toast('✅ تم استيراد البيانات بنجاح');
        await loadInitialDataFromServer();
        goto('dashboard', null);
      } else {
        toast('⛔ ' + res.message);
      }
    }catch(err){
      toast('⛔ فشل الاستيراد: ' + err.message);
    }
  };
  input.click();
}

async function resetAllData(){
  const v = await xdlg({ title: '⚠️ إعادة تعيين شاملة', ico: '⚠️', danger: true, msg: 'تحذير: سيتم حذف كافة التصاريح وسجل الأشخاص والعمليات', fields: [{ id: 'confirm', label: 'اكتب "حذف الكل" للتأكيد', req: true }], ok: '🗑 تأكيد الحذف' });
  if(!v) return;
  if(v.confirm.trim() !== 'حذف الكل'){ toast('⚠️ كلمة التأكيد غير صحيحة'); return; }

  try{
    const res = await fetch('/api/settings/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmText: v.confirm.trim() })
    }).then(r => r.json());

    if(res.success){
      EX = {}; PQ = []; QL = []; PE = []; PH = {}; BLD = [];
      toast('🗑 تم تصفير البيانات بنجاح');
      await syncAllFromDb();
      rd();
    } else {
      toast('⛔ ' + res.message);
    }
  }catch(err){
    toast('⛔ خطأ في الاتصال');
  }
}

function rebuildSettingsScreen(){
  const screen = document.getElementById('screen-systemsettings');
  if(!screen) return;
  const currentThemeKey = (S.theme && S.theme.key) || 'default';
  screen.innerHTML = `
    <div class="ph"><div><div class="pt">🛠️ إعدادات النظام</div><div class="ps">الهوية، الألوان، الشعار، النسخ الاحتياطي وقاعدة البيانات</div></div><button class="btn bp" onclick="saveSettings()">💾 حفظ</button></div>
    <div class="card" style="padding:22px;margin-bottom:18px">
      <div class="sdv">🏢 اسم النظام</div>
      <div class="fg"><label>اسم المنظومة</label><input type="text" id="sysSystemName" value="${xesc(S.name)}" placeholder="نظام تصاريح دخول المجمع"></div>
    </div>
    <div class="card" style="padding:22px;margin-bottom:18px">
      <div class="sdv">🖼️ شعار النظام</div>
      <div class="grid2">
        <div>
          <div class="logo-upload-preview" id="sysLogoBox" onclick="document.getElementById('sysLogoInput').click()" style="cursor:pointer;min-height:160px">
            ${S.logo ? `<img src="${S.logo}" style="max-height:150px">` : '<span style="color:var(--g400);font-size:12px">اضغط لرفع الشعار</span>'}
          </div>
          <input type="file" id="sysLogoInput" accept="image/*" style="display:none" onchange="handleSysLogo(this.files)">
          <p class="hint" style="text-align:center;margin-top:8px">💡 يدعم PNG شفاف حتى 5MB</p>
        </div>
        <div>
          <div class="field-auto" style="margin-bottom:10px">
            <div style="font-size:11px;color:var(--g400);font-weight:700">معاينة الشعار في الشريط العلوي:</div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,var(--aul),var(--au));border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden">
                ${S.logo ? `<img src="${S.logo}" style="width:100%;height:100%;object-fit:contain">` : '🛡️'}
              </div>
              <div style="font-size:12px;color:var(--g600);font-weight:700">منصة الوصول الآمن للمجمع</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn bg2 bsm" style="flex:1" onclick="document.getElementById('sysLogoInput').click()">📤 تغيير</button>
            <button class="btn bred bsm" style="flex:1" onclick="removeLogo()">🗑 إزالة</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:22px;margin-bottom:18px">
      <div class="sdv">🎨 ألوان النظام</div>
      <p class="hint" style="margin-bottom:14px">اختر ثيمًا جاهزًا أو خصص الألوان حسب الهوية</p>
      <div class="theme-picker-grid" id="themePickerGrid">
        ${Object.entries(THEME_PRESETS).map(([key, theme]) => `
          <div class="theme-preset ${currentThemeKey === key ? 'active' : ''}" onclick="selectTheme('${key}')">
            <div class="theme-swatches">
              <span style="background:${theme.colors.gd}"></span>
              <span style="background:${theme.colors.gm}"></span>
              <span style="background:${theme.colors.au}"></span>
              <span style="background:${theme.colors.gp}"></span>
            </div>
            <div class="theme-preset-name">${theme.name}</div>
          </div>`).join('')}
      </div>
      <div class="sdv" style="margin-top:20px">🎨 تخصيص يدوي دقيق</div>
      <div class="custom-color-grid">
        <div class="color-input-row"><label>الأساسي</label><input type="color" id="colorGm" value="${(S.theme && S.theme.colors.gm) || THEME_PRESETS.default.colors.gm}" onchange="applyCustomTheme()"></div>
        <div class="color-input-row"><label>الغامق</label><input type="color" id="colorGd" value="${(S.theme && S.theme.colors.gd) || THEME_PRESETS.default.colors.gd}" onchange="applyCustomTheme()"></div>
        <div class="color-input-row"><label>الذهبي</label><input type="color" id="colorAu" value="${(S.theme && S.theme.colors.au) || THEME_PRESETS.default.colors.au}" onchange="applyCustomTheme()"></div>
        <div class="color-input-row"><label>الفاتح جداً</label><input type="color" id="colorGp" value="${(S.theme && S.theme.colors.gp) || THEME_PRESETS.default.colors.gp}" onchange="applyCustomTheme()"></div>
        <div class="color-input-row"><label>الفاتح</label><input type="color" id="colorGlight" value="${(S.theme && S.theme.colors.glight) || THEME_PRESETS.default.colors.glight}" onchange="applyCustomTheme()"></div>
        <div class="color-input-row"><label>الذهبي الفاتح</label><input type="color" id="colorAul" value="${(S.theme && S.theme.colors.aul) || THEME_PRESETS.default.colors.aul}" onchange="applyCustomTheme()"></div>
      </div>
    </div>
    <div class="card" style="padding:22px">
      <div class="sdv">💾 إدارة قاعدة البيانات والنسخ الاحتياطي (SQL Server)</div>
      <div class="grid3">
        <div class="stat-box" style="border-top:3px solid var(--gm)">
          <div class="stat-ico">📤</div>
          <div style="font-size:13px;font-weight:800;margin:6px 0">تصدير كامل</div>
          <div class="stat-lbl" style="margin-bottom:12px">نسخة JSON متوافقة</div>
          <button class="btn bp btn-block" onclick="exportDatabase()">📥 تصدير الآن</button>
        </div>
        <div class="stat-box" style="border-top:3px solid var(--au)">
          <div class="stat-ico">📥</div>
          <div style="font-size:13px;font-weight:800;margin:6px 0">استيراد كامل</div>
          <div class="stat-lbl" style="margin-bottom:12px">استعادة من ملف</div>
          <button class="btn bgold btn-block" onclick="importDatabase()">📤 استيراد ملف</button>
        </div>
        <div class="stat-box" style="border-top:3px solid var(--red)">
          <div class="stat-ico">🗑</div>
          <div style="font-size:13px;font-weight:800;margin:6px 0">تصفير شامل</div>
          <div class="stat-lbl" style="margin-bottom:12px">حذف كافة السجلات</div>
          <button class="btn bred btn-block" onclick="resetAllData()">⚠️ تصفير</button>
        </div>
      </div>
      <div class="detail-block" style="margin-top:16px">
        <div class="detail-row"><span>🏢 الفروع النشطة</span><b>${BR.length}</b></div>
        <div class="detail-row"><span>🏬 المباني</span><b>${BL.length}</b></div>
        <div class="detail-row"><span>👥 المستخدمون</span><b>${US.length}</b></div>
        <div class="detail-row"><span>🧑 سجل الأشخاص</span><b>${PE.length}</b></div>
        <div class="detail-row"><span>🪪 التصاريح الصادرة</span><b>${Object.keys(EX).length}</b></div>
        <div class="detail-row"><span>📋 الطلبات قيد المراجعة</span><b>${PQ.length}</b></div>
      </div>
    </div>`;
  setTimeout(applySearchableToAll, 200);
}

/* ═══════ REPORTS ═══════ */
function rr(){
  const bf = document.getElementById('repBranchFilter');
  if(bf){
    const c = bf.value || 'all';
    bf.innerHTML = '<option value="all">كل الفروع</option>' + BR.map(b => `<option value="${b.id}">🏢 ${b.name}</option>`).join('');
    bf.value = c;
  }
  const blf = document.getElementById('repBuildingFilter');
  if(blf){
    const c = blf.value || 'all';
    blf.innerHTML = '<option value="all">كل المباني</option>' + BL.map(b => `<option value="${b.id}">🏬 ${b.name}</option>`).join('');
    blf.value = c;
  }
  const df = document.getElementById('repDeptFilter');
  if(df){
    const c = df.value || 'all';
    df.innerHTML = '<option value="all">كل الإدارات</option>' + DP.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    df.value = c;
  }

  const bv = bf ? bf.value : 'all';
  const blv = blf ? blf.value : 'all';
  const dv = df ? df.value : 'all';
  const tv = document.getElementById('repTypeFilter')?.value || 'all';

  let r = Object.entries(EX).map(([no, p]) => ({ no, ...p }));
  if(bv !== 'all') r = r.filter(p => p.branch === bv);
  if(blv !== 'all') r = r.filter(p => p.buildingId === blv);
  if(dv !== 'all') r = r.filter(p => p.departmentId === dv);
  if(tv !== 'all') r = r.filter(p => p.mode === tv);

  document.getElementById('repTotalPermits').textContent = r.length;
  document.getElementById('repActivePermits').textContent = r.filter(p => getPS(p) === 'active').length;
  document.getElementById('repExpiredPermits').textContent = r.filter(p => getPS(p) === 'expired').length;
  document.getElementById('repSuspendedPermits').textContent = r.filter(p => p.status === 'suspended').length;

  const byB = {};
  r.forEach(p => { const n = p.branchName || '—'; byB[n] = (byB[n] || 0) + 1; });
  const bE = Object.entries(byB).sort((a, b) => b[1] - a[1]);
  const mB = Math.max(...bE.map(x => x[1]), 1);
  document.getElementById('reportsByBranch').innerHTML = bE.length ? bE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏢 ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mB * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا بيانات</div>';

  const byBl = {};
  r.forEach(p => { const n = p.buildingName || '—'; byBl[n] = (byBl[n] || 0) + 1; });
  const blE = Object.entries(byBl).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const mBl = Math.max(...blE.map(x => x[1]), 1);
  document.getElementById('reportsByBuilding').innerHTML = blE.length ? blE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏬 ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mBl * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا بيانات</div>';

  const byD = {};
  r.forEach(p => { const d = gD(p.departmentId); const n = d ? d.name : '—'; byD[n] = (byD[n] || 0) + 1; });
  const dE = Object.entries(byD).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const mD = Math.max(...dE.map(x => x[1]), 1);
  document.getElementById('reportsByDept').innerHTML = dE.length ? dE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🏛️ ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mD * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا بيانات</div>';

  const byP = {};
  r.forEach(p => { const n = p.pathName || '—'; byP[n] = (byP[n] || 0) + 1; });
  const pE = Object.entries(byP).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const mP = Math.max(...pE.map(x => x[1]), 1);
  document.getElementById('reportsByPath').innerHTML = pE.length ? pE.map((x, i) => `
    <div class="bar-row">
      <div class="bar-label">🛣️ ${xesc(x[0])}</div>
      <div class="bar-track"><div class="bar-fill ${BC[i % BC.length]}" style="width:${Math.round(x[1] / mP * 100)}%">${x[1]}</div></div>
      <div class="bar-val">${x[1]}</div>
    </div>`).join('') : '<div class="hint">لا بيانات</div>';

  const dt = document.getElementById('reportsDetailedTable');
  const render = rows => {
    if(!r.length){ dt.innerHTML = '<tr><td colspan="10" class="hint" style="text-align:center;padding:16px">لا توجد بيانات مطابقة</td></tr>'; return; }
    dt.innerHTML = rows.map(p => {
      const st = getPS(p), sL = st === 'active' ? '✅ نشط' : st === 'expired' ? '⏱ منتهي' : '⏸️ موقوف';
      const d = gD(p.departmentId);
      return `<tr>
        <td><b>${xesc(p.no || p.permitNumber)}</b></td>
        <td>${xesc(p.title)}</td>
        <td>${p.mode === 'vehicle' ? '🚗' : p.mode === 'exit' ? '🚪' : '🧑'}</td>
        <td>${xesc(p.branchName || '—')}</td>
        <td>${xesc(p.buildingName || '—')}</td>
        <td>${d ? xesc(d.name) : '—'}</td>
        <td>${xesc(p.pathName || '—')}</td>
        <td>${xesc(p.visitDate)}</td>
        <td>${xesc(p.expiry || p.expiryDate)}</td>
        <td>${sL}</td>
      </tr>`;
    }).join('');
  };
  setPagerData('reports', r, render);
}

function exportReportsExcel(){
  window.location.href = '/api/reports/export-csv';
  toast('📊 جاري تنزيل ملف التقرير...');
}

/* ═══════ DROPDOWNS & SEARCHABLE ═══════ */
function refreshPB(){
  const active = BR.filter(b => b.status === 'active');
  const h = active.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  ['visitBranch','vehicleBranch','exitBranch'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = h;
    if(active.some(b => b.id === CB)) el.value = CB;
  });
  renderBuildingSelect();
  renderVehicleBuilding();
  renderExitBuilding();
  fillDriverSelect();
  fillReqDept();
}

function renderBuildingSelect(){
  const br = document.getElementById('visitBranch')?.value || CB;
  const s = document.getElementById('visitBuilding');
  if(!s) return;
  const bl = gBF(br);
  s.innerHTML = bl.length ? `<option value="">— كل المباني —</option>` + bl.map(b => `<option value="${b.id}">${b.name}</option>`).join('') : '<option value="">⚠️ لا مباني</option>';
  rpc2();
}


function renderVehicleBuilding(){
  const br = document.getElementById('vehicleBranch')?.value || CB;
  const s = document.getElementById('vehicleBuilding');
  if(!s) return;
  const bl = gBF(br);
  s.innerHTML = bl.length ? `<option value="">— كل المباني —</option>` + bl.map(b => `<option value="${b.id}">${b.name}</option>`).join('') : '<option value="">⚠️ لا مباني</option>';
  renderVehiclePath();
}

function renderExitBuilding(){
  const br = document.getElementById('exitBranch')?.value || CB;
  const s = document.getElementById('exitBuilding');
  if(!s) return;
  const bl = gBF(br);
  s.innerHTML = bl.length ? `<option value="">— كل المباني —</option>` + bl.map(b => `<option value="${b.id}">${b.name}</option>`).join('') : '<option value="">⚠️ لا مباني</option>';
}

function renderVehiclePath(){
  const br = document.getElementById('vehicleBranch')?.value || CB;
  const bid = document.getElementById('vehicleBuilding')?.value || '';
  const s = document.getElementById('vehiclePathSelect');
  if(!s) return;
  let ps = PD.filter(p => (p.branchId || p.branch) === br && (!bid || p.buildingId === bid));
  if(!ps.length && bid){
    const branchPs = PD.filter(p => (p.branchId || p.branch) === br);
    if(branchPs.length) ps = branchPs;
  }
  s.innerHTML = ps.length ? ps.map(p => `<option value="${xesc(p.name)}">${xesc(p.name)}</option>`).join('') : '<option value="">— لا مسار متاح —</option>';
}

function fillDriverSelect(){
  const s = document.getElementById('vehicleDriverSelect');
  if(!s) return;
  const r = PE.filter(p => p.branch === CB);
  s.innerHTML = r.map(p => `<option value="${p.id}">${xesc(p.name)} — ${xesc(p.sub)}</option>`).join('') || '<option>— لا يوجد سائقون مسجلون —</option>';
}

function fillReqDept(){
  const s = document.getElementById('requestingDept');
  if(!s) return;
  const d = gDB(CB);
  let h = '';
  d.filter(x => x.level === 1).forEach(m => {
    h += `<option value="${m.id}">🏛️ ${xesc(m.name)}</option>`;
    d.filter(x => x.parentId === m.id && x.level === 2).forEach(s2 => {
      h += `<option value="${s2.id}">   📂 ${xesc(s2.name)}</option>`;
      d.filter(x => x.parentId === s2.id && x.level === 3).forEach(t => {
        h += `<option value="${t.id}">      📁 ${xesc(t.name)}</option>`;
      });
    });
  });
  h += `<option value="external">🌐 جهة خارجية</option><option value="other">✏️ أخرى</option>`;
  s.innerHTML = h;
}

function onReqDept(){
  document.getElementById('requestingDeptOther').style.display = document.getElementById('requestingDept').value === 'other' ? 'block' : 'none';
}

function makeSearchable(selectEl){
  if(!selectEl || selectEl.dataset.searchable === '1') return;
  if(selectEl.dataset.noSearch === '1') return;
  if(selectEl.options.length < 4) return;
  selectEl.dataset.searchable = '1';
  const wrap = document.createElement('div');
  wrap.className = 'sd-wrap';
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);
  selectEl.style.display = 'none';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sd-trigger';
  trigger.innerHTML = `<span class="sd-label">—</span><span class="sd-chev">▾</span>`;
  wrap.appendChild(trigger);

  const panel = document.createElement('div');
  panel.className = 'sd-panel';
  panel.innerHTML = `<div class="sd-search"><input type="text" placeholder="🔍 بحث..."></div><div class="sd-opts"></div>`;
  wrap.appendChild(panel);

  const searchInput = panel.querySelector('.sd-search input');
  const optsBox = panel.querySelector('.sd-opts');
  const labelEl = trigger.querySelector('.sd-label');

  function refreshLabel(){
    const opt = selectEl.options[selectEl.selectedIndex];
    labelEl.textContent = opt ? opt.textContent : '—';
  }

  function renderOpts(filter = ''){
    const f = filter.trim().toLowerCase();
    const filtered = [...selectEl.options].filter(o => !f || o.textContent.toLowerCase().includes(f));
    if(!filtered.length){
      optsBox.innerHTML = '<div class="sd-empty">لا توجد نتائج</div>';
      return;
    }
    optsBox.innerHTML = filtered.map(o => `<div class="sd-opt ${o.selected ? 'selected' : ''}" data-val="${xesc(o.value)}">${xesc(o.textContent)}</div>`).join('');
    optsBox.querySelectorAll('.sd-opt').forEach(el => {
      el.addEventListener('click', () => {
        selectEl.value = el.dataset.val;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        refreshLabel();
        panel.classList.remove('open');
        trigger.classList.remove('open');
        searchInput.value = '';
      });
    });
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.sd-panel.open').forEach(p => { if(p !== panel) p.classList.remove('open'); });
    document.querySelectorAll('.sd-trigger.open').forEach(t => { if(t !== trigger) t.classList.remove('open'); });
    panel.classList.toggle('open');
    trigger.classList.toggle('open');
    if(panel.classList.contains('open')){
      renderOpts();
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 50);
    }
  });

  searchInput.addEventListener('input', () => renderOpts(searchInput.value));
  selectEl.addEventListener('change', refreshLabel);

  const observer = new MutationObserver(() => {
    refreshLabel();
    if(panel.classList.contains('open')) renderOpts(searchInput.value);
  });
  observer.observe(selectEl, { childList: true, subtree: true });
  refreshLabel();
}

function applySearchableToAll(){
  document.querySelectorAll('select').forEach(sel => {
    if(sel.dataset.noSearch === '1') return;
    if(sel.closest('.sd-wrap')) return;
    makeSearchable(sel);
  });
}

document.addEventListener('click', e => {
  if(!e.target.closest('.sd-wrap')){
    document.querySelectorAll('.sd-panel.open').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.sd-trigger.open').forEach(t => t.classList.remove('open'));
  }
});

/* ═══════ MODAL GENERAL (xdlg) ═══════ */
function xdlg(o){
  return new Promise(res => {
    let m = document.getElementById('xdlg');
    if(m) m.remove();
    m = document.createElement('div');
    m.className = 'mover open';
    m.id = 'xdlg';
    m.style.zIndex = 700;
    const F = (o.fields || []).map(f => `
      <div class="fg" style="margin-bottom:12px">
        <label>${xesc(f.label)}${f.req ? ' <span class="req">*</span>' : ''}</label>
        ${f.type === 'select' ? `<select id="xf_${f.id}" data-no-search="1">${f.options.map(x => {
          const v = x.v !== undefined ? x.v : x, t = x.t !== undefined ? x.t : x;
          return `<option value="${xesc(v)}"${v == f.value ? ' selected' : ''}>${xesc(t)}</option>`;
        }).join('')}</select>` : `<input id="xf_${f.id}" type="${f.type || 'text'}" value="${xesc(f.value || '')}" placeholder="${xesc(f.ph || '')}">`}
      </div>`).join('');

    m.innerHTML = `
      <div class="modal" style="width:${o.w || 440}px">
        <div class="mh">
          <div class="mht">${o.ico || '➕'} ${xesc(o.title)}</div>
          <button class="mc" data-x="0">✕</button>
        </div>
        <div class="mb">
          ${o.msg ? `<div class="alert-banner ${o.danger ? 'warn' : 'info'}">
            <div class="alert-ico">${o.danger ? '⚠️' : 'ℹ️'}</div>
            <div>
              <div class="alert-text-title">${xesc(o.msg)}</div>
              ${o.sub ? `<div class="alert-text-sub">${o.sub}</div>` : ''}
            </div>
          </div>` : ''}
          ${F}
          <div class="bgrp">
            <button class="btn bg2" data-x="0">إلغاء</button>
            <button class="btn ${o.danger ? 'bred' : 'bp'}" data-x="1">${o.ok || '💾 حفظ'}</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(m);

    const get = () => {
      const v = {};
      for(const f of o.fields || []){
        const el = m.querySelector('#xf_' + f.id);
        const val = el.value.trim();
        if(f.req && !val){
          toast('⚠️ ' + f.label);
          el.focus();
          return null;
        }
        v[f.id] = val;
      }
      return v;
    };

    const done = r => { m.remove(); res(r); };

    m.addEventListener('click', e => {
      const x = e.target.dataset && e.target.dataset.x;
      if(x === '0' || e.target === m) done(null);
      if(x === '1'){
        const v = get();
        if(v) done(v);
      }
    });

    m.addEventListener('keydown', e => {
      if(e.key === 'Enter' && e.target.tagName === 'INPUT'){
        const v = get();
        if(v) done(v);
      }
    });

    const f1 = m.querySelector('input,select');
    if(f1) setTimeout(() => f1.focus(), 60);
  });
}

document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  const d = document.getElementById('xdlg');
  if(d){ d.querySelector('[data-x="0"]').click(); return; }
  const o = [...document.querySelectorAll('.mover.open')].pop();
  if(o){
    if(o.id === 'modalPersonCustomize' || o.id === 'v10_daysPicker') o.remove();
    else o.classList.remove('open');
  }
});

/* ═══════ ZIP EXPORT ═══════ */
function exportProjectZIP(){
  toast('📦 جاري تصدير نسخة احتياطية من البيانات...');
  exportDatabase();
}

/* ═══════ INITIALIZATION ═══════ */
(async function init(){
  document.getElementById('loginUsername')?.focus();
  loadTheme();
  popYear();
  fillNats();
  fillPTypes();
  fillIdTypes();
  fillVTypes();
  fillDevs();
  fillVCols();
  fillVTypes2();
  fillGLocs();
  fillBldgTypes();
  popMakes();

  await loadInitialDataFromServer();

  refreshPB();
  rp();
  rg();
  rb();
  rct();
  rvp();
  rpq();
  refreshBds();
  rut();
  rbr();
  rde();
  rlk();
  setGateMode('person');
  rbc();
  rre();
  rbl();
  rd();
  ral();

  document.getElementById('vehicleFrom').value = TD();
  document.getElementById('vehicleTo').value = addD(TD(), 15);
  document.getElementById('visitDate').value = TD();
  document.getElementById('visitExpiry').value = addD(TD(), 15);

  setTimeout(() => { applySearchableToAll(); enhanceFilterBars(); }, 400);

  setInterval(() => {
    const c = document.getElementById('gateClock');
    if(c) c.textContent = new Date().toLocaleTimeString('en-GB');
  }, 1000);

  setupGateAutoSearch();
  console.log('✅ نظام تصاريح الدخول (.NET 8 MVC) جاهز ومربوط بقاعدة البيانات');
})();

/* Helper for filter bar resets and auto clear */
function enhanceFilterBars(){
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const si = bar.querySelector('.search-input input');
    if(si && !bar.querySelector('.sx')){
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'sx';
      x.textContent = '✕';
      x.title = 'مسح البحث';
      x.onclick = () => { si.value = ''; si.dispatchEvent(new Event('input', { bubbles: true })); si.focus(); };
      si.parentNode.appendChild(x);
      si.addEventListener('input', () => { x.style.display = si.value ? 'block' : 'none'; });
      x.style.display = si.value ? 'block' : 'none';
    }
  });
}

function setupGateAutoSearch(){
  const input = document.getElementById('gateSearch');
  if(!input || input._bound) return;
  input._bound = true;
  let timer = null;

  input.addEventListener('input', function(){
    const v = this.value.trim();
    clearTimeout(timer);
    if(v.length >= 4){
      timer = setTimeout(() => gateLookup(), 300);
    }
  });

  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      clearTimeout(timer);
      if(this.value.trim().length >= 4) gateLookup();
    }
  });
}

function formatDaysLabel(days){
  if(!days || !days.length) return '—';
  if(days.length === 7) return 'كل الأيام';
  return days.map(k => (window.WEEK_DAYS.find(d => d.key === k) || {}).short || k).join(' • ');
}
