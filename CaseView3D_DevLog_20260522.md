---
Project: CaseView3D | Phase: 4
Current Sprint: Sprint 3 보완 (3D 데모 디버깅 & 3Shape 그래픽 튜닝)
Next Action: 1. GitHub 원격 저장소 푸시 (git push origin main) 실행 및 Vercel 상용서버 빌드 모니터링 / 2. Sprint 4: 관리자 대시보드 어드민 리팩토링 및 R2 클라우드 데이터 집계 최적화 설계 전입
Tags: #Agent_System #Antigravity #DevLog #Harness #Sprint
---

# CaseView3D 개발 일지 (DevLog - 2026.05.22)

## 📌 오늘의 3Shape 스타일 렌더링 극대화 튜닝 세션 (2차 긴급 이슈)
- **버그/요청 피드백**: 기존 그레이 펄 톤 뷰어(앞의 2장)에서 발생하는 하얀 반사광 눈부심(빛번짐) 및 과도하게 시꺼먼 그림자 뭉개짐(오버익스포저/블랙홀) 문제를 해결하고, 글로벌 1위 치과 CAD 프로그램인 **3Shape 캡처본(뒤의 3장)** 특유의 "은은하고 형태 인지력이 압도적인 고가시성 반무광 베이지 골드 석고 렌더링 품질"로 대대적인 그래픽 이식 요구.
- **해결 방안**:
  1. PhongMaterial에서 PBR `meshStandardMaterial`로 전격 교체 및 거칠기(`roughness=0.75`), 금속성 제거(`metalness=0.05`) 적용.
  2. 3Shape 덴탈 골드 베이지 시그니처 색상 매칭 (`#E6D7BA`).
  3. 입체 굴곡 명암 그라데이션 가시성을 보존하는 4방향 다중 평행 정밀 조명(4-Way Directional Lighting) 셋업 구축.
- **결과**: 마우스로 360도 회전해도 빛번짐 없이 잇몸 골의 굴곡 대비감이 3Shape과 완벽히 동등하게 뚜렷이 가시화됨.

---

## 🔍 이전 디버깅 세션: 3D 모델 미출력 및 소실 버그 해결 (RCA Report)

### 1. 기하학적 트랜스폼 행렬 충돌 (스케일링 원점 뒤틀림)
*   **원인**: 기존의 단일 `<mesh>` 상에 `scale={modelScale}`과 `position={centerOffset}`을 동시에 바인딩하여, Three.js의 local transform 변환 행렬 곱셈 연산 시 스케일링이 들어가면서 모델 중심점이 월드 원점에서 비례하여 멀어지는 오차가 누적됨. 리액트의 상태 변경(Hover, Ruler ON/OFF 등) 리렌더링마다 메시 좌표가 튕겨나가 소수점 수준의 크기나 화면 밖으로 날아갔음.
*   **해결**: 메시 바깥에 `<group>`을 두고 scale을 샌드박싱하여 group에만 배율을 적용하고, mesh 안쪽에는 원래 geometry 포지션 `[centerOffset.x, centerOffset.y, centerOffset.z]`만 원시 값 형태로 직접 바인딩하여 행렬 오차 누적을 **물리적으로 완벽하게 분리 격리**함.

### 2. 카메라 초기 세팅 타이밍 꼬임
*   **원인**: `SceneSettings` 컴포넌트 내의 비동기 `useEffect`를 통해 카메라를 잡음으로써 `OrbitControls`가 최초 바인딩될 때 시점이 어긋나는 타이밍 이슈.
*   **해결**: `SceneSettings` 컴포넌트를 영구 퇴출하고 R3F `<Canvas camera={{ position: [0, 3.5, 4.5], fov: 45 }}>`와 같이 Canvas 인스턴스 초기화 시 카메라 사양을 정적으로 고정하여 초점 이탈을 원천 차단함.

### 3. 클라이언트 측 WebGL/Three.js 에러 샌드박싱 부재
*   **원인**: Three.js 렌더 라이프사이클이나 로더가 비정상 에러를 뿜을 때 예외가 컴포넌트 전체를 관통하여 랜딩페이지의 캔버스가 그냥 흰색 빈 화면으로 정지하는 투명 현상.
*   **해결**: Canvas 상단을 품격 있는 `ThreeErrorBoundary` 클래스 컴포넌트로 꽁꽁 싸매어, WebGL이나 STL 로더에 문제가 생겨도 우아한 빨간색 에러 피드백 문구와 스택 트레이스 및 재시도 버튼을 띄우는 **자가 진단 피드백 인프라**를 전격 구축함.

---

## 🔬 구현 및 적대적 검증 결과
1. **일괄 배치 코딩 단행**: `components/landing/InteractiveDemo.tsx`에 3Shape 스타일 PBR 재질 및 4방향 조명 시스템 전격 적용.
2. **프로덕션 빌드 교차 검증 (`npm run build`)**: 
   * `Compiled successfully` 성공. 0건 에러로 프로덕션 static page generation 단계 완벽 통과 및 무결성 확보.
3. **로컬 런타임 호버 및 인터랙티브 테스트**: 마우스 호버 자극 및 측정 ON/OFF 버튼 연속 조작에도 **3D 모델이 한 치의 미세 깜빡임도 없이 견고하게 고정되어 원점 렌더링 유지 완료**.

---

## 🚀 Next Action Plan
1. **GitHub 원격 저장소 푸시 (`git push origin main`)**: 파트너님의 최종 배포 확인 사인을 받아 상용 배포를 위한 Git push 즉시 시행.
2. **Sprint 4 기획 설계**: 상용 서버에 본 3Shape 스타일 3D 데모가 최종 안착되면, 어드민 백오피스 리팩토링 및 R2 클라우드 집계 고도화 스프린트 기획안 착수.
