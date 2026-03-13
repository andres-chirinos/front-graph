import { findEntityById, getClaimsForEntity } from '../localData';
import type { Entity } from '../types';

/**
 * Fetch a single entity by ID with all its claims
 */
export async function fetchEntityById(entityId: string) {
  try {
    const entity = await findEntityById(entityId);
    if (!entity) throw new Error('Entity not found');

    const claims = await getClaimsForEntity(entityId);

    return {
      entity: entity as Entity,
      claims,
    };
  } catch (error) {
    console.error('Error fetching entity:', error);
    throw error;
  }
}

/**
 * Alias for fetchEntityById - get a single entity by ID
 */
export async function getEntityById(entityId: string) {
  const result = await fetchEntityById(entityId);
  return result.entity;
}
