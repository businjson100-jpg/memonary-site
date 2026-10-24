export function validateInput(input) {
  const errors = [];
  const text = (key, label, min, max) => {
    const value = typeof input[key] === 'string' ? input[key].trim().normalize('NFC') : '';
    if (value.length < min || value.length > max || /[\x00-\x1f\x7f<>]/.test(value) || (['name','address','placeType'].includes(key) && /\p{Cf}/u.test(value))) errors.push(`${label}: ${min}~${max}자의 올바른 내용을 입력해 주세요.`);
    return value;
  };
  const name=text('name','업장 이름',1,200), address=text('address','도로명주소',3,500);
  const placeType=text('placeType','카테고리',1,40);
  const sourceKind=input.sourceKind;
  if (!['first_hand','licensed_material'].includes(sourceKind)) errors.push('자료 출처를 선택해 주세요.');
  const evidenceUrl=text('evidenceUrl','증빙 링크',0,1000), evidenceDescription=text('evidenceDescription','증빙 설명',0,2000);
  if (evidenceUrl) {
    try {
      const url=new URL(evidenceUrl), host=url.hostname.toLowerCase().replace(/\.$/,'');
      if (url.protocol!=='https:' || !host.includes('.') || host.endsWith('.local') || host.endsWith('.localhost') || /^[\d.]+$/.test(host) || host.includes(':') || url.port || url.search || url.hash || url.username || url.password || /\s/.test(evidenceUrl) ||
        ['naver.com','naver.me','pstatic.net','ncloud.com','google.com','goo.gl','kakao.com','daum.net'].some(d=>host===d||host.endsWith('.'+d))) throw new Error();
    } catch { errors.push('증빙 링크는 검색 서비스 자료가 아닌 독립 자료의 HTTPS 주소여야 합니다.'); }
  }
  if (!/^[A-Za-z0-9_-]{43}$/.test(input.addressSelectionToken || '')) errors.push('도로명주소를 검색한 뒤 결과를 선택해 주세요.');
  for (const [key,label] of [['rightsConfirmed','자료 사용 권한'],['notDerivedFromSearch','검색 결과 재사용 금지'],['privacyConfirmed','개인정보 고지']]) if(input[key]!==true) errors.push(`${label} 확인이 필요합니다.`);
  // Explicit allowlist: no external candidate fields, token, query or storage are read.
  return { errors, value: {name,address,placeType,sourceKind,evidenceUrl,evidenceDescription,addressSelectionToken:input.addressSelectionToken,rightsConfirmed:input.rightsConfirmed===true,notDerivedFromSearch:input.notDerivedFromSearch===true,privacyConfirmed:input.privacyConfirmed===true} };
}
