"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "../services/api";
import { Alert } from "../components/Alert/Alert";
import { useTheme } from "../components/ThemeContext/ThemeContext";
import ToggleSwitch from "../components/ToggleSwitch/ToggleSwitch";
import styles from "./LoginPage.module.css";

type AuthMode = "login" | "register";
type LoginAlert = {
  message: string;
  type: "error" | "success";
};

export default function LoginPage() {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<LoginAlert | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);
    setIsLoading(true);

    try {
      if (authMode === "login") {
        await api.auth.login({ email, password });
        setAlert({ message: "Login realizado com sucesso.", type: "success" });
        router.push("/dashboard");
        return;
      }

      await api.auth.register({ name, email, password });
      setAlert({ message: "Cadastro realizado com sucesso.", type: "success" });
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel concluir a solicitacao. Confira os dados e tente novamente.";

      setAlert({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setAlert(null);
  }

  const isRegisterMode = authMode === "register";

  return (
    <main className={styles.page}>
      {alert ? <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} /> : null}

      <div className={styles.themeArea}>
        <ToggleSwitch checked={darkMode} onChange={setDarkMode} label={darkMode ? "Dark" : "Light"} />
      </div>

      <section className={styles.card} aria-label="Acesso ao sistema">
       

        <div className={styles.modeTabs} aria-label="Selecionar modo de acesso">
          <button
            className={authMode === "login" ? styles.activeTab : styles.tab}
            type="button"
            onClick={() => handleModeChange("login")}
          >
            Entrar
          </button>
          <button
            className={isRegisterMode ? styles.activeTab : styles.tab}
            type="button"
            onClick={() => handleModeChange("register")}
          >
            Registrar
          </button>
        </div>

        <div key={authMode} className={styles.authContent}>
          <div className={styles.heading}>
            <p>{isRegisterMode ? "Primeiro acesso" : "Bem-vindo de volta"}</p>
            <h1>{isRegisterMode ? "Crie sua conta" : "Entre na sua conta"}</h1>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isRegisterMode ? (
              <label className={styles.field}>
                <span>Nome</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                />
              </label>
            ) : null}

            <label className={styles.field}>
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                autoComplete="email"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                required
              />
            </label>

            <button className={styles.submitButton} type="submit" disabled={isLoading}>
              {isLoading ? "Aguarde..." : isRegisterMode ? "Registrar" : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
