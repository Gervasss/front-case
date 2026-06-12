"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Alert } from "../components/Alert/Alert";
import { NavbarMinimal } from "../components/Navbar/NavbamarMinimal";
import { ApiError, api, Imovel, Lead, Status } from "../services/api";
import styles from "./Leads.module.css";

type LeadFormState = {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  value: string;
  source: string;
  notes: string;
  nextFollowUp: string;
  statusId: string;
  imovelId: string;
};

const emptyForm: LeadFormState = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  value: "",
  source: "",
  notes: "",
  nextFollowUp: "",
  statusId: "",
  imovelId: "",
};

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

function getImovelTitle(imovel: Imovel) {
  return imovel.title ?? imovel.titulo ?? "";
}

function getImovelValue(imovel: Imovel) {
  return imovel.price ?? imovel.value ?? imovel.valor ?? 0;
}

function toFormState(lead: Lead): LeadFormState {
  return {
    company: lead.company,
    contactName: lead.contactName,
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    value: lead.value ? String(lead.value) : "",
    source: lead.source ?? "",
    notes: lead.notes ?? "",
    nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : "",
    statusId: lead.statusId,
    imovelId: "",
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [form, setForm] = useState<LeadFormState>(emptyForm);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const sortedLeads = useMemo(
    () => [...leads].sort((first, second) => first.contactName.localeCompare(second.contactName)),
    [leads],
  );

  async function loadData() {
    setIsLoading(true);
    setAlert(null);

    try {
      const [kanbanColumns, fallbackStatuses, leadList, imovelResult] = await Promise.all([
        api.leads.kanban().catch(() => []),
        api.statuses.list().catch(() => []),
        api.leads.list(),
        api.imoveis.list().then(
          (items) => ({ items, error: null }),
          (error) => ({ items: [] as Imovel[], error }),
        ),
      ]);
      const statusList = kanbanColumns.map((column) => ({
        id: column.id,
        name: column.name,
        color: column.color,
        order: column.order,
      }));
      const nextStatuses = statusList.length ? statusList : fallbackStatuses;

      setStatuses(nextStatuses);
      setLeads(leadList);
      setImoveis(imovelResult.items);
      setForm((current) => ({ ...current, statusId: current.statusId || nextStatuses[0]?.id || "" }));

      if (imovelResult.error) {
        const message =
          imovelResult.error instanceof ApiError
            ? imovelResult.error.message
            : "Nao foi possivel carregar os imoveis.";
        setAlert({ type: "error", message });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel carregar os leads.";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateForm(field: keyof LeadFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImovelChange(imovelId: string) {
    const selectedImovel = imoveis.find((imovel) => imovel.id === imovelId);

    setForm((current) => ({
      ...current,
      imovelId,
      company: selectedImovel ? getImovelTitle(selectedImovel) : "",
      value: selectedImovel ? String(getImovelValue(selectedImovel)) : "",
    }));
  }

  function startCreate() {
    setEditingLead(null);
    setForm({ ...emptyForm, statusId: statuses[0]?.id ?? "" });
  }

  function startEdit(lead: Lead) {
    const selectedImovel = imoveis.find(
      (imovel) => getImovelTitle(imovel) === lead.company && getImovelValue(imovel) === lead.value,
    );

    setEditingLead(lead);
    setForm({ ...toFormState(lead), imovelId: selectedImovel?.id ?? "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setAlert(null);

    const payload = {
      company: form.company,
      contactName: form.contactName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      value: form.value ? Number(form.value) : undefined,
      source: form.source || undefined,
      notes: form.notes || undefined,
      nextFollowUp: form.nextFollowUp || undefined,
      statusId: form.statusId,
    };

    try {
      if (editingLead) {
        await api.leads.update(editingLead.id, payload);
        setAlert({ type: "success", message: "Lead atualizado." });
      } else {
        await api.leads.create(payload);
        setAlert({ type: "success", message: "Lead criado." });
      }

      setEditingLead(null);
      setForm({ ...emptyForm, statusId: statuses[0]?.id ?? "" });
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel salvar o lead.";
      setAlert({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLead(lead: Lead) {
    const confirmed = window.confirm(`Apagar o lead de ${lead.contactName}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.leads.remove(lead.id);
      setAlert({ type: "success", message: "Lead apagado." });
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel apagar o lead.";
      setAlert({ type: "error", message });
    }
  }

  return (
    <main className={styles.shell}>
      <NavbarMinimal />

      <section className={styles.workspace}>
        {alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null}

        <header className={styles.header}>
          <h1>Leads</h1>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.formPanel}>
            <div className={styles.formHeader}>
              <h1>{editingLead ? "Editar lead" : "Criar lead"}</h1>
            </div>
            <div className={styles.clearAction}>
              <button className={styles.secondaryButton} type="button" onClick={startCreate}>
                Limpar
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                <span>Cliente</span>
                <input value={form.contactName} onChange={(event) => updateForm("contactName", event.target.value)} required />
              </label>
              <label>
                <span>Imovel de interesse</span>
                <select value={form.imovelId} onChange={(event) => handleImovelChange(event.target.value)} required>
                  <option value="">Selecione um imovel</option>
                  {imoveis.map((imovel) => (
                    <option key={imovel.id} value={imovel.id}>
                      {getImovelTitle(imovel)} - {formatCurrency(getImovelValue(imovel))}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select value={form.statusId} onChange={(event) => updateForm("statusId", event.target.value)} required>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.formGrid}>
                <label>
                  <span>E-mail</span>
                  <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
                </label>
                <label>
                  <span>Telefone</span>
                  <input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} />
                </label>
              </div>
              <div className={styles.formGrid}>
                <label>
                  <span>Valor</span>
                  <input type="number" min="0" value={form.value} onChange={(event) => updateForm("value", event.target.value)} />
                </label>
                <label>
                  <span>Origem</span>
                  <input value={form.source} onChange={(event) => updateForm("source", event.target.value)} />
                </label>
              </div>
              <label>
                <span>Proximo contato</span>
                <input type="date" value={form.nextFollowUp} onChange={(event) => updateForm("nextFollowUp", event.target.value)} />
              </label>
              <label>
                <span>Observacoes</span>
                <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={4} />
              </label>
              <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : editingLead ? "Salvar edicao" : "Cadastrar lead"}
              </button>
            </form>
          </section>

          <section className={styles.listPanel}>
            <div className={styles.formHeader}>
              <h1>Gerenciar leads</h1>
            </div>
          

            {isLoading ? <p className={styles.emptyState}>Carregando leads...</p> : null}

            {!isLoading && !sortedLeads.length ? <p className={styles.emptyState}>Nenhum lead cadastrado.</p> : null}

            <div className={styles.leadList}>
              {sortedLeads.map((lead) => (
                <article className={styles.leadRow} key={lead.id}>
                  <div className={styles.cardContent}>
                 
                    <div className={styles.cardGrid}>
                      <span>Cliente</span>
                      <span>Imovel</span>
                      <span>Status</span>
                      <span>Valor</span>
                      <span>Origem</span>
                      <strong>{lead.contactName}</strong>
                      <strong>{lead.company}</strong>
                      <strong>{lead.status?.name ?? "Sem status"}</strong>
                      <strong>{formatCurrency(lead.value)}</strong>
                      <strong>{lead.source || "Sem origem"}</strong>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.editIconButton} type="button" onClick={() => startEdit(lead)} aria-label={`Editar ${lead.contactName}`}>
                      <IconPencil size={18} stroke={1.8} />
                    </button>
                    <button className={styles.deleteIconButton} type="button" onClick={() => void deleteLead(lead)} aria-label={`Apagar ${lead.contactName}`}>
                      <IconTrash size={18} stroke={1.8} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
