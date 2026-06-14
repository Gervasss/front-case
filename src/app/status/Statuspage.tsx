"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Alert } from "../components/Alert/Alert";
import { NavbarMinimal } from "../components/Navbar/NavbamarMinimal";
import { ApiError, api, Status } from "../services/api";
import styles from "./Status.module.css";

type StatusFormState = {
  name: string;
  color: string;
  order: string;
};

const emptyForm: StatusFormState = {
  name: "",
  color: "#20b2aa",
  order: "",
};

function toFormState(status: Status): StatusFormState {
  return {
    name: status.name,
    color: status.color,
    order: String(status.order),
  };
}

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [form, setForm] = useState<StatusFormState>(emptyForm);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const sortedStatuses = useMemo(
    () => [...statuses].sort((first, second) => first.order - second.order),
    [statuses],
  );

  async function loadData() {
    setIsLoading(true);
    setAlert(null);

    try {
      const statusList = await api.statuses.list();
      setStatuses(statusList);
      setForm((current) => ({
        ...current,
        order: current.order || String(statusList.length + 1),
      }));
      return statusList;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar os status.";
      setAlert({ type: "error", message });
      return [];
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

  function updateForm(field: keyof StatusFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setEditingStatus(null);
    setForm({ ...emptyForm, order: String(statuses.length + 1) });
  }

  function startEdit(status: Status) {
    setEditingStatus(status);
    setForm(toFormState(status));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setAlert(null);

    const payload = {
      name: form.name.trim(),
      color: form.color,
      order: form.order ? Number(form.order) : undefined,
    };

    try {
      if (editingStatus) {
        await api.statuses.update(editingStatus.id, payload);
        setAlert({ type: "success", message: "Status atualizado." });
      } else {
        await api.statuses.create(payload);
        setAlert({ type: "success", message: "Status criado." });
      }

      setEditingStatus(null);
      const statusList = await loadData();
      setForm({ ...emptyForm, order: String(statusList.length + 1) });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o status.";
      setAlert({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStatus(status: Status) {
    const confirmed = window.confirm(`Apagar o status ${status.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.statuses.remove(status.id);
      setAlert({ type: "success", message: "Status apagado." });
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível apagar o status. Verifique se existem leads usando este status.";
      setAlert({ type: "error", message });
    }
  }

  return (
    <main className={styles.shell}>
      <NavbarMinimal />

      <section className={styles.workspace}>
        {alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null}

        <header className={styles.header}>
          <h1>Status</h1>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.formPanel}>
            <div className={styles.formHeader}>
              <h1>{editingStatus ? "Editar status" : "Criar status"}</h1>
            </div>
            <div className={styles.clearAction}>
              <button className={styles.secondaryButton} type="button" onClick={startCreate}>
                Limpar
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                <span>Nome</span>
                <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
              </label>

              <div className={styles.formGrid}>
                <label>
                  <span>Cor</span>
                  <input type="color" value={form.color} onChange={(event) => updateForm("color", event.target.value)} required />
                </label>
                <label>
                  <span>Ordem</span>
                  <input type="number" min="1" value={form.order} onChange={(event) => updateForm("order", event.target.value)} required />
                </label>
              </div>

              <div className={styles.preview} aria-label="Prévia do status">
                <i style={{ backgroundColor: form.color }} />
                <strong>{form.name || "Novo status"}</strong>
                <span>Coluna {form.order || statuses.length + 1}</span>
              </div>

              <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : editingStatus ? "Salvar edição" : "Criar status"}
              </button>
            </form>
          </section>

          <section className={styles.listPanel}>
            <div className={styles.formHeader}>
              <h1>Status do dashboard</h1>
            </div>

            {isLoading ? <p className={styles.emptyState}>Carregando status...</p> : null}

            {!isLoading && !sortedStatuses.length ? (
              <p className={styles.emptyState}>Nenhum status cadastrado. Crie o primeiro para montar o dashboard.</p>
            ) : null}

            <div className={styles.statusList}>
              {sortedStatuses.map((status) => (
                <article className={styles.statusRow} key={status.id}>
                  <div className={styles.statusContent}>
                    <span className={styles.colorSwatch} style={{ backgroundColor: status.color }} />
                    <div className={styles.statusText}>
                      <strong>{status.name}</strong>
                      <span>Ordem {status.order}</span>
                    </div>
                    <span className={styles.leadCount}>
                      {status._count?.leads ?? 0} leads
                    </span>
                  </div>

                  <div className={styles.rowActions}>
                    <button className={styles.editIconButton} type="button" onClick={() => startEdit(status)} aria-label={`Editar ${status.name}`}>
                      <IconPencil size={18} stroke={1.8} />
                    </button>
                    <button className={styles.deleteIconButton} type="button" onClick={() => void deleteStatus(status)} aria-label={`Apagar ${status.name}`}>
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
