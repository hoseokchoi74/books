# 집현전 · Jade Hall

직접 만지며 배우는 **한국형 인터랙티브 교과서 시리즈**입니다. 옛 서책(선장본)의 모양 — 오침안정법 표지, 제첨, 판심의 어미 문양, 광곽 — 을 빌려, 각 권 안에 슬라이더·3D 모형·퍼즐로 된 실험을 담았습니다.

## 출간
| 권 | 내용 |
|---|---|
| **DRAM 書** (`dram/`) | 1T1C 셀, 리프레시, 센스 앰프, 어레이, 타이밍, DDR5, 컨트롤러, 미세화, 공정·수율·리페어, 로우해머·ECC, HBM — 14개 장, 45개 실험 |
| **NAND 書** (`nand/`) | 플로팅 게이트·전하 트랩, FN 터널링·ISPP, 스트링·셀프 부스팅, MLC~QLC, 3D NAND, 신뢰성, BCH·LDPC, FTL·GC, SSD 시스템, ZNS·AI 스토리지 — 13개 장, 38개 실험 |

## 구조
```
index.html          서가(시리즈 홈)
assets/jade.css     공통 디자인 토큰 (한지·먹·주칠·옥색, 다크 모드)
assets/book.css     서책 레이아웃 (목차, 그림, 실험, 문제)
assets/book.js      공통 엔진 (테마, 목차/이전·다음, 퀴즈, 실험 바인딩, 그래프)
assets/iso3d.js     드래그로 돌리는 작은 3D 엔진
dram/book.js        책 정보와 목차
dram/index.html     책 머리 (로드맵)
dram/chapters/*.html 각 장
nand/               NAND 書 (같은 구조)
```
빌드 과정 없이 정적 파일만으로 동작합니다. 로컬에서는 `npx http-server .` 로 열어 보세요.

## 배포
GitHub Pages: Settings → Pages → Branch `main` / root.

수치는 교육용 근사 모델이며 특정 제품의 사양이 아닙니다. 콘텐츠 CC BY 4.0 · 코드 MIT.
