'use client'
import { Input, Divider, Button, Textarea, TimeInput, Checkbox, Card, CardBody, Switch } from "@heroui/react";
import { Time } from "@internationalized/date";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import bcrypt from 'bcryptjs';

interface UnidadesProps {
    unidades?: any;
}

export default function Fiscales_add({ unidades }: UnidadesProps) {
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [hora, setHora] = useState(false);
    const [ruta, setRuta] = useState(false);
    const [delet, setDelete] = useState(false);


    const submitForm = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = {
            ubicacion: form.get('ubicacion'),
            numero: form.get('numero'),
            username: form.get('username'),
            setdelete: delet,
            sethora: hora,
            setruta: ruta,
            password: await bcrypt.hash(password, 10)
        }
        try {
            const response = await axios.post('/api/fiscales', data);
            if (response.status === 400) {
                throw new Error('Error al agregar fiscal');
            } else if (response.status === 401) {
                console.log(response);
                toast.error('Ya existe un fiscal con ese número');
            } else if (response.status === 200) {
                toast.success('Fiscal agregado', {
                    onClose: () => router.push('/fiscales')
                });
            }
            console.log(data)
        } catch (error: any) {
            console.log(error);
            if (error.response.status === 400) {
                toast.error('Error al agregar fiscal');
            } else if (error.response.status === 401) {
                toast.error('Ya existe un fiscal con esa placa');
            }
        }
    }

    return (
        <>
            <div className="mb-10 rounded-sm border border-stroke dark:bg-slate-800 bg-slate-200 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex justify-center items-center ">
                    <Card className="my-5 lg:w-1/3">
                        <CardBody className="m-2">
                            <div className="m-5 ">
                                <h1 className="text-xl font-bold">Agregar Fiscal</h1>
                                <Divider />
                                <div className="my-4 w-full">
                                    <form onSubmit={submitForm} className="grid gap-4 pr-3 w-full">
                                        <Textarea name="ubicacion" isRequired required type='text' label='Ubicación del Fiscal' />
                                        <Input name="numero" isRequired required type='text' label='Número del Fiscal' />
                                        <Input name='username' isRequired required type='text' label='Nombre de usuario' />
                                        <Input name='password' isRequired required type='text' min={8} value={password} onChange={(e) => setPassword(e.target.value)} label='Contraseña' />
                                        <Switch name='sethora' defaultSelected={false} onChange={(e) => setHora(e.target.checked)}>¿Selecciona Hora?</Switch>
                                        <Switch name='setruta' defaultSelected={false} onChange={(e) => setRuta(e.target.checked)}>¿Establece Ruta?</Switch>
                                        <Switch name='setdelete' defaultSelected={false} onChange={(e) => setDelete(e.target.checked)}>¿Elimina Registros?</Switch>
                                        <Button type="submit" variant="shadow" className="w-full bg-green-700 text-slate-100">Agregar Fiscal</Button>
                                    </form>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}