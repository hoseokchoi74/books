/* DRAM 서(書) — 책 정보와 목차 */
window.BOOK = {
  title: 'DRAM 書',
  sub: '디램 교과서',
  hanja: '記憶',
  chapters: [
    {n:'01', slug:'hierarchy',  title:'메모리 계층과 DRAM의 자리', desc:'레지스터에서 SSD까지. 왜 DRAM이 "주기억장치"가 되었는가. 지연과 용량의 줄다리기.', tags:['기초','시뮬레이터']},
    {n:'02', slug:'cell',       title:'1T1C 셀과 전하 공유',       desc:'트랜지스터 하나, 커패시터 하나. 쓰기·읽기·파괴적 읽기와 전하 공유 신호 ΔV.', tags:['소자','시뮬레이터']},
    {n:'03', slug:'refresh',    title:'누설과 리프레시',           desc:'전하는 샌다. 리텐션 시간 분포, 온도, 64 ms 규칙, 리프레시 오버헤드.', tags:['소자','시뮬레이터']},
    {n:'04', slug:'senseamp',   title:'센스 앰프',                 desc:'수십 mV를 1.1 V로. 프리차지 → 전하 공유 → 래치 증폭 → 재저장 파형.', tags:['회로','시뮬레이터']},
    {n:'05', slug:'array',      title:'어레이 구조와 주소',         desc:'워드라인·비트라인·매트·뱅크. 행/열 주소 디코딩과 오픈/폴디드 비트라인.', tags:['구조','시뮬레이터']},
    {n:'06', slug:'timing',     title:'명령과 타이밍',             desc:'ACT·RD·WR·PRE. tRCD, CL, tRP, tRAS. 로우 버퍼 히트와 충돌.', tags:['동작','시뮬레이터']},
    {n:'07', slug:'interface',  title:'인터페이스: SDRAM에서 DDR5까지', desc:'더블 데이터 레이트, 프리페치, 버스트, 뱅크 그룹, LPDDR와 GDDR.', tags:['인터페이스','시뮬레이터']},
    {n:'08', slug:'controller', title:'메모리 컨트롤러',           desc:'주소 매핑과 인터리빙, FR-FCFS 스케줄링, 읽기·쓰기 전환 비용.', tags:['시스템','시뮬레이터']},
    {n:'09', slug:'scaling',    title:'미세화와 셀 구조',           desc:'6F²와 4F², 매립 워드라인, 실린더 커패시터의 종횡비, 3D DRAM.', tags:['공정','3D','시뮬레이터']},
    {n:'10', slug:'fab',        title:'제조 공정·수율·리페어',     desc:'셀이 쌓이는 순서, 결함 밀도와 수율 모델, 여분 행·열로 고치는 리페어.', tags:['공정','시뮬레이터']},
    {n:'11', slug:'reliability',title:'로우해머와 ECC',            desc:'이웃 행을 두드리면 비트가 뒤집힌다. 해밍 코드와 온다이 ECC.', tags:['신뢰성','시뮬레이터']},
    {n:'12', slug:'hbm',        title:'HBM과 미래 메모리',          desc:'TSV로 쌓은 1024비트 버스. HBM3E·HBM4, CXL, PIM, 에너지/비트.', tags:['트렌드','3D','시뮬레이터']},
    {n:'13', slug:'playground', title:'DRAM 설계 놀이터',           desc:'셀·어레이·인터페이스 변수를 한 번에 조정하고 결과를 한눈에 비교한다.', tags:['종합','시뮬레이터']},
    {n:'14', slug:'glossary',   title:'용어집 & 종합 퀴즈',         desc:'핵심 용어를 검색하고 실력을 점검한다.', tags:['정리']}
  ]
};
