/* NAND 書 — 책 정보와 목차 */
window.BOOK = {
  title: 'NAND 書',
  sub: '낸드 플래시 교과서',
  hanja: '貯藏',
  chapters: [
    {n:'01', slug:'flash',      title:'플래시 메모리의 자리',        desc:'전원을 꺼도 남는 기억. NOR와 NAND, DRAM과 SSD 사이에서 NAND가 차지한 자리.', tags:['기초','시뮬레이터']},
    {n:'02', slug:'cell',       title:'플로팅 게이트와 전하 트랩',    desc:'게이트 속에 가둔 전자가 문턱 전압을 옮긴다. 결합비, 전하 트랩, 에너지 밴드.', tags:['소자','시뮬레이터']},
    {n:'03', slug:'program',    title:'프로그램과 소거',             desc:'파울러–노드하임 터널링, ISPP 계단 펄스와 검증, 블록 단위 소거.', tags:['소자','시뮬레이터']},
    {n:'04', slug:'string',     title:'NAND 스트링과 어레이',        desc:'직렬로 꿴 셀 스트링, 페이지와 블록, 패스 전압 읽기, 셀프 부스팅.', tags:['구조','시뮬레이터']},
    {n:'05', slug:'mlc',        title:'MLC·TLC·QLC: 한 셀에 여러 비트', desc:'문턱 전압 분포, 그레이 코드, 읽기 기준 전압, 비트를 늘릴수록 좁아지는 여유.', tags:['동작','시뮬레이터']},
    {n:'06', slug:'vnand',      title:'3D NAND',                    desc:'눕혀 있던 스트링을 세우다. 채널 홀, 계단 콘택, 수백 층 적층, CMOS 언더 어레이.', tags:['구조','3D','시뮬레이터']},
    {n:'07', slug:'reliability',title:'내구성·리텐션·간섭',          desc:'P/E 사이클 마모, 전하 손실, 읽기·프로그램 교란, 이웃 셀 간섭.', tags:['신뢰성','시뮬레이터']},
    {n:'08', slug:'ecc',        title:'오류 정정: BCH에서 LDPC까지',  desc:'원시 오류율과 정정 능력, 비트 뒤집기 복호, 소프트 읽기와 LLR.', tags:['신호처리','시뮬레이터']},
    {n:'09', slug:'ftl',        title:'FTL과 가비지 컬렉션',          desc:'제자리에 덮어쓸 수 없는 메모리. 주소 변환, 가비지 컬렉션, 쓰기 증폭, 웨어 레벨링.', tags:['시스템','시뮬레이터']},
    {n:'10', slug:'ssd',        title:'SSD 시스템',                  desc:'채널·웨이 병렬성, SLC 캐시, NVMe 큐, 리틀의 법칙으로 보는 IOPS.', tags:['시스템','시뮬레이터']},
    {n:'11', slug:'future',     title:'NAND의 미래',                 desc:'400층 이후, PLC, 웨이퍼 본딩, ZNS, AI 스토리지와 비트 원가.', tags:['트렌드','시뮬레이터']},
    {n:'12', slug:'playground', title:'SSD 설계 놀이터',              desc:'셀 방식·층수·OP·채널을 조정해 용량·성능·수명을 한눈에 비교한다.', tags:['종합','시뮬레이터']},
    {n:'13', slug:'glossary',   title:'용어집 & 종합 퀴즈',           desc:'핵심 용어를 검색하고 실력을 점검한다.', tags:['정리']}
  ]
};
