# Contract: PWA Manifest

**Consumer**: Android Chrome, 기타 Chromium 기반 브라우저의 설치/WebAPK 생성 로직, Lighthouse PWA 감사
**Producer**: `src/app/manifest.ts` (Next.js App Router `MetadataRoute.Manifest`)

## 요구 필드 (FR-007, FR-009 강제)

```jsonc
{
  "name": "string (필수)",
  "short_name": "string (필수, 12자 내외 권장)",
  "description": "string (필수)",
  "start_url": "'/' (필수)",
  "display": "standalone",              // 고정값 — FR-009
  "background_color": "#0a0e27 (night-900과 일치)",
  "theme_color": "#0a0e27 (night-900과 일치)",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## 검증 조건

- `display`는 반드시 `"standalone"`이어야 한다(`"browser"`/`"minimal-ui"` 불가) — FR-009.
- `icons` 배열에는 최소 192×192(any), 512×512(any), 512×512(maskable) 3개 항목이 있어야 한다 — Lighthouse PWA "installable" 감사 통과 조건.
- `background_color`/`theme_color`는 `tailwind.config.ts`의 `night.900`(`#0a0e27`)과 시각적으로 일치해야 한다(스플래시 화면 이질감 방지).
- 이 계약은 서비스 워커의 오프라인 캐싱 여부와 무관하다(FR-012 — 오프라인 콘텐츠 제공은 범위 밖).

## 연관 메타 태그 (iOS Safari, `src/app/layout.tsx`)

매니페스트만으로는 iOS Safari의 홈 화면 추가/standalone 실행이 보장되지 않으므로 다음 메타 태그를 함께 제공해야 한다:

- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
- `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` (FR-010 세이프 영역 대응을 위해 `viewport-fit=cover` 추가)
