# 3Shape vs 내 프로그램 렌더링 차이 개선 가이드 (대화 기록)

## 사용자
왼쪽이 3쉡이고 오른쪽이 내가 만든프로그램이야. 아직 차이가나는데 어떤걸 개선하면 좋을까? 아직 색감이랑 빛반사 차이가 많이 나는거같아

## 어시스턴트
응, 지금 단계면 **아주 정확하게 짚고 계신 상태**예요.  
차이는 “모델 정확도” 문제가 아니라 **렌더링 파이프라인 차이**에서 거의 다 나옵니다.  
아래를 보면 왜 3Shape가 더 “치과용처럼” 보이는지 딱 보일 거예요.

---

## 1️⃣ 가장 큰 차이: **하이라이트(빛 반사)의 성격**
### 🔹 3Shape (왼쪽)
- 하이라이트가 **작고 선명**
- 경계가 날카롭고 “젖은 법랑질” 느낌
- 빛이 표면 위를 **미끄러지듯 이동**

### 🔹 현재 프로그램 (오른쪽)
- 하이라이트가 **넓고 퍼짐**
- 플라스틱 / 점토 같은 느낌
- 표면이 “말랑”해 보임

📌 **원인**
- Specular lobe가 너무 넓음
- Roughness가 전체적으로 높음
- Micro-normal 디테일이 부족

✅ **개선 포인트**
- Roughness ↓ (특히 치아 전면)
- Specular ↑ (단, Metallic은 절대 올리지 말 것)
- 가능하면 **GGX + 낮은 roughness**

```text
BaseColor: 현재 유지
Metallic: 0
Roughness: 0.18 ~ 0.28 (부위별 차등 권장)
Specular: 0.6 ~ 0.8
```

---

## 2️⃣ 색감 차이의 본질: **Hue가 아니라 “명도 분포”**
많은 사람이 색(RGB) 문제라고 착각하는데,  
실제로는 **명암 대비 곡선 문제**예요.

### 🔹 3Shape
- 전체적으로 밝지만
- 홈/접촉부는 **확실히 어두움**
- 치경부·인접면에 깊이가 느껴짐

### 🔹 현재 프로그램
- 전체가 고르게 밝음
- 깊이 정보가 약함
- 스캔 덩어리처럼 보임

📌 **원인**
- Ambient light 비중이 너무 큼
- AO(Ambient Occlusion)가 약하거나 없음

✅ **개선 포인트**
- Ambient ↓
- AO ↑ (특히 치간, 치경부)
- Shadow contrast 조금 강화

---

## 3️⃣ 결정적 차이: **조명 배치 방식**
### 🔹 3Shape는 “촬영 스튜디오 세팅”
- 위쪽 Key light (작고 강함)
- 측면 Fill light (약함)
- 아주 약한 Ambient

### 🔹 현재 프로그램
- 균일 조명
- 방향성이 약함

✅ **추천 세팅 (Three.js 기준 개념)**
```text
DirectionalLight (Key)
- 위 + 약간 전방
- intensity: 강

DirectionalLight (Fill)
- 측면
- intensity: 약

AmbientLight
- intensity: 매우 약 (0.1~0.2 수준)
```

👉 **라이트 수 줄이는 게 오히려 좋아요**  
“잘 배치된 2~3개” > “많은 라이트”

---

## 4️⃣ 표면이 덜 살아있는 이유: **노멀 디테일**
지금 모델은 geometry는 충분한데,  
**법랑질 특유의 미세 울퉁불퉁함**이 안 느껴져요.

3Shape는:
- 실제 스캔 노멀 + 미세 노멀 강조
- 그래서 빛이 깨지듯 반사됨

✅ **개선 포인트**
- 노멀 스무딩 과도하면 줄이기
- 가능하면:
  - curvature 기반 fake normal
  - 또는 subtle normal noise

