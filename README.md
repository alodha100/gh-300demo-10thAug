# Cinema

A responsive movie recommendation demo with a React client and Python JSON API.

## Run locally

In one terminal, start the API:

```bash
python3 backend/app.py
```

In another, start the client:

```bash
cd frontend
npm install
npm run dev
```

The client offers a display-name login, search, one-to-five star ratings, and personalized recommendations. The Vite development server proxies API requests to port 8000.