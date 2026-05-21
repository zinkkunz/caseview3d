---
Project: CaseView3D | Phase: 4
Current Sprint: Sprint 3 보완 (3D 데모 디버깅)
Next Action: 1. GitHub 원격 저장소 푸시 (git push origin main) 실행 및 Vercel 상용서버 빌드 모니터링 / 2. Sprint 4: 관리자 대시보드 어드민 리팩토링 및 R2 클라우드 데이터 집계 최적화 설계 전입
Tags: #Agent_System #Antigravity #DevLog #Harness #Sprint
---

# CaseView3D 개발 일지 (DevLog - 2026.05.22)

## 📌 오늘의 긴급 이슈 및 버그 피드백
- **현상**: 랜딩페이지 내 3D 뷰어 데모에서 치아 잇몸 스캔 모델이 정상 렌더링되지 않거나, 마우스 조작/리렌더링 시 잠깐 반짝 나타난 후 즉시 화면에서 소멸(튕김)하는 크리티컬 버그 발생.
- **영향**: 로그인 전 즉시 체험할 수 있는 기공소 핵심 3D 기술력 시연에 치명적 차질 유발.

---

## 🔍 버그 원인 분석 및 설계적 해결책 (RCA Report)

### 1. 기하학적 트랜스폼 행렬 충돌 (스케일링 원점 뒤틀림)
*   **원인**: 기존의 단일 `<mesh>` 상에 `scale={modelScale}`과 `position={centerOffset}`을 동시에 바인딩했습니다. Three.js의 local transform 변환 행렬 곱셈 연산 순서에 의해, 스케일링이 들어가면서 메시의 원래 바운딩 박스 중심점이 월드 원점에서 비례하여 멀어지는 오차가 누적되었습니다. 이로 인해 리액트의 상태 변경(Hover, Ruler ON/OFF 등)으로 인해 컴포넌트가 리렌더링될 때마다 메시의 좌표가 튕겨나가 소수점 수준의 크기나 화면 밖으로 날아갔습니다.
*   **해결**: 메시 바깥에 `<group>`을 두고 scale을 샌드박싱하여 group에만 배율을 적용하고, mesh 안쪽에는 원래 geometry 포지션 `[centerOffset.x, centerOffset.y, centerOffset.z]`만 원시 값 형태로 직접 바인딩하여 행렬 오차 누적을 **물리적으로 완벽하게 분리 격리**했습니다.

### 2. 카메라 초기 세팅 타이밍 꼬임
*   **원인**: `SceneSettings` 컴포넌트 내의 비동기 `useEffect`를 통해 카메라를 잡음으로써 `OrbitControls`가 최초 바인딩될 때 시점이 어긋나는 타이밍 이슈가 있었습니다.
*   **해결**: `SceneSettings` 조력 컴포넌트를 영구 퇴출하고 R3F `<Canvas camera={{ position: [0, 3.5, 4.5], fov: 45 }}>`와 같이 Canvas 인스턴스 초기화 시 카메라 사양을 정적으로 고정하여 초점 이탈을 원천 차단했습니다.

### 3. 클라이언트 측 WebGL/Three.js 에러 샌드박싱 부재
*   **원인**: Three.js 렌더 라이프사이클이나 로더가 비정상 에러를 뿜을 때 예외가 컴포넌트 전체를 관통하여 랜딩페이지의 캔버스가 그냥 흰색 빈 화면으로 정지하는 투명 현상이 발생했습니다.
*   **해결**: Canvas 상단을 품격 있는 `ThreeErrorBoundary` 클래스 컴포넌트로 꽁꽁 싸매어, WebGL이나 STL 로더에 문제가 생겨도 우아한 빨간색 에러 피드백 문구와 스택 트레이스 및 재시도 버튼을 띄우는 **자가 진단 피드백 인프라**를 전격 구축했습니다.

---

## 🔬 구현 및 적대적 검증 결과
1. **일괄 배치 코딩 단행**: `components/landing/InteractiveDemo.tsx`에 상기 3D 엔진 기하학적 격리 및 에러 경계 시스템 완벽 적용.
2. **프로덕션 빌드 교차 검증 (`npm run build`)**: 
   * `Compiled successfully` 성공. 0건 에러로 프로덕션 static page generation 단계 완벽 통과 및 무결성 확보.
3. **로컬 런타임 호버 및 인터랙티브 테스트**: 마우스 호버 자극 및 측정 ON/OFF 버튼 연속 조작에도 **3D 모델이 한 치의 미세 깜빡임도 없이 견고하게 고정되어 원점 렌더링 유지 완료**.

---

## 🚀 Next Action Plan
1. **GitHub 원격 저장소 푸시 (`git push origin main`)**: 파트너님의 확인 사인을 받아 상용 배포를 위한 Git push 즉시 시행.
2. **Sprint 4 기획 설계**: 상용 서버에 본 3D 데모가 최종 안착되면, 어드민 백오피스 리팩토링 및 R2 클라우드 집계 고도화 스프린트 기획안 착수.
