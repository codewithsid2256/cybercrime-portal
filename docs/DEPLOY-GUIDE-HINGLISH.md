# 🚀 GitHub pe upload + Render pe live — Step-by-Step Guide

> **Project folder:** `cybercrime-portal/`
> **Total size:** ~11 MB (GitHub limit 100 MB per file — tension nahi lene ka)
> **Time:** 15–20 minute

Is guide me do hisse hain:
- **Part A** → GitHub pe code daalna
- **Part B** → Render pe live chalana
- **Part C** → Common errors ka solution

---

## PART A — GitHub pe upload karna

### A1. GitHub account aur naya repository

1. [github.com](https://github.com) pe login karo (account nahi hai to **Sign up** — free hai).
2. Top-right corner me **`+`** icon → **New repository**.
3. Ye details bharo:

| Field | Value |
|---|---|
| **Repository name** | `cybercrime-portal` |
| **Description** | `National Cyber Crime Reporting Portal — prototype (citizen portal + officer console)` |
| **Visibility** | **Public** ← Render free plan ke liye Public sabse simple hai (Private bhi chalega, par GitHub connect karna padega) |
| **Initialize this repository with** | ⚠️ **Kuch bhi tick mat karo** (README, .gitignore, license — sab blank chhodo) |

4. **Create repository** click karo.

Ab tumhare paas ek **khaali repo** hai, aur ek URL dikhega jaisa:
```
https://github.com/<tumhara-username>/cybercrime-portal.git
```
Ye URL copy kar lo — agla step me chahiye.

---

### A2. Git install check karo

Terminal / Command Prompt kholo aur chalao:

```bash
git --version
```

- **Version dikha** → aage badho (A3).
- **"command not found" aaya** → Git install karo:
  - **Windows:** [git-scm.com/download/win](https://git-scm.com/download/win) → download → next-next-finish
  - **Mac:** terminal me `xcode-select --install`
  - **Linux:** `sudo apt install git`

Phir `git --version` dobara chalao.

---

### A3. Project folder me jao aur Git setup karo

```bash
cd path/to/cybercrime-portal
```

> **Windows example:** `cd C:\Users\Aritra\Downloads\cybercrime-portal`
> **Tip:** folder ke andar `package.json` hona chahiye. Check karne ke liye `ls` (Mac/Linux) ya `dir` (Windows) chalao.

Ab git ko apna naam/email batao (sirf pehli baar):

```bash
git config --global user.name "Tumhara Naam"
git config --global user.email "tumhara-email@example.com"
```

---

### A4. Git initialize karo aur pehla commit

```bash
git init
git add .
git commit -m "Initial commit: NCRP prototype - citizen portal + officer console"
```

`git add .` karte waqt `.gitignore` automatically `node_modules/`, `data/`, `uploads/` ko chhod dega — yaani sirf source code jayega, 150 MB ki dependencies nahi. ✅

---

### A5. GitHub pe push karo

Branch ka naam `main` karo aur remote jodo:

```bash
git branch -M main
git remote add origin https://github.com/<tumhara-username>/cybercrime-portal.git
git push -u origin main
```

`<tumhara-username>` ki jagah apna actual GitHub username daalo. Example:

```bash
git remote add origin https://github.com/aritra-ghosh/cybercrime-portal.git
```

**Push karte waqt password maangega:**
- **Browser popup** khulega → GitHub me login karo → **Authorize** ✅ (sabse easy)
- Ya **Personal Access Token** chahiye hoga (password nahi chalega):
  GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → scope me `repo` tick → copy → terminal me password ki jagah paste.

**Success ka signal:**
```
Enumerating objects: 62, done.
...
To https://github.com/<you>/cybercrime-portal.git
 * [new branch]      main -> main
```

Ab GitHub pe apna repo refresh karo — saari files dikhni chahiye. 🎉

---

### A6. Thodi si safety (recommended)

Agar repo **private** rakhna chahte ho: GitHub → repo → **Settings → General → Danger Zone → Change visibility → Make private**.
*(Render me GitHub connect karna padega — Part B ke step B2 me note hai.)*

Agar repo public hai to koi dikkat nahi — koi secret file commit nahi hui hai. `ADMIN_PASSWORD` sirf Render ke env var me jayega, code me nahi.

---

## PART B — Render pe live chalana

### B1. Render account banao

1. [render.com](https://render.com) kholo → **Get Started** / **Sign Up**.
2. **Sign in with GitHub** choose karo (sabse simple — repo access direct mil jayega).
3. GitHub permission maangega → **Authorize Render**.
4. Plan: **Individual / Hobby** — koi credit card nahi chahiye free plan ke liye.

---

### B2. Naya Web Service banao

Dashboard me:

1. **+ New** (upar right) → **Web Service**.
2. **"Build and deploy from a Git repository"** select karo → **Next**.
3. Repo list me `cybercrime-portal` dikhega → **Connect** click karo.
   - *Agar repo nahi dikh raha:* **Configure account** / **GitHub** pe click karke `cybercrime-portal` repo ka access allow karo.
   - *Private repo hai to ye step zaroori hai.*
4. Ab form bharo:

| Field | Value |
|---|---|
| **Name** | `ncrp-prototype` (ya jo chaho — URL yahi banega) |
| **Region** | **Singapore** ← India se sabse close, sabse fast |
| **Branch** | `main` |
| **Root Directory** | *(khaali chhodo)* |
| **Runtime / Language** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

5. **Environment Variables** section kholo → **Add Environment Variable** click karo aur ye 4 add karo:

| Key | Value |
|---|---|
| `NODE_VERSION` | `20.20.2` |
| `SESSION_SECRET` | *(koi lamba random string — neeche trick di hai)* |
| `ADMIN_PASSWORD` | *(apna strong password, e.g. `Cyber@Secure#2026`)* |
| `COOKIE_SECURE` | `true` |

> **SESSION_SECRET kaise banaye:** terminal me chalao
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Jo 64-character string aaye, wahi paste kar do. **Check karo** app me `generateValue` use nahi ho raha kyunki ye manual web service hai — isliye khud daalna zaroori hai.

6. **Advanced** section me **Health Check Path** = `/healthz` daal do (optional par useful).

7. **Create Web Service** click karo. 🚀

---

### B3. Deployment dekho (2–4 minute)

Log window me ye dikhega:

```
Cloning from https://github.com/...
Installing dependencies...
added 62 packages
NCRP prototype listening on http://0.0.0.0:10000
==> Your service is live 🎉
```

Status **Live** (green) ho jaye to upar mila URL kholo:

```
https://ncrp-prototype.onrender.com
```

Site chal padegi — pehli baar khulte hi sample data khud-ba-khud seed ho jayega.

**Officer console test karo:**
- `https://ncrp-prototype.onrender.com/admin/login`
- Username: `admin`
- Password: jo tumne `ADMIN_PASSWORD` me daala tha

---

### B4. Auto-deploy kaise kaam karta hai

Render pe **Auto-Deploy: Yes** (default) hota hai. Matlab:

```bash
# local me change karo, phir:
git add .
git commit -m "Update homepage text"
git push
```

Push karte hi Render khud-ba-khud naya version deploy kar dega — 2–3 minute me live. Kuch aur karne ki zaroorat nahi. 🔁

---

### B5. Free plan ki 2 zaroori baatein

Yeh pehle se jaan lo, surprise na ho:

**1. Sleep mode**
15 minute koi visitor nahi aaya → service sleep ho jati hai. Next visitor ke liye **30–60 second** lagta hai load hone me. (Paying plan me ye nahi hota.)

**2. Data reset ho jata hai** ⚠️
Free plan me **persistent disk nahi milti**. Matlab jab bhi service restart ya redeploy hoti hai, tumhare saare complaints aur uploads **mit jate hain** aur app wapas sample data se shuru hoti hai.

- **Demo/portfolio ke liye ye theek hai** — har visitor ko saaf sample data milega, aur kuch nahi bigadta.
- **Agar data bachana hai** (jaise cousin ko link bheja aur usne complaint file ki, restart pe gayab ho gayi):
  - Render **Settings → Instance Type → Starter** ($7/month approx)
  - Phir `render.yaml` ke last me jo **PERSISTENT DISK** block comment me hai, use uncomment karo
  - Ya dashboard me manually: **Disks → Add Disk** → mount path `/var/data` → env vars me `DATA_DIR=/var/data` aur `UPLOAD_DIR=/var/data/uploads`

---

## PART C — Common errors aur solutions

| Error / Problem | Kya hua | Solution |
|---|---|---|
| `fatal: not a git repository` | Galat folder me ho | `cd` karke project folder me jao jahan `package.json` hai |
| `remote: Repository not found` | URL galat hai ya username galat | `git remote -v` se check karo, phir `git remote set-url origin <sahi-URL>` |
| Push pe password reject ho raha | GitHub plain password accept nahi karta | Browser popup me login karo, ya Personal Access Token (Part A5) use karo |
| `failed to push some refs` | GitHub pe initial file (README) bana diya tha | `git pull origin main --allow-unrelated-histories` phir `git push` |
| Render: `No such file or directory: package.json` | Root Directory galat set hai | Render → Settings → **Root Directory** khaali karo (blank) |
| Render: build fail `npm ERR!` | Lockfile mismatch | Build command change karo: `npm install` (jo already hai) — ya `npm ci` **na** rakho |
| Render: `Exited with status 1` | Server crash | Render logs me actual error dekho; 90% cases me `Start Command` galat hota hai → `npm start` hi rakho |
| Site khulti hai par CSS missing | Static file path galat | Nahi hona chahiye — logs bhej dena, check kar lenge |
| Admin login nahi chal raha | `ADMIN_PASSWORD` env var nahi mila | Render → Environment → variable add karke **Manual Deploy → Deploy latest commit** |
| Site "Application failed to respond" | Port binding issue | `PORT` env var **mat** set karo — Render khud deta hai aur code use utha leta hai |
| Free site bahut slow / first load 50 sec | Sleep mode | Normal hai (Part B5). Starter plan me nahi hoga |
| Deploy ke baad data gayab | Ephemeral filesystem | Expected on free plan (Part B5). Disk add karo persistence ke liye |

---

## Quick reference card

```bash
# ── LOCAL TEST ────────────────────────────────
cd cybercrime-portal
npm install
npm start
# → http://localhost:3000
# → http://localhost:3000/admin/login  (admin / Admin@1930)

# ── GITHUB UPLOAD ─────────────────────────────
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/cybercrime-portal.git
git push -u origin main

# ── FUTURE UPDATES ────────────────────────────
git add .
git commit -m "What I changed"
git push          # Render khud deploy kar dega

# ── RENDER SETTINGS ───────────────────────────
Runtime         : Node
Build Command   : npm install
Start Command   : npm start
Health Check    : /healthz
Instance Type   : Free
Region          : Singapore

# ── ENV VARIABLES ─────────────────────────────
NODE_VERSION    = 20.20.2
SESSION_SECRET  = <64-char random hex>
ADMIN_PASSWORD  = <your strong password>
COOKIE_SECURE   = true
```

---

## Deploy ke baad ye 3 kaam zaroor karo

1. **Admin password badlo** — `Admin@1930` sirf local demo ke liye hai. Render pe `ADMIN_PASSWORD` env var se apna password set karo.
2. **README me live link add karo** — GitHub repo ke README me apna Render URL daal do, visitors ko help hoga.
3. **Disclaimer visible rakho** — footer ka "DEMONSTRATION PROTOTYPE" wala notice mat hatao. Ye project sarkari nahi hai, aur ye batana zaroori hai. Emblem ki jagah apna shield logo lagana aur bhi safe hai.

---

## Bonus: custom domain (baad me)

Render free URL `ncrp-prototype.onrender.com` kaafi hai, par apna domain chahiye to:

1. Domain kharido (Namecheap / GoDaddy / Cloudflare — ~₹800/year)
2. Render → **Settings → Custom Domains → Add Custom Domain**
3. `www.yourdomain.com` daalo
4. Domain provider ke DNS me jo CNAME Render batayega wo add karo
5. 10–30 minute me SSL certificate khud lag jayega (free)

**Note:** Custom domain ka matlab ye nahi ki official portal ban gaya. Disclaimer hataana galat hoga, aur `.gov.in` domain kisi ko milta nahi — `.gov.in` sirf sarkari entities ko milta hai.

---

*Guide prepared for the NCRP prototype project · All sample records are fictitious.*
