import { useState, useEffect } from 'react';
import { getUnifiedData } from '../../../../lib/queries/localData';
import type { Entity } from '../../../../lib/queries';

export const useDashboardData = (municipalityId: string | null = null) => {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { candidates, surveys } = await getUnifiedData();
        
        // Merge candidates and surveys for the main dashboard view
        // In the future we can add more sophisticated filtering or sorting
        const combined = [
          ...candidates,
          ...surveys.map(s => ({ ...s, isSurvey: true }))
        ];

        setEntities(combined);
      } catch (error) {
        console.error('[useDashboardData] Error loading local data:', error);
        setEntities([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [municipalityId]);

  return { entities, loading, refreshing: false };
};
export type { Entity };
