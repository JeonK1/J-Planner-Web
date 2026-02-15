# J-Planner

J를 위한 여행 플래너 웹 애플리케이션

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router v7

## Prerequisites

- Node.js 18 이상
- npm 9 이상
- J-Planner Server 실행 필요 (API 백엔드)

## Getting Started

### 1. 백엔드 서버 실행

```bash
# J-Planner-Server 프로젝트 디렉토리에서
./gradlew bootRun --args='--spring.profiles.active=dev'
# http://localhost:8080 에서 실행됨
```

### 2. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (기본 http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# ESLint 검사
npm run lint
```

> 개발 서버는 `/api` 요청을 `http://localhost:8080`으로 프록시합니다 (vite.config.ts).

## 주요 기능

- **입장번호로 여행 계획 조회**: 입장번호를 입력하여 서버에서 여행 계획 로드
- **새 여행 계획 생성**: 입장번호, 비밀번호, 여행 정보를 입력하여 서버에 플랜 생성
- **비밀번호 인증 후 수정**: 수정 버튼 → 비밀번호 인증 → 수정 모드 진입
- **여행 기본정보 편집**: 제목, 설명, 여행 날짜 수정
- **비행기정보 / 숙소정보**: 확장/축소 가능한 섹션으로 구성, 섹션 추가/삭제/편집
- **REST API 연동**: Kotlin Spring 백엔드 서버와 통신하여 데이터 관리

## 테스트 방법

백엔드 서버와 프론트엔드를 모두 실행한 후 아래 순서로 기능을 확인할 수 있습니다.

### 1. 입장번호 입력

- `/` 페이지에서 입장번호 `DEMO`를 입력하고 "입장" 클릭
- 서버에서 여행 계획을 조회하여 플랜 페이지로 이동 확인
- 존재하지 않는 입장번호 입력 시 에러 메시지 표시 확인

### 2. 새 여행 계획 생성

- `/` 페이지에서 "새 여행 계획 만들기" 클릭
- 입장번호, 비밀번호, 여행 제목, 설명, 시작일/종료일 입력
- 생성 후 자동으로 수정 모드로 진입하여 바로 편집 가능
- 이미 사용 중인 입장번호 입력 시 에러 메시지 표시 확인

### 3. 여행계획 조회

- 비행기정보, 숙소정보 섹션이 각각 개별 ExpandableSection으로 표시되는지 확인
- 각 섹션 헤더 클릭 시 확장/축소 동작 확인

### 4. 수정 모드

- "수정" 버튼 클릭 → 비밀번호 다이얼로그 표시
- 비밀번호 `1234` 입력 → 수정 모드 전환 확인
- 잘못된 비밀번호 입력 → 에러 메시지 표시 확인
- 여행 제목, 설명, 날짜 편집 후 "저장" 클릭
- 섹션 제목, 항공편/숙소 정보 편집 후 "저장" 클릭
- "+ 비행기 추가" / "+ 숙소 추가" 버튼으로 새 섹션 추가
- "섹션 삭제" 버튼으로 섹션 삭제
- "수정 완료" 클릭 → 조회 모드 복귀 확인

### 5. 데이터 영속성

- 데이터 수정 후 페이지 새로고침 → 서버에 저장된 데이터 유지 확인
- 새로고침 후 수정 모드 해제 확인 (인증 상태는 메모리에만 유지)

### 데모 계정 정보

| 항목 | 값 |
|------|------|
| 입장번호 | `DEMO` |
| 비밀번호 | `1234` |

## 에러 처리

API 통신 실패에 대비한 에러 처리 UI가 적용되어 있습니다.

### 전체 페이지 에러
- **플랜 로딩 실패**: 서버 연결 불가 시 에러 아이콘 + 메시지 + "다시 시도" 버튼 표시
- **입장번호 조회 실패**: 네트워크 오류 시 "서버와 통신할 수 없습니다" 메시지 표시

### 인라인 에러 알림 (ErrorAlert)
- **플랜 정보 저장 실패**: PlanHeader 상단에 에러 메시지 표시 (5초 후 자동 사라짐)
- **섹션 저장/삭제 실패**: 해당 섹션 내부에 에러 메시지 표시 (5초 후 자동 사라짐)
- **섹션 추가 실패**: 섹션 목록 하단에 에러 메시지 표시 (5초 후 자동 사라짐)
- 모든 인라인 에러는 × 버튼으로 수동 닫기 가능

### ErrorAlert 컴포넌트
- 위치: `src/components/ui/ErrorAlert.tsx`
- Props: `message`, `onDismiss?`, `autoHideMs?`
- 빨간색 배경/테두리 스타일, 자동 숨김 및 수동 닫기 지원

## Architecture

```
브라우저 (React SPA, localhost:5173)
  ↓ /api/* 요청
Vite Dev Proxy
  ↓
Spring Boot Server (localhost:8080)
  ↓
H2 / PostgreSQL DB
```

## Project Structure

```
src/
├── api/              # API 클라이언트 (client, types, mappers, planApi)
├── pages/            # 페이지 컴포넌트 (EntryPage, CreatePlanPage, PlanPage, NotFoundPage)
├── components/       # 공유 컴포넌트 (ui/, layout/)
├── features/         # 기능 모듈 (entry/, plan/, sections/)
├── stores/           # Zustand 스토어 (usePlanStore, useAuthStore)
├── types/            # 타입 정의 (plan, flight, accommodation)
├── lib/              # 유틸리티 (cn, utils)
└── constants/        # 상수
```
