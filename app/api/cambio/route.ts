import { NextRequest, NextResponse } from "next/server";
import { buscarCotacao } from "@/lib/cambio";

export async function GET(request: NextRequest) {
  const moeda = request.nextUrl.searchParams.get("moeda");
  if (!moeda) {
    return NextResponse.json(
      { erro: "Parâmetro 'moeda' obrigatório" },
      { status: 400 }
    );
  }

  const cotacao = await buscarCotacao(moeda);
  return NextResponse.json({ cotacao });
}
