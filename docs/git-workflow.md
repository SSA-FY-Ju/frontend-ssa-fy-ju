# SSAju Frontend Git Workflow & Commit Rules

## Build-Then-Commit 프로세스

프론트엔드에서는 **빌드 통과**가 코드 검증의 기준입니다. 다음 프로세스를 엄격하게 준수합니다.

### 1단계: 빌드 필수 실행

기능 구현 또는 리팩토링 후, 코드를 커밋하기 전에 반드시 `ssaju-frontend/` 디렉토리에서 빌드 실행:

```bash
cd ssaju-frontend/
npm run build
```

**빌드 명령은 다음을 모두 검사합니다**:
- TypeScript 타입 에러
- ESLint 에러 (설정에 따라)
- Next.js 빌드 에러
- import 경로 에러

**빌드가 성공(`✓ Compiled successfully`)해야만 커밋**합니다.

### 2단계: 자가 치유 (Self-Healing)

빌드가 실패할 경우:
1. 에러 메시지 분석 (처음부터 끝까지 읽기, 중간 부분이 가장 중요)
2. 코드 수정
3. 빌드 재실행 (통과할 때까지 반복)

**💡 트러블 슈팅 팁**:
- TypeScript 에러: 에러 메시지에 파일 경로와 줄 번호가 정확히 나옴 → 그 줄을 먼저 보기
- `Module not found`: import 경로 확인 (상대 경로 오타, 파일 이동 후 업데이트 누락)
- `Property does not exist on type`: 타입 정의가 실제 데이터와 일치하는지 확인

### 3단계: (선택) Lint 검사

엄격하게 코드 품질을 유지하려면:
```bash
npm run lint
```

ESLint 경고는 에러가 아니지만, 커밋 전에 최대한 해결 권장.

### 4단계: 커밋 조건

**정상 커밋**: `npm run build` 가 성공할 때만 `git commit` 실행
- 빌드 에러를 우회하거나 무시하고 커밋 금지
- 커밋 이전에 빌드 결과 확인 필수

**WIP 커밋** (임시, 로컬만):
- 빌드 에러가 있지만 진행 상황을 저장해야 할 때
- 커밋 메시지에 `[WIP]` 접두사 필수: `feat: [WIP] 관운 분석 페이지`
- **중요**: `git push` 금지 (로컬에만 유지)
- 문제 해결 후 수정하여 새 커밋으로 진행

---

## 커밋 메시지 규칙 (Conventional Commits + 한국어)

### 언어: 한국어 (필수)

모든 커밋 메시지는 **한국어**로 작성합니다. 코드 주석도 한국어.

### 접두사 (Prefix)

커밋 메시지는 반드시 다음 접두사 중 하나로 시작:

| 접두사 | 사용 시점 | 예시 |
|--------|---------|------|
| `feat:` | 새로운 기능 추가 (페이지, 컴포넌트, 훅 등) | `feat: 관운 분석 페이지 추가` |
| `fix:` | 버그 수정 | `fix: 폼 제출 후 로딩 상태가 해제되지 않는 문제` |
| `docs:` | 문서 수정 (README, spec.md 등) | `docs: API 통신 가이드 업데이트` |
| `style:` | 코드 포맷팅, 세미콜론 등 (기능 변화 없음) | `style: Prettier 적용` |
| `refactor:` | 코드 리팩토링 (기능 변화 없음) | `refactor: useCareerTiming 훅으로 로직 분리` |
| `chore:` | 빌드 설정, 의존성 수정 등 | `chore: tailwindcss 의존성 추가` |
| `test:` | 테스트 추가 또는 수정 | `test: 검증 유틸 단위 테스트 추가` |
| `ui:` | UI/스타일 변경만 (기능 변화 없음) | `ui: 버튼 색상 조정` |

### 커밋 메시지 형식

```
<prefix>: <제목>

<본문 설명 (선택사항, 줄바꿈으로 구분)>

[Build Passed]
```

**규칙**:
- 제목은 50자 이내 (예: `feat: 관운 분석 페이지 추가`)
- 본문은 한 줄 72자 이내로 나누기
- `[Build Passed]` 는 일반 커밋에 필수, `[WIP]` 커밋에는 불필요

### 예시

