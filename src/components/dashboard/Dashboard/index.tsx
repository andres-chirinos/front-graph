import React, { useCallback, useMemo, useState } from 'react';
import { ListFilter, Users } from 'lucide-react';
import { SearchCommand } from '../SearchCommand/SearchCommand';
import { useDashboardData } from './hooks/useDashboardData';
import { buildPath } from '../../../lib/utils/paths';
import { EntityCard } from './EntityCard';
import type { Entity } from '../../../lib/queries';
import { PaginationControls } from '../../ui/PaginationControls';
import { PieChart, ChevronRight } from 'lucide-react';

const EntityDashboard: React.FC = () => {


  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { entities, loading } = useDashboardData(null);
  const showLoading = loading;

  const totalPages = Math.ceil(entities.length / ITEMS_PER_PAGE);
  const currentEntities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return entities.slice(start, start + ITEMS_PER_PAGE);
  }, [entities, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary-green selection:text-white antialiased">
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto pt-32 px-6 pb-20">
        <header className="mb-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-[ -0.05em] leading-[0.85] mb-8">
              Conoce a tus <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-green to-orange-400">
                Candidatos.
              </span>
            </h1>

            <div className="relative group">
              <SearchCommand
                onSelect={useCallback((entity: Entity) => {
                  window.location.href = buildPath(`/entity?id=${entity.$id}`);
                }, [])}
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {[
                'Todos',
                'Candidatos',
                'Encuestas',
              ].map((filtro) => (
                <button
                  key={`filter-${filtro}`}
                  className="px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-green hover:border-slate-300 shadow-sm transition-all"
                >
                  {filtro}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Vista General del Proceso Electoral
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showLoading ? (
              [1, 2, 3, 4, 5, 6].map((_, index) => (
                <div
                  key={`loading-skeleton-${index}`}
                  className="bg-white border border-slate-200/80 p-6 rounded-[2.5rem] h-60 animate-pulse shadow-sm"
                >
                  <div className="h-4 w-24 rounded bg-slate-100 mb-4"></div>
                  <div className="h-8 w-3/4 rounded bg-slate-100 mb-3"></div>
                  <div className="h-4 w-1/2 rounded bg-slate-100"></div>
                </div>
              ))
            ) : currentEntities.length > 0 ? (
              currentEntities.map((entity) => {
                if (entity.isSurvey) {
                  return (
                    <a
                      key={entity.$id}
                      href={buildPath(`/entity?id=${entity.$id}`)}
                      className="group flex flex-col p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-green shrink-0 group-hover:scale-110 group-hover:bg-primary-green group-hover:text-white transition-all duration-300 shadow-sm">
                          <PieChart className="w-7 h-7" />
                        </div>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/5 text-slate-400 shadow-sm border border-white/10">
                          {entity.coberturaLabel || 'ENCUESTA'}
                        </span>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-[1.35rem] font-black text-white leading-tight mb-4 line-clamp-2 group-hover:text-primary-green transition-colors">
                          {entity.label}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {entity.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] font-black text-white px-4 py-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-primary-green group-hover:border-primary-green transition-all">
                          Ver Resultados
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  );
                }
                return (
                  <EntityCard
                    key={entity.$id}
                    entity={entity}
                    municipalityName={entity.territorio || 'Bolivia'}
                  />
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium flex flex-col items-center gap-2">
                <span>No se encontraron resultados.</span>
              </div>
            )}
          </div>

          {!showLoading && entities.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EntityDashboard);
