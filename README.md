# YATA — 숭실대 카풀 커뮤니티 (Frontend)

숭실대학교 학생을 위한 안전한 카풀 매칭 커뮤니티 서비스의 프론트엔드입니다.

[디자인 시스템 (Figma)](https://www.figma.com/design/nupe8ZSHOAJrz3JX2lW6qG/YATA---%EC%88%AD%EC%8B%A4%EB%8C%80-%EC%B9%B4%ED%92%80-%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0)

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | [Next.js 14](https://nextjs.org) (App Router) · React 18 · TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) · CSS Variables 기반 디자인 토큰 |
| UI Primitive | [shadcn/ui](https://ui.shadcn.com) · [Radix UI](https://www.radix-ui.com) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| Font | [Pretendard Variable](https://github.com/orioncactus/pretendard) |
| Icon | [lucide-react](https://lucide.dev) |

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 사용 가능한 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

## 프로젝트 구조 (Feature-based)

```
src/
├── app/                          # App Router 진입점
│   ├── (route)/                  # 라우트 그룹 — 모든 페이지가 여기에
│   │   ├── page.tsx              # /
│   │   └── login/
│   │       └── page.tsx          # /login
│   ├── fonts/                    # Pretendard Variable
│   ├── globals.css               # 디자인 토큰 (CSS Variables)
│   └── layout.tsx                # 루트 레이아웃
│
├── features/                     # 기능 단위 모듈
│   └── auth/
│       └── components/
│           └── login-form.tsx
│       # 추후 추가될 폴더 예시
│       # ├── hooks/              # useLogin 등 feature 훅
│       # ├── api/                # 인증 서비스 함수
│       # └── types/              # 인증 도메인 타입
│
├── components/
│   └── ui/                       # 전역 공용 UI 프리미티브 (shadcn)
│       ├── button.tsx
│       └── input.tsx
│
├── lib/                          # 전역 유틸 (cn 등)
│   └── utils.ts
│
└── providers/                    # 전역 Provider
    └── query-provider.tsx
```

### 폴더 규칙

- **`app/(route)/`** — 라우트(`page.tsx`, `layout.tsx`)만 위치. 비즈니스 로직 없음, 가능한 한 얇게.
- **`features/<feature>/`** — 한 기능의 컴포넌트·훅·API·타입을 colocation. 다른 feature에서 직접 import 금지.
- **`components/ui/`** — 여러 feature가 공유하는 디자인 시스템 프리미티브만.
- **`lib/` · `providers/`** — 전역 공통.

## 디자인 시스템

Yourssu Design System 기반 Foundations 토큰을 `globals.css` + `tailwind.config.ts`에 정의했습니다.

### Color

- **Primitives** — `point` (브랜드 퍼플) · `gray` · `red` · `yellow` · `green`
- **Semantic** — `bg-*`, `fg-*` (text), `stroke-*` (border), `status-*`

```tsx
<button className="bg-point-500 text-fg-inverse">호출</button>
<div className="bg-bg-page text-fg-primary border-stroke-thin">…</div>
```

### Typography

총 16종 — Tailwind 유틸리티 클래스로 사용합니다.

| 카테고리 | 클래스 |
| --- | --- |
| Title | `text-title-1` `text-title-2` `text-title-3` |
| Subtitle / Body | `text-subtitle` `text-body-1` `text-body-2` `text-strong-1` `text-strong-2` |
| Caption | `text-caption-1` `text-caption-2` |
| Display (Inter) | `text-display-lg` `text-display-md` `text-display-italic` `text-eyebrow` |
| Mono | `text-mono-md` `text-mono-sm` |

### Spacing · Radius · Shadow

- **Spacing** — Tailwind 기본 스케일 사용 (Figma `space-2`~`space-64`와 1:1 매칭)
- **Radius** — `rounded-xs` (4) · `sm` (8) · `md` (12) · `lg` (16) · `xl` (20) · `2xl` (24)
- **Shadow** — `shadow-sm` · `shadow-md` · `shadow-lg` · `shadow-xl` · `shadow-point`

## 컨벤션

- 커밋 메시지는 `feat:` / `fix:` / `chore:` / `refactor:` 등 프리픽스 + 한글 설명
- 디자인 토큰 외 하드코딩된 색·간격·라운드 값 사용 금지
