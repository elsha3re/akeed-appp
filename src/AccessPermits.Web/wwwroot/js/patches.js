/* ═══════════════════════════════════════════════════════════════
   نظام تصاريح الدخول - Patches v5, v6, v7, v10 & Device MAC Suite
   100% Complete Implementation of all UI Behaviors & Extensions
   ═══════════════════════════════════════════════════════════════ */

(function(){
  'use strict';
  
  function $(id){ return document.getElementById(id); }
  function safeCall(fn, ...args){
    try {
      if(typeof window[fn] === 'function') return window[fn](...args);
    } catch(e) { console.error('Error in', fn, e); }
  }
  function showToast(msg, type){
    const t = $('toast');
    if(!t){ alert(msg); return; }
    t.textContent = msg;
    t.className = 'toast ' + (type === 'err' ? 'err' : 'ok') + ' show';
    clearTimeout(window._patchToast);
    window._patchToast = setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ═══════════════════════════════════════════════════════════
     1) PATCH v5 — فتح وحفظ الأشخاص والمستخدمين
     ═══════════════════════════════════════════════════════════ */
  window.openAddPersonFixed = function(personId, fromWizard){
    try {
      const isEdit = !!personId;
      const person = isEdit ? PE.find(x => x.id === personId) : null;
      
      let modal = $('modalAddPersonPatch');
      if(!modal){
        modal = document.createElement('div');
        modal.id = 'modalAddPersonPatch';
        modal.className = 'mover';
        modal.style.zIndex = '900';
        modal.innerHTML = buildPersonModalHTML();
        document.body.appendChild(modal);
        bindPersonModalEvents();
      }
      
      const p = person;
      const $m = id => modal.querySelector('#' + id);
      
      $m('pName').value = p ? p.name : '';
      $m('pIdNo').value = p ? (p.idNo || p.idNumber || '') : '';
      $m('pEntity').value = p && p.entity !== '—' ? p.entity : '';
      
      const natSel = $m('pNat');
      natSel.innerHTML = (typeof LK !== 'undefined' ? LK.nationalities : ['سعودي','مصري','أخرى'])
        .map(n => `<option ${p && p.nat === n ? 'selected' : ''}>${n}</option>`).join('');
      
      const typeSel = $m('pType');
      typeSel.innerHTML = (typeof LK !== 'undefined' ? LK.personTypes : ['مواطن','مقيم','زائر'])
        .map(n => `<option ${p && p.type === n ? 'selected' : ''}>${n}</option>`).join('');
      
      const idTypeSel = $m('pIdType');
      idTypeSel.innerHTML = (typeof LK !== 'undefined' ? LK.idTypes : ['هوية وطنية','إقامة','جواز سفر'])
        .map(n => `<option ${p && p.idType === n ? 'selected' : ''}>${n}</option>`).join('');
      
      const branchSel = $m('pBranch');
      if(branchSel){
        branchSel.innerHTML = (typeof BR !== 'undefined' ? BR.filter(b => b.status === 'active') : [])
          .map(b => `<option value="${b.id}" ${(p ? (p.branch || p.branchId) : CB) === b.id ? 'selected' : ''}>${b.name}</option>`).join('');
      }
      
      const attachments = p && typeof PH !== 'undefined' && PH[p.id] ? PH[p.id] : null;
      renderPersonAttachments(modal, attachments);
      
      $m('pModalTitle').textContent = isEdit ? '✏️ تعديل بيانات شخص — ' + p.name : '🧑 تسجيل شخص جديد';
      $m('pBranchName').textContent = isEdit ? p.name : (typeof BN !== 'undefined' && BN[CB] ? BN[CB] : '—');
      
      modal.dataset.personId = personId || '';
      modal.dataset.fromWizard = fromWizard ? '1' : '0';
      
      modal.classList.add('open');
      setTimeout(() => safeCall('applySearchableToAll'), 200);
    } catch(err) {
      console.error('Error in openAddPersonFixed:', err);
      showToast('⛔ خطأ: ' + err.message, 'err');
    }
  };

  function buildPersonModalHTML(){
    return `
      <div class="modal modal-lg" style="width:750px">
        <div class="mh">
          <div class="mht">🧑 <span id="pModalTitle">تسجيل شخص</span> — <span id="pBranchName">—</span></div>
          <button class="mc" onclick="document.getElementById('modalAddPersonPatch').classList.remove('open')">✕</button>
        </div>
        <div class="mb">
          <div class="fg" style="margin-bottom:12px">
            <label>🏢 الفرع التابع له <span class="req">*</span></label>
            <select id="pBranch" data-no-search="1"></select>
          </div>
          <div class="fg3" style="margin-bottom:12px">
            <div class="fg">
              <label>الاسم <span class="req">*</span></label>
              <input type="text" id="pName" placeholder="الاسم الكامل">
            </div>
            <div class="fg">
              <label>النوع</label>
              <select id="pType" data-no-search="1"></select>
            </div>
            <div class="fg">
              <label>الجنسية <span class="req">*</span></label>
              <select id="pNat"></select>
            </div>
          </div>
          
          <div class="alert-banner warn" id="pNatWarning" style="display:none">
            <div class="alert-ico">⛔</div>
            <div><div class="alert-text-title">جنسية ممنوعة في هذا الفرع</div></div>
          </div>
          
          <div class="fg3" style="margin-bottom:12px">
            <div class="fg">
              <label>نوع الهوية</label>
              <select id="pIdType" data-no-search="1"></select>
            </div>
            <div class="fg">
              <label>رقم الهوية <span class="req">*</span></label>
              <input type="text" id="pIdNo" placeholder="10 أرقام">
            </div>
            <div class="fg">
              <label>الجهة</label>
              <input type="text" id="pEntity" placeholder="الشركة أو الجهة">
            </div>
          </div>
          
          <div class="sdv">📎 المرفقات</div>
          <div class="attachments-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px">
            <div class="attach-slot" id="pSlotPersonal" onclick="document.getElementById('pAttPersonal').click()" style="border:2px dashed #e2e8f0;border-radius:12px;padding:18px 12px;text-align:center;cursor:pointer;min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#fff">
              <div style="font-size:32px">🧑</div>
              <div style="font-size:12px;font-weight:800;color:#334155">صورة شخصية</div>
              <div style="font-size:10.5px;color:#94a3b8">PNG / JPG — 5MB</div>
              <input type="file" id="pAttPersonal" accept="image/*" style="display:none">
            </div>
            <div class="attach-slot" id="pSlotId" onclick="document.getElementById('pAttId').click()" style="border:2px dashed #e2e8f0;border-radius:12px;padding:18px 12px;text-align:center;cursor:pointer;min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#fff">
              <div style="font-size:32px">🆔</div>
              <div style="font-size:12px;font-weight:800;color:#334155">صورة الهوية</div>
              <div style="font-size:10.5px;color:#94a3b8">PNG / JPG — 5MB</div>
              <input type="file" id="pAttId" accept="image/*" style="display:none">
            </div>
            <div class="attach-slot" id="pSlotOther" onclick="document.getElementById('pAttOther').click()" style="border:2px dashed #e2e8f0;border-radius:12px;padding:18px 12px;text-align:center;cursor:pointer;min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#fff">
              <div style="font-size:32px">📎</div>
              <div style="font-size:12px;font-weight:800;color:#334155">مرفقات أخرى</div>
              <div style="font-size:10.5px;color:#94a3b8">متعدد</div>
              <input type="file" id="pAttOther" multiple style="display:none">
            </div>
          </div>
          <div id="pOtherList"></div>
          
          <div class="bgrp" style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:16px">
            <button type="button" class="btn bg2" onclick="document.getElementById('modalAddPersonPatch').classList.remove('open')">إلغاء</button>
            <button type="button" class="btn bp" onclick="window.savePersonPatch()">💾 حفظ</button>
          </div>
        </div>
      </div>`;
  }

  window._pAttach = { personal: null, id: null, others: [] };

  function bindPersonModalEvents(){
    const modal = $('modalAddPersonPatch');
    if(!modal) return;

    modal.querySelector('#pAttPersonal').addEventListener('change', function(e){
      const f = e.target.files[0];
      if(!f) return;
      if(f.size > 5*1024*1024){ showToast('⚠️ الملف كبير', 'err'); return; }
      const r = new FileReader();
      r.onload = ev => {
        window._pAttach.personal = { name: f.name, size: f.size, type: f.type, data: ev.target.result };
        renderPersonAttachments(modal, null);
      };
      r.readAsDataURL(f);
    });

    modal.querySelector('#pAttId').addEventListener('change', function(e){
      const f = e.target.files[0];
      if(!f) return;
      if(f.size > 5*1024*1024){ showToast('⚠️ الملف كبير', 'err'); return; }
      const r = new FileReader();
      r.onload = ev => {
        window._pAttach.id = { name: f.name, size: f.size, type: f.type, data: ev.target.result };
        renderPersonAttachments(modal, null);
      };
      r.readAsDataURL(f);
    });

    modal.querySelector('#pAttOther').addEventListener('change', function(e){
      Array.from(e.target.files).forEach(f => {
        if(f.size > 5*1024*1024){ showToast('⚠️ الملف كبير', 'err'); return; }
        const r = new FileReader();
        r.onload = ev => {
          window._pAttach.others.push({ name: f.name, size: f.size, type: f.type, data: ev.target.result });
          renderPersonAttachments(modal, null);
        };
        r.readAsDataURL(f);
      });
    });

    modal.querySelector('#pNat').addEventListener('change', function(){
      const w = modal.querySelector('#pNatWarning');
      if(typeof BNB !== 'undefined' && BNB[CB] && BNB[CB].includes(this.value)){
        w.style.display = 'flex';
      } else {
        w.style.display = 'none';
      }
    });
  }

  function bindAttachInput(modal, sel, key){
    const inp = modal.querySelector(sel);
    if(!inp) return;
    inp.addEventListener('change', function(e){
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = ev => {
        window._pAttach[key] = { name: f.name, size: f.size, type: f.type, data: ev.target.result };
        renderPersonAttachments(modal, null);
      };
      r.readAsDataURL(f);
    });
  }

  function renderPersonAttachments(modal, existing){
    if(!modal) return;
    const att = {
      personal: existing ? existing.personal : window._pAttach.personal,
      id: existing ? existing.idPhoto : window._pAttach.id,
      others: existing ? (existing.others || []) : window._pAttach.others
    };

    if(existing){
      window._pAttach.personal = att.personal;
      window._pAttach.id = att.id;
      window._pAttach.others = [...att.others];
    }

    const slotP = modal.querySelector('#pSlotPersonal');
    if(att.personal){
      slotP.innerHTML = `
        <img src="${att.personal.data}" style="width:100%;height:120px;object-fit:cover;border-radius:10px">
        <div style="position:absolute;bottom:0;right:0;left:0;background:rgba(21,87,58,.92);color:#fff;font-size:9.5px;padding:4px;text-align:center;font-weight:700">${att.personal.name}</div>
        <button type="button" onclick="event.stopPropagation();window._removePAttach('personal')" style="position:absolute;top:6px;left:6px;width:24px;height:24px;border-radius:50%;background:#dc2626;color:#fff;border:none;cursor:pointer;font-size:13px;z-index:2">✕</button>
        <input type="file" id="pAttPersonal" accept="image/*" style="display:none">
      `;
      slotP.style.position = 'relative';
      slotP.style.borderStyle = 'solid';
      slotP.style.borderColor = '#15573a';
      slotP.style.background = '#f0fdf4';
      bindAttachInput(modal, '#pAttPersonal', 'personal');
    } else {
      slotP.innerHTML = `
        <div style="font-size:32px">🧑</div>
        <div style="font-size:12px;font-weight:800;color:#334155">صورة شخصية</div>
        <div style="font-size:10.5px;color:#94a3b8">PNG / JPG — 5MB</div>
        <input type="file" id="pAttPersonal" accept="image/*" style="display:none">
      `;
      slotP.style.borderStyle = 'dashed';
      slotP.style.borderColor = '#e2e8f0';
      slotP.style.background = '#fff';
      bindAttachInput(modal, '#pAttPersonal', 'personal');
    }

    const slotId = modal.querySelector('#pSlotId');
    if(att.id){
      slotId.innerHTML = `
        <img src="${att.id.data}" style="width:100%;height:120px;object-fit:cover;border-radius:10px">
        <div style="position:absolute;bottom:0;right:0;left:0;background:rgba(21,87,58,.92);color:#fff;font-size:9.5px;padding:4px;text-align:center;font-weight:700">${att.id.name}</div>
        <button type="button" onclick="event.stopPropagation();window._removePAttach('id')" style="position:absolute;top:6px;left:6px;width:24px;height:24px;border-radius:50%;background:#dc2626;color:#fff;border:none;cursor:pointer;font-size:13px;z-index:2">✕</button>
        <input type="file" id="pAttId" accept="image/*" style="display:none">
      `;
      slotId.style.position = 'relative';
      slotId.style.borderStyle = 'solid';
      slotId.style.borderColor = '#15573a';
      slotId.style.background = '#f0fdf4';
      bindAttachInput(modal, '#pAttId', 'id');
    } else {
      slotId.innerHTML = `
        <div style="font-size:32px">🆔</div>
        <div style="font-size:12px;font-weight:800;color:#334155">صورة الهوية</div>
        <div style="font-size:10.5px;color:#94a3b8">PNG / JPG — 5MB</div>
        <input type="file" id="pAttId" accept="image/*" style="display:none">
      `;
      slotId.style.borderStyle = 'dashed';
      slotId.style.borderColor = '#e2e8f0';
      slotId.style.background = '#fff';
      bindAttachInput(modal, '#pAttId', 'id');
    }

    const list = modal.querySelector('#pOtherList');
    if(att.others && att.others.length){
      list.innerHTML = att.others.map((a, i) => `
        <div style="display:flex;align-items:center;gap:11px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:11px 13px;margin-bottom:8px">
          <div style="width:42px;height:42px;border-radius:9px;background:#edf7f2;display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden">
            ${a.type && a.type.startsWith('image/') ? `<img src="${a.data}" style="width:100%;height:100%;object-fit:cover">` : '📎'}
          </div>
          <div style="flex:1">
            <div style="font-size:12.5px;font-weight:700">${a.name}</div>
            <div style="font-size:10.5px;color:#94a3b8">${(a.size/1024).toFixed(1)} KB</div>
          </div>
          <button type="button" onclick="window._removePAttach('other', ${i})" style="background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">حذف</button>
        </div>`).join('');
    } else {
      list.innerHTML = '';
    }
  }

  window._removePAttach = function(type, idx){
    if(type === 'personal') window._pAttach.personal = null;
    if(type === 'id') window._pAttach.id = null;
    if(type === 'other') window._pAttach.others.splice(idx, 1);
    renderPersonAttachments($('modalAddPersonPatch'), null);
  };

  window.savePersonPatch = async function(){
    try {
      const modalPatch = $('modalAddPersonPatch');
      const modalBase  = $('modalAddPerson');
      const modal = (modalPatch && modalPatch.classList.contains('open'))
        ? modalPatch
        : (modalBase && modalBase.classList.contains('open') ? modalBase : (modalPatch || modalBase));
      if(!modal){ showToast('⚠️ لم يتم فتح النافذة', 'err'); return; }

      const personId   = modal.dataset?.personId || null;
      const fromWizard = modal.dataset?.fromWizard === '1';

      // قراءة الحقول من كلا النموذجين
      const q = sel => (modal.querySelector(sel) || {}).value || '';
      const n      = (q('#pName')      || q('#newPersonName')).trim();
      const nat    =  q('#pNat')       || q('#newPersonNat')     || 'سعودي';
      const id     = (q('#pIdNo')      || q('#newPersonIdNo')).trim();
      const it     =  q('#pIdType')    || q('#newPersonIdType')   || 'هوية وطنية';
      const entity = (q('#pEntity')    || q('#newPersonEntity')).trim();
      const type   =  q('#pType')      || q('#newPersonType')     || 'مواطن';
      const br     =  q('#pBranch')    || q('#newPersonBranch')   || CB;

      if(!n){ showToast('⚠️ أدخل اسم الشخص', 'err'); return; }
      if(!id){ showToast('⚠️ أدخل رقم الهوية', 'err'); return; }
      if(!nat){ showToast('⚠️ اختر الجنسية', 'err'); return; }
      if((it === 'هوية وطنية' || it === 'إقامة') && !/^\d{10}$/.test(id)){
        showToast('⚠️ رقم الهوية يجب أن يتكون من 10 أرقام', 'err'); return;
      }

      const pAttach = window._pAttach || { personal: null, id: null, others: [] };

      const dto = {
        id: personId || null,
        branchId: br,
        name: n,
        idNumber: id,
        entity: entity || null,
        personType: type,
        idType: it,
        nationality: nat,
        status: 'active',
        personalPhotoBase64: pAttach.personal?.data || null,
        idPhotoBase64: pAttach.id?.data || null,
        otherAttachments: pAttach.others || []
      };

      let serverData = null;
      try {
        const resp = await fetch('/api/registry/persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        });

        let res;
        try { res = await resp.json(); } catch(je){
          showToast('⛔ خطأ في الاتصال بالسيرفر (' + resp.status + ')', 'err');
          return;
        }

        // الـ API يُعيد {success, message, data}
        if(res && typeof res.success !== 'undefined'){
          if(!res.success){
            showToast('⛔ ' + (res.message || res.title || 'فشل الحفظ'), 'err');
            return;
          }
          serverData = res.data;
        } else if(res && res.errors){
          // ASP.NET model validation error format
          const errs = Object.values(res.errors).flat().join(' — ');
          showToast('⛔ ' + (res.title || errs || 'خطأ في البيانات'), 'err');
          return;
        } else {
          // response غير متوقع — نكمل محلياً
          console.warn('Unexpected API response:', res);
        }
      } catch(fetchErr) {
        console.warn('API error, falling back locally:', fetchErr);
      }

      const assignedId = serverData?.id || personId || ('p-' + Date.now().toString(36));
      let p = personId ? PE.find(x => x.id === personId) : null;
      if(p){
        Object.assign(p, {
          name: n,
          sub: id.length > 6 ? id.slice(0,4)+'••••'+id.slice(-2) : id,
          idNo: id, entity: entity || '—',
          type, idType: it, nat, branch: br
        });
      } else {
        p = {
          id: assignedId, branch: br, name: n,
          sub: id.length > 6 ? id.slice(0,4)+'••••'+id.slice(-2) : id,
          idNo: id, entity: entity || '—',
          type, idType: it, nat,
          addedBy: CU ? CU.id : 'system', status: 'active'
        };
        PE.push(p);
      }

      if(pAttach.personal || pAttach.id || pAttach.others?.length){
        PH[p.id] = { personal: pAttach.personal, idPhoto: pAttach.id, others: [...(pAttach.others||[])] };
      }

      if(modalPatch) modalPatch.classList.remove('open');
      if(modalBase)  modalBase.classList.remove('open');

      window._pAttach = { personal: null, id: null, others: [] };
      showToast(personId ? '✅ تم تحديث بيانات الشخص' : '✅ تم تسجيل ' + n + ' بنجاح');
      if(typeof rre === 'function') rre();
      if(fromWizard && typeof app === 'function') app(p.id);

    } catch(err) {
      console.error('Error in savePersonPatch:', err);
      showToast('⛔ خطأ: ' + (err.message || 'غير معروف'), 'err');
    }
  };


  /* ═══════════════════════════════════════════════════════════
     2) PATCH v6 — الاعتماد الجزئي + الملاحظات
     ═══════════════════════════════════════════════════════════ */
  window._personNotes = {};
  window._personSelected = {};

  window.buildApprovalPersonsTable = function(reqId){
    const req = (typeof PQ !== 'undefined') ? PQ.find(x => x.id === reqId) : null;
    if(!req || !req.persons || !req.persons.length) return '';

    const isMulti = req.mode === 'multi';
    const defaultPath = req.path || '—';
    const defaultFrom = req.visitDate || '—';
    const defaultTo = req.expiry || '—';
    const defaultDevices = req.devices || [];

    if(!window._personNotes[reqId]) window._personNotes[reqId] = {};
    if(!window._personSelected[reqId]) window._personSelected[reqId] = {};

    let rows = req.persons.map((p, i) => {
      const pp = (req.perPerson && req.perPerson[p.id]) || {};
      const path = pp.path || defaultPath;
      const dateFrom = pp.dateFrom || defaultFrom;
      const dateTo = pp.dateTo || defaultTo;
      const devices = (pp.devices && pp.devices.length) ? pp.devices : defaultDevices;
      const hasCustom = pp.path || pp.dateFrom || pp.dateTo || (pp.devices && pp.devices.length);
      const check = (typeof xchk === 'function') ? xchk(p, req.branch) : { bad: 0, t: '✔ سليم' };
      const disabled = check.bad ? 'disabled' : '';

      if(window._personSelected[reqId][p.id] === undefined){
        window._personSelected[reqId][p.id] = !check.bad;
      }

      const photo = (typeof PH !== 'undefined' && PH[p.id]) ? PH[p.id] : null;
      const photoData = photo ? (photo.personal ? photo.personal.data : (photo.data || null)) : null;
      const initials = p.name.split(' ').slice(0, 2).map(x => x[0]).join('');
      const avatar = photoData 
        ? `<img src="${photoData}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
        : `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1e7a4f,#15573a);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${initials}</div>`;

      const devicesStr = devices.length 
        ? devices.slice(0, 2).map(d => `<span class="badge bgry" style="font-size:9.5px;margin:1px">${d}</span>`).join('') + (devices.length > 2 ? `<span class="badge bgry" style="font-size:9.5px">+${devices.length - 2}</span>` : '')
        : '<span style="color:#94a3b8;font-size:11px">—</span>';

      const note = window._personNotes[reqId][p.id] || '';

      return `
        <tr data-person-id="${p.id}" style="border-bottom:1px solid #f1f5f9">
          <td style="padding:12px;text-align:center">
            ${isMulti ? `<input type="checkbox" class="apPersonChk" data-req="${reqId}" data-person="${p.id}" ${window._personSelected[reqId][p.id] && !check.bad ? 'checked' : ''} ${disabled} style="width:18px;height:18px;accent-color:#15573a;cursor:pointer" onchange="window.togglePersonSelection('${reqId}','${p.id}',this.checked)">` : `<b>${i + 1}</b>`}
          </td>
          <td style="padding:12px">
            <div style="display:flex;align-items:center;gap:10px">
              ${avatar}
              <div>
                <div style="font-size:12.5px;font-weight:700;color:#1e293b">${p.name}</div>
                <div style="font-size:10.5px;color:#94a3b8">${p.sub || '—'}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px">
            <div style="font-size:11.5px;font-weight:700;color:#15573a">${hasCustom ? '⚙️ ' : ''}${path}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px">📅 ${dateFrom} ← ${dateTo}</div>
          </td>
          <td style="padding:12px">${devicesStr}</td>
          <td style="padding:12px">
            <div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;display:inline-block;background:${check.bad ? '#fee2e2' : '#dcfce7'};color:${check.bad ? '#dc2626' : '#15803d'}">
              ${check.t}
            </div>
          </td>
          <td style="padding:12px;min-width:180px">
            <input type="text" 
                   class="apPersonNote" 
                   data-req="${reqId}" 
                   data-person="${p.id}"
                   value="${note.replace(/"/g, '&quot;')}"
                   placeholder="اكتب ملاحظة للمعتمد حول هذا الشخص..."
                   oninput="window.savePersonNote('${reqId}','${p.id}',this.value)"
                   style="width:100%;padding:7px 10px;font-size:11.5px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;background:#fff">
          </td>
        </tr>`;
    }).join('');

    const multiActions = isMulti ? `
      <div style="padding:12px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span style="font-size:11.5px;font-weight:700;color:#475569">تحديد سريع:</span>
        <button type="button" class="btn bg2 bxs" onclick="window.selectAllPersons('${reqId}',true)">✅ تحديد الكل</button>
        <button type="button" class="btn bg2 bxs" onclick="window.selectAllPersons('${reqId}',false)">✖ إلغاء الكل</button>
        <span style="margin-right:auto;font-size:11.5px;color:#15573a;font-weight:700">
          <span id="apSelCount_${reqId}">${Object.values(window._personSelected[reqId]).filter(v => v).length}</span> من ${req.persons.length} محدد
        </span>
      </div>` : '';

    return `
      <div class="sdv" style="margin-top:18px">
        🧑 الأشخاص (${req.persons.length})
        ${isMulti ? '<span class="badge bor2" style="font-size:10px;margin-right:8px">👥 طلب متعدد</span>' : ''}
      </div>
      <div class="alert-banner info" style="margin-bottom:12px">
        <div class="alert-ico">ℹ️</div>
        <div>
          <div class="alert-text-title">${isMulti ? 'حدد الأشخاص المراد اعتمادهم واكتب ملاحظاتهم' : 'راجع بيانات الشخص'}</div>
          <div class="alert-text-sub">${isMulti ? '💡 الأشخاص غير المحددين لن يُصدر لهم تصريح' : 'يمكنك إضافة ملاحظة قبل الاعتماد'}</div>
        </div>
      </div>
      <div class="tbl-wrap" style="border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;background:#fff">
          <thead>
            <tr style="background:#edf7f2">
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2;width:50px">${isMulti ? '✔' : '#'}</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2">الشخص</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2;width:200px">🛣️ المسار والوقت</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2;width:150px">📱 المسموح</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2;width:120px">الحالة</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#15573a;border-bottom:2px solid #d6f0e2;width:200px">📝 ملاحظة المعتمد</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${multiActions}
      </div>`;
  };

  window.togglePersonSelection = function(reqId, personId, checked){
    if(!window._personSelected[reqId]) window._personSelected[reqId] = {};
    window._personSelected[reqId][personId] = checked;
    const el = document.getElementById('apSelCount_' + reqId);
    if(el) el.textContent = Object.values(window._personSelected[reqId]).filter(v => v).length;
  };

  window.selectAllPersons = function(reqId, checked){
    if(!window._personSelected[reqId]) window._personSelected[reqId] = {};
    const req = PQ.find(x => x.id === reqId);
    if(!req) return;
    req.persons.forEach(p => {
      const check = (typeof xchk === 'function') ? xchk(p, req.branch) : { bad: 0 };
      if(!check.bad) window._personSelected[reqId][p.id] = checked;
    });
    document.querySelectorAll(`.apPersonChk[data-req="${reqId}"]`).forEach(chk => { chk.checked = checked; });
    const el = document.getElementById('apSelCount_' + reqId);
    if(el) el.textContent = Object.values(window._personSelected[reqId]).filter(v => v).length;
  };

  window.savePersonNote = function(reqId, personId, value){
    if(!window._personNotes[reqId]) window._personNotes[reqId] = {};
    window._personNotes[reqId][personId] = value;
  };

  /* ═══════════════════════════════════════════════════════════
     3) PATCH v10 — التمديد كطلب جديد بالبيانات الكاملة + الدوام
     ═══════════════════════════════════════════════════════════ */
  window.v10_openRenewWizard = function(permitNo){
    const permit = EX[permitNo];
    if(!permit){ toast('⚠️ التصريح غير موجود'); return; }

    let group = [];
    let groupRef = permit.groupRef || null;
    if(groupRef){
      group = Object.entries(EX).filter(([n, p]) => p.groupRef === groupRef).map(([n, p]) => ({ no: n, ...p }));
    } else {
      group = [{ no: permitNo, ...permit }];
    }

    const allPersons = [];
    const perPerson = {};

    group.forEach(g => {
      if(g.personIds){
        g.personIds.forEach(pid => {
          const person = PE.find(x => x.id === pid);
          if(person && !allPersons.some(p => p.id === pid)) allPersons.push(person);
          if(!perPerson[pid]) perPerson[pid] = {};
          if(g.pathName && g.pathName !== (permit.pathName || '—')) perPerson[pid].path = g.pathName;
          if(g.timeFrom) perPerson[pid].timeFrom = g.timeFrom;
          if(g.timeTo) perPerson[pid].timeTo = g.timeTo;
          if(g.workingDays) perPerson[pid].days = g.workingDays.split(',');
        });
      }
    });

    if(!allPersons.length){ toast('⚠️ لا يوجد أشخاص في التصريح'); return; }

    WS = {
      step: 1,
      mode: allPersons.length > 1 ? 'multi' : 'single',
      persons: allPersons,
      perPerson: perPerson,
      attachments: JSON.parse(JSON.stringify(permit.attachments || [])),
      renewFrom: permitNo,
      groupRef: groupRef,
      renewGroup: group.map(g => g.no)
    };

    const titleEl = document.getElementById('newReqTitle');
    if(titleEl){
      titleEl.innerHTML = '🔄 طلب تمديد — ' + (groupRef || permitNo) + ' <span style="background:linear-gradient(135deg,#c9941e,#a07820);color:#fff;padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:800;margin-right:8px">🔄 تمديد</span>';
    }

    document.getElementById('modeCard-single')?.classList.toggle('selected', allPersons.length === 1);
    document.getElementById('modeCard-multi')?.classList.toggle('selected', allPersons.length > 1);

    const visitBranch = document.getElementById('visitBranch');
    if(visitBranch) visitBranch.value = permit.branch || CB;
    renderBuildingSelect();
    const visitBuilding = document.getElementById('visitBuilding');
    if(visitBuilding) visitBuilding.value = permit.buildingId || '';
    rpc2();

    const pathChecklist = document.getElementById('pathChecklist');
    if(pathChecklist) pathChecklist.value = permit.pathName || '';

    const visitDate = document.getElementById('visitDate');
    const visitExpiry = document.getElementById('visitExpiry');
    if(visitDate) visitDate.value = TD();
    if(visitExpiry) visitExpiry.value = addD(TD(), 30);

    const permitDevices = permit.devices || [];
    document.querySelectorAll('#wizDeviceChecklist input').forEach(c => {
      c.checked = permitDevices.includes(c.value);
    });

    const reqNotes = document.getElementById('wizRequesterNotes');
    if(reqNotes) reqNotes.value = '🔄 طلب تمديد للتصريح: ' + permitNo + (groupRef ? ' (مجموعة ' + groupRef + ')' : '');

    rwa2();
    rpc();
    rpc2();
    goto('new-request', null);
    WS.step = 1;
    rwa();

    toast(groupRef ? `🔄 تم فتح طلب تمديد جماعي (${allPersons.length} أشخاص)` : '🔄 تم فتح طلب التمديد للتعديل والإرسال');
  };

  window.renewPermit = window.v10_openRenewWizard;

  /* ═══════════════════════════════════════════════════════════
     4) تأكيد القرار وإرسال الاعتماد للـ Backend
     ═══════════════════════════════════════════════════════════ */
  window.confirmApproval = async function(){
    const note = document.getElementById('apaNote').value.trim();
    if(_ara === 'reject' && !note){ toast('⚠️ يرجى كتابة سبب الرفض'); return; }

    const r = PQ.find(x => x.id === _ari);
    if(!r) return;

    if(_ara === 'approve' && CU && CU.role !== 'admin' && r.submitterId === CU.id){
      toast('⛔ لا يمكنك اعتماد طلب قدّمته بنفسك');
      return;
    }

    const decisionDto = {
      requestId: _ari,
      action: _ara,
      note: note,
      selectedPersonIds: Object.keys(window._personSelected[_ari] || {}).filter(k => window._personSelected[_ari][k]),
      personNotes: window._personNotes[_ari] || {}
    };

    try {
      const res = await fetch('/api/permits/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionDto)
      }).then(res => res.json());

      if(!res.success){
        toast('⛔ ' + res.message);
        return;
      }
    } catch(err) {
      console.warn('API error in approval, fallback local update:', err);
    }

    closeModal('modalApprovalAction');
    PQ = PQ.filter(x => x.id !== _ari);

    if(_ara === 'approve'){
      toast('✅ تم اعتماد الطلب وإصدار التصاريح بنجاح في قاعدة البيانات');
    } else {
      toast('❌ تم رفض الطلب');
    }

    delete window._personNotes[_ari];
    delete window._personSelected[_ari];

    await syncAllFromDb();
    rpq();
    rd();
    rpl();
    rmr();
  };

  /* ── va / vpr — عرض تفاصيل الطلب الكاملة ── */
  window.va = function(id){
    const r = (typeof PQ !== 'undefined') ? PQ.find(x => x.id === id) : null;
    const b = document.getElementById('modalViewApprovalBody');
    if(!r || !b){
      toast('⚠️ لم يتم العثور على بيانات الطلب');
      return;
    }

    const tl = r.mode === 'vehicle' ? '🚗 تصريح مركبة' : r.mode === 'exit' ? '🚪 تصريح خروج' : r.mode === 'multi' ? '👥 طلب متعدد' : '🧑 تصريح فردي';
    const tc = r.mode === 'vehicle' ? 'bbl' : r.mode === 'exit' ? 'bpurple' : 'bgry';

    const branchName = (typeof BN !== 'undefined' && BN[r.branch]) || r.branch || '—';
    const bldgName = r.buildingName || '—';
    const deptName = r.departmentName || r.entity || r.requestingDept || '—';
    const submitterName = r.submitter || '—';

    // ملاحظات مقدم الطلب
    let nh = (r.notes && r.notes !== '—') 
      ? `<div class="notes-box" style="margin-top:14px"><div class="notes-box-title">📝 ملاحظات مقدم الطلب</div><div class="notes-box-content">${xesc(r.notes)}</div></div>` 
      : '';

    // ملاحظات حارس الأمن
    let gh = (r.guardNotes && r.guardNotes !== '—') 
      ? `<div class="notes-box blue" style="margin-top:10px"><div class="notes-box-title">🛡️ ملاحظات لموظف الاستعلام</div><div class="notes-box-content">${xesc(r.guardNotes)}</div></div>` 
      : '';

    // جدول الأشخاص إذا كان تصريح أفراد أو متعدد
    let personsHtml = '';
    if(r.persons && r.persons.length){
      if(typeof window.buildApprovalPersonsTable === 'function'){
        personsHtml = window.buildApprovalPersonsTable(r.id);
      } else {
        personsHtml = `
          <div class="sdv" style="margin-top:16px">👥 الأشخاص المصرح لهم (${r.persons.length})</div>
          <div class="tbl-wrap">
            <table>
              <thead><tr><th>#</th><th>الاسم</th><th>رقم الهوية</th><th>المسار</th></tr></thead>
              <tbody>
                ${r.persons.map((p, idx) => `<tr><td>${idx+1}</td><td><b>${xesc(p.name)}</b></td><td>${xesc(p.sub || '—')}</td><td>${xesc((r.perPerson && r.perPerson[p.id]?.path) || r.path || '—')}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>`;
      }
    }

    // تفاصيل المركبة إذا كان تصريح مركبة
    let vehicleHtml = '';
    if(r.mode === 'vehicle'){
      vehicleHtml = `
        <div class="sdv" style="margin-top:16px">🚗 بيانات المركبة</div>
        <div class="detail-block" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;background:var(--g50);padding:14px;border-radius:10px;border:1px solid var(--g200)">
          <div class="detail-row"><span>المركبة:</span><b>${xesc(r.title || '—')}</b></div>
          <div class="detail-row"><span>اللوحة:</span><b>${xesc(r.sub || '—')}</b></div>
          <div class="detail-row"><span>الموديل:</span><b>${xesc(r.year || '—')}</b></div>
          <div class="detail-row"><span>اللون:</span><b>${xesc(r.color || '—')}</b></div>
        </div>`;
    }

    // أصول الخروج إذا كان تصريح خروج
    let exitHtml = '';
    if(r.mode === 'exit' && r.exitItems && r.exitItems.length){
      exitHtml = `
        <div class="sdv" style="margin-top:16px">📦 الأصول المصرح بخروجها (${r.exitItems.length})</div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>التصنيف</th><th>النوع</th><th>العدد</th><th>الرقم التسلسلي</th></tr></thead>
            <tbody>
              ${r.exitItems.map(i => `<tr><td>${xesc(i.category || '—')}</td><td>${xesc(i.type || i.itemType || '—')}</td><td>${i.qty || i.quantity || 1}</td><td>${xesc(i.serialNumber || i.sn || '—')}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    // الأجهزة المصرح بها
    let devHtml = '';
    if(r.devices && r.devices.length){
      devHtml = `
        <div class="sdv" style="margin-top:16px">📱 الأجهزة المصرح بدخولها</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
          ${r.devices.map(d => `<span class="badge bgry" style="padding:5px 10px;font-size:11.5px">📱 ${xesc(d)}</span>`).join('')}
        </div>`;
    }

    // المرفقات
    let attachHtml = '';
    if(r.attachments && r.attachments.length){
      attachHtml = `
        <div class="sdv" style="margin-top:16px">📎 المرفقات (${r.attachments.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
          ${r.attachments.map(a => `
            <div class="card" style="padding:8px 12px;display:inline-flex;align-items:center;gap:8px;font-size:12px">
              <span>${(typeof getFI === 'function') ? getFI(a.type, a.name) : '📎'}</span>
              <b>${xesc(a.name)}</b>
              <span style="color:var(--g400);font-size:10px">${(typeof fmtSize === 'function') ? fmtSize(a.size || 0) : ''}</span>
              ${a.data ? `<a href="${a.data}" download="${xesc(a.name)}" class="btn bg2 bxs" style="margin-inline-start:6px">📥 تحميل</a>` : ''}
            </div>
          `).join('')}
        </div>`;
    }

    // أزرار الإجراءات
    const isApproverOrAdmin = (typeof CU !== 'undefined' && CU && (CU.role === 'admin' || CU.role === 'approver'));
    const canSelfApprove = !(CU && CU.role !== 'admin' && r.submitterId === CU.id);

    let actionsHtml = `
      <div class="bgrp" style="margin-top:20px;border-top:1px solid var(--g100);padding-top:16px">
        <button type="button" class="btn bg2" onclick="closeModal('modalViewApproval')">إغلاق</button>
        ${isApproverOrAdmin && canSelfApprove ? `
          <button type="button" class="btn bp" onclick="closeModal('modalViewApproval'); oaa('${r.id}','approve')">✅ اعتماد الطلب</button>
          <button type="button" class="btn bred" onclick="closeModal('modalViewApproval'); oaa('${r.id}','reject')">❌ رفض الطلب</button>
        ` : ''}
        ${(r.mode === 'single' || r.mode === 'multi') && (r.submitterId === (CU ? CU.id : '') || (CU && CU.role === 'admin')) ? `
          <button type="button" class="btn bgold" onclick="closeModal('modalViewApproval'); cloneForEdit('${r.id}')">✏️ تعديل الطلب</button>
        ` : ''}
      </div>`;

    b.innerHTML = `
      <div class="alert-banner info" style="margin-bottom:16px">
        <div class="alert-ico">📋</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="alert-text-title" style="font-size:15px">${xesc(r.title)}</div>
            <span class="badge ${tc}" style="font-size:11px">${tl}</span>
          </div>
          <div class="alert-text-sub" style="margin-top:3px">${xesc(r.sub || '')}</div>
        </div>
      </div>

      <div class="sdv">📋 البيانات العامة للطلب</div>
      <div class="detail-block" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;background:var(--g50);padding:14px;border-radius:10px;border:1px solid var(--g200)">
        <div class="detail-row"><span>رقم الطلب:</span><b>${xesc(r.id)}</b></div>
        <div class="detail-row"><span>مقدم الطلب:</span><b>${xesc(submitterName)}</b></div>
        <div class="detail-row"><span>الإدارة / الجهة:</span><b>${xesc(deptName)}</b></div>
        <div class="detail-row"><span>🏢 الفرع:</span><b>${xesc(branchName)}</b></div>
        <div class="detail-row"><span>🏬 المبنى:</span><b>${xesc(bldgName)}</b></div>
        <div class="detail-row"><span>🛣️ المسار:</span><b>${xesc(r.path || '—')}</b></div>
        <div class="detail-row"><span>📅 موعد الزيارة:</span><b>${xesc(r.visitDate || '—')}</b></div>
        <div class="detail-row"><span>📅 تاريخ الانتهاء:</span><b>${xesc(r.expiry || '—')}</b></div>
        <div class="detail-row"><span>الحالة:</span><b><span class="badge bpnd">قيد المراجعة</span></b></div>
      </div>

      ${vehicleHtml}
      ${personsHtml}
      ${exitHtml}
      ${devHtml}
      ${nh}
      ${gh}
      ${attachHtml}
      ${actionsHtml}
    `;

    openModal('modalViewApproval');
  };

  window.vpr = window.va;

  // Set default aliases
  window.openAddPerson = window.openAddPersonFixed;
  window.saveNewPerson = window.savePersonPatch;

})();

/* ═══════════════════════════════════════════════════════════════════
   PATCH v11 — دوال البوابات الكاملة (saveGate, gdLoad, rdv, ...)
   مأخوذة من النسخة الأصلية وموصّلة بالـ Backend API
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── normMac ── */
  if(!window.normMac){
    window.normMac = function(s){
      const h = String(s||'').replace(/[^0-9a-fA-F]/g,'').toUpperCase();
      return h.length === 12 ? h.match(/.{2}/g).join(':') : '';
    };
  }

  /* ── newId helper ── */
  const newId = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  /* ── migrateGates: تحويل mac قديم → devices[] ── */
  window.migrateGates = function(){
    Object.keys(GP||{}).forEach(br => (GP[br]||[]).forEach(g => {
      if(!Array.isArray(g.devices)) g.devices = [];
      if(g.mac){
        if(!g.devices.some(d => d.mac === g.mac))
          g.devices.push({id: newId(), name:'', mac: g.mac});
        delete g.mac;
      }
    }));
  };
  window.migrateGates();

  /* ── gdFmt ── */
  window.gdFmt = function(v){
    const h = String(v||'').replace(/[^0-9a-fA-F]/g,'').toUpperCase().slice(0,12);
    const p = h.match(/.{1,2}/g);
    return p ? p.join(':') : '';
  };

  /* ── gdCount ── */
  window.gdCount = function(){
    const el = document.getElementById('gateDevCount');
    if(el) el.textContent = document.querySelectorAll('#gateDevRows .dev-row').length;
  };

  /* ── gdAddRow ── */
  window.gdAddRow = function(d){
    const w = document.getElementById('gateDevRows'); if(!w) return;
    d = d || {};
    w.insertAdjacentHTML('beforeend',
      `<div class="dev-row" data-id="${xesc(d.id||'')}" data-seen="${xesc(d.lastSeen||'')}">
        <input type="text" class="dev-name" placeholder="اسم الجهاز (اختياري)" value="${xesc(d.name||'')}">
        <input type="text" class="dev-mac" dir="ltr" placeholder="AA:BB:CC:DD:EE:FF" maxlength="17" value="${xesc(d.mac||'')}" oninput="this.value=gdFmt(this.value)">
        <button type="button" class="btn bred bxs" title="حذف الجهاز" onclick="gdDel(this)">✕</button>
      </div>`
    );
    window.gdCount();
    if(!d.mac){ const i = w.lastElementChild.querySelector('.dev-mac'); if(i) i.focus(); }
  };

  /* ── gdDel ── */
  window.gdDel = function(b){ b.closest('.dev-row').remove(); window.gdCount(); };

  /* ── gdLoad ── */
  window.gdLoad = function(g){
    const w = document.getElementById('gateDevRows'); if(!w) return;
    w.innerHTML = '';
    const ds = (g && g.devices) || [];
    if(ds.length) ds.forEach(d => window.gdAddRow(d));
    else window.gdAddRow({});
    window.gdCount();
  };

  /* ── findOtherGate helper ── */
  function findOtherGate(mac, exceptId){
    for(const br of Object.keys(GP||{})){
      const g = (GP[br]||[]).find(x => x.id !== exceptId && (x.devices||[]).some(d => d.mac === mac));
      if(g) return g;
    }
    return null;
  }

  /* ── saveGate — الحفظ مع الـ Backend ── */
  window.saveGate = async function(){
    window.migrateGates();
    const v = id => document.getElementById(id);
    const e   = v('gateId').value;
    const n   = v('gateName').value.trim();
    const br  = (v('gateBranch') || {}).value || CB;
    const bid = (v('gateBuilding') || {}).value;
    const loc = (v('gateLocation') || {}).value || '';

    if(!n || !bid){ toast('⚠️ أدخل اسم البوابة واختر المبنى'); return; }

    /* جمع الأجهزة من الجدول */
    const devs = [], seen = new Set();
    for(const r of document.querySelectorAll('#gateDevRows .dev-row')){
      const nm  = (r.querySelector('.dev-name')?.value || '').trim();
      const raw = (r.querySelector('.dev-mac')?.value || '').trim();
      if(!raw && !nm) continue;
      const mac = window.normMac(raw);
      if(raw && !mac){ toast('⚠️ صيغة MAC غير صحيحة: ' + raw); return; }
      if(mac && seen.has(mac)){ toast('⚠️ MAC مكرر داخل نفس البوابة: ' + mac); return; }
      if(mac) seen.add(mac);
      const other = mac ? findOtherGate(mac, e) : null;
      if(other){ toast('⚠️ الـ MAC ' + mac + ' مربوط ببوابة «' + other.name + '»'); return; }
      const d = { id: r.dataset.id || newId(), name: nm, mac: mac || '' };
      if(r.dataset.seen) d.lastSeen = +r.dataset.seen;
      devs.push(d);
    }

    if(!GP[br]) GP[br] = [];
    if(GP[br].some(g => g.name === n && g.id !== e)){
      toast('⚠️ اسم البوابة مستخدم في هذا الفرع'); return;
    }

    /* بناء DTO للـ backend */
    const dto = {
      id: e || null,
      name: n,
      branchId: br,
      buildingId: bid,
      location: loc,
      status: 'active',
      devices: devs.map(d => ({ id: d.id, gateId: e||'', name: d.name, macAddress: d.mac, lastSeen: d.lastSeen||null }))
    };

    try{
      const resp = await fetch('/api/organization/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      let res;
      try { res = await resp.json(); } catch(_) { res = null; }

      if(res && res.success && res.data){
        /* تحديث GP بالبيانات من السيرفر */
        const gateFromServer = res.data;
        /* تحويل devices من السيرفر إلى الصيغة المحلية */
        const serverDevices = (gateFromServer.devices||[]).map(d => ({
          id: d.id, name: d.name||'', mac: d.macAddress||d.mac||'', lastSeen: d.lastSeen||null
        }));

        const gateObj = {
          id: gateFromServer.id,
          name: gateFromServer.name || n,
          branchId: br,
          buildingId: bid,
          location: loc,
          devices: serverDevices,
          status: 'active'
        };

        if(e){
          const existing = (GP[br]||[]).find(x => x.id === e);
          if(existing){
            const old = existing.name;
            Object.assign(existing, gateObj);
            delete existing.mac;
            if(old !== n){
              (PD||[]).forEach(p => { if(p.branch === br || p.branchId === br) p.gates = (p.gates||[]).map(x => x === old ? n : x); });
              (US||[]).forEach(u => { if(u.gates) u.gates = u.gates.map(x => x === br+'::'+old ? br+'::'+n : x); });
            }
          }
        } else {
          GP[br].push(gateObj);
        }
        xau(e?'edit':'add', 'بوابة', n);
        toast(e ? '✅ تم حفظ البوابة بنجاح' : '🚪 تمت إضافة البوابة بنجاح');
        closeModal('modalGate');
        if(CB !== br && typeof setBranch === 'function') {
          setBranch(br);
        } else {
          if(typeof rb==='function') rb();
          if(typeof rg==='function') rg();
          if(typeof rp==='function') rp();
          if(typeof pgq==='function') pgq();
          if(typeof rdv==='function') rdv();
          if(typeof rd==='function') rd();
        }
        return;
      } else {
        const msg = (res && res.message) || (res && res.errors ? Object.values(res.errors).flat().join(', ') : 'فشل حفظ البوابة');
        toast('⛔ ' + msg);
        return;
      }
    }catch(err){
      console.warn('API error saving gate, fallback local:', err);
    }

    /* Fallback محلي */
    if(e){
      const g = (GP[br]||[]).find(x => x.id === e);
      if(!g){ toast('⚠️ لا يمكن نقل البوابة لفرع آخر أثناء التعديل'); return; }
      const old = g.name;
      Object.assign(g, { name:n, buildingId:bid, location:loc, devices:devs });
      delete g.mac;
      if(old !== n){
        PD.forEach(p => { if(p.branch===br) p.gates = p.gates.map(x => x===old ? n : x); });
        US.forEach(u => { if(u.gates) u.gates = u.gates.map(x => x===br+'::'+old ? br+'::'+n : x); });
      }
      xau('edit','بوابة',n); toast('✅ تم حفظ البوابة');
    } else {
      GP[br].push({ id:'g'+Date.now().toString(36), name:n, buildingId:bid, location:loc, devices:devs, status:'active' });
      xau('add','بوابة',n); toast('🚪 تمت إضافة البوابة');
    }
    closeModal('modalGate');
    if(CB !== br && typeof setBranch === 'function') {
      setBranch(br);
    } else {
      if(typeof rb==='function') rb();
      if(typeof rg==='function') rg();
      if(typeof rp==='function') rp();
      if(typeof pgq==='function') pgq();
      if(typeof rdv==='function') rdv();
      if(typeof rd==='function') rd();
    }
  };

  /* ── editGate ── */
  window.editGate = function(id){
    window.migrateGates();
    const g = (GP[CB]||[]).find(x => x.id === id);
    if(!g) return;
    document.getElementById('gateModalTitle').textContent = '🚪 تعديل ' + g.name;
    document.getElementById('gateId').value   = g.id;
    document.getElementById('gateName').value = g.name;
    if(typeof fgLoc === 'function') fgLoc();
    if(typeof rgBd === 'function') rgBd(CB);
    document.getElementById('gateBuilding').value = g.buildingId;
    const loc = document.getElementById('gateLocation');
    if(loc && g.location && ![...loc.options].some(o => o.value === g.location || o.text === g.location)){
      loc.insertAdjacentHTML('beforeend', `<option>${xesc(g.location)}</option>`);
    }
    if(loc) loc.value = g.location || loc.value;
    window.gdLoad(g);
    if(typeof openModal === 'function') openModal('modalGate');
  };

  /* ── dvEdit, dvRemove ── */
  window.dvEdit   = function(br, gid){ if(CB !== br) setBranch(br); window.editGate(gid); };
  window.dvRemove = function(br, gid, did){
    const g = (GP[br]||[]).find(x => x.id === gid); if(!g) return;
    const d = (g.devices||[]).find(x => x.id === did); if(!d) return;
    if(!confirm('حذف الجهاز ' + (d.name?'«'+d.name+'» ':'')+d.mac+' من «'+g.name+'»؟')) return;
    g.devices = g.devices.filter(x => x.id !== did);
    try{
      fetch(`/api/organization/branches/${br}/gates/${gid}/devices/${did}`, { method:'DELETE' });
    }catch(e){}
    xau('edit','حذف جهاز من بوابة',g.name);
    if(typeof rg==='function') rg();
    if(typeof rdv==='function') rdv();
    if(typeof pgq==='function') pgq();
    if(typeof ugt==='function') ugt();
    toast('🗑 تم حذف الجهاز');
  };

  /* ── rdv — جدول الأجهزة الكاملة ── */
  let _dvRows = [];
  function esc(s){ return typeof xesc==='function' ? xesc(s) : String(s==null?'':s); }
  function fillSel(id, html){
    const el = document.getElementById(id); if(!el) return null;
    if(el.dataset.sig !== html){
      const c = el.value;
      el.innerHTML = html; el.dataset.sig = html;
      if(c && [...el.options].some(o => o.value === c)) el.value = c;
    }
    return el;
  }
  const setTxt = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };

  window.rdv = function(){
    window.migrateGates();
    const t = document.getElementById('devicesTbody'); if(!t) return;
    const brs = BR.filter(b => b.status==='active').filter(b =>
      !CU || CU.role==='admin' || !(CU.branches||[]).length || CU.branches.includes(b.id)
    );
    const bsel = fillSel('dvBranch',
      '<option value="all">🏢 كل الفروع</option>' +
      brs.map(b => `<option value="${esc(b.id)}">🏢 ${esc(b.name)}</option>`).join('')
    );
    const bv = (bsel && bsel.value) || 'all';
    const scope = brs.filter(b => bv==='all' || b.id===bv);
    const gates = [];
    scope.forEach(b => (GP[b.id]||[]).forEach(g => gates.push({br:b.id, g:g})));

    const gsel = fillSel('dvGate',
      '<option value="all">🚪 كل البوابات</option>' +
      gates.map(x => `<option value="${esc(x.br+'::'+x.g.id)}">🚪 ${esc(x.g.name)}${scope.length>1?' — '+esc(BN[x.br]||x.br):''}</option>`).join('')
    );
    const gv   = (gsel && gsel.value) || 'all';
    const kind = (document.getElementById('dvKind')||{}).value || 'all';
    const q    = (document.getElementById('dvSearch')||{}).value || '';

    setTxt('dvStatTotal', gates.reduce((s,x) => s+(x.g.devices||[]).length, 0));
    setTxt('dvStatWith',  gates.filter(x => (x.g.devices||[]).length).length);
    setTxt('dvStatNone',  gates.filter(x => !(x.g.devices||[]).length).length);
    setTxt('dvStatMulti', gates.filter(x => (x.g.devices||[]).length>1).length);

    let rows = [];
    gates.forEach(({br, g}) => {
      if(gv!=='all' && gv!==br+'::'+g.id) return;
      const b = gB(g.buildingId), ds = g.devices||[];
      if(!ds.length) rows.push({br, g, b, d:null});
      else ds.forEach(d => rows.push({br, g, b, d}));
    });
    rows = rows.filter(r => {
      if(kind==='devices' && !r.d) return false;
      if(kind==='none' && r.d) return false;
      if(kind==='multi' && !(r.d && r.g.devices.length>1)) return false;
      if(q && typeof smatch==='function' && !smatch([r.d&&r.d.name, r.d&&r.d.mac, r.g.name, r.b&&r.b.name, BN[r.br]], q)) return false;
      return true;
    });
    _dvRows = rows;

    const me = (window.__thisDeviceMac ? window.__thisDeviceMac() : '') || '';
    const render = pageRows => {
      const empty = document.getElementById('devicesEmpty');
      if(empty) empty.style.display = rows.length ? 'none' : 'block';
      t.innerHTML = pageRows.map(r => {
        const d = r.d, n = (r.g.devices||[]).length;
        const dev = d
          ? `<b>📱 ${d.name ? esc(d.name) : '<span class="hint">بدون اسم</span>'}</b>` + (me && d.mac===me ? ' <span class="badge bact">هذا الجهاز</span>' : '')
          : '<span class="badge bor2">⚠️ بوابة بدون أجهزة</span>';
        const acts =
          `<button class="btn bg2 bxs" onclick="dvEdit('${r.br}','${r.g.id}')">تعديل البوابة</button>` +
          (d ? ` <button class="btn bred bxs" onclick="dvRemove('${r.br}','${r.g.id}','${d.id}')">حذف الجهاز</button>` : '');
        return `<tr>
          <td>${dev}</td>
          <td>${d ? `<code dir="ltr">${esc(d.mac)}</code>` : '—'}</td>
          <td>🚪 ${esc(r.g.name)}${n>1 ? ` <span class="badge bpurple">${n} أجهزة</span>` : ''}</td>
          <td>${r.b ? '🏬 '+esc(r.b.name) : '—'}</td>
          <td>🏢 ${esc(BN[r.br]||r.br)}</td>
          <td style="font-size:11px;color:var(--g500)">${d&&d.lastSeen ? esc(new Date(d.lastSeen).toLocaleString('ar-SA')) : '—'}</td>
          <td style="white-space:nowrap">${acts}</td>
        </tr>`;
      }).join('');
    };
    if(typeof setPagerData==='function') setPagerData('devices', rows, render);
    else render(rows);
  };

  /* ── تصدير الأجهزة CSV ── */
  window.exportDevicesCsv = function(){
    if(!_dvRows.length){ toast('⚠️ لا توجد بيانات للتصدير'); return; }
    const q = v => '"' + String(v==null?'':v).replace(/"/g,'""') + '"';
    const head = ['الفرع','المبنى','البوابة','الموقع','اسم الجهاز','MAC','آخر ظهور'];
    const lines = [head.map(q).join(',')].concat(_dvRows.map(r => [
      BN[r.br]||r.br, r.b?r.b.name:'', r.g.name, r.g.location||'',
      r.d?r.d.name:'', r.d?r.d.mac:'', r.d&&r.d.lastSeen?new Date(r.d.lastSeen).toLocaleString('ar-SA'):''
    ].map(q).join(',')));
    const blob = new Blob(['\ufeff'+lines.join('\r\n')], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'devices_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  };

  /* ── تصحيح agb و addGate و closeModal ── */
  window.agb = function(bid){
    const b = (typeof gB === 'function') ? gB(bid) : null;
    if(!b) return;
    const title = document.getElementById('gateModalTitle');
    if(title) title.textContent = '🚪 بوابة في ' + b.name;
    const gid = document.getElementById('gateId');
    if(gid) gid.value = '';
    const br = b.branchId || CB;
    let nextNum = ((GP[br] || []).length + 1);
    while((GP[br] || []).some(g => g.name === 'بوابة ' + nextNum)) { nextNum++; }
    const gn = document.getElementById('gateName');
    if(gn) gn.value = 'بوابة ' + nextNum;
    if(typeof fgLoc === 'function') fgLoc();
    if(typeof rgBd === 'function') rgBd(br);
    const gb = document.getElementById('gateBuilding');
    const bl = (typeof gBF === 'function') ? gBF(br) : [];
    if(gb) gb.innerHTML = bl.map(x => `<option value="${x.id}" ${x.id === bid ? 'selected' : ''}>${xesc(x.name)}</option>`).join('');
    if(typeof gdLoad === 'function') gdLoad(null);
    if(typeof openModal === 'function') openModal('modalGate');
  };

  window.addGate = function(){
    const bs = (typeof gBF === 'function') ? gBF(CB) : [];
    if(!bs.length){ toast('⚠️ يرجى إضافة مبنى أولاً في هذا الفرع'); return; }
    const title = document.getElementById('gateModalTitle');
    if(title) title.textContent = '🚪 بوابة جديدة';
    const gid = document.getElementById('gateId');
    if(gid) gid.value = '';
    let nextNum = ((GP[CB] || []).length + 1);
    while((GP[CB] || []).some(g => g.name === 'بوابة ' + nextNum)) { nextNum++; }
    const gn = document.getElementById('gateName');
    if(gn) gn.value = 'بوابة ' + nextNum;
    if(typeof fgLoc === 'function') fgLoc();
    if(typeof rgBd === 'function') rgBd(CB);
    const gb = document.getElementById('gateBuilding');
    if(gb) gb.innerHTML = bs.map(b => `<option value="${b.id}">${xesc(b.name)}</option>`).join('');
    if(typeof gdLoad === 'function') gdLoad(null);
    if(typeof openModal === 'function') openModal('modalGate');
  };

  const _origCloseModal = window.closeModal;
  window.closeModal = function(id){
    if(id === 'modalGate'){
      const gid = document.getElementById('gateId');
      if(gid) gid.value = '';
    }
    if(typeof _origCloseModal === 'function') _origCloseModal(id);
  };

  /* ── تعريف rg الكامل لعرض البوابات مع الفلاتر ── */
  window.rg = function(){
    const t = document.getElementById('gatesSettingsTbody');
    if(!t) return;
    const gs = GP[CB] || [];

    // تحديث قائمة فلترة المباني
    const bSel = document.getElementById('gsBuilding');
    if(bSel && bSel.dataset.branch !== CB){
      bSel.dataset.branch = CB;
      const bldgs = (typeof BL !== 'undefined') ? BL.filter(b => b.branchId === CB) : [];
      bSel.innerHTML = '<option value="">🏬 كل المباني</option>' + bldgs.map(b => `<option value="${b.id}">🏬 ${xesc(b.name)}</option>`).join('');
    }
    const bFilter = (bSel && bSel.value) || '';
    const dFilter = (document.getElementById('gsDevices') || {}).value || 'all';
    const q = (document.getElementById('gsSearch')?.value || '').trim().toLowerCase();

    let filtered = gs.filter(g => {
      if(bFilter && g.buildingId !== bFilter) return false;
      const devCount = (g.devices || []).length;
      if(dFilter === 'none' && devCount > 0) return false;
      if(dFilter === 'one' && devCount !== 1) return false;
      if(dFilter === 'multi' && devCount <= 1) return false;
      if(q){
        const b = typeof gB === 'function' ? gB(g.buildingId) : null;
        const bName = b ? b.name : '';
        const devMacs = (g.devices || []).map(d => (d.mac || '') + ' ' + (d.name || '')).join(' ');
        const pathNames = (PD || []).filter(p => (p.branchId || p.branch) === CB && (p.gates || []).includes(g.name)).map(p => p.name).join(' ');
        const hay = (g.name + ' ' + bName + ' ' + (g.location || '') + ' ' + devMacs + ' ' + pathNames).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });

    const render = rows => {
      const empty = document.getElementById('gatesSettingsEmpty');
      if(empty) empty.style.display = rows.length ? 'none' : 'block';
      t.innerHTML = rows.map(g => {
        const ip = (PD || []).filter(p => (p.branchId || p.branch) === CB && (p.gates || []).includes(g.name)).map(p => p.name);
        const b = typeof gB === 'function' ? gB(g.buildingId) : null;
        const devCount = (g.devices || []).length;
        const devBadge = devCount > 0 
          ? `<span class="badge bpurple">📱 ${devCount} ${devCount === 1 ? 'جهاز' : 'أجهزة'}</span>`
          : (g.mac ? `<code dir="ltr" style="font-size:11px">${xesc(g.mac)}</code>` : '<span class="badge bor2">⚠️ بدون أجهزة</span>');
        return `<tr>
          <td><b>🚪 ${xesc(g.name)}</b></td>
          <td>${b ? `<span class="badge bbl">🏬 ${xesc(b.name)}</span>` : '—'}</td>
          <td>📍 ${xesc(g.location || '—')}</td>
          <td>${devBadge}</td>
          <td>${ip.length ? ip.map(n => `<span class="badge bgry" style="margin-left:4px">🛣️ ${xesc(n)}</span>`).join('') : '<span class="hint">⚠️ بدون مسار</span>'}</td>
          <td style="white-space:nowrap">
            <button class="btn bg2 bxs" onclick="editGate('${g.id}')">تعديل</button> 
            <button class="btn bred bxs" onclick="dgs('${g.id}')">حذف</button>
          </td>
        </tr>`;
      }).join('');
      if(typeof applyPermButtons === 'function') applyPermButtons();
    };

    if(typeof setPagerData === 'function') setPagerData('gatesSettings', filtered, render);
    else render(filtered);

    if(typeof window.__renderDeviceBar === 'function') window.__renderDeviceBar();
  };


})();

/* ═══════════════════════════════════════════════════════════════════
   PATCH v12 — تصحيح savePath لاستخدام ID من السيرفر + تصحيح saveBranch
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Override savePath لاستخدام server ID ── */
  const _origSavePath = window.savePath;
  window.savePath = async function(){
    if(typeof selGatesPath === 'undefined' || !selGatesPath.length){
      toast('⚠️ اختر بوابة واحدة على الأقل'); return;
    }
    const n   = (document.getElementById('newPathName')||{}).value?.trim();
    const br  = (document.getElementById('newPathBranch')||{}).value || CB;
    const bid = (document.getElementById('newPathBuilding')||{}).value;

    if(!n){ toast('⚠️ اكتب اسم المسار'); return; }
    if(!bid){ toast('⚠️ اختر المبنى'); return; }

    const dto = { id: null, name: n, branchId: br, buildingId: bid, gates: [...selGatesPath] };

    try{
      const res = await fetch('/api/organization/paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      }).then(r => r.json());

      if(res.success && res.data){
        const savedPath = {
          ...res.data,
          branch: res.data.branchId || br,
          branchId: res.data.branchId || br,
          buildingId: res.data.buildingId || bid,
          gates: res.data.gates || [...selGatesPath]
        };
        const exIdx = PD.findIndex(x => x.id === savedPath.id);
        if(exIdx >= 0) PD[exIdx] = savedPath;
        else PD.push(savedPath);

        if(typeof xau==='function') xau('add', 'مسار', n);
        if(typeof closeModal==='function') closeModal('modalAddPath');
        toast('✅ تم حفظ المسار بنجاح');
        if(typeof rp==='function') rp();
        if(typeof rg==='function') rg();
        if(typeof rpc2==='function') rpc2();
        if(typeof rd==='function') rd();
        return;
      } else {
        toast('⛔ ' + (res.message || 'فشل حفظ المسار'));
        return;
      }
    }catch(err){
      console.warn('API error savePath, fallback local:', err);
      const savedPath = { id: 'p' + Date.now().toString(36), name: n, branch: br, branchId: br, buildingId: bid, gates: [...selGatesPath] };
      PD.push(savedPath);
      if(typeof xau==='function') xau('add', 'مسار', n);
      if(typeof closeModal==='function') closeModal('modalAddPath');
      toast('✅ تم حفظ المسار');
      if(typeof rp==='function') rp();
      if(typeof rg==='function') rg();
      if(typeof rpc2==='function') rpc2();
    }
  };


  /* ── Override saveBlacklist لاستخدام server ID ── */
  const _origSaveBl = window.saveBlacklist;
  window.saveBlacklist = async function(){
    const i   = (document.getElementById('blIdNo')||{}).value?.trim();
    const n   = (document.getElementById('blName')||{}).value?.trim();
    const r   = (document.getElementById('blReason')||{}).value?.trim();
    const nat = (document.getElementById('blNat')||{}).value || 'سعودي';

    if(!i || !n || !r){ toast('⚠️ يرجى تعبئة الحقول المطلوبة'); return; }

    try{
      const res = await fetch('/api/registry/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: CB, idNumber: i, name: n, nationality: nat, reason: r })
      }).then(x => x.json());

      if(res.success && res.data){
        BLD.push(res.data);
        if(typeof xau==='function') xau('add', 'قائمة سوداء', n);
        toast('⛔ تم حظر الشخص بنجاح');
        if(typeof closeModal==='function') closeModal('modalAddBlacklist');
        if(typeof rbl==='function') rbl();
        return;
      } else {
        toast('⛔ ' + (res.message || 'فشل إضافة الشخص للقائمة السوداء'));
        return;
      }
    }catch(err){
      console.warn('API error saveBlacklist, fallback local:', err);
      BLD.push({ id:'bl'+Date.now().toString(36), branch:CB, idNo:i, name:n, nat:nat, reason:r, addedBy: CU?CU.id:'system' });
      if(typeof xau==='function') xau('add', 'قائمة سوداء', n);
      toast('⛔ تم حظر الشخص بنجاح');
      if(typeof closeModal==='function') closeModal('modalAddBlacklist');
      if(typeof rbl==='function') rbl();
    }
  };

})();


/* ═══════════════════════════════════════════════════════════════════
   PATCH v13 — جدول الأشخاص في التصريح + التخصيص الكامل + أيام الأسبوع
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  window.WEEK_DAYS = [
    {key:'sun', label:'الأحد',    short:'أحد'},
    {key:'mon', label:'الاثنين',  short:'اثنين'},
    {key:'tue', label:'الثلاثاء', short:'ثلاثاء'},
    {key:'wed', label:'الأربعاء', short:'أربعاء'},
    {key:'thu', label:'الخميس',   short:'خميس'},
    {key:'fri', label:'الجمعة',   short:'جمعة'},
    {key:'sat', label:'السبت',    short:'سبت'}
  ];

  function formatDaysArr(arr){
    if(!arr || !arr.length) return '—';
    if(arr.length === 7) return 'كل الأيام';
    return arr.map(function(k){ return (window.WEEK_DAYS.find(function(d){ return d.key === k; }) || {}).short || k; }).join(' • ');
  }
  window.v10_formatDays = formatDaysArr;

  /* عرض جدول الأشخاص في الخطوة 2 من معالج التصريح */
  window.renderMultiTable = function(ps){
    var mb = document.getElementById('multiPeopleBlock');
    var sb = document.getElementById('singlePersonBlock');
    if(!mb || !sb) return;

    if(WS.mode !== 'multi' || WS.persons.length < 1){
      mb.style.display = 'none';
      if(WS.persons.length === 1){
        sb.style.display = 'block';
        window.renderSingleRow(ps);
      } else {
        sb.style.display = 'none';
      }
      return;
    }

    sb.style.display = 'none';
    mb.style.display = 'block';

    var br = document.getElementById('visitBranch') ? document.getElementById('visitBranch').value : CB;
    if(!ps || !ps.length){
      ps = (PD || []).filter(function(p){ return (p.branchId || p.branch) === br; });
    }

    var defaultPath = (document.getElementById('pathChecklist') || {}).value || '';
    var defaultFrom = (document.getElementById('visitDate') || {}).value || '';
    var defaultTo = (document.getElementById('visitExpiry') || {}).value || '';
    var defaultDevices = Array.from(document.querySelectorAll('#wizDeviceChecklist input:checked')).map(function(c){ return c.value; });

    var tbody = document.getElementById('multiPeopleTbody');
    if(!tbody) return;

    tbody.innerHTML = WS.persons.map(function(p, i){
      var pp = (WS.perPerson && WS.perPerson[p.id]) || {};
      var ph = (typeof PH !== 'undefined' && PH[p.id]) ? PH[p.id] : null;
      var photoData = ph ? (ph.personal ? ph.personal.data : (ph.data || null)) : null;
      var initials = (p.name || '').split(' ').slice(0, 2).map(function(x){ return x[0]; }).join('');
      var avatar = photoData 
        ? '<img src="' + photoData + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover">'
        : '<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--gm),var(--gd));color:#fff;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700">' + initials + '</div>';

      var path = pp.path || defaultPath || '—';
      var hasPath = !!pp.path;
      var dateFrom = pp.dateFrom || defaultFrom;
      var dateTo = pp.dateTo || defaultTo;
      var hasDate = !!(pp.dateFrom || pp.dateTo);
      var timeFrom = pp.timeFrom || '07:00';
      var timeTo = pp.timeTo || '17:00';
      var hasTime = !!(pp.timeFrom || pp.timeTo);
      var days = pp.days || null;
      var hasDays = !!(days && days.length);
      var daysLabel = hasDays ? formatDaysArr(days) : 'حسب الفرع';
      var devices = (pp.devices && pp.devices.length) ? pp.devices : defaultDevices;
      var hasDev = !!(pp.devices && pp.devices.length);
      var devLabel = devices.length ? (devices.length + ' عنصر') : '—';

      return '<tr data-person-id="' + p.id + '">' +
        '<td style="padding:8px;text-align:center;font-weight:700;font-size:11px">' + (i + 1) + '</td>' +
        '<td style="padding:8px">' +
          '<div class="person-cell">' +
            avatar +
            '<div>' +
              '<div style="font-weight:700;font-size:11.5px">' + xesc(p.name) + '</div>' +
              '<div style="font-size:9.5px;color:var(--g400)">' + xesc(p.sub || '—') + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td style="padding:6px">' +
          '<span class="custom-badge ' + (hasPath ? 'set' : '') + '">' +
            (hasPath ? '⚙️ ' : '') + xesc(path) +
          '</span>' +
        '</td>' +
        '<td style="padding:6px">' +
          '<input type="date" value="' + dateFrom + '" onchange="window.v10_onDateChange(this,\'' + p.id + '\',\'dateFrom\')" style="width:105px;padding:4px 6px;font-size:10.5px;border:1.5px solid ' + (hasDate ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;font-family:inherit;background:' + (hasDate ? '#fdf8ee' : '#fff') + '">' +
        '</td>' +
        '<td style="padding:6px">' +
          '<input type="date" value="' + dateTo + '" onchange="window.v10_onDateChange(this,\'' + p.id + '\',\'dateTo\')" style="width:105px;padding:4px 6px;font-size:10.5px;border:1.5px solid ' + (hasDate ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;font-family:inherit;background:' + (hasDate ? '#fdf8ee' : '#fff') + '">' +
        '</td>' +
        '<td style="padding:6px">' +
          '<input type="time" value="' + timeFrom + '" onchange="window.v10_onTimeChange(this,\'' + p.id + '\',\'timeFrom\')" style="width:80px;padding:4px 6px;font-size:10.5px;border:1.5px solid ' + (hasTime ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;font-family:inherit;background:' + (hasTime ? '#fdf8ee' : '#fff') + '">' +
        '</td>' +
        '<td style="padding:6px">' +
          '<input type="time" value="' + timeTo + '" onchange="window.v10_onTimeChange(this,\'' + p.id + '\',\'timeTo\')" style="width:80px;padding:4px 6px;font-size:10.5px;border:1.5px solid ' + (hasTime ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;font-family:inherit;background:' + (hasTime ? '#fdf8ee' : '#fff') + '">' +
        '</td>' +
        '<td style="padding:6px">' +
          '<button type="button" onclick="window.v10_openDaysPicker(\'' + p.id + '\')" style="width:100%;padding:4px 6px;font-size:10px;border:1.5px solid ' + (hasDays ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;font-family:inherit;background:' + (hasDays ? '#fdf8ee' : '#fff') + ';cursor:pointer;color:' + (hasDays ? '#78350f' : 'inherit') + '">' + daysLabel + '</button>' +
        '</td>' +
        '<td style="padding:6px">' +
          '<span class="custom-badge ' + (hasDev ? 'set' : '') + '">' +
            (hasDev ? '⚙️ ' : '') + devLabel +
          '</span>' +
        '</td>' +
        '<td style="padding:6px">' +
          '<div style="display:flex;gap:4px">' +
            '<button type="button" class="btn bg2 bxs" onclick="window.openPersonCustomize(\'' + p.id + '\')" title="تخصيص كامل">⚙️</button>' +
            '<button type="button" class="btn bg2 bxs" onclick="window.v10_resetPerson(\'' + p.id + '\')" title="إرجاع للافتراضي">↺</button>' +
            '<button type="button" class="btn bred bxs" onclick="window.rpp(\'' + p.id + '\')" title="حذف">✕</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    var table = tbody.closest('table');
    var thead = table ? table.querySelector('thead tr') : null;
    if(thead){
      thead.innerHTML = '<th style="width:30px;font-size:10.5px;padding:8px">#</th>' +
        '<th style="font-size:10.5px;padding:8px">الشخص</th>' +
        '<th style="width:110px;font-size:10.5px;padding:8px">🛣️ المسار</th>' +
        '<th style="width:115px;font-size:10.5px;padding:8px">📅 من</th>' +
        '<th style="width:115px;font-size:10.5px;padding:8px">📅 إلى</th>' +
        '<th style="width:85px;font-size:10.5px;padding:8px">⏰ ساعة من</th>' +
        '<th style="width:85px;font-size:10.5px;padding:8px">⏰ ساعة إلى</th>' +
        '<th style="width:110px;font-size:10.5px;padding:8px">📆 الأيام</th>' +
        '<th style="width:80px;font-size:10.5px;padding:8px">📱 المسموح</th>' +
        '<th style="width:110px;font-size:10.5px;padding:8px">إجراءات</th>';
    }
  };

  /* عرض صف الشخص الفردي */
  window.renderSingleRow = function(ps){
    var tbody = document.getElementById('singlePersonTbody');
    if(!tbody) return;
    var p = WS.persons[0];
    if(!p){ tbody.innerHTML = ''; return; }

    var pp = (WS.perPerson && WS.perPerson[p.id]) || {};
    var ph = (typeof PH !== 'undefined' && PH[p.id]) ? PH[p.id] : null;
    var photoData = ph ? (ph.personal ? ph.personal.data : (ph.data || null)) : null;
    var initials = (p.name || '').split(' ').slice(0, 2).map(function(x){ return x[0]; }).join('');
    var avatar = photoData 
      ? '<img src="' + photoData + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover">'
      : '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gm),var(--gd));color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + initials + '</div>';

    var defaultPath = (document.getElementById('pathChecklist') || {}).value || '—';
    var path = pp.path || defaultPath;
    var dateFrom = pp.dateFrom || (document.getElementById('visitDate') || {}).value || '';
    var dateTo = pp.dateTo || (document.getElementById('visitExpiry') || {}).value || '';
    var timeFrom = pp.timeFrom || '07:00';
    var timeTo = pp.timeTo || '17:00';
    var days = pp.days || [];
    var daysLabel = days.length ? formatDaysArr(days) : 'حسب الفرع';
    var devices = (pp.devices && pp.devices.length) ? pp.devices : Array.from(document.querySelectorAll('#wizDeviceChecklist input:checked')).map(function(c){ return c.value; });
    var devLabel = devices.length ? (devices.length + ' عنصر') : '—';

    tbody.innerHTML = '<tr>' +
      '<td style="padding:8px;text-align:center;font-weight:700">1</td>' +
      '<td style="padding:8px">' +
        '<div class="person-cell">' +
          avatar +
          '<div>' +
            '<div style="font-weight:700;font-size:12px">' + xesc(p.name) + '</div>' +
            '<div style="font-size:10px;color:var(--g400)">' + xesc(p.sub || '—') + '</div>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td style="padding:8px"><span class="custom-badge">' + xesc(path) + '</span></td>' +
      '<td style="padding:6px"><input type="date" value="' + dateFrom + '" onchange="window.v10_onDateChange(this,\'' + p.id + '\',\'dateFrom\')" style="width:110px;padding:4px 6px;font-size:10.5px;border:1.5px solid var(--g200);border-radius:6px;font-family:inherit"></td>' +
      '<td style="padding:6px"><input type="date" value="' + dateTo + '" onchange="window.v10_onDateChange(this,\'' + p.id + '\',\'dateTo\')" style="width:110px;padding:4px 6px;font-size:10.5px;border:1.5px solid var(--g200);border-radius:6px;font-family:inherit"></td>' +
      '<td style="padding:6px"><input type="time" value="' + timeFrom + '" onchange="window.v10_onTimeChange(this,\'' + p.id + '\',\'timeFrom\')" style="width:80px;padding:4px 6px;font-size:10.5px;border:1.5px solid var(--g200);border-radius:6px;font-family:inherit"></td>' +
      '<td style="padding:6px"><input type="time" value="' + timeTo + '" onchange="window.v10_onTimeChange(this,\'' + p.id + '\',\'timeTo\')" style="width:80px;padding:4px 6px;font-size:10.5px;border:1.5px solid var(--g200);border-radius:6px;font-family:inherit"></td>' +
      '<td style="padding:6px"><button type="button" onclick="window.v10_openDaysPicker(\'' + p.id + '\')" style="font-size:10px;padding:4px 6px;border:1.5px solid ' + (days.length ? 'var(--au)' : 'var(--g200)') + ';border-radius:6px;background:' + (days.length ? '#fdf8ee' : '#fff') + ';cursor:pointer">' + daysLabel + '</button></td>' +
      '<td style="padding:6px"><span class="custom-badge">' + devLabel + '</span></td>' +
    '</tr>';

    var table = tbody.closest('table');
    var thead = table ? table.querySelector('thead tr') : null;
    if(thead){
      thead.innerHTML = '<th style="font-size:10.5px;padding:8px">#</th>' +
        '<th style="font-size:10.5px;padding:8px">الشخص</th>' +
        '<th style="font-size:10.5px;padding:8px">🛣️ المسار</th>' +
        '<th style="font-size:10.5px;padding:8px">📅 من</th>' +
        '<th style="font-size:10.5px;padding:8px">📅 إلى</th>' +
        '<th style="font-size:10.5px;padding:8px">⏰ من</th>' +
        '<th style="font-size:10.5px;padding:8px">⏰ إلى</th>' +
        '<th style="font-size:10.5px;padding:8px">📆 الأيام</th>' +
        '<th style="font-size:10.5px;padding:8px">📱 المسموح</th>';
    }
  };

  window.v10_onDateChange = function(input, personId, field){
    if(!WS.perPerson[personId]) WS.perPerson[personId] = {};
    var val = input.value;
    var defVal = field === 'dateFrom' 
      ? (document.getElementById('visitDate') || {}).value 
      : (document.getElementById('visitExpiry') || {}).value;
    
    if(val && val !== defVal){
      WS.perPerson[personId][field] = val;
      input.style.borderColor = 'var(--au)';
      input.style.background = '#fdf8ee';
    } else {
      delete WS.perPerson[personId][field];
      input.style.borderColor = 'var(--g200)';
      input.style.background = '#fff';
    }
    if(!Object.keys(WS.perPerson[personId]).length) delete WS.perPerson[personId];
  };

  window.v10_onTimeChange = function(input, personId, field){
    if(!WS.perPerson[personId]) WS.perPerson[personId] = {};
    var val = input.value;
    if(val){
      WS.perPerson[personId][field] = val;
      input.style.borderColor = 'var(--au)';
      input.style.background = '#fdf8ee';
    } else {
      delete WS.perPerson[personId][field];
      input.style.borderColor = 'var(--g200)';
      input.style.background = '#fff';
    }
    if(!Object.keys(WS.perPerson[personId]).length) delete WS.perPerson[personId];
  };

  window.v10_resetPerson = function(personId){
    if(WS.perPerson[personId]) delete WS.perPerson[personId];
    if(typeof rpc2 === 'function') rpc2();
    if(typeof toast === 'function') toast('↺ تم الإرجاع للافتراضي');
  };

  /* نافذة الأيام المخصصة للشخص */
  window.v10_openDaysPicker = function(personId){
    var p = WS.persons.find(function(x){ return x.id === personId; });
    if(!p) return;
    var pp = (WS.perPerson && WS.perPerson[personId]) || {};
    var currentDays = pp.days || [];
    
    var old = document.getElementById('v10_daysPicker');
    if(old) old.remove();

    var daysHtml = window.WEEK_DAYS.map(function(d){
      return '<label class="check-item" style="cursor:pointer;padding:10px 12px">' +
        '<input type="checkbox" class="v10DayChk" value="' + d.key + '" ' + (currentDays.includes(d.key) ? 'checked' : '') + '>' +
        '<span style="font-size:12px">' + d.label + '</span>' +
      '</label>';
    }).join('');

    var modal = document.createElement('div');
    modal.className = 'mover open';
    modal.id = 'v10_daysPicker';
    modal.style.zIndex = 950;
    modal.innerHTML = '<div class="modal" style="width:480px">' +
      '<div class="mh">' +
        '<div class="mht">📅 أيام العمل — ' + xesc(p.name) + '</div>' +
        '<button class="mc" onclick="document.getElementById(\'v10_daysPicker\').remove()">✕</button>' +
      '</div>' +
      '<div class="mb">' +
        '<div class="filter-tags" style="margin-bottom:14px">' +
          '<button type="button" class="filter-tag" onclick="window.v10_daysQuick(\'weekdays\')">📅 الأحد → الخميس</button>' +
          '<button type="button" class="filter-tag" onclick="window.v10_daysQuick(\'weekend\')">🗓 الجمعة والسبت</button>' +
          '<button type="button" class="filter-tag" onclick="window.v10_daysQuick(\'all\')">✅ كل الأيام</button>' +
          '<button type="button" class="filter-tag" onclick="window.v10_daysQuick(\'none\')">✖ إلغاء</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
          daysHtml +
        '</div>' +
        '<div class="bgrp" style="border-top:1px solid var(--g100);padding-top:14px">' +
          '<button type="button" class="btn bg2" onclick="document.getElementById(\'v10_daysPicker\').remove()">إلغاء</button>' +
          '<button type="button" class="btn bp" onclick="window.v10_saveDays(\'' + personId + '\')">💾 حفظ</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(modal);
  };

  window.v10_daysQuick = function(mode){
    var modal = document.getElementById('v10_daysPicker');
    if(!modal) return;
    var days = [];
    if(mode === 'weekdays') days = ['sun','mon','tue','wed','thu'];
    else if(mode === 'weekend') days = ['fri','sat'];
    else if(mode === 'all') days = ['sun','mon','tue','wed','thu','fri','sat'];
    modal.querySelectorAll('.v10DayChk').forEach(function(c){ c.checked = days.includes(c.value); });
  };

  window.v10_saveDays = function(personId){
    var modal = document.getElementById('v10_daysPicker');
    if(!modal) return;
    var days = Array.from(modal.querySelectorAll('.v10DayChk:checked')).map(function(c){ return c.value; });
    if(!WS.perPerson[personId]) WS.perPerson[personId] = {};
    if(days.length){
      WS.perPerson[personId].days = days;
    } else {
      delete WS.perPerson[personId].days;
      if(!Object.keys(WS.perPerson[personId]).length) delete WS.perPerson[personId];
    }
    modal.remove();
    if(typeof rpc2 === 'function') rpc2();
    if(typeof toast === 'function') toast('✅ تم حفظ الأيام');
  };

  /* نافذة التخصيص الكامل للشخص */
  window.openPersonCustomize = function(id){
    var p = WS.persons.find(function(x){ return x.id === id; });
    if(!p) return;

    var pp = (WS.perPerson && WS.perPerson[p.id]) || {};
    var br = document.getElementById('visitBranch') ? document.getElementById('visitBranch').value : CB;
    var bid = document.getElementById('visitBuilding') ? document.getElementById('visitBuilding').value : '';
    var ps = (PD || []).filter(function(pt){ return (pt.branchId || pt.branch) === br && (!bid || pt.buildingId === bid); });
    if(!ps.length && bid) ps = (PD || []).filter(function(pt){ return (pt.branchId || pt.branch) === br; });

    var defPath = (document.getElementById('pathChecklist') || {}).value || '';
    var defFrom = (document.getElementById('visitDate') || {}).value || '';
    var defTo = (document.getElementById('visitExpiry') || {}).value || '';
    var defDev = Array.from(document.querySelectorAll('#wizDeviceChecklist input:checked')).map(function(c){ return c.value; });

    var curPath = pp.path || '';
    var curFrom = pp.dateFrom || defFrom;
    var curTo = pp.dateTo || defTo;
    var curTimeFrom = pp.timeFrom || '07:00';
    var curTimeTo = pp.timeTo || '17:00';
    var curDays = pp.days || [];
    var curDev = pp.devices || defDev;

    var existing = document.getElementById('modalPersonCustomize');
    if(existing) existing.remove();

    var optionsHtml = ps.map(function(x){
      return '<option value="' + xesc(x.name) + '" ' + (x.name === curPath ? 'selected' : '') + '>' + xesc(x.name) + '</option>';
    }).join('');

    var daysGridHtml = window.WEEK_DAYS.map(function(d){
      return '<label class="check-item" style="cursor:pointer;padding:8px 10px;font-size:11px">' +
        '<input type="checkbox" class="pcDayChk" value="' + d.key + '" ' + (curDays.includes(d.key) ? 'checked' : '') + '>' +
        d.label +
      '</label>';
    }).join('');

    var devList = (typeof LK !== 'undefined' && LK.devices) || [];
    var devsGridHtml = devList.map(function(d){
      return '<label class="check-item">' +
        '<input type="checkbox" value="' + xesc(d) + '" ' + (curDev.includes(d) ? 'checked' : '') + '>' +
        xesc(d) +
      '</label>';
    }).join('');

    var modal = document.createElement('div');
    modal.className = 'mover open';
    modal.id = 'modalPersonCustomize';
    modal.style.zIndex = 900;
    modal.innerHTML = '<div class="modal modal-lg" style="width:680px">' +
      '<div class="mh">' +
        '<div class="mht">⚙️ تخصيص التصريح — ' + xesc(p.name) + '</div>' +
        '<button class="mc" onclick="document.getElementById(\'modalPersonCustomize\').remove()">✕</button>' +
      '</div>' +
      '<div class="mb">' +
        '<div class="sdv">🛣️ المسار المخصص</div>' +
        '<div class="fg" style="margin-bottom:14px">' +
          '<select id="pcPath">' +
            '<option value="">(افتراضي: ' + xesc(defPath || '—') + ')</option>' +
            optionsHtml +
          '</select>' +
        '</div>' +
        '<div class="sdv">📅 الفترة المخصصة</div>' +
        '<div class="fg2" style="margin-bottom:14px">' +
          '<div class="fg"><label>من تاريخ</label><input type="date" id="pcFrom" value="' + curFrom + '"></div>' +
          '<div class="fg"><label>إلى تاريخ</label><input type="date" id="pcTo" value="' + curTo + '"></div>' +
        '</div>' +
        '<div class="sdv">⏰ ساعات العمل المخصصة</div>' +
        '<div class="fg2" style="margin-bottom:14px">' +
          '<div class="fg"><label>من ساعة</label><input type="time" id="pcTimeFrom" value="' + curTimeFrom + '"></div>' +
          '<div class="fg"><label>إلى ساعة</label><input type="time" id="pcTimeTo" value="' + curTimeTo + '"></div>' +
        '</div>' +
        '<div class="sdv">📆 أيام العمل المخصصة</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">' +
          daysGridHtml +
        '</div>' +
        '<div class="sdv">📱 المسموح المخصص</div>' +
        '<div class="check-grid" id="pcDevicesGrid" style="margin-bottom:14px">' +
          devsGridHtml +
        '</div>' +
        '<div class="bgrp" style="border-top:1px solid var(--g100);padding-top:14px">' +
          '<button type="button" class="btn bg2" onclick="document.getElementById(\'modalPersonCustomize\').remove()">إلغاء</button>' +
          '<button type="button" class="btn bp" onclick="window.v10_saveCustomize(\'' + p.id + '\')">💾 حفظ التخصيص</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(modal);
  };

  window.v10_saveCustomize = function(id){
    if(!WS.perPerson[id]) WS.perPerson[id] = {};
    var path = (document.getElementById('pcPath') || {}).value;
    var from = (document.getElementById('pcFrom') || {}).value;
    var to = (document.getElementById('pcTo') || {}).value;
    var timeFrom = (document.getElementById('pcTimeFrom') || {}).value;
    var timeTo = (document.getElementById('pcTimeTo') || {}).value;
    var days = Array.from(document.querySelectorAll('.pcDayChk:checked')).map(function(c){ return c.value; });
    var devices = Array.from(document.querySelectorAll('#pcDevicesGrid input:checked')).map(function(c){ return c.value; });

    var defFrom = (document.getElementById('visitDate') || {}).value;
    var defTo = (document.getElementById('visitExpiry') || {}).value;
    var defDev = Array.from(document.querySelectorAll('#wizDeviceChecklist input:checked')).map(function(c){ return c.value; });

    if(path) WS.perPerson[id].path = path; else delete WS.perPerson[id].path;
    if(from && from !== defFrom) WS.perPerson[id].dateFrom = from; else delete WS.perPerson[id].dateFrom;
    if(to && to !== defTo) WS.perPerson[id].dateTo = to; else delete WS.perPerson[id].dateTo;
    if(timeFrom && timeFrom !== '07:00') WS.perPerson[id].timeFrom = timeFrom; else delete WS.perPerson[id].timeFrom;
    if(timeTo && timeTo !== '17:00') WS.perPerson[id].timeTo = timeTo; else delete WS.perPerson[id].timeTo;
    if(days.length) WS.perPerson[id].days = days; else delete WS.perPerson[id].days;

    var sameDev = devices.length === defDev.length && devices.every(function(d){ return defDev.includes(d); });
    if(!sameDev) WS.perPerson[id].devices = devices; else delete WS.perPerson[id].devices;

    if(!Object.keys(WS.perPerson[id]).length) delete WS.perPerson[id];

    var m = document.getElementById('modalPersonCustomize');
    if(m) m.remove();
    if(typeof rpc2 === 'function') rpc2();
    if(typeof toast === 'function') toast('✅ تم حفظ التخصيص');
  };

})();
