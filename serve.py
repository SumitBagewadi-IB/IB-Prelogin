#!/usr/bin/env python3
"""Serve the mirror locally.

    python3 serve.py            # http://localhost:8000
    python3 serve.py 9000       # custom port

Root-relative URLs (/bonds, /assets/...) need a real server; opening the HTML
files over file:// will not resolve them.
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "404" in (fmt % args):
            sys.stderr.write("404  %s\n" % (fmt % args))


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving %s at http://localhost:%d  (ctrl-c to stop)" % (ROOT, PORT))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
