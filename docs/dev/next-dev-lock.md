# Next Dev Lock and Port Recovery

Use this when `pnpm -C apps/web dev` fails with a lock-file or port-in-use error.

## 1. Stop hanging Next.js process

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

## 2. Clear stale Next dev lock

```powershell
Remove-Item -Force apps/web/.next/dev/lock -ErrorAction SilentlyContinue
```

## 3. Restart dev server

```powershell
pnpm -C apps/web dev
```

## 4. Resolve port conflicts

If another process still owns the port:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_NETSTAT> /F
```

For desktop Vite port conflicts (`5173`):

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID_FROM_NETSTAT> /F
```

## 5. Alternate ports when needed

```powershell
pnpm -C apps/web dev -- --port 3001
pnpm -C apps/desktop dev:renderer -- --port 5174
```
