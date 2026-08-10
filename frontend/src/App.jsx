import { useEffect, useState } from 'react'
import './App.css'

const fallbackMovies = [
  { id: 1, title: 'The Last Horizon', year: 2024, genre: 'Sci-Fi', match: 98, image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80' },
  { id: 2, title: 'Golden Hour', year: 2023, genre: 'Drama', match: 95, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80' },
  { id: 3, title: 'Neon City', year: 2024, genre: 'Thriller', match: 91, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
  { id: 4, title: 'Wild North', year: 2022, genre: 'Adventure', match: 89, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80' },
]

function MovieCard({ movie, onRate, rating }) {
  return (
    <article className="movie-card">
      <img src={movie.image} alt={`${movie.title} poster`} />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p><span>{movie.match}% Match</span> {movie.year} · {movie.genre}</p>
        <div className="rating" aria-label={`Rate ${movie.title}`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" className={star <= rating ? 'selected' : ''} onClick={() => onRate(movie.id, star)} aria-label={`${star} star${star > 1 ? 's' : ''}`}>★</button>
          ))}
        </div>
      </div>
    </article>
  )
}

function App() {
  const [movies, setMovies] = useState(fallbackMovies)
  const [query, setQuery] = useState('')
  const [ratings, setRatings] = useState({})
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState('')

  useEffect(() => {
    fetch('/api/recommendations')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setMovies)
      .catch(() => {})
  }, [])

  const visibleMovies = movies.filter((movie) =>
    `${movie.title} ${movie.genre}`.toLowerCase().includes(query.toLowerCase()),
  )

  function rateMovie(movieId, value) {
    setRatings((current) => ({ ...current, [movieId]: value }))
    fetch(`/api/movies/${movieId}/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: value }),
    }).catch(() => {})
  }

  function login(event) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get('name').trim()
    if (name) {
      setUser(name)
      setShowLogin(false)
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#home">CINEMA</a>
        <nav aria-label="Main navigation"><a href="#home">Home</a><a href="#recommendations">My List</a></nav>
        <div className="actions">
          <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, genres" aria-label="Search movies" /></label>
          <button className="profile" type="button" onClick={() => setShowLogin(true)}>{user ? user.slice(0, 1).toUpperCase() : 'Sign in'}</button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">CINEMA ORIGINAL</p>
          <h1>Stories made<br />for your next night in.</h1>
          <p>Discover films curated from your taste, your ratings, and what you love to watch.</p>
          <a className="play-button" href="#recommendations">▶ Start watching</a>
        </div>
      </section>

      <section className="catalogue" id="recommendations">
        <div className="section-heading">
          <div><p className="eyebrow">PERSONALIZED FOR {user ? user.toUpperCase() : 'YOU'}</p><h2>Top picks for you</h2></div>
          <span>{visibleMovies.length} titles</span>
        </div>
        <div className="movie-grid">
          {visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} rating={ratings[movie.id] || 0} onRate={rateMovie} />)}
        </div>
        {!visibleMovies.length && <p className="empty">No movies match “{query}”. Try another search.</p>}
      </section>

      {showLogin && <div className="dialog-backdrop" role="presentation" onClick={() => setShowLogin(false)}>
        <form className="login-dialog" onSubmit={login} onClick={(event) => event.stopPropagation()}>
          <button className="close" type="button" onClick={() => setShowLogin(false)} aria-label="Close login">×</button>
          <p className="eyebrow">WELCOME TO CINEMA</p><h2>Find your next favorite.</h2>
          <label>Display name<input name="name" autoFocus required placeholder="Alex" /></label>
          <button className="submit" type="submit">Continue</button>
        </form>
      </div>}
    </main>
  )
}

export default App
