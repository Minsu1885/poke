import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokemon } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemonList, getPokemon } from '../services/pokeApi';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { useLanguage } from '../i18n/LanguageContext';
import './Pokedex.css';

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

export function Pokedex() {
  const { language, toggleLanguage, t } = useLanguage();
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const loadPokemon = useCallback(async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await getPokemonList(50, offset);
      setTotalCount(response.count);
      setLoadedCount(offset + response.results.length);

      const pokemonDetails = await Promise.all(
        response.results.map((p) => getPokemon(p.name))
      );

      if (append) {
        setPokemonList((prev) => [...prev, ...pokemonDetails]);
      } else {
        setPokemonList(pokemonDetails);
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
    return pokemonList.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || p.types.some((t) => t.type.name === selectedType);
      return matchesName && matchesType;
    });
  }, [pokemonList, searchTerm, selectedType]);

  const handleLoadMore = () => {
    if (!loadingMore && loadedCount < totalCount) {
      loadPokemon(loadedCount, true);
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
        <button className="pokedex__lang-toggle" onClick={toggleLanguage}>
          {language === 'en' ? '한국어' : 'English'}
        </button>
        <div className="pokedex__logo">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png"
            alt="PokeAPI"
            className="pokedex__logo-img"
          />
          <h1>{t('title')}</h1>
        </div>
        <p className="pokedex__subtitle">
          {t('subtitle', { count: totalCount.toLocaleString() })}
        </p>
      </header>

      <div className="pokedex__controls">
        <div className="pokedex__search">
          <input
            type="text"
            placeholder={t('search')}
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
            <option value="">{t('allTypes')}</option>
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
          <p>{t('loading')}</p>
        </div>
      ) : (
        <>
          <div className="pokedex__grid">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                onClick={handlePokemonClick}
              />
            ))}
          </div>

          {filteredPokemon.length === 0 && (
            <div className="pokedex__empty">
              <p>{t('noResults', { term: searchTerm || selectedType })}</p>
            </div>
          )}

          {loadedCount < totalCount && !searchTerm && !selectedType && (
            <div className="pokedex__load-more">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="pokedex__load-more-btn"
              >
                {loadingMore ? t('loadingMore') : t('loadMore', { current: loadedCount, total: totalCount })}
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
