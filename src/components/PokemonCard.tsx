import { useState } from 'react';
import type { PokemonWithNames } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemonImageUrl } from '../services/pokeApi';
import { useLanguage } from '../i18n/LanguageContext';
import './PokemonCard.css';

interface PokemonCardProps {
  pokemon: PokemonWithNames;
  onClick: (pokemon: PokemonWithNames) => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const { language } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  const displayName = language === 'ko'
    ? (pokemon.names.ko || pokemon.name)
    : (pokemon.names.en || pokemon.name);

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
          alt={displayName}
          className={`pokemon-card__image ${imageLoaded ? 'pokemon-card__image--loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      <h3 className="pokemon-card__name">{displayName}</h3>
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
