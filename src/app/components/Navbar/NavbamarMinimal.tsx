"use client";

import {
  IconBuildingCommunity,
  IconHome2,
  IconLayoutKanban,
  IconLogout,
} from "@tabler/icons-react";
import { Center, Stack, Tooltip, UnstyledButton } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import { useTheme } from "../ThemeContext/ThemeContext";
import classes from "./NavbarMinimal.module.css";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, href, active, onClick }: NavbarLinkProps) {
  if (href) {
    return (
      <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
        <Link
          href={href}
          onClick={onClick}
          className={classes.link}
          data-active={active || undefined}
          aria-label={label}
        >
          <Icon size={20} stroke={1.5} />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const navItems = [
  { icon: IconHome2, label: "Dashboard", href: "/dashboard" },
  { icon: IconLayoutKanban, label: "Leads", href: "/leads" },
  { icon: IconBuildingCommunity, label: "Imoveis", href: "/imoveis" },
];

export function NavbarMinimal() {
  const pathname = usePathname();
  const { darkMode, setDarkMode } = useTheme();

  const links = navItems.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={pathname === link.href || (index === 0 && pathname === "/")}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <Link className={classes.brand} href="/dashboard" aria-label="SI Solucoes Imobiliarias">
          <Image src="/assets/logo.png" alt="SI Solucoes Imobiliarias" width={42} height={42} priority />
        </Link>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack className={classes.navbarFooter} justify="center" gap={10}>
        <div className={classes.themeToggle}>
          <ToggleSwitch checked={darkMode} onChange={setDarkMode} label="" />
        </div>
        <NavbarLink icon={IconLogout} label="Sair" href="/" />
      </Stack>
    </nav>
  );
}
