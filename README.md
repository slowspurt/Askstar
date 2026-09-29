# Askstar (별에 묻다) 🌟

## Portfolio demo

기존 Askstar 서비스를 Vercel에서 보존·시연하기 위한 버전입니다. `askstar.kr` 도메인이나 Firebase/Notion API 키 없이 빌드할 수 있습니다. 실제 배포 주소는 Vercel 프로젝트 생성 후 정해집니다.

## Overview | 개요
Askstar (or "별에 묻다" in Korean, meaning "Ask the Stars") is an interactive astrology service that provides personalized astrological interpretations based on your birth chart. Using the positions of the Sun, Moon, and Ascendant (Rising sign), askstar offers insights into personality traits, emotional tendencies, and how you present yourself to the world.

별에 묻다는 출생 차트를 기반으로 개인화된 점성학적 해석을 제공하는 인터랙티브 점성술 서비스입니다. 태양, 달, 어센던트(상승점)의 위치를 활용하여 성격 특성, 감정적 성향, 그리고 당신이 세상에 자신을 표현하는 방식에 대한 통찰력을 제공합니다.

## Features | 주요 기능

### 🔮 Personal Interpretations | 개인 해석
- Three-pillars analysis: Detailed interpretations of your Sun, Moon, and Ascendant signs
- Gender-specific insights: Tailored interpretations based on your gender identity
- Visual representations: Beautiful visualizations of your astrological profile

- 3궁 분석: 태양궁, 달궁, 어센던트 별자리에 대한 상세한 해석
- 성별 맞춤 통찰: 성별 정체성에 기반한 맞춤형 해석
- 시각적 표현: 아름다운 점성학적 프로필 시각화

### 💞 Compatibility Analysis | 궁합 분석
- Relationship dynamics: Understand the astrological compatibility between you and another person
- Strengths and challenges: Insights into relationship strengths and potential challenges
- Growth opportunities: Suggestions for mutual growth and understanding

- 관계 역학: 당신과 다른 사람 사이의 점성학적 궁합 이해
- 강점과 도전: 관계의 강점과 잠재적 도전에 대한 통찰
- 성장 기회: 상호 성장과 이해를 위한 제안

## Development Roadmap | 개발 로드맵

### Phase 1: Prototype (1-2 months) | 1단계: 프로토타입 (1-2개월)
- Web scraping system implementation | 웹 크롤링 시스템 구현
- Basic 36 sign interpretations | 기본 36개 별자리 해석
- Simple web interface | 간단한 웹 인터페이스

### Phase 2: Core Features (2-3 months) | 2단계: 핵심 기능 (2-3개월)
- Gender-specific interpretations | 성별 특화 해석
- Basic compatibility features | 기본 궁합 기능
- Visual elements implementation | 시각화 요소 구현

### Phase 3: Service Enhancement (3-6 months) | 3단계: 서비스 고도화 (3-6개월)
- Expanded interaction descriptions | 상호작용 설명 확장
- User feedback-based improvements | 사용자 피드백 기반 해석 개선
- Advanced visualizations and PDF export | 고급 시각화 및 PDF 출력

### Phase 4: Long-term Development (6+ months) | 4단계: 장기 발전 계획 (6개월 이후)
- Swiss Ephemeris integration consideration | Swiss Ephemeris 통합 검토
- Subscription model implementation | 구독 모델 구현
- Additional astrological features | 추가 점성학적 기능 확장

## Technical Stack | 기술 스택

### Frontend | 프론트엔드
- React 19 with TypeScript 5.8
- Tailwind CSS 3.4 for styling
- Framer Motion 12 for animations
- React Router 7 for navigation
- Vite 6 for build tooling

### Data Processing | 데이터 처리
- circular-natal-horoscope-js for astrological calculations
- node-geocoder for location data
- Google Spreadsheet API for data management

