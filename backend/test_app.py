import json
import threading
import unittest
from http.client import HTTPConnection
from http.server import HTTPServer

from app import ApiHandler, RATINGS


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("localhost", 0), ApiHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def request(self, method, path, body=None):
        connection = HTTPConnection("localhost", self.server.server_port)
        connection.request(method, path, body, {"Content-Type": "application/json"})
        response = connection.getresponse()
        result = response.status, json.loads(response.read())
        connection.close()
        return result

    def test_recommendations_are_available(self):
        status, movies = self.request("GET", "/api/recommendations")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(movies), 1)

    def test_rating_is_validated_and_saved(self):
        status, payload = self.request("POST", "/api/movies/1/rating", '{"rating": 4}')
        self.assertEqual((status, payload["rating"], RATINGS[1]), (200, 4, 4))
        self.assertEqual(self.request("POST", "/api/movies/1/rating", '{"rating": 8}')[0], 400)
