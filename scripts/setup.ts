#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import path from "node:path"

const root = process.cwd()
const services = [
  "user-service",
  "product-service",
  "order-service",
  "cart-service"
]

function run(command: string, cwd = root): number {
  console.log(`\n  Running: ${command}`)
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: "utf8"
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? ""
    if (stderr) {
      console.error(`  Error: ${stderr}`)
    }
    return result.status ?? 1
  }

  const stdout = result.stdout?.trim() ?? ""
  if (stdout) {
    console.log(`  OK: ${stdout}`)
  }

  return 0
}

function main(): void {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: npm run backend:setup")
    console.log("Applies Prisma migrations and seeds demo data.")
    return
  }

  for (const service of services) {
    const serviceDir = path.join(root, "backend", service)
    console.log(`\n==> ${service}: applying migrations...`)
    let result = run("npx prisma migrate deploy", serviceDir)
    if (result !== 0) {
      console.log("  -> Retrying with baseline...")
      run(
        "npx prisma migrate resolve --applied 20260101000000_init",
        serviceDir
      )
      result = run("npx prisma migrate deploy", serviceDir)
    }
  }

  console.log("\n==> Seeding demo data...")
  const seedScript = path.join(root, "scripts", "seed.ts")
  const result = run(`npx tsx "${seedScript}"`)
  if (result !== 0) {
    console.error("  Seed step failed.")
    process.exit(result)
  }

  console.log("\nSetup complete!")
  console.log("Admin: admin@meridian.com / admin123")
}

main()
