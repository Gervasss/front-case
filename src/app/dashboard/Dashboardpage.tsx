"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "../components/Alert/Alert";
import { ModalLead } from "../components/ModalLead/ModalLead";
import { NavbarMinimal } from "../components/Navbar/NavbamarMinimal";
import { ApiError, api, Imovel, KanbanColumn, Lead, Status } from "../services/api";
import styles from "./Dashboard.module.css";

function formatCurrency(value?: number | null) {
  if (!value) {
    return "Sem valor";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const allLeads = useMemo(() => columns.flatMap((column) => column.leads), [columns]);
  const totalValue = useMemo(
    () => allLeads.reduce((total, lead) => total + (lead.value ?? 0), 0),
    [allLeads],
  );

  async function loadBoard() {
    setIsLoading(true);
    setAlert(null);

    try {
      const [statusList, kanban, imovelList] = await Promise.all([
        api.statuses.list(),
        api.leads.kanban(),
        api.imoveis.list().catch(() => []),
      ]);
      setStatuses(statusList);
      setColumns(kanban);
      setImoveis(imovelList);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel carregar o dashboard.";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBoard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function moveLead(leadId: string, statusId: string) {
    try {
      await api.leads.move(leadId, { statusId });
      setAlert({ type: "success", message: "Lead movido com sucesso." });
      await loadBoard();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel mover o lead.";
      setAlert({ type: "error", message });
    }
  }

  function findLeadImovel(lead: Lead | null) {
    if (!lead) {
      return null;
    }

    return (
      lead.imovel ??
      imoveis.find((imovel) => imovel.id === lead.imovelId) ??
      imoveis.find(
        (imovel) => imovel.title === lead.company && imovel.price === lead.value,
      ) ?? null
    );
  }

  function findLeadStatusName(lead: Lead | null) {
    if (!lead) {
      return undefined;
    }

    return lead.status?.name ?? statuses.find((status) => status.id === lead.statusId)?.name;
  }

  function enrichLead(lead: Lead) {
    return {
      ...lead,
      status: lead.status ?? statuses.find((status) => status.id === lead.statusId),
      imovel: findLeadImovel(lead),
    };
  }

  return (
    <main className={styles.shell}>
      <NavbarMinimal />

      <section className={styles.workspace}>
        {alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null}

        <header className={styles.header}>
          <h1>Dashboard</h1>
        </header>

        <div className={styles.statsGrid}>
          <article className={styles.statCard} data-tone="up">
            <span>Leads ativos</span>
            <strong>{allLeads.length}</strong>
          </article>
          <article className={styles.statCard} data-tone="good">
            <span>Valor em carteira</span>
            <strong>{formatCurrency(totalValue)}</strong>
          </article>
          <article className={styles.statCard} data-tone="warn">
            <span>Status</span>
            <strong>{statuses.length}</strong>
          </article>
        </div>

        <section className={styles.board} aria-label="Dashboard de leads">
          <div className={styles.sectionTitle}>
            
            <button className={styles.secondaryButton} type="button" onClick={loadBoard}>
              Atualizar
            </button>
          </div>

          <div className={styles.legend} aria-label="Legendas dos status">
            {statuses.map((status) => (
              <span key={status.id}>
                <i style={{ backgroundColor: status.color }} />
                {status.name}
              </span>
            ))}
          </div>

          {isLoading ? <p className={styles.emptyState}>Carregando leads...</p> : null}

          {!isLoading && !columns.length ? (
            <p className={styles.emptyState}>Nenhum status ou lead encontrado. Use a aba Leads para criar registros.</p>
          ) : null}

          {!isLoading && columns.length ? (
            <div className={styles.kanban}>
              {columns.map((column) => (
                <article
                  className={styles.column}
                  key={column.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedLeadId) {
                      void moveLead(draggedLeadId, column.id);
                      setDraggedLeadId(null);
                    }
                  }}
                >
                  <div className={styles.columnHeader}>
                    <span style={{ backgroundColor: column.color }} />
                    <h3>{column.name}</h3>
                    <strong>{column.leads.length}</strong>
                  </div>

                  <div className={styles.leadList}>
                    {column.leads.map((lead) => (
                      <article
                        className={styles.leadCard}
                        draggable
                        key={lead.id}
                        onDragStart={() => setDraggedLeadId(lead.id)}
                        onDragEnd={() => setDraggedLeadId(null)}
                      >
                        <div className={styles.leadTop}>
                       
                          <span>{lead.source || "Sem origem"}</span>
                        </div>
                        <div className={styles.leadInfoGrid}>
                          <span>Cliente</span>
                          <span>Imovel</span>
                          <span>Valor</span>
                          <strong>{lead.contactName}</strong>
                          <strong>{lead.company}</strong>
                          <strong>{formatCurrency(lead.value)}</strong>
                        </div>
                        <label className={styles.moveField}>
                          <span>Status</span>
                          <select value={lead.statusId} onChange={(event) => void moveLead(lead.id, event.target.value)}>
                            {statuses.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button className={styles.detailsButton} type="button" onClick={() => setSelectedLead(enrichLead(lead))}>
                          Ver detalhes
                        </button>
                      </article>
                    ))}

                    {!column.leads.length ? <p className={styles.columnEmpty}>Solte leads aqui.</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
      <ModalLead
        lead={selectedLead}
        imovel={findLeadImovel(selectedLead)}
        statusName={findLeadStatusName(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />
    </main>
  );
}
