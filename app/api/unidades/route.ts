import { connectDB } from "@/libs/db";
import unidades from "@/models/unidades";
import { NextResponse } from "next/server";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { cookies } from "next/headers";

connectDB();
const jwtName = process.env.JWT_NAME;
if (!jwtName) {
  throw new Error("JWT_NAME is not defined in environment variables");
}

export async function GET() {
  try {
    const allUnidades = await unidades
      .find({}, { numero: 1, _id: 1 })
      .sort({ numero: 1 });
    
    return NextResponse.json(allUnidades);
  } catch (error) {
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}

export async function POST(request: any) {
  const { placa, numero, nombre_conductor, telefono_conductor, id_grupo } =
    await request.json();
   const cookieStore = await cookies();
   const token: any = cookieStore.get(jwtName as any);
   try {
     jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;
    //  const findUnidad = await unidades.findOne({ placa });
    //  if (findUnidad) {
    //    return NextResponse.json(
    //      { error: "Ya existe una unidad con esta placa" },
    //      { status: 401 }
    //    );
    //  }
     const newUnidad = new unidades({
       placa,
       numero,
       nombre_conductor,
       telefono_conductor,
       id_grupo,
     });
     const savedUnidad = await newUnidad.save();
     return NextResponse.json(savedUnidad);
   } catch (error) {
     return NextResponse.json((error as Error).message, { status: 400 });
   }
}

export async function PUT(request: any) {
  const { nombre_conductor, telefono_conductor, numero, placa, _id } =
    await request.json();
  console.log(nombre_conductor, telefono_conductor, numero, placa, _id);
   const cookieStore = await cookies();
   const token: any = cookieStore.get(jwtName as any);
   try {
     jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;
    //  const findUnidad = await unidades.findOne({ placa });
    //  if (findUnidad && findUnidad._id != _id) {
    //    return NextResponse.json(
    //      { error: "Ya existe una unidad con esta placa" },
    //      { status: 401 }
    //    );
    //  }
     const findNumero = await unidades.findOne({ numero });
     if (findNumero && findNumero._id != _id) {
       return NextResponse.json(
         { error: "Ya existe una unidad con este número" },
         { status: 401 }
       );
     }
     const updatedUnidad = await unidades.findOneAndUpdate(
       { _id },
       { nombre_conductor, telefono_conductor, numero, placa }
     );
     if (!updatedUnidad) {
       return NextResponse.json(
         { error: "No se encuentra ninguna unidad con ese ID" },
         { status: 409 }
       );
     }
     return NextResponse.json(updatedUnidad);
   } catch (error) {
    console.log(error)
     return NextResponse.json((error as Error).message, { status: 400 });
   }
}

export async function DELETE(request: any) {
  const { id } = await request.json();
  console.log(id);
   const cookieStore = await cookies();
   const token: any = cookieStore.get(jwtName as any);
   try {
     jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;
     const deletedUnidad = await unidades.findByIdAndDelete(id);
     if (!deletedUnidad) {
       return NextResponse.json(
         { error: "No se encuentra ninguna unidad con ese ID" },
         { status: 409 }
       );
     }
     return NextResponse.json(deletedUnidad);
   } catch (error) {
     return NextResponse.json((error as Error).message, { status: 400 });
   }
}
