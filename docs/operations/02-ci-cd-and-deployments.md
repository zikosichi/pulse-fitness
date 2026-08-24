# CI/CD and deployments

## GitHub source

- Repository: [`https://github.com/zikosichi/pulse-fitness`](https://github.com/zikosichi/pulse-fitness)
- Git remote: `https://github.com/zikosichi/pulse-fitness.git`
- Visibility: public
- Default and production branch: `main`
- Active branches observed on 2026-08-20: one (`main`)
- Latest verified production commit when this handbook was written: `5a1786a` (`Refine custom favicon`)

The old bookmarked repository `tevzadzedavit-coder/tskaltubofitness` is not connected to the current local repository or Vercel project.

## What “CI” means here

There are no files under `.github/workflows/` and no GitHub Actions workflow in the repository. There is also no separate test runner in `package.json`.

The current automated gate is Vercel:

1. GitHub receives a commit.
2. Vercel receives the Git event through its Git integration.
3. Vercel installs dependencies and runs the detected Next.js build.
4. A successful `main` build becomes a Production deployment.
5. Other Git branches become Preview deployments.
6. Vercel reports deployment status back to GitHub. GitHub showed one successful status check on `main` when verified.

Because no repository-owned CI workflow exists, local lint/build checks are especially important.

## Required local checks

From `pulse-web/`:

```bash
npm ci
npm run lint
npm run build
```

There is currently no `npm test` script. Do not claim tests passed; only lint and production build can be run with the existing scripts.

For local development:

```bash
npm run dev
```

Default local URL: `http://localhost:3000`.

## Vercel project

- Dashboard: [`https://vercel.com/zikosichis-projects/pulse-fitness`](https://vercel.com/zikosichis-projects/pulse-fitness)
- Team: `zikosichi's projects`
- Plan observed: Hobby
- Project name: `pulse-fitness`
- Project ID: `prj_6B8Ax4cpMFJsq9Gs5NV5Rx1cfqSE`
- Connected Git repository: `zikosichi/pulse-fitness`
- Production branch tracking: `main`
- Preview branch tracking: all unassigned Git branches
- Development environment: available through Vercel CLI

## Vercel build settings

Verified on 2026-08-20:

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | Repository root (field empty) |
| Build command | Framework default; no override |
| Install command | Framework default; no override |
| Output directory | Framework default; no override |
| Development command | Framework default; no override |
| Node.js runtime | `24.x` |
| Environment variables | None configured |
| Deployment checks | None configured |
| Rolling releases | Disabled |
| Prioritize Production builds | Enabled |
| Git LFS | Disabled |
| Deploy hooks | None |
| Pull-request comments | Enabled through the Git integration |
| Commit comments | Disabled |
| Deployment status events | Enabled |
| Repository dispatch events | Enabled |
| Deployment retention | Enabled; old deployments may eventually be deleted |

## Domain assignment in Vercel

- Primary Production domain: `www.pulsefitness.ge`
- Apex `pulsefitness.ge`: configured as a `308` redirect to `www.pulsefitness.ge`
- Stable Vercel alias: `pulse-fitness-rust.vercel.app`

The stable `.vercel.app` hostname retains the older generated name even though the Vercel project is now named `pulse-fitness`.

## Normal deployment procedure

Preferred safer flow:

```bash
git status
git pull --ff-only origin main
git switch -c <short-change-name>
npm ci
npm run lint
npm run build
git add <explicit-files>
git commit -m "Describe the change"
git push -u origin <short-change-name>
```

Then open a GitHub pull request. Vercel should create a Preview deployment for the branch/PR. Review the preview, merge into `main`, and watch the Production deployment.

Current reality: direct pushes to `main` also deploy Production. Use them only when intentionally shipping immediately.

## Confirming a deployment

1. Open the Vercel Deployments page.
2. Find the Git commit SHA and message.
3. Confirm state `Ready` and environment `Production`.
4. Open both `https://www.pulsefitness.ge` and `https://pulsefitness.ge`.
5. Confirm the apex redirects to `www` and the page loads.
6. Check `/robots.txt`, `/sitemap.xml`, social metadata, and language switching for changes that affect them.

## Rollback options

Two safe options:

1. **Git revert:** revert the bad commit, run lint/build, and push the revert to `main`. This preserves a complete Git history and creates a new Production deployment.
2. **Vercel previous deployment:** use the Deployments dashboard to promote or redeploy a previously known-good deployment, then reconcile Git immediately so the next push does not reintroduce the bad state.

Do not delete deployment history as a rollback technique.

## Current CI/CD gaps

- No GitHub Actions workflow.
- No automated unit, integration, or end-to-end test script.
- No Vercel deployment checks beyond a successful framework build.
- Branch-protection/ruleset configuration was not verifiable from the signed-out public GitHub view. Do not assume `main` is protected.
- The local `gh` CLI had a stale/invalid authentication token when verified; browser access and ordinary Git credentials are separate.

A future improvement would add a GitHub Actions workflow for `npm ci`, `npm run lint`, and `npm run build`, then require that check before merging to `main`.