**정상 커밋 (빌드 성공)**:

```
feat: 관운 분석 페이지 추가

- /career/timing 경로에 페이지 생성
- TimingForm 컴포넌트 추가 (생년월일 입력)
- useCareerTiming 커스텀 훅으로 API 호출 로직 분리
- 결과 화면에 favoredPeriod, confidenceScore, reasoning 표시

[Build Passed]
```

```
fix: 빈 응답일 때 에러 메시지가 표시되지 않는 문제 수정

API 응답의 data가 null일 때 success가 true여도
에러로 처리하도록 조건 추가

[Build Passed]
```

```
chore: tailwindcss 의존성 추가

Tailwind CSS를 스타일링 표준으로 사용하기 위해 설치.
전역 CSS에 @tailwind 디렉티브 추가.

[Build Passed]
```

**WIP 커밋 (로컬만, 빌드 미통과)**:

```
feat: [WIP] AI 컨설팅 페이지

아직 TypeScript 에러 있음. 다음 작업:
- useConsultation 훅 구현
- ConsultationForm 컴포넌트 완성

(로컬에서만 유지, push하지 말 것)
```

---

## 브랜치 및 PR 규칙

### 브랜치 생성

새로운 기능 개발이나 버그 수정을 시작하기 전에 **반드시 `main` 브랜치로부터** 새로운 브랜치 생성:

```bash
git checkout main
git pull origin main
git checkout -b <prefix>/<feature-name>
```

### 브랜치 네이밍 규칙

형식: `<prefix>/<feature-name>` (한국어 금지, 영문+하이픈만)

| 예시 | 설명 |
|------|------|
| `feat/career-timing-page` | 관운 분석 페이지 구현 |
| `feat/consultation-form` | AI 컨설팅 폼 구현 |
| `fix/form-validation-error` | 폼 검증 오류 수정 |
| `docs/update-api-doc` | API 문서 업데이트 |
| `refactor/api-client` | API 클라이언트 리팩토링 |
| `ui/button-style` | 버튼 스타일 수정 |

### 직접 머지 금지

**절대 `main` 브랜치로 직접 병합(Merge)하지 마세요.**

작업 완료 후:
1. 빌드 통과 확인 (`npm run build`)
2. 커밋 완료 (`[Build Passed]` 포함)
3. 원격 저장소에 브랜치 `push`:
   ```bash
   git push origin <prefix>/<feature-name>
   ```
4. PR 생성 및 제출
5. **사용자 검토 대기** (코드 리뷰 및 피드백 대기, 결과에 따라 수정 또는 완료)

---

## 일반적인 워크플로우

### 수동 워크플로우

```bash
# 1. main에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feat/career-timing-page

# 2. 코드 작성/수정
# ... 개발 ...

# 3. 빌드 실행 (ssaju-frontend 디렉토리에서)
cd ssaju-frontend/
npm run build
# "✓ Compiled successfully" 확인

# 4. 커밋
git add <files>
git commit -m "feat: 관운 분석 페이지 추가

- /career/timing 경로에 페이지 생성
- TimingForm 컴포넌트 구현
- useCareerTiming 훅으로 API 호출

[Build Passed]"

# 5. Push & PR 생성
git push origin feat/career-timing-page

# GitHub에서 PR 생성 (온라인 또는 gh cli 사용)
gh pr create --title "feat: 관운 분석 페이지 추가" \
  --body "기능 설명"

# 6. 사용자 검토 대기 (코드 리뷰 결과에 따라 수정 또는 완료)
```

### 자동화 워크플로우 (Claude Code)

개발 완료 후 코드 저장 시 **자동으로** 다음 단계를 수행합니다:

1. ✅ `npm run build` 통과 확인
2. ✅ `git add .` (변경사항 스테이징)
3. ✅ `git commit` (자동 커밋 메시지 생성)
4. ✅ `git push` (원격 저장소에 푸시)
5. ✅ `gh pr create` (PR 자동 생성)

**사용자 역할**: PR 생성 후 **검토 → merge만 수행**

**작동 방식**:
- 파일 변경 저장 (Edit/Write) 후 hook이 자동 실행
- `ssaju-frontend/` 디렉토리에서 build 실행
- build 성공 시 git workflow 자동 진행
- main 브랜치는 제외 (feature/fix 브랜치에서만 작동)
- 커밋 메시지는 변경 파일명 기반으로 자동 생성

