import { useState, useEffect } from 'react';
import type { Pokemon, PokemonSpecies } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';
import { getPokemonSpecies, getPokemonImageUrl } from '../services/pokeApi';
import { useLanguage } from '../i18n/LanguageContext';
import './PokemonDetail.css';

interface PokemonDetailProps {
  pokemon: Pokemon;
  onClose: () => void;
}

export function PokemonDetail({ pokemon, onClose }: PokemonDetailProps) {
  const { language, t } = useLanguage();
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    getPokemonSpecies(pokemon.id)
      .then(setSpecies)
      .catch(console.error);
  }, [pokemon.id]);

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  const langCode = language === 'ko' ? 'ko' : 'en';

  const flavorText = species?.flavor_text_entries.find(
    (entry) => entry.language.name === langCode
  ) || species?.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );

  const genus = species?.genera.find(
    (g) => g.language.name === langCode
  ) || species?.genera.find(
    (g) => g.language.name === 'en'
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const maxStat = 255;

  return (
    <div className="pokemon-detail-overlay" onClick={handleOverlayClick}>
      <div className="pokemon-detail" style={{ '--primary-color': backgroundColor } as React.CSSProperties}>
        <button className="pokemon-detail__close" onClick={onClose}>
          &times;
        </button>

        <div className="pokemon-detail__header" style={{ backgroundColor }}>
          <div className="pokemon-detail__id">#{String(pokemon.id).padStart(3, '0')}</div>
          <h2 className="pokemon-detail__name">{pokemon.name}</h2>
          {genus && (
            <p className="pokemon-detail__genus">{genus.genus}</p>
          )}
          <div className="pokemon-detail__types">
            {pokemon.types.map((tp) => (
              <span
                key={tp.type.name}
                className="pokemon-detail__type"
                style={{ backgroundColor: TYPE_COLORS[tp.type.name] }}
              >
                {tp.type.name}
              </span>
            ))}
          </div>
          <div className="pokemon-detail__image-container">
            <img
              src={showShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
                : getPokemonImageUrl(pokemon.id)
              }
              alt={pokemon.name}
              className="pokemon-detail__image"
            />
            <button
              className="pokemon-detail__shiny-toggle"
              onClick={() => setShowShiny(!showShiny)}
              title={showShiny ? t('showNormal') : t('showShiny')}
            >
              {showShiny ? '✨' : '⭐'}
            </button>
          </div>
        </div>

        <div className="pokemon-detail__body">
          <div className="pokemon-detail__info-grid">
            <div className="pokemon-detail__info-item">
              <span className="pokemon-detail__info-label">{t('height')}</span>
              <span className="pokemon-detail__info-value">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="pokemon-detail__info-item">
              <span className="pokemon-detail__info-label">{t('weight')}</span>
              <span className="pokemon-detail__info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
          </div>

          {flavorText && (
            <div className="pokemon-detail__description">
              <h3>{t('description')}</h3>
              <p>{flavorText.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')}</p>
            </div>
          )}

          <div className="pokemon-detail__abilities">
            <h3>{t('abilities')}</h3>
            <div className="pokemon-detail__ability-list">
              {pokemon.abilities.map((a) => (
                <span
                  key={a.ability.name}
                  className={`pokemon-detail__ability ${a.is_hidden ? 'pokemon-detail__ability--hidden' : ''}`}
                >
                  {a.ability.name.replace('-', ' ')}
                  {a.is_hidden && <span className="pokemon-detail__hidden-label">{t('hidden')}</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="pokemon-detail__stats">
            <h3>{t('baseStats')}</h3>
            {pokemon.stats.map((stat) => (
              <div key={stat.stat.name} className="pokemon-detail__stat">
                <span className="pokemon-detail__stat-name">
                  {t(`stats.${stat.stat.name}`)}
                </span>
                <span className="pokemon-detail__stat-value">{stat.base_stat}</span>
                <div className="pokemon-detail__stat-bar">
                  <div
                    className="pokemon-detail__stat-fill"
                    style={{
                      width: `${(stat.base_stat / maxStat) * 100}%`,
                      backgroundColor,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pokemon-detail__stat pokemon-detail__stat--total">
              <span className="pokemon-detail__stat-name">{t('total')}</span>
              <span className="pokemon-detail__stat-value">
                {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
