# R3F 기반 치과 CAD 3D 뷰 개선 가이드

## 1. 목표 및 현 상태

- **목표**: 3Shape와 유사한 치과 CAD 판독용 3D 뷰 구현
- **기술 스택**: Three.js + React-Three-Fiber (R3F)
- **현재 문제점**
  - 모델이 떠 보이거나 평면적으로 인식됨
  - 마진, 교합, 언더컷 가독성 부족
  - 회전 시 조명 인상이 계속 변해 어색함 발생

> 체감 품질 저하의 원인 비중: 모델 20% / 조명·머티리얼·카메라 80%

---

## 2. 문제의 근본 원인

### 2.1 월드 기준 조명 사용
- DirectionalLight가 고정
- 모델 회전 시 하이라이트 이동
- CAD 판독 환경에 부적합

### 2.2 PBR(MaterialStandardMaterial) 사용
- 사실적인 렌더링에는 적합
- 형태 강조와 판독에는 불리

### 2.3 Ambient Light 세팅 부적절
- 강하면 평면화
- 약하면 언더컷 소실

---

## 3. 3Shape 스타일을 위한 구조적 해결책

### 3.1 조명 전략 (핵심)

#### 3.1.1 카메라 종속 Directional Light
```jsx
const lightRef = useRef()

useFrame(({ camera }) => {
  lightRef.current.position
    .copy(camera.position)
    .add(new THREE.Vector3(1, 1, 1))
})
```

```jsx
<directionalLight
  ref={lightRef}
  intensity={0.9}
  color="#ffffff"
/>
```

- 모델을 회전해도 항상 동일한 음영 인상 유지

---

#### 3.1.2 상부 보조 라이트
```jsx
<directionalLight
  position={[0, 10, 0]}
  intensity={0.3}
/>
```

---

#### 3.1.3 약한 Ambient Light
```jsx
<ambientLight intensity={0.15} />
```

- 완전 제거는 금물

---

## 3.2 머티리얼 전략

### 3.2.1 권장: MeshPhongMaterial
```jsx
<meshPhongMaterial
  color="#bba77f"
  shininess={35}
  specular="#dddddd"
/>
```

- shininess: 25~45 권장
- specular는 순백색 지양

---

### 3.2.2 보철물(회색) 머티리얼
```jsx
<meshPhongMaterial
  color="#cfcfcf"
  shininess={20}
  specular="#bbbbbb"
/>
```

---

## 3.3 형태 강조용 Fake AO 개념

- 3Shape는 실제 AO를 거의 사용하지 않음
- 법선과 시선 벡터 기반 명암 보정 활용

### 개념식 (Shader)
```glsl
float ndv = dot(normalize(vNormal), normalize(vViewDir));
float shade = smoothstep(0.0, 0.6, ndv);
```

- 마진, 교합 edge 가독성 향상

---

## 4. 거리맵(Color Distance Map) 처리 원칙

### 4.1 3Shape 거리맵의 본질

- 조명 계산과 무관
- 법선 영향 없음
- 기준 메쉬와 대상 메쉬 간 **순수 거리값 시각화**

---

### 4.2 R3F에서의 올바른 구현 방식

#### 잘못된 방식
- 거리값을 조명 계산에 포함

#### 권장 방식
```glsl
vec3 color = distanceColor(distance);
gl_FragColor = vec4(color, 1.0);
```

- Lighting 계산을 완전히 우회
- Emissive 컬러처럼 처리

---

## 5. 카메라 세팅

### 5.1 Perspective Camera (권장)
```jsx
<PerspectiveCamera
  makeDefault
  fov={25}
  near={0.1}
  far={1000}
/>
```

- 과도한 원근 왜곡 방지

### 5.2 Orthographic Camera
- 교합 공간 확인 시 적극 권장

---

## 6. 즉시 적용 체크리스트 (우선순위)

1. DirectionalLight를 카메라 종속으로 변경
2. MaterialStandard → MeshPhongMaterial 전환
3. AmbientLight 강도 0.1~0.2로 조정
4. 거리맵을 조명 계산에서 완전히 분리
5. 카메라 FOV 25 전후로 축소

---

## 7. 다음 확장 가능 항목

- R3F용 3Shape 조명 프리셋 컴포넌트
- 거리맵 전용 ShaderMaterial 템플릿
- 교합 공간 확인용 dual-view (Shaded + Distance)
- STL 간 signed distance 계산 로직
