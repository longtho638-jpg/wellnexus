# PROJECT BRIEF  
Mission: Evidence Layer cho rebate/payout. Web: Next 15 + Tailwind; Backend: Firebase Functions (Node 20); DB: Firestore.  
Deploy: Web Frameworks for Firebase (SSR). Region: {{REGION}}. Project: {{PROJECT_ID}}.  
MVP Endpoints: GET /api/health (200), POST/GET /api/claims (401 khi thiếu token; 201/200 khi hợp lệ).  
DoD: Build Next pass (không ignore error), Emulators smoke pass, Hosting Preview OK, Rules RBAC deployed, Logs sạch lỗi.  
  
Reference: project/_inputs/glm46/manifest.json (GLM 4.6 scaffold)  
Method: Cách 2 – Lưu trên GCS (repo chỉ giữ manifest và sha)
