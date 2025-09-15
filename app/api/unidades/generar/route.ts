import { connectDB } from "@/libs/db";
import unidades from "@/models/unidades";
import { NextResponse } from "next/server";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { cookies } from "next/headers";

// Conectar a la base de datos
connectDB();
const jwtName = process.env.JWT_NAME;
if (!jwtName) {
  throw new Error("JWT_NAME is not defined in environment variables");
}

// GET: /api/unidades/generar?count=100&start=1
export async function GET(request: any) {
  const url = new URL(request.url);
  const countParam = url.searchParams.get("count");
  const startParam = url.searchParams.get("start");

  // valores por defecto
  const count = countParam ? parseInt(countParam, 10) : 150;
  const start = startParam ? parseInt(startParam, 10) : 1;

  // validaciones básicas
  if (isNaN(count) || count <= 0) {
    return NextResponse.json(
      { error: "Parámetro count inválido" },
      { status: 400 }
    );
  }
  if (isNaN(start) || start <= 0) {
    return NextResponse.json(
      { error: "Parámetro start inválido" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token: any = cookieStore.get(jwtName as any);
  try {
    jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;

    // Evitar re-ejecución: si ya existen unidades generadas anteriormente (campos en '0'), bloquear
    const alreadyGenerated = await unidades
      .findOne({ placa: "0", nombre_conductor: "0", telefono_conductor: "0" })
      .lean();
    if (alreadyGenerated) {
      return NextResponse.json(
        {
          error:
            "La generación de unidades ya fue ejecutada anteriormente. Operación bloqueada.",
          message:
            "La generación ya se ejecutó previamente. No se realizaron cambios.",
        },
        { status: 409 }
      );
    }

    // Obtener el último número existente mayor o igual a start-1 para evitar duplicados
    const maxExisting = await unidades
      .find({ numero: { $gte: start } })
      .sort({ numero: -1 })
      .limit(1)
      .lean();

    let nextNumero = start;
    if (maxExisting && maxExisting.length > 0) {
      nextNumero = Math.max(nextNumero, (maxExisting[0].numero || 0) + 1);
    }

    const created: any[] = [];
    const skipped: any[] = [];

    for (let i = 0; i < count; i++) {
      const numero = nextNumero + i;

      // Si ya existe una unidad con ese numero, saltarla
      const exists = await unidades.findOne({ numero }).lean();
      if (exists) {
        skipped.push({ numero, reason: "already_exists" });
        continue;
      }

      const unidadDoc = new unidades({
        placa: "0",
        numero,
        nombre_conductor: "0",
        telefono_conductor: "0",
      });
      const saved = await unidadDoc.save();
      created.push({ _id: saved._id, numero: saved.numero });
    }

    return NextResponse.json({
      createdCount: created.length,
      created,
      skipped,
      message:
        created.length > 0
          ? `Se han generado ${created.length} unidades correctamente.`
          : "No se crearon unidades.",
    });
  } catch (error) {
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}
