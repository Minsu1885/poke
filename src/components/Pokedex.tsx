import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { PokemonWithNames } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemonList, getPokemonWithNames } from '../services/pokeApi';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { useLanguage } from '../i18n/LanguageContext';
import './Pokedex.css';

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

export function Pokedex() {
  const { language, toggleLanguage, t } = useLanguage();
  const [pokemonList, setPokemonList] = useState<PokemonWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonWithNames | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isLoadingRef = useRef(false);

  const loadAllPokemon = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      // Get total count first
      const firstResponse = await getPokemonList(1, 0);
      const total = firstResponse.count;
      setTotalCount(total);

      // Load all Pokemon in batches
      const batchSize = 100;
      const allPokemon: PokemonWithNames[] = [];

      for (let offset = 0; offset < total; offset += batchSize) {
        const response = await getPokemonList(batchSize, offset);

        const pokemonResults = await Promise.allSettled(
          response.results.map((p) => getPokemonWithNames(p.name))
        );

        const pokemonDetails = pokemonResults
          .filter((result): result is PromiseFulfilledResult<PokemonWithNames> => result.status === 'fulfilled')
          .map((result) => result.value);

        allPokemon.push(...pokemonDetails);
        setLoadedCount(offset + response.results.length);
        setLoadingProgress(Math.min(100, Math.round(((offset + batchSize) / total) * 100)));

        // Update list incrementally for better UX
        setPokemonList([...allPokemon].sort((a, b) => a.id - b.id));
      }
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadAllPokemon();
  }, [loadAllPokemon]);

  const filteredPokemon = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return pokemonList.filter((p) => {
      const matchesEnglishName = p.name.toLowerCase().includes(term);
      const matchesKoreanName = p.names.ko?.toLowerCase().includes(term);
      const matchesName = matchesEnglishName || matchesKoreanName;
      const matchesType = !selectedType || p.types.some((tp) => tp.type.name === selectedType);
      return matchesName && matchesType;
    });
  }, [pokemonList, searchTerm, selectedType]);

  const handlePokemonClick = (pokemon: PokemonWithNames) => {
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
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && pokemonList.length === 0 ? (
        <div className="pokedex__loading">
          <div className="pokedex__pokeball-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      ) : (
        <>
          {loading && (
            <div className="pokedex__progress">
              <div className="pokedex__progress-bar">
                <div
                  className="pokedex__progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="pokedex__progress-text">
                {t('loadingMore')} ({loadedCount} / {totalCount})
              </p>
            </div>
          )}

          <div className="pokedex__grid">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                onClick={handlePokemonClick}
              />
            ))}
          </div>

          {filteredPokemon.length === 0 && !loading && (
            <div className="pokedex__empty">
              <p>{t('noResults', { term: searchTerm || selectedType })}</p>
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
