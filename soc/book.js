/* SoC 書 — 책 정보와 목차 */
window.BOOK = {
  title: 'SoC 書',
  sub: '시스템 온 칩 교과서',
  hanja: '統合',
  chapters: [
    {n:'01', slug:'overview',  title:'칩 하나에 담은 시스템',      desc:'스마트폰 SoC의 평면도, 트랜지스터 수의 역사, 어떤 일이 어느 블록에서 일어나는가.', tags:['기초','3D','시뮬레이터']},
    {n:'02', slug:'cpu',       title:'CPU 코어',                  desc:'파이프라인과 해저드, 분기 예측, 슈퍼스칼라·비순차 실행, 빅·리틀.', tags:['구조','시뮬레이터']},
    {n:'03', slug:'accel',     title:'이종 컴퓨팅과 가속기',        desc:'암달의 법칙, GPU의 SIMT, NPU의 시스톨릭 어레이, 와트당 성능.', tags:['구조','시뮬레이터']},
    {n:'04', slug:'noc',       title:'인터커넥트와 NoC',           desc:'버스·크로스바·메시, XY 라우팅, 혼잡과 지연, 중재.', tags:['통신','시뮬레이터']},
    {n:'05', slug:'coherence', title:'캐시 일관성',               desc:'MESI 상태 기계, 스누핑과 디렉터리, 거짓 공유.', tags:['통신','시뮬레이터']},
    {n:'06', slug:'memsys',    title:'메모리 서브시스템과 QoS',     desc:'LPDDR 대역폭 예산, 디스플레이·카메라·GPU의 경쟁, 우선순위와 지연 보장.', tags:['시스템','시뮬레이터']},
    {n:'07', slug:'power',     title:'전력: DVFS와 파워 게이팅',    desc:'P = αCV²f, 누설, 전압·주파수 조절, 끄고 켜는 손익분기점.', tags:['전력','시뮬레이터']},
    {n:'08', slug:'thermal',   title:'열과 스로틀링',              desc:'열 저항·열 용량, 핫스팟, 표면 온도 한계와 지속 성능.', tags:['전력','시뮬레이터']},
    {n:'09', slug:'clock',     title:'클록, 타이밍, 클록 도메인',   desc:'셋업·홀드, 클록 스큐, PLL, 메타스테빌리티와 동기화기.', tags:['회로','시뮬레이터']},
    {n:'10', slug:'flow',      title:'설계 흐름과 다이 원가',       desc:'RTL에서 GDS까지, 정적 타이밍 분석, 다이 크기·수율·원가.', tags:['설계','시뮬레이터']},
    {n:'11', slug:'chiplet',   title:'칩렛과 첨단 패키징',          desc:'모놀리식 vs 칩렛, UCIe, 2.5D·3D 적층, 다이 간 대역폭과 에너지.', tags:['트렌드','3D','시뮬레이터']},
    {n:'12', slug:'playground',title:'SoC 설계 놀이터',            desc:'공정·코어·GPU·NPU·메모리를 골라 성능·전력·원가를 한눈에.', tags:['종합','시뮬레이터']},
    {n:'13', slug:'glossary',  title:'용어집 & 종합 퀴즈',          desc:'핵심 용어를 검색하고 실력을 점검한다.', tags:['정리']}
  ]
};
