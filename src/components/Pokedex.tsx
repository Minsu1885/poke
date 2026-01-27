import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokemon, PokemonListItem } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemonList } from '../services/pokeApi';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import './Pokedex.css';

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

export function Pokedex() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadPokemon = useCallback(async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await getPokemonList(50, offset);
      setTotalCount(response.count);
      if (append) {
        setPokemonList((prev) => [...prev, ...response.results]);
      } else {
        setPokemonList(response.results);
      }
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPokemon();
  }, [loadPokemon]);

  const filteredPokemon = useMemo(() => {
    return pokemonList.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pokemonList, searchTerm]);

  const handleLoadMore = () => {
    if (!loadingMore && pokemonList.length < totalCount) {
      loadPokemon(pokemonList.length, true);
    }
  };

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleCloseDetail = () => {
    setSelectedPokemon(null);
  };

  return (
    <div className="pokedex">
      <header className="pokedex__header">
        <div className="pokedex__logo">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png"
            alt="PokeAPI"
            className="pokedex__logo-img"
          />
          <h1>Pokedex</h1>
        </div>
        <p className="pokedex__subtitle">
          Explore {totalCount.toLocaleString()} Pokemon from all generations
        </p>
      </header>

      <div className="pokedex__controls">
        <div className="pokedex__search">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pokedex__search-input"
          />
          {searchTerm && (
            <button
              className="pokedex__search-clear"
              onClick={() => setSearchTerm('')}
            >
              &times;
            </button>
          )}
        </div>
        <div className="pokedex__filter">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="pokedex__type-select"
          >
            <option value="">All Types</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="pokedex__loading">
          <div className="pokedex__pokeball-spinner"></div>
          <p>Loading Pokemon...</p>
        </div>
      ) : (
        <>
          <div className="pokedex__grid">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                url={pokemon.url}
                onClick={handlePokemonClick}
              />
            ))}
          </div>

          {filteredPokemon.length === 0 && (
            <div className="pokedex__empty">
              <p>No Pokemon found matching "{searchTerm}"</p>
            </div>
          )}

          {pokemonList.length < totalCount && !searchTerm && (
            <div className="pokedex__load-more">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="pokedex__load-more-btn"
              >
                {loadingMore ? 'Loading...' : `Load More (${pokemonList.length} / ${totalCount})`}
              </button>
            </div>
          )}
        </>
      )}

      {selectedPokemon && (
        <PokemonDetail pokemon={selectedPokemon} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
