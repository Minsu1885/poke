import type { Pokemon, PokemonListResponse, PokemonSpecies, PokemonWithNames } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  return response.json();
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon: ${nameOrId}`);
  }
  return response.json();
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon species: ${nameOrId}`);
  }
  return response.json();
}

export function getPokemonImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function getPokemonWithNames(nameOrId: string | number): Promise<PokemonWithNames> {
  const pokemon = await getPokemon(nameOrId);

  const names: Record<string, string> = {};

  try {
    const species = await getPokemonSpecies(nameOrId);
    for (const entry of species.names) {
      names[entry.language.name] = entry.name;
    }
  } catch {
    // Species data not available for some Pokemon
    names.en = pokemon.name;
    names.ko = pokemon.name;
  }

  return {
    ...pokemon,
    names,
  };
}

export function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}
