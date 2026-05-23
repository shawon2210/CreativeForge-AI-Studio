"""Quick helper to list all OpenAPI paths from localhost:5000"""
import urllib.request, json
try:
    r = urllib.request.urlopen("http://localhost:5000/openapi.json", timeout=10)
    spec = json.loads(r.read())
    paths = list(spec.get("paths", {}).keys())
    print(f"Total paths: {len(paths)}")
    for p in sorted(paths):
        print(p)
except Exception as e:
    print(f"Error: {e}")
