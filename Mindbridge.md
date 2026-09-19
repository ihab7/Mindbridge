# Mindbridge

## Status

**Phase**: MVP in progress  
**Architecture**: ~90% complete  
**Current Focus**: UX enhancement  
**Last Updated**: 2026-09-19

Health-tech SaaS platform connecting practitioners and patients for daily wellness tracking.

---

## Architecture

| Component | Decision | Notes |
|-----------|----------|-------|
| Frontend | Next.js + React + TypeScript | App router, server components where possible |
| Backend | Node.js | API routes or separate service |
| Database | PostgreSQL + MongoDB | Hybrid: relational (users, sessions) + document (wellness data) |
| LLM Integration | Anthropic/OpenAI APIs | LangChain for chain orchestration |
| Auth | [Your choice] | e.g., NextAuth, Auth0, custom JWT |
| Hosting | AWS | EC2/RDS/S3 or Vercel + managed DB |
| Real-time | [If needed] | e.g., WebSockets, tRPC, or polling |

---

## Blockers & Next Steps

### Current Blockers
- [ ] List friction points here (e.g., UX flow gaps, performance issues, missing integrations)

### UX Enhancement Focus
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

### Upcoming
- [ ] Post-MVP roadmap items
- [ ] Scalability prep
- [ ] Analytics / monitoring

---

## Quick Links
- Repo: `C:\Users\ThinkPad\Downloads\MindBridge`
- Last session: [Add context here]