⚠️ **참고**:
- Build 실패 시 workflow 중단
- 브랜치에 변경사항이 없으면 skip
- PR 생성 실패 시 수동으로 `gh pr create --fill` 실행

---

## 🐛 Git 관련 자주 발생하는 문제

### 1. 빌드 실패인데 커밋하고 싶을 때

❌ **하지 말 것**:
```bash
git commit --no-verify -m "..."  # 검증 우회 금지
```

✅ **해야 할 것**:

**Option A: WIP 커밋 (로컬만)**
```bash
git commit -m "feat: [WIP] 관운 분석 페이지

TypeScript 에러 있음. 해결 후 수정 예정.

(이 커밋은 로컬에만 유지, push 금지)"
```

**Option B: 임시 저장 후 문제 해결**
```bash
# 변경사항 임시 저장
git stash

# 문제 분석 + 수정

# 다시 꺼내기
git stash pop

# 빌드 통과 후 커밋
```

### 2. 커밋하고 나서 `console.log` 를 발견했을 때

push 하기 전이면:
```bash
# 방금 한 커밋에 수정 합치기
git add <fixed-files>
git commit --amend --no-edit
```

이미 push 했다면:
```bash
# 새 커밋으로 수정 (amend 금지)
git add <fixed-files>
git commit -m "fix: 디버깅 console.log 제거

[Build Passed]"
```

### 3. 잘못된 브랜치에서 작업을 시작했을 때

```bash
# 변경사항을 stash에 저장
git stash

# 올바른 브랜치 생성 후 이동
git checkout main
git checkout -b feat/correct-name

# stash 복원
git stash pop
```

### 4. 빌드 캐시 문제 의심 시

```bash
rm -rf .next         # Next.js 빌드 캐시 삭제
rm -rf node_modules  # 의존성 초기화 (큰 문제일 때만)
npm install
npm run build
```

---

## Phase 1 테스트 규칙

### 테스트 전략: Build + 수동 체크리스트

**필수**:
1. `npm run build` 성공 (TypeScript + ESLint 통과)
2. 각 페이지 구현 후 수동 테스트 실행

### 수동 테스트 체크리스트 (각 페이지마다)

페이지 구현 후, 개발 서버에서 다음을 확인:

```
✅ 페이지 접근 가능 (에러 없이 로드됨)
✅ 폼 입력이 정상 작동
✅ 제출 시 브라우저 개발자도구 네트워크 탭에서 API 호출 확인
✅ 응답 데이터가 UI에 표시됨
✅ 에러 상황 (백엔드 꺼짐) 테스트 - 앱 크래시 없음
✅ 로딩 상태 UI 표시됨
✅ (해당하는 페이지) 피드백 버튼 동작 확인
```

각 페이지마다 이 체크리스트를 커밋 전에 실행하고 통과 확인.

---

## 📋 커밋 전 최종 체크리스트

- [ ] `npm run build` 성공 (✓ Compiled successfully)
- [ ] 수동 테스트 체크리스트 통과 (각 페이지)
- [ ] 디버깅용 `console.log` 제거됨
- [ ] 커밋 메시지가 한국어 (Conventional Commits 형식)
- [ ] 커밋 메시지에 `[Build Passed]` 포함 (WIP 제외)
- [ ] 브랜치 이름이 `<prefix>/<feature-name>` 형식 (영문+하이픈)
- [ ] 하드코딩된 URL, API 키 없음 (`.env.local` 사용)
- [ ] 작업과 무관한 파일은 커밋에서 제외
- [ ] 모든 스타일은 Tailwind CSS 사용
- [ ] `@ts-ignore`, `@ts-nocheck` 없음

---

## PR 제출 시 체크리스트

- [ ] 브랜치가 최신 `main` 을 기반으로 함
- [ ] 모든 커밋의 빌드가 통과 (`[Build Passed]` 포함)
- [ ] PR 제목이 첫 번째 커밋의 제목과 일치
- [ ] PR 본문에 "무엇을 왜 했는지" 설명
- [ ] 관련 이슈 링크 (있다면)

---

**Last Updated**: 2026-04-24
