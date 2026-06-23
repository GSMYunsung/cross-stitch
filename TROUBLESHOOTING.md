# Troubleshooting

개발 중 마주친 오류와 해결 방법 정리.

---

## 1. `next/image` — hostname not configured

**오류**
```
Invalid src prop (https://avatars.githubusercontent.com/...) on `next/image`,
hostname "avatars.githubusercontent.com" is not configured under images in your next.config.js
```

**원인**  
`next/image`는 허용된 외부 호스트만 이미지를 로드할 수 있음. GitHub 아바타 도메인이 미등록 상태.

**해결**  
`next.config.ts`의 `remotePatterns`에 추가:
```ts
{ protocol: "https", hostname: "avatars.githubusercontent.com" }
```

---

## 2. Firestore — Permission denied (403)

**오류**
```json
{ "error": { "code": 403, "message": "Permission denied." } }
```

**원인**  
Firestore 보안 규칙이 기본값(`allow read, write: if false`)으로 설정되어 있어 모든 접근 차단.

**해결**  
Firebase Console → Firestore Database → 규칙 탭에서 아래로 교체:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /grids/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 3. Firebase Storage — 403 (만료된 규칙)

**오류**
```
Failed to load resource: the server responded with a status of 403
firebasestorage.googleapis.com/v0/b/.../o?name=images%2F{uid}.png
```

**원인**  
Storage 보안 규칙에 `request.time < timestamp.date(2026, 2, 26)` 만료일이 설정되어 있었고 해당 날짜가 지나 모든 요청 차단.

**해결**  
Firebase Console → Storage → 규칙 탭에서 아래로 교체:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && fileName == request.auth.uid + '.png';
    }
  }
}
```
> `{userId}.png` 패턴은 경로에 `.`을 직접 쓸 수 없어 조건문으로 처리.

---

## 4. GitHub 로그인 — `auth/unauthorized-domain`

**오류**
```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
```

**원인**  
Firebase Authentication은 등록된 도메인에서만 OAuth 팝업을 허용함.  
`localhost` 대신 IP(`118.222.27.159:3000`)로 접속 시 미등록 도메인으로 간주되어 차단.

**해결**  
Firebase Console → Authentication → Settings → 승인된 도메인에 접속 IP(`118.222.27.159`) 추가.

---

## 5. GitHub 로그인 후 — `/api/github/user` 401 반복

**오류**
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**원인**  
`signInWithPopup` 완료 직후 `onAuthStateChanged`가 실행되어 `/api/github/user`를 즉시 호출하지만,  
GitHub 토큰을 httpOnly 쿠키에 저장하는 POST 요청이 아직 완료되지 않은 상태 → 쿠키 없음 → 401.

기존 재시도 로직(2회 × 1000ms)이 부족하거나, 재시도 소진 시 401/비정상 응답을 구분하지 않고 `authInfoReset()`을 호출해 로그인 페이지로 돌려보내는 문제도 있었음.

**해결**  
`AuthProvider`의 `initialize()` 재시도 로직 개선:
- 재시도 횟수 2 → 5
- 재시도 간격 1000ms → 600ms  
- 401과 기타 오류 케이스 분리 처리

```ts
if (userRes.status === 401) {
  if (retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return initialize(retries - 1);
  }
  authInfoReset();
  router.push("/login");
  return;
}
```