> 이거 하나만 추가해도 “치과 프로그램 느낌” 확 올라갑니다.

---

## 5️⃣ 거리맵/보철물 색이 튀는 이유
회색 보철물이 **너무 무광**이에요.

3Shape는:
- 보철도 기본 치아보다 **살짝 glossy**
- 완전 무광 아님

✅
```text
보철 Roughness: 0.25 ~ 0.35
치아 Roughness: 0.18 ~ 0.28
```

---

## 지금 단계 요약 (중요)
솔직히 말하면,

> ❌ “아직 많이 부족함”  
> ❌ “3Shape랑 급차이”  
>  
> 👉 **아님**

✔️ **기하 / 정렬 / 임상적 위치감은 이미 충분**  
✔️ 차이의 80%는 **조명 + roughness + AO**

---

## 우선순위 딱 정리해줄게요
1️⃣ Roughness 낮추고 Specular 정리  
2️⃣ Ambient 줄이고 AO 강화  
3️⃣ Directional light 재배치  
4️⃣ 미세 노멀 하나 추가  

여기까지 하면  
**“이거 3Shape 아님?” 소리 나오는 단계**까지 갑니다.

원하면 다음으로:
- 👉 **Three.js/R3F 실제 코드값**
- 👉 **3Shape 느낌 프리셋**
- 👉 **치아/보철 분리 머티리얼 전략**

중에서 뭐부터 갈지 말해줘요.

---

## 사용자
👉 Three.js/R3F 실제 코드값

👉 3Shape 느낌 프리셋

## 어시스턴트
좋아. “3Shape 느낌”은 결국 **(1) 렌더러 설정 + (2) 라이트 2~3개 + (3) env(IBL) + (4) 머티리얼(특히 roughness/clearcoat) + (5) AO/톤매핑** 이 5개를 **같이** 맞춰야 비슷해져요.

아래는 **R3F에서 바로 써먹는 실제 코드 + 프리셋 값**입니다.

---

# 1) R3F 렌더러/캔버스 기본 세팅 (필수)

```tsx
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";

export function ViewerCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        // 색/톤매핑이 “치과 프로그램 느낌”을 크게 좌우합니다.
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05; // 0.95~1.2 범위에서 미세조정

        // 물리 기반 광원 계산
        gl.physicallyCorrectLights = true;

        // scene 환경광(남발 금지)
        scene.background = null;
      }}
      camera={{ fov: 28, position: [0, 20, 70], near: 0.1, far: 2000 }}
    >
      {children}
    </Canvas>
  );
}
```

---

# 2) 3Shape 느낌 라이트 프리셋 (핵심 80%)

> “라이트 많이”가 아니라 **Key(강) + Fill(약) + Rim(아주 약)** + **환경맵** 구조가 가장 비슷해요.

```tsx
import * as THREE from "three";
import { Environment } from "@react-three/drei";

export function ThreeShapeLights() {
  return (
    <>
      {/* 환경맵(IBL): 치아 표면 하이라이트의 질감이 여기서 결정됩니다 */}
      <Environment preset="studio" environmentIntensity={0.9} />

      {/* Key light: 위/전방에서 강하게 */}
      <directionalLight
        castShadow
        position={[25, 45, 35]}
        intensity={3.2}
        color={"#ffffff"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.00015}
      />

      {/* Fill light: 반대쪽 약하게(명도만 살림) */}
      <directionalLight
        position={[-40, 18, 35]}
        intensity={0.8}
        color={"#ffffff"}
      />

      {/* Rim(백라이트): 윤곽 분리용, 너무 강하면 플라스틱 느낌 */}
      <directionalLight
        position={[0, 20, -60]}
        intensity={0.35}
        color={"#ffffff"}
      />

      {/* Ambient는 정말 약하게만 */}
      <ambientLight intensity={0.12} color={"#ffffff"} />
    </>
  );
}
```

