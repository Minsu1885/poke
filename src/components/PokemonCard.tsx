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
  const [fallbackLevel, setFallbackLevel] = useState(0);

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  const displayName = language === 'ko'
    ? (pokemon.names.ko || pokemon.name)
    : (pokemon.names.en || pokemon.name);

  // Image fallback chain: official artwork -> API sprite -> basic sprite URL
  const getImageUrl = () => {
    switch (fallbackLevel) {
      case 0:
        return getPokemonImageUrl(pokemon.id);
      case 1:
        return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
      case 2:
        return pokemon.sprites.front_default;
      default:
        return pokemon.sprites.front_default;
    }
  };

  const handleImageError = () => {
    if (fallbackLevel < 2) {
      setFallbackLevel((prev) => prev + 1);
    }
  };

  const imageUrl = getImageUrl();

  return (
    <div
      className="pokemon-card"
      style={{ backgroundColor }}
      onClick={() => onClick(pokemon)}
    >
      <div className="pokemon-card__id">#{String(pokemon.id).padStart(3, '0')}</div>
      <div className="pokemon-card__image-container">
        {!imageLoaded && <div className="pokemon-card__image-skeleton"></div>}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className={`pokemon-card__image ${imageLoaded ? 'pokemon-card__image--loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="pokemon-card__no-image">?</div>
        )}
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
