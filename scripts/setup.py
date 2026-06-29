#!/usr/bin/env python3
"""
Cross-platform setup script.
Applies Prisma migrations and seeds demo data.
Usage: python scripts/setup.py
"""

import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVICES = ["user-service", "product-service", "order-service", "cart-service"]

def run(cmd, cwd=None):
    print(f"  Running: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Error: {result.stderr.strip()}")
    else:
        print(f"  OK: {result.stdout.strip()}")
    return result.returncode

def main():
    # Apply Prisma migrations for each service
    for svc in SERVICES:
        svc_dir = os.path.join(ROOT, "backend", svc)
        print(f"\n==> {svc}: applying migrations...")
        ret = run("npx prisma migrate deploy", cwd=svc_dir)
        if ret != 0:
            print(f"  -> Retrying with baseline...")
            run("npx prisma migrate resolve --applied 20260101000000_init", cwd=svc_dir)
            run("npx prisma migrate deploy", cwd=svc_dir)

    # Seed demo data
    print("\n==> Seeding demo data...")
    seed_py = os.path.join(ROOT, "scripts", "seed.py")
    ret = run(f"python \"{seed_py}\"")
    if ret != 0:
        print("  Trying python3...")
        ret = run(f"python3 \"{seed_py}\"")

    print("\nSetup complete!")
    print("Admin: admin@meridian.com / admin123")

if __name__ == "__main__":
    main()
