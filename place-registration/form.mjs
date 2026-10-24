import {validateInput} from './model.mjs';
import {addressSelection,resetAddress} from './address.mjs';
import {request,secret,solve} from './api.mjs';
const form=document.querySelector('#registration'),status=document.querySelector('#validation'),submit=document.querySelector('#submit'),check=document.querySelector('#receipt-status'),cancel=document.querySelector('#receipt-cancel'),correct=document.querySelector('#receipt-correct');
let pending=null,receipt=null,busy=false,epoch=0,mode='submit',cancelArmed=false;
const official=location.origin==='https://memonary.kr';
// A valid production address selection is required; the API remains the authority for intake readiness.
const canSubmit=()=>official&&!!addressSelection();
const labels={PENDING_REVIEW:'심사 중',APPROVED:'승인',REJECTED:'반려',CANCELLED:'취소 완료',CLOSED:'기간 만료 종료'};
const show=text=>{status.textContent=text;status.focus();};
const read=()=>Object.fromEntries(Array.from(form.querySelectorAll('input,select,textarea')).map(e=>[e.id,e.type==='checkbox'?e.checked:e.value]));
function controls(){check.disabled=busy||!receipt;cancel.disabled=busy||!receipt||receipt.status!=='PENDING_REVIEW';correct.disabled=busy||!receipt||!['PENDING_REVIEW','APPROVED'].includes(receipt.status);submit.disabled=busy||!canSubmit()||(!!receipt&&mode!=='correct');submit.textContent=!canSubmit()?'주소 검색·선택 후 제출 가능':mode==='correct'?'정정 요청 제출':'장소 등록 요청 제출';cancel.textContent=cancelArmed?'취소 확인 · 원문 삭제':'제보 취소';}
function remember(r,initialToken){if(typeof r.proposalId!=='string'||!labels[r.status]||(r.status!=='CANCELLED'&&!/^[A-Za-z0-9_-]{43}$/.test(r.receiptToken??initialToken??'')))throw new Error('응답을 확인할 수 없습니다.');receipt=r.receiptToken===null?null:{proposalId:r.proposalId,receiptToken:r.receiptToken??initialToken,status:r.status};}
function renderResult(r,action){show(`접수번호: ${r.proposalId}\n상태: ${labels[r.status]??r.status}\n${action==='cancel'?'취소와 원문 삭제가 완료됐으며 조회·정정 권한은 폐기됐습니다.':action==='correct'?'정정 요청을 접수했습니다. 승인된 공개 장소는 자동 변경하지 않습니다.':'조회 성공 시 받은 새 권한으로 취소·정정을 이어갈 수 있습니다.'}\n접수 후 24시간 만료는 연장되지 않습니다. 새로고침·페이지 종료·입력 지우기·성공 응답 유실 시 권한을 잃으며 자동 복구하지 않습니다.${r.place?'\n공개 장소: '+r.place.name:''}`);}
function failure(e){if(![400,403,409,429].includes(e.status)){receipt=null;mode='submit';show(e.message+' 처리 여부 또는 최신 권한을 확인할 수 없어 조회·취소·정정을 중단했습니다. 자동 복구하지 않습니다. 접수번호만으로 변경할 수 없습니다.');}else show(e.message+' 이 거절 응답에서는 권한을 소비하지 않았습니다.');}
const clear=()=>{epoch++;pending=null;receipt=null;busy=false;mode='submit';cancelArmed=false;form.reset();resetAddress();status.textContent='';controls();};
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy||!canSubmit()||(receipt&&mode!=='correct'))return;const current=epoch;const {errors,value}=validateInput({...read(),addressSelectionToken:addressSelection()});if(errors.length){show(errors.join('\n'));return;}
 const {privacyConfirmed,addressSelectionToken,...independentSubmission}=value;
 if(mode==='correct'){
  if(!receipt)return;busy=true;cancelArmed=false;controls();
  try{const r=await request('/correct',{proposalId:receipt.proposalId,receiptToken:receipt.receiptToken,addressSelectionToken,independentSubmission});if(current!==epoch)return;remember(r);mode='submit';form.reset();resetAddress();renderResult(r,'correct');}catch(e){if(current===epoch)failure(e);}finally{if(current===epoch){busy=false;controls();}}return;
 }
 if(pending&&JSON.stringify(pending.independentSubmission)!==JSON.stringify(independentSubmission)){show('응답 미확인 요청이 있습니다. 같은 입력으로 재시도하거나 입력 지우기를 선택해 주세요.');return;}
 busy=true;controls();try{
  if(!pending){const c=await request('/challenge',{});const nonce=await solve(c.challenge);if(current!==epoch)return;pending={idempotencyKey:crypto.randomUUID(),receiptToken:secret(),challenge:c.challenge,nonce,website:read().website,privacyConfirmed,addressSelectionToken,independentSubmission};}
  const r=await request('',pending);if(current!==epoch)return;remember(r,pending.receiptToken);pending=null;renderResult(r,'submit');form.reset();resetAddress();
 }catch(e){if(current===epoch)show(e.message);}finally{if(current===epoch){busy=false;controls();}}
});
async function act(action){if(busy||!receipt)return;const current=epoch;busy=true;cancelArmed=false;controls();try{const r=await request('/'+action,{proposalId:receipt.proposalId,receiptToken:receipt.receiptToken});if(current!==epoch)return;remember(r);if(action==='cancel')mode='submit';renderResult(r,action);}catch(e){if(current===epoch)failure(e);}finally{if(current===epoch){busy=false;controls();}}}
check.onclick=()=>act('status');
cancel.onclick=()=>{if(busy||cancel.disabled)return;if(!cancelArmed){cancelArmed=true;show('취소하면 미결 제보의 원문·참고자료를 삭제하고 조회·정정 권한을 폐기합니다. 계속하려면 ‘취소 확인 · 원문 삭제’를 누르세요.');controls();return;}return act('cancel');};
correct.onclick=()=>{if(busy||correct.disabled)return;mode='correct';cancelArmed=false;form.reset();resetAddress();show('정정할 장소 정보를 양식에 다시 입력하고 주소를 검색·선택한 뒤 ‘정정 요청 제출’을 누르세요. 참고자료는 선택입니다. 기존 미결 처리기한과 최초 접수의 24시간 권한 만료는 연장되지 않습니다. 승인 후 정정은 별도 비공개 심사로 접수되며 공개 장소를 자동 수정하지 않습니다.');controls();document.querySelector('#name').focus();};
document.querySelector('#check-input').onclick=()=>{const {errors}=validateInput({...read(),addressSelectionToken:addressSelection()});show(errors.length?errors.join('\n'):'입력 형식을 확인했습니다. 아직 제출되지 않았습니다.');};
document.querySelector('#clear-input').onclick=clear;
form.addEventListener('click',controls);form.addEventListener('input',controls);
window.addEventListener('pageshow',clear);window.addEventListener('pagehide',clear);clear();
