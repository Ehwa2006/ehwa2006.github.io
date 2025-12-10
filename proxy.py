#!/usr/bin/env python3
"""간단한 SerpAPI 프록시 서버"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
from urllib.error import URLError

SERPAPI_KEY = "5a3d1fa38905880650b9c46f87a5a2fe0df13e7551b0e82a2b0d3f0566e25e45"

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """GET 요청 처리"""
        if self.path == '/api/game-images':
            try:
                # SerpAPI에 요청
                url = f"https://serpapi.com/search.json?q=game&tbm=isch&num=100&api_key={SERPAPI_KEY}"
                with urllib.request.urlopen(url, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
                
                # 응답 반환 (CORS 헤더 포함)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
                
            except URLError as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        """CORS preflight 요청 처리"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """로그 포매팅"""
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    PORT = 3000
    server = HTTPServer(('localhost', PORT), ProxyHandler)
    print(f"🚀 프록시 서버 시작: http://localhost:{PORT}")
    print(f"📌 엔드포인트: http://localhost:{PORT}/api/game-images")
    server.serve_forever()
