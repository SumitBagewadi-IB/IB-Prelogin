#!/usr/bin/env python3
"""Serve the mirror locally.

    python3 serve.py            # http://localhost:8000
    python3 serve.py 9000       # custom port

Root-relative URLs (/bonds, /_next/...) need a real server; opening the HTML
files over file:// will not resolve them.
"""
import http.server
import json
import os
import socket
import sys
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


API_INDEX = os.path.join(ROOT, "_api", "_index.json")
API_MAP = {}
if os.path.exists(API_INDEX):
    with open(API_INDEX) as f:
        API_MAP = json.load(f)


class Handler(http.server.SimpleHTTPRequestHandler):
    # A page here pulls 100+ subresources and a browser opens several sockets
    # at once, so keep-alive plus real concurrency is required — a serial
    # server stalls and the browser gives up with "this page couldn't load".
    protocol_version = "HTTP/1.1"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_GET(self):
        if self.serve_api():
            return
        super().do_GET()

    def do_HEAD(self):
        if self.serve_api(head=True):
            return
        super().do_HEAD()

    def serve_api(self, head=False):
        """Answer /api/... from the snapshot table.

        These cannot live at their real paths: /api/blog is both a document and
        the parent of /api/blog/category, which no filesystem allows. The query
        string is ignored — one snapshot answers every variant.
        """
        u = urlparse(self.path)
        if not u.path.startswith("/api/"):
            return False
        # Prefer an exact path+query snapshot (blog pagination returns different
        # data per page); fall back to the path-only one.
        name = (API_MAP.get(u.path + "?" + u.query) if u.query else None) \
            or API_MAP.get(u.path) or API_MAP.get(u.path.rstrip("/"))
        if not name:
            return False
        blob = os.path.join(ROOT, "_api", name)
        if not os.path.exists(blob):
            return False
        data = open(blob, "rb").read()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if not head:
            self.wfile.write(data)
        return True

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        msg = fmt % args
        if " 404 " in msg or " 500 " in msg:
            sys.stderr.write("%s\n" % msg)


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    # Safe to reuse: a genuine clash is caught by port_taken() before we bind,
    # and without this a restart fails while the old socket is in TIME_WAIT.
    allow_reuse_address = True


def port_taken(port):
    """A wildcard bind can succeed while another process holds 127.0.0.1 on the
    same port, which silently shadows this server. Probe loopback directly."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.4)
        return s.connect_ex(("127.0.0.1", port)) == 0


if port_taken(PORT):
    sys.exit("port %d is already in use — pass a different one, e.g. "
             "python3 serve.py %d" % (PORT, PORT + 77))

with Server(("127.0.0.1", PORT), Handler) as httpd:
    print("serving %s at http://localhost:%d  (ctrl-c to stop)" % (ROOT, PORT))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
