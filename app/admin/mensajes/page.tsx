import type { Metadata } from "next";
import { BandejaMensajes } from "@/src/components/admin/BandejaMensajes";

export const metadata: Metadata = { title: "Mensajes" };

export default function Mensajes() {
  return (
    <>
      <h1>Bandeja de mensajes</h1>
      <BandejaMensajes />
    </>
  );
}
