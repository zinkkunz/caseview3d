# CaseView3D Setup Guide

이 가이드는 CaseView3D 프로젝트를 새로운 컴퓨터에 세팅하여 작업을 이어서 할 때 필요한 절차를 설명합니다.

## 필수 준비물
- [Node.js](https://nodejs.org/) (LTS 버전 권장, v18 이상)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (로컬 DB 사용 시) 또는 클라우드 DB 접속 정보

## 설치 및 실행 순서

### 1. 프로젝트 다운로드 (Clone)
터미널(또는 명령 프롬프트)을 열고 프로젝트를 다운로드합니다. 이전에 Push한 GitHub 저장소 주소를 사용하세요.
```bash
git clone https://github.com/zinsunz/caseview3d.git
cd caseview3d
```

### 2. 라이브러리 설치
프로젝트에 필요한 패키지들을 설치합니다.
```bash
npm install
```

### 3. 환경 변수 설정 (.env)
**.env 파일은 보안상 이유로 GitHub에 올라가지 않습니다.** 기존 컴퓨터에 있는 `.env` 파일을 복사해서 가져오거나, 다음 항목들을 채워 새로운 `.env` 파일을 프로젝트 루트 폴더에 만들어야 합니다.

**필수 환경 변수 항목:**
```env
# 데이터베이스 접속 주소 (Postgres)
DATABASE_URL="postgresql://사용자:비밀번호@localhost:5432/데이터베이스이름"

# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="복잡한비밀번호설정"

# 소셜 로그인 설정 (필요한 경우)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""
```

### 4. 데이터베이스 연결 (Prisma)
환경 변수가 설정되었다면, 데이터베이스 스키마를 동기화하고 클라이언트를 생성합니다.

```bash
# Prisma 클라이언트 생성
npx prisma generate

# (새로운 DB라면) 데이터베이스 테이블 생성
npx prisma db push
```

### 5. 개발 서버 실행
모든 설정이 완료되었으면 개발 서버를 실행합니다.
```bash
npm run dev
```
이제 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 작업을 이어가시면 됩니다.

### 6. 초기 관리자 계정 생성 (선택)
새로운 데이터베이스를 연결했다면, 관리자 계정을 새로 생성해야 합니다. 프로젝트에 포함된 스크립트를 실행하면 됩니다.
```bash
node create_admin.js
```
이후 `zinsunz@naver.com` / `admin1234` 로 로그인할 수 있습니다.

## 문제 해결
- **DB 접속 오류**: `.env` 파일의 `DATABASE_URL`이 정확한지 확인하세요.
- **로그인 오류**: `NEXTAUTH_SECRET`과 소셜 로그인 키 값들이 올바른지 확인하세요.
