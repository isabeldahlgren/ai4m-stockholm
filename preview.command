#!/bin/sh
# ---------------------------------------------------------------
#  Double-click this file to look at the site on your own computer.
#
#  A small window of text will open; leave it open while you work.
#  The site appears in your browser at http://localhost:8000
#  Save a file in the content folder, then reload the browser page
#  to see the change. Close the window when you have finished.
# ---------------------------------------------------------------

cd "$(dirname "$0")" || exit 1

python3 - <<'PY'
import http.server, socketserver, webbrowser, threading

class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves the site, and tells the browser never to keep a copy.

    Without this a browser may go on showing the version of a file it
    saw earlier, so an edit appears to have had no effect."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass

socketserver.TCPServer.allow_reuse_address = True

server = None
for port in range(8000, 8011):
    try:
        server = socketserver.TCPServer(("127.0.0.1", port), Handler)
        break
    except OSError:
        continue

if server is None:
    print("\n  Could not start the preview: ports 8000 to 8010 are all in use.")
    print("  Close any other preview window and try again.\n")
    raise SystemExit(1)

url = "http://localhost:%d/" % port
print()
print("  The site is now at  " + url)
print("  Leave this window open while you are editing.")
print("  To stop, close this window or press Ctrl-C.")
print()

threading.Timer(1.0, webbrowser.open, [url]).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n  Preview stopped.\n")
PY
