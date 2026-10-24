const base='https://api.memonary.kr/api/v1/public/place-intake';
export async function request(path,body){
 if(location.origin!=='https://memonary.kr')throw new Error('공식 사이트 https://memonary.kr에서 이용해 주세요.');
 const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','X-Intake-Request':'1'},body:JSON.stringify(body),credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'});
 if(!r.ok){let code;try{code=(await r.json()).message;}catch{}const messages={RECEIPT_UNAVAILABLE:'조회·변경 권한이 없거나 만료·소진됐습니다.',INVALID_INDEPENDENT_SUBMISSION:'입력 내용과 주소 선택을 확인해 주세요.',INTAKE_CONFLICT:'같은 내용의 미결 요청이 있습니다.',PROPOSAL_NOT_CANCELLABLE:'현재 상태에서는 취소할 수 없습니다.',PROPOSAL_NOT_CORRECTABLE:'현재 상태에서는 정정할 수 없습니다.',INTAKE_ORIGIN_REJECTED:'허용된 접수 화면에서만 요청할 수 있습니다.',INTAKE_RATE_LIMIT:'요청이 많습니다. 잠시 후 다시 시도해 주세요.',INTAKE_CAPACITY:'현재 접수 가능한 수를 초과했습니다.',PUBLIC_INTAKE_BLOCKED:'운영 접수가 차단되어 있습니다.'};const e=new Error(messages[code]??'처리 결과를 확인할 수 없습니다. 성공으로 표시하지 않았습니다.');e.status=r.status;throw e;}
 const response=await r.json();if(!response.success||!response.data)throw new Error('응답을 확인할 수 없습니다.');if(path==='/addresses'&&(response.data.synthetic!==false||!Array.isArray(response.data.results)))throw new Error('운영 주소 조회를 확인할 수 없어 접수를 진행하지 않습니다.');return response.data;
}
export const secret=()=>{const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');};
export async function solve(challenge){for(let n=0;n<1e9;n++) {const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${challenge}:${n}`)));if(bytes[0]===0&&bytes[1]===0)return String(n);}throw new Error('요청 확인 실패');}