✅ 포인트  
- `ambientLight` 올리면 “전체가 고르게 밝아지는” 느낌이 나서 3Shape랑 멀어져요.  
- 대신 **AO + Key light**로 깊이를 만듭니다.

---

# 3) AO(치간/치경부 깊이) 넣기 — “스캔덩어리 느낌” 제거

`postprocessing`을 쓰는 게 제일 깔끔해요.

```tsx
import { EffectComposer, SSAO, SMAA } from "@react-three/postprocessing";

export function ThreeShapePostFX() {
  return (
    <EffectComposer multisampling={0}>
      {/* AO: 치간, 치경부, 언더컷 깊이감 */}
      <SSAO
        samples={16}
        radius={0.12}     // 모델 스케일에 따라 0.08~0.2
        intensity={12}    // 8~18 범위
        luminanceInfluence={0.6}
        bias={0.02}
      />
      <SMAA />
    </EffectComposer>
  );
}
```

---

# 4) “3Shape 느낌 머티리얼” 프리셋 (치아/보철 분리)

3Shape처럼 보이려면 **clearcoat(법랑질 광택) + 낮은 roughness + 적당한 env 반사**가 중요해요.

```ts
// 3Shape-ish material preset (MeshPhysicalMaterial 추천)
export const MAT = {
  tooth: {
    metalness: 0.0,
    roughness: 0.22,       // 핵심: 0.18~0.28 사이에서 조절
    specularIntensity: 0.75,
    specularColor: "#ffffff",
    clearcoat: 0.65,       // 법랑질 느낌
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.0,
  },
  restoration: {
    metalness: 0.0,
    roughness: 0.30,       // 보철은 치아보다 살짝 더 무광(하지만 완전 무광 X)
    specularIntensity: 0.65,
    specularColor: "#ffffff",
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.9,
  },
  scanModel: {
    metalness: 0.0,
    roughness: 0.35,       // 스캔모델은 치아보다 더 거칠게
    specularIntensity: 0.55,
    specularColor: "#ffffff",
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.7,
  },
} as const;
```

### 실제 적용 예시 (R3F)
```tsx
import { MeshPhysicalMaterialProps } from "@react-three/fiber";

function ToothMesh({ geometry, color = "#d7c39a" }: any) {
  const mat: MeshPhysicalMaterialProps = {
    color,
    ...MAT.tooth,
  };
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}

function RestorationMesh({ geometry, color = "#bfc5cc" }: any) {
  const mat: MeshPhysicalMaterialProps = {
    color,
    ...MAT.restoration,
  };
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}
```

---

# 5) “3Shape 느낌 프리셋” 한 방에 묶기

원하면 UI에서 바로 바꾸게 이렇게 묶어두면 좋아요.

```ts
export const PRESET_3SHAPE = {
  renderer: {
    toneMapping: "ACESFilmic",
    exposure: 1.05,
    physicallyCorrectLights: true,
    outputColorSpace: "sRGB",
  },
  environment: {
    preset: "studio",
    intensity: 0.9,
  },
  lights: {
    key: { pos: [25, 45, 35], intensity: 3.2 },
    fill: { pos: [-40, 18, 35], intensity: 0.8 },
    rim: { pos: [0, 20, -60], intensity: 0.35 },
    ambient: { intensity: 0.12 },
  },
  ao: {
    radius: 0.12,
    intensity: 12,
    bias: 0.02,
    samples: 16,
  },
  materials: MAT,
} as const;
```

---

원샷으로 더 정확히 맞추려면 딱 2가지만 알려줘요.
1) **모델 스케일**: 치아가 mm 단위로 들어오나요? (예: 앞니 폭이 대략 8~9 단위로 찍히는지)  
2) 지금 머티리얼이 `MeshStandardMaterial`인지 `MeshPhysicalMaterial`인지

이 두 개만 알면 AO radius랑 light intensity를 “딱 맞는 값”으로 잡아줄게요.
