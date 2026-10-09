/* 포토 書 — 책 정보와 목차 */
window.BOOK = {
  title: '포토 書',
  sub: '빛으로 새기는 나노미터',
  hanja: '光刻',
  chapters: [
    {n:'01', slug:'overview',  title:'노광 공정 한눈에',            desc:'트랙과 스캐너, 도포에서 현상까지 9단계, 스캐너 처리량과 원가.', tags:['기초','시뮬레이터']},
    {n:'02', slug:'optics',    title:'빛과 회절',                   desc:'단일 슬릿, 회절 격자, 푸리에 광학: 마스크 스펙트럼과 동공 필터.', tags:['광학','시뮬레이터']},
    {n:'03', slug:'resolution',title:'해상도와 초점 심도',           desc:'레일리 식, k₁의 역사, 액침 노광이 NA와 DOF를 바꾸는 원리.', tags:['광학','시뮬레이터']},
    {n:'04', slug:'illumination',title:'조명 설계',                  desc:'일반·환형·다이폴·쿼드러폴 조명, 피치별 대비와 금지 피치.', tags:['광학','시뮬레이터']},
    {n:'05', slug:'mask',      title:'포토마스크',                  desc:'바이너리·감쇠형·교번형 위상 반전 마스크, MEEF, 마스크 결함.', tags:['마스크','시뮬레이터']},
    {n:'06', slug:'resist',    title:'감광액 화학',                 desc:'화학 증폭형 감광액, 산 확산과 PEB, 대비 곡선, 현상.', tags:['재료','시뮬레이터']},
    {n:'07', slug:'thinfilm',  title:'박막 간섭과 반사 방지',        desc:'정재파, 스윙 곡선, BARC 두께 최적화, 단차 위 반사 노칭.', tags:['재료','시뮬레이터']},
    {n:'08', slug:'window',    title:'공정 창과 CD 균일도',          desc:'보썽 곡선, 노광량–초점 창, 몬테카를로 CDU 예산.', tags:['공정','시뮬레이터']},
    {n:'09', slug:'overlay',   title:'정렬과 오버레이',              desc:'웨이퍼·필드 오버레이 모델, 최소 제곱 보정, 측정 마크.', tags:['공정','시뮬레이터']},
    {n:'10', slug:'opc',       title:'OPC와 계산 리소그래피',        desc:'근접 효과, 피치별 바이어스, 역 리소그래피(ILT) 최적화.', tags:['계산','시뮬레이터']},
    {n:'11', slug:'multi',     title:'다중 패터닝',                 desc:'LELE 색칠 분해, SADP·SAQP, 컷 마스크, 스티칭.', tags:['패터닝','시뮬레이터']},
    {n:'12', slug:'euv',       title:'EUV 리소그래피',              desc:'Mo/Si 다층 거울, 마스크 3D 효과, 광원 출력과 확률적 결함.', tags:['EUV','시뮬레이터']},
    {n:'13', slug:'highna',    title:'High-NA와 그 너머',            desc:'애너모픽 광학, 반쪽 필드와 스티칭, 나노임프린트·DSA.', tags:['EUV','시뮬레이터']},
    {n:'14', slug:'metrology', title:'계측과 공정 제어',             desc:'CD-SEM과 LER 분석, 산란 계측, APC 피드백.', tags:['계측','시뮬레이터']},
    {n:'15', slug:'playground',title:'스캐너 놀이터',                desc:'파장·NA·조명·마스크·감광액·노광량·초점을 골라 목표 패턴 찍기.', tags:['종합','시뮬레이터']},
    {n:'16', slug:'glossary',  title:'용어집 & 종합 퀴즈',            desc:'포토 공정 용어 검색과 종합 문제.', tags:['정리']}
  ]
};
