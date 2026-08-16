# -*- coding: utf-8 -*-
"""
PharmaMarket POS Pro - Python Launcher Entrypoint (نقطة تشغيل النظام)
"""

import os
import sys
import subprocess
import webbrowser
import http.server
import socketserver
import threading
import time

# Ensure UTF-8 stdout encoding for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")

class SPAServerHandler(http.server.SimpleHTTPRequestHandler):
    """Handler for Single Page Application routing (fallback to index.html)"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        # Resolve target file path
        req_path = self.translate_path(self.path)
        # If path does not exist and doesn't have a file extension, route to index.html
        if not os.path.exists(req_path) and not os.path.splitext(req_path)[1]:
            self.path = "/index.html"
        return super().do_GET()

def start_application():
    print("=" * 65)
    print(" PharmaMarket POS Pro Launcher - نظام الكاشير للماركت والصيدليات")
    print("=" * 65)

    # Verify if dist/ directory exists, if not trigger build
    if not os.path.exists(DIST_DIR) or not os.path.exists(os.path.join(DIST_DIR, "index.html")):
        print("جاري بناء وتجهيز حزمة النظام (Building production bundle)...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        try:
            subprocess.run([npm_cmd, "run", "build"], cwd=BASE_DIR, check=True)
            print("تم بناء النظام بنجاح!")
        except Exception as err:
            print(f"خطأ أثناء البناء: {err}")

    url = f"http://localhost:{PORT}/"

    # Attempt starting Python standalone server on PORT
    try:
        with socketserver.TCPServer(("", PORT), SPAServerHandler) as httpd:
            print(f"خادم التطبيق يعمل بنجاح على الرابط: {url}")
            print(f"المسار الفرعي للملفات: {DIST_DIR}")
            print("جاري فتح متصفح الإنترنت تلقائياً...")
            print("=" * 65)
            print("اضغط (Ctrl + C) لإيقاف الخادم.")

            # Open default system web browser
            threading.Timer(1.0, lambda: webbrowser.open(url)).start()
            
            httpd.serve_forever()
    except OSError:
        # Port already in use (e.g. Vite dev server or existing session), redirect browser directly
        print(f"المنفذ {PORT} يعمل حالياً. جاري التوجيه إلى {url} ...")
        webbrowser.open(url)

if __name__ == "__main__":
    start_application()
