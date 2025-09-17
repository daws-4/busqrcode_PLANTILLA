import { connectDB } from "@/libs/db";
import fiscales from "@/models/fiscales";
import { NextResponse } from "next/server";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { cookies } from "next/headers";

connectDB();
const jwtName = process.env.JWT_NAME;
if (!jwtName) {
  throw new Error("JWT_NAME is not defined in environment variables");
}
export async function POST(request: any) {
  const { ubicacion, numero, username, password, sethora, setdelete, setruta } =
    await request.json();
  const cookieStore = await cookies();
  const token: any = cookieStore.get(jwtName as any);
  try {
    jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;
    const findUnidad = await fiscales.findOne({ numero });
    if (findUnidad) {
      return NextResponse.json(
        { error: "Ya existe una unidad con esta placa" },
        { status: 401 }
      );
    }
    const findUsername = await fiscales.findOne({ username });
    if (findUsername) {
      return NextResponse.json(
        { error: "Ya existe un fiscal con este nombre de usuario" },
        { status: 401 }
      );
    }
    const newUnidad = new fiscales({
      ubicacion,
      numero,
      username,
      password,
      sethora: !!sethora,
      setdelete: !!setdelete,
      setruta: !!setruta,
    });
    const savedUnidad = await newUnidad.save();
    return NextResponse.json(savedUnidad);
  } catch (error) {
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}

export async function PUT(request: any) {
  const {
    ubicacion,
    numero,
    _id,
    username,
    password,
    sethora,
    setdelete,
    setruta,
  } = await request.json();
  console.log(ubicacion, numero, _id, username, password, sethora, setdelete);
  const cookieStore = await cookies();
  const token: any = cookieStore.get(jwtName as any);
  try {
    jwt.verify(token.value, process.env.JWT_SECRET as Secret) as JwtPayload;
    const findNumero = await fiscales.findOne({ numero });
    if (findNumero && findNumero._id.toString() != _id) {
      return NextResponse.json(
        { error: "Ya existe un fiscal con este número" },
        { status: 401 }
      );
    }
    const findUsername = await fiscales.findOne({ username });
    if (findUsername && findUsername._id.toString() != _id) {
      return NextResponse.json(
        { error: "Ya existe un fiscal con este nombre de usuario" },
        { status: 401 }
      );
    }
    const updatedUnidad = await fiscales.findOneAndUpdate(
      { _id },
      {
        ubicacion,
        numero,
        password,
        username,
        sethora: !!sethora,
        setdelete: !!setdelete,
        setruta: !!setruta,
      }
    );
    if (!updatedUnidad) {
      return NextResponse.json(
        { error: "No se encuentra ningún fiscal con ese ID" },
        { status: 409 }
      );
    }
    return NextResponse.json(updatedUnidad);
  } catch (error) {
    console.log(error);
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
    const deletedUnidad = await fiscales.findByIdAndDelete(id);
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
