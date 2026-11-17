import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioActual } from "@/src/lib/auth";
import { PanelAdmin } from "@/src/components/admin/PanelAdmin";

export const metadata: Metadata = { title: "Panel privado" };

export default async function Admin() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login?volver=/admin");
  return (
    <>
      <h1>Panel privado</h1>
      <PanelAdmin uid={usuario.uid} />
    </>
  );
}
