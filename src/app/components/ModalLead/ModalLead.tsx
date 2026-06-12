"use client";

import { IconX } from "@tabler/icons-react";
import { Imovel, Lead } from "../../services/api";
import styles from "./ModalLead.module.css";

type ModalLeadProps = {
  lead: Lead | null;
  imovel?: Imovel | null;
  onClose: () => void;
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

export function ModalLead({ lead, imovel, onClose }: ModalLeadProps) {
  if (!lead) {
    return null;
  }

  const cityState = [imovel?.city, imovel?.state].filter(Boolean).join("/");

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <span>Detalhes do lead</span>
            <h2 id="lead-details-title">{lead.contactName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar detalhes">
            <IconX size={20} stroke={1.8} />
          </button>
        </header>

        <div className={styles.content}>
          <article className={styles.section}>
            <h3>Cliente</h3>
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{lead.contactName}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{lead.email || "Nao informado"}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{lead.phone || "Nao informado"}</dd>
              </div>
            </dl>
          </article>

          <article className={styles.section}>
            <h3>Lead</h3>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{lead.status?.name ?? "Sem status"}</dd>
              </div>
              <div>
                <dt>Origem</dt>
                <dd>{lead.source || "Sem origem"}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{formatCurrency(lead.value)}</dd>
              </div>
              <div>
                <dt>Proximo contato</dt>
                <dd>{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("pt-BR") : "Nao definido"}</dd>
              </div>
            </dl>
            {lead.notes ? <p className={styles.notes}>{lead.notes}</p> : null}
          </article>

          <article className={styles.section}>
            <h3>Imovel</h3>
            <dl>
              <div>
                <dt>Titulo</dt>
                <dd>{imovel?.title || lead.company}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{imovel?.propertyType || "Nao informado"}</dd>
              </div>
              <div>
                <dt>Endereco</dt>
                <dd>{imovel?.address || "Nao informado"}</dd>
              </div>
              <div>
                <dt>Cidade/UF</dt>
                <dd>{cityState || "Nao informado"}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{formatCurrency(imovel?.price ?? lead.value)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
}
