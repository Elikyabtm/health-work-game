import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "C'est quoi la définition ?",
  description:
    "Un jeu interactif pour associer librement des mots autour des grandes définitions de la santé, sécurité et conditions de travail.",
  generator: "Créé dans le cadre d'un module ludique de sensibilisation au SSCT",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