### Deployment | 배포
- Vercel static hosting: Vite preset, `npm run build`, output `dist`
- React Router deep links are configured in `vercel.json`
- No environment variables or external data synchronization are required for the normal build
- Optional `SITE_URL` sets the canonical origin. Otherwise the build uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`; local builds use `http://localhost:4173`
- Keep Vercel's System Environment Variables enabled. Never set a private API key in a `VITE_` variable
- GitHub import: select this repository and the branch containing these changes; use the Vite defaults above
- CLI alternative: `npx vercel` for a preview, `npm run deploy` for production
- Node 22 was used for local verification

### Portfolio behavior
- Birth-chart calculations run in the browser with `circular-natal-horoscope-js`; interpretations come from bundled Korean/English JSON
- Daily fortunes select predefined messages and scores using the date as a seed
- All 15 archived articles are served from `public/`. The regular build does not contact Notion or Google Sheets
- Sharing uses `/share#...` links containing only the display name, three calculated signs, version and creation time. No birth date, time, city or gender is included. Opening the link needs no database or browser storage; the page treats links as expired after 24 hours
- The encoded link is readable by anyone who has it, not encrypted or signed. Its expiry is a client-side display rule. Old Firebase IDs cannot be resolved by this static deployment
- City search still uses OpenStreetMap Nominatim after an explicit search action, with in-session caching and a request interval. Seoul can be selected from bundled coordinates without a network call
- Nominatim's public service forbids API autocomplete, requires attribution and limits aggregate application traffic to 1 request/second. It is only suitable here for a lightly used demo; a busier deployment needs a different provider or a shared proxy/cache. See [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/)
- The old Notion admin screen is removed. Historical Firebase Functions and optional data-update scripts remain in the repository but are not part of the Vercel app
- The build updates metadata in `dist` only, preserving manually edited source articles. Old GitHub Pages/share files and advertising authorization are excluded from output

### AI/API audit (2026-09-29)
No runtime AI generation or AI-provider API integration was found in current source, dependency declarations, environment-variable names or the 95 locally available commits. The `Gemini` components represent the zodiac sign, not Google's model. The article about AI is editorial content. Whether the original interpretation text was authored with AI cannot be determined from the repository.

Previous API use: Nominatim for city coordinates; Google Sheets for importing interpretation data; Notion for generating articles; Firebase Functions/Firestore for storing and retrieving shared results. The portfolio build needs none of their credentials; only explicit city searches still use an external API.

### Checks
```bash
npm test
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

`npm run lint` also checks the historical Firebase code and currently reports pre-existing issues there and in `LoadingPage.tsx`. These do not block the TypeScript or production build.

Optional legacy commands such as `build:fresh`, `build-articles`, `convert-data` and `deploy:firebase` still require their original credentials/services. They are not used by Vercel.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Getting Started | 시작하기

```bash
# Install dependencies | 의존성 설치
npm install

# Start development server | 개발 서버 시작
npm run dev

# Open in browser | 브라우저에서 열기
http://localhost:3000
```

## Current Status | 현재 상태
- ✅ Landing page design | 랜딩 페이지 디자인
- ✅ Mobile responsiveness | 모바일 반응형
- ✅ i18n integration (Korean/English) | 다국어 지원 (한국어/영어)
- ✅ Input page implementation | 입력페이지 구현
- ✅ Result page with motion visualization | 결과페이지(모션 시각화) 구현
- ✅ First deployment | 1차 배포 완료
- ✅ Birth chart analysis | 출생 차트 분석 기능
- ✅ MainPage improvements | 메인페이지 개선
- 🚧 UI/UX improvements (In Progress) | UI/UX 개선 (진행 중, 일부 진행 완료)
- 📅 Compatibility features (Planned) | 궁합 기능 (계획됨)

## Contact | 연락처
For questions or suggestions, please open an issue or submit a pull request.
문의사항이나 제안이 있으시면 이슈를 열거나 풀 리퀘스트를 제출해 주세요.
