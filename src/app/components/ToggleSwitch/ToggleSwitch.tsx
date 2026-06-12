"use client";

import styles from "./ToggleSwitch.module.css";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export default function ToggleSwitch({ checked, onChange, label = "Tema" }: ToggleSwitchProps) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <button
        className={styles.switch}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={checked ? "Ativar modo claro" : "Ativar modo escuro"}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  );
}
