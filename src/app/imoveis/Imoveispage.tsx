"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Alert } from "../components/Alert/Alert";
import { NavbarMinimal } from "../components/Navbar/NavbamarMinimal";
import { ApiError, api, Imovel } from "../services/api";
import styles from "./Imoveis.module.css";

type ImovelFormState = {
  title: string;
  type: string;
  address: string;
  city: string;
  state: string;
  value: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: string;
  notes: string;
};

const emptyForm: ImovelFormState = {
  title: "",
  type: "",
  address: "",
  city: "",
  state: "",
  value: "",
  bedrooms: "",
  bathrooms: "",
  areaM2: "",
  notes: "",
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

function toFormState(imovel: Imovel): ImovelFormState {
  return {
    title: imovel.title ?? "",
    type: imovel.propertyType ?? "",
    address: imovel.address ?? "",
    city: imovel.city ?? "",
    state: imovel.state ?? "",
    value: imovel.price ? String(imovel.price) : "",
    bedrooms: imovel.bedrooms ? String(imovel.bedrooms) : "",
    bathrooms: imovel.bathrooms ? String(imovel.bathrooms) : "",
    areaM2: imovel.areaM2 ? String(imovel.areaM2) : "",
    notes: imovel.notes ?? "",
  };
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [form, setForm] = useState<ImovelFormState>(emptyForm);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const sortedImoveis = useMemo(
    () => [...imoveis].sort((first, second) => (first.title ?? "").localeCompare(second.title ?? "")),
    [imoveis],
  );

  async function loadData() {
    setIsLoading(true);
    setAlert(null);

    try {
      const imovelList = await api.imoveis.list();
      setImoveis(imovelList);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel carregar os imoveis.";
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

  function updateForm(field: keyof ImovelFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setEditingImovel(null);
    setForm(emptyForm);
  }

  function startEdit(imovel: Imovel) {
    setEditingImovel(imovel);
    setForm(toFormState(imovel));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setAlert(null);

    const payload = {
      title: form.title,
      type: form.type,
      address: form.address,
      city: form.city,
      state: form.state,
      value: Number(form.value),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      areaM2: form.areaM2 ? Number(form.areaM2) : undefined,
      notes: form.notes || undefined,
    };

    try {
      if (editingImovel) {
        await api.imoveis.update(editingImovel.id, payload);
        setAlert({ type: "success", message: "Imovel atualizado." });
      } else {
        await api.imoveis.create(payload);
        setAlert({ type: "success", message: "Imovel cadastrado." });
      }

      startCreate();
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel salvar o imovel.";
      setAlert({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteImovel(imovel: Imovel) {
    const confirmed = window.confirm(`Apagar o imovel ${imovel.title}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.imoveis.remove(imovel.id);
      setAlert({ type: "success", message: "Imovel apagado." });
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel apagar o imovel.";
      setAlert({ type: "error", message });
    }
  }

  return (
    <main className={styles.shell}>
      <NavbarMinimal />

      <section className={styles.workspace}>
        {alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null}

        <header className={styles.header}>
          <h1>Imoveis</h1>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.formPanel}>
            <div className={styles.formHeader}>
              <h1>{editingImovel ? "Editar imovel" : "Cadastrar imovel"}</h1>
            </div>
            <div className={styles.clearAction}>
              <button className={styles.secondaryButton} type="button" onClick={startCreate}>
                Limpar
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                <span>Titulo</span>
                <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} required />
              </label>
              <div className={styles.formGrid}>
                <label>
                  <span>Tipo</span>
                  <input value={form.type} onChange={(event) => updateForm("type", event.target.value)} required />
                </label>
                <label>
                  <span>Valor</span>
                  <input type="number" min="0" value={form.value} onChange={(event) => updateForm("value", event.target.value)} required />
                </label>
              </div>
              <label>
                <span>Endereco</span>
                <input value={form.address} onChange={(event) => updateForm("address", event.target.value)} required />
              </label>
              <div className={styles.formGrid}>
                <label>
                  <span>Cidade</span>
                  <input value={form.city} onChange={(event) => updateForm("city", event.target.value)} required />
                </label>
                <label>
                  <span>Estado</span>
                  <input maxLength={2} value={form.state} onChange={(event) => updateForm("state", event.target.value.toUpperCase())} required />
                </label>
              </div>
              <div className={styles.formGridThree}>
                <label>
                  <span>Quartos</span>
                  <input type="number" min="0" value={form.bedrooms} onChange={(event) => updateForm("bedrooms", event.target.value)} />
                </label>
                <label>
                  <span>Banheiros</span>
                  <input type="number" min="0" value={form.bathrooms} onChange={(event) => updateForm("bathrooms", event.target.value)} />
                </label>
                <label>
                  <span>Area m2</span>
                  <input type="number" min="0" value={form.areaM2} onChange={(event) => updateForm("areaM2", event.target.value)} />
                </label>
              </div>
              <label>
                <span>Observacoes</span>
                <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={4} />
              </label>
              <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : editingImovel ? "Salvar edicao" : "Cadastrar imovel"}
              </button>
            </form>
          </section>

          <section className={styles.listPanel}>
            <div className={styles.formHeader}>
              <h1>Gerenciar imoveis</h1>
            </div>
           

            {isLoading ? <p className={styles.emptyState}>Carregando imoveis...</p> : null}

            {!isLoading && !sortedImoveis.length ? <p className={styles.emptyState}>Nenhum imovel cadastrado.</p> : null}

            <div className={styles.imovelList}>
              {sortedImoveis.map((imovel) => (
                <article className={styles.imovelRow} key={imovel.id}>
                  <div className={styles.cardContent}>
               
                    <div className={styles.cardGrid}>
                      <span>Imovel</span>
                      <span>Tipo</span>
                      <span>Local</span>
                      <span>Quartos</span>
                      <span>Valor</span>
                      <strong>{imovel.title}</strong>
                      <strong>{imovel.propertyType}</strong>
                      <strong>{imovel.city}/{imovel.state}</strong>
                      <strong>{imovel.bedrooms ?? 0}</strong>
                      <strong>{formatCurrency(imovel.price)}</strong>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.editIconButton} type="button" onClick={() => startEdit(imovel)} aria-label={`Editar ${imovel.title}`}>
                      <IconPencil size={18} stroke={1.8} />
                    </button>
                    <button className={styles.deleteIconButton} type="button" onClick={() => void deleteImovel(imovel)} aria-label={`Apagar ${imovel.title}`}>
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
