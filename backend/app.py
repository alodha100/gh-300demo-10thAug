"""Small JSON API for the Cinema recommendation client."""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

MOVIES = [
    {"id": 1, "title": "The Last Horizon", "year": 2024, "genre": "Sci-Fi", "match": 98, "image": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80"},
    {"id": 2, "title": "Golden Hour", "year": 2023, "genre": "Drama", "match": 95, "image": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80"},
    {"id": 3, "title": "Neon City", "year": 2024, "genre": "Thriller", "match": 91, "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"},
    {"id": 4, "title": "Wild North", "year": 2022, "genre": "Adventure", "match": 89, "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80"},
]
RATINGS = {}


class ApiHandler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_json(405, {"error": "Method not allowed"})

    def do_GET(self):
        if self.path == "/api/recommendations":
            self.send_json(200, MOVIES)
        else:
            self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        parts = self.path.split("/")
        if len(parts) == 5 and parts[1:3] == ["api", "movies"] and parts[4] == "rating":
            try:
                rating = json.loads(self.rfile.read(int(self.headers["Content-Length"])))["rating"]
                movie_id = int(parts[3])
                if movie_id not in {movie["id"] for movie in MOVIES} or not isinstance(rating, int) or not 1 <= rating <= 5:
                    raise ValueError
            except (KeyError, TypeError, ValueError, json.JSONDecodeError):
                self.send_json(400, {"error": "rating must be an integer from 1 to 5"})
                return
            RATINGS[movie_id] = rating
            self.send_json(200, {"movie_id": movie_id, "rating": rating})
        else:
            self.send_json(404, {"error": "Not found"})

    def log_message(self, format, *args):
        return


def run(port=8000):
    HTTPServer(("", port), ApiHandler).serve_forever()


if __name__ == "__main__":
    run()
