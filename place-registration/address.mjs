import {request} from './api.mjs';
const query=document.querySelector('#address-query'),button=document.querySelector('#address-search'),results=document.querySelector('#address-results'),message=document.querySelector('#address-message'),address=document.querySelector('#address');
let token='',selectedAddress='',version=0;
export const addressSelection=()=>{if(address.value!==selectedAddress){resetAddress();return '';}return token;};
export function resetAddress(){version++;token='';selectedAddress='';address.value='';results.replaceChildren();button.disabled=false;message.textContent='주소를 검색한 뒤 결과를 선택해 주세요.';}
query.addEventListener('input',resetAddress);
address.addEventListener('input',resetAddress);
address.addEventListener('change',resetAddress);
button.onclick=async()=>{resetAddress();const current=version;button.disabled=true;message.textContent='주소를 검색하고 있습니다.';
try {const data=await request('/addresses',{keyword:query.value.trim()});if(current!==version)return;
message.textContent=data.synthetic?'로컬 합성 주소입니다. 공식 주소 조회 결과가 아닙니다.':(data.results.length?'주소를 선택해 주세요.':'검색 결과가 없습니다.');
for(const item of data.results){const b=document.createElement('button');b.type='button';b.textContent=item.address;b.onclick=()=>{token=item.selectionToken;selectedAddress=item.address;address.value=item.address;message.textContent='주소를 선택했습니다.';results.replaceChildren();};results.append(b);}
}catch(e){if(current===version)message.textContent='주소 조회를 사용할 수 없습니다. 실제 API 사용·저장 조건 확인 전까지 접수는 차단됩니다.';}finally{if(current===version)button.disabled=false;}};
