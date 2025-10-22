# Runbook Codex CLI  

```
pnpm install
pnpm codex:smoke           # build → emulators → newman
pnpm codex:deploy:preview  # kên h preview
pnpm codex:deploy:prod     # sau 2-eyes
```

## Checklist DoD  

- Build Next pass (không ignore lỗi)  
- Emulators smoke pass (200/401)  
- firebase.json rewrite /api/** → {{API_NAME}} ({{REGION}})  
- Firestore Rules RBAC deployed  
- Hosting Preview OK, Functions logs sạch lỗi 
