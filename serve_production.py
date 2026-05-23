"""
Production server for CreativeForge AI Studio.
Serves frontend static files from dist/ and API from the same port.
Usage: python3 serve_production.py
"""
import os
import sys
import subprocess
from pathlib import Path

# Configuration
FRONTEND_DIST = Path(__file__).parent / "apps" / "web" / "dist"
API_PORT = 5000
FRONTEND_PORT = 3000

def main():
    # Check frontend build exists
    if not (FRONTEND_DIST / "index.html").exists():
        print(f"ERROR: Frontend build not found at {FRONTEND_DIST}")
        print("Run: cd apps/web && npx vite build")
        sys.exit(1)

    print("=" * 60)
    print("  CreativeForge AI Studio - Production Server")
    print("=" * 60)
    print(f"  Frontend:  http://localhost:{FRONTEND_PORT}")
    print(f"  API:       http://localhost:{API_PORT}")
    print(f"  API Docs:  http://localhost:{API_PORT}/docs")
    print("=" * 60)

    # Start API server in background
    api_proc = subprocess.Popen(
        [sys.executable, "main_mock.py"],
        cwd=str(Path(__file__).parent / "apps" / "api"),
        env={**os.environ, "CREATIVEFORGE_MODE": "mock"},
    )
    print(f"[API] Started (PID {api_proc.pid})")

    # Start frontend static server
    frontend_proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(FRONTEND_PORT), "--bind", "0.0.0.0"],
        cwd=str(FRONTEND_DIST),
    )
    print(f"[Frontend] Started (PID {frontend_proc.pid})")

    print("\nPress Ctrl+C to stop both servers.\n")

    try:
        api_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        frontend_proc.terminate()
        api_proc.terminate()
        frontend_proc.wait()
        api_proc.wait()
        print("Stopped.")

if __name__ == "__main__":
    main()
