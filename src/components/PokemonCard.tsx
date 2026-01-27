import { useState, useEffect } from 'react';
import type { Pokemon } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemon, getPokemonImageUrl, extractIdFromUrl } from '../services/pokeApi';
import './PokemonCard.css';

interface PokemonCardProps {
  url: string;
  onClick: (pokemon: Pokemon) => void;
}

export function PokemonCard({ url, onClick }: PokemonCardProps) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const pokemonId = extractIdFromUrl(url);

  useEffect(() => {
    getPokemon(pokemonId)
      .then(setPokemon)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pokemonId]);

  if (loading || !pokemon) {
    return (
      <div className="pokemon-card pokemon-card--loading">
        <div className="pokemon-card__skeleton"></div>
      </div>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  return (
    <div
      className="pokemon-card"
      style={{ backgroundColor }}
      onClick={() => onClick(pokemon)}
    >
      <div className="pokemon-card__id">#{String(pokemon.id).padStart(3, '0')}</div>
      <div className="pokemon-card__image-container">
        {!imageLoaded && <div className="pokemon-card__image-skeleton"></div>}
        <img
          src={getPokemonImageUrl(pokemon.id)}
          alt={pokemon.name}
          className={`pokemon-card__image ${imageLoaded ? 'pokemon-card__image--loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      <h3 className="pokemon-card__name">{pokemon.name}</h3>
      <div className="pokemon-card__types">
        {pokemon.types.map((t) => (
          <span
            key={t.type.name}
            className="pokemon-card__type"
            style={{ backgroundColor: TYPE_COLORS[t.type.name] }}
          >
            {t.type.name}
          </span>
        ))}
      </div>
    </div>
  );
}
