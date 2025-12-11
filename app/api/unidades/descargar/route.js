import { connectDB } from "@/libs/db";
import unidades from "@/models/unidades";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import archiver from "archiver";
import { Readable } from "stream";

connectDB();

export async function GET() {
  try {
    // Obtener todas las unidades de la base de datos
    const allUnidades = await unidades.find().sort({ numero: 1 });

    if (!allUnidades || allUnidades.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron unidades en la base de datos" },
        { status: 404 }
      );
    }

    // Crear un archivo ZIP en memoria
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Nivel máximo de compresión
    });

    // Array para almacenar los buffers de los QR codes
    const qrPromises = allUnidades.map(async (unidad) => {
      try {
        // Generar el QR code como buffer
        const qrBuffer = await QRCode.toBuffer(unidad._id.toString(), {
          errorCorrectionLevel: "H",
          type: "png",
          width: 500,
        });

        // Agregar el QR al archivo
        archive.append(qrBuffer, { name: `unidad-${unidad.numero}.png` });
      } catch (error) {
        console.error(`Error generando QR para unidad ${unidad.numero}:`, error);
      }
    });

    // Esperar a que todos los QR codes se generen
    await Promise.all(qrPromises);

    // Finalizar el archivo
    archive.finalize();

    // Convertir el stream del archive a buffer
    const chunks = [];
    
    for await (const chunk of archive) {
      chunks.push(Buffer.from(chunk));
    }
    
    const zipBuffer = Buffer.concat(chunks);

    // Crear la fecha actual para el nombre del archivo
    const now = new Date();
    const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `qr-unidades-${fecha}.zip`;

    // Retornar el ZIP con los headers apropiados
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generando archivo ZIP:", error);
    return NextResponse.json(
      { error: "Error al generar el archivo ZIP de códigos QR" },
      { status: 500 }
    );
  }
}
