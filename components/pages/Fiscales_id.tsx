'use client'
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button, Input, Textarea, Switch } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify'
import axios from 'axios'
import { useState } from "react";
import bcrypt from 'bcryptjs';

interface Plantillas_Pizarras_idProps {
    fiscal?: any
    params?: any
}

export default function Plantillas_Pizarras_id({ fiscal, params }: Plantillas_Pizarras_idProps) {
    const router = useRouter()
    const unid = JSON.parse(fiscal)
    const fiscId = params.fisc
    console.log(params.fisc)
    const [numero, setNumero] = useState(unid.numero)
    const [ubicacion, setUbicacion] = useState(unid.ubicacion)
    const [username, setUsername] = useState(unid.username)
    const [password, setPassword] = useState('')
    const [hora, setHora] = useState(unid.sethora);
    const [delet, setDelete] = useState(unid.setdelete);
    const [ruta, setRuta] = useState(unid.setruta);

    const submitForm = async (e: any) => {
        e.preventDefault();
        const data = {
            numero,
            ubicacion,
            username,
            password: await bcrypt.hash(password, 10),
            id: fiscId,
            sethora: hora,
            setruta: ruta,
            setdelete: delet
        }
        try {
            const response = await axios.put(`/api/fiscales`, { ...data, _id: params.fisc });
            if (response.status === 400) {
                throw new Error('Error al editar la unidad');
            } else if (response.status == 401) {
                toast.error(response.data.error);
                console.log(response)
            } else if (response.status === 409) {
                console.log(response);
                toast.error('No se encuentra ninguna unidad con ese ID');
            } else if (response.status === 200) {
                toast.success('Unidad Editada', {
                    onClose: () => router.push('/fiscales')
                });
            }

        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.error);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    }

    const deletePizarra = async () => {
        const deletedPizarra = window.confirm('¿Estás seguro de eliminar la Unidad?, esta acción no se puede deshacer')
        if (deletedPizarra) {
            try {
                const response = await axios.delete(`/api/fiscales`, { data: { id: params.fisc } });
                console.log(response)
                if (response.status == 200) {
                    toast.success('Fiscal eliminado con éxito', { onClose: () => router.push('/fiscales') })
                } else if (response.status == 409) {
                    console.log(response)
                    throw new Error('No se encuentra ningún fiscal con ese ID')
                }
            } catch (error) {
                console.log(error)
                toast.error('Error al eliminar la unidad')
            }
        }
        return
    }
    return (
        <>
            <div className="mb-10 rounded-sm border border-stroke dark:bg-slate-800 bg-slate-200 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex justify-center items-center ">
                    <Card className="my-5 lg:w-1/2">
                        <CardBody className="m-2">
                            <div className="m-5 ">
                                <h1 className="text-xl font-bold">Editar Fiscal</h1>
                                <Divider />
                                <div className="my-4 w-full">
                                    <form onSubmit={submitForm} className="grid gap-4 pr-3 w-full" >
                                        <Input name="numero" isRequired required type='text' value={numero} label='Numero del Fiscal' onChange={(e) => setNumero(e.target.value)} />
                                        <Input name='username' isRequired required type='text' value={username} label='Nombre de Usuario Fiscal' onChange={(e) => setUsername(e.target.value)} />
                                        <Input name='password' isRequired required type='text' label='Contraseña' min={8} onChange={(e) => setPassword(e.target.value)} />
                                        <Textarea name="ubicacion" isRequired required type='text' value={ubicacion} label='Ubicacion del Fiscal' onChange={(e) => setUbicacion(e.target.value)} />
                                        <Switch name='sethora' defaultSelected={hora} onChange={(e) => setHora(e.target.checked)}>¿Selecciona Hora?</Switch>
                                        <Switch name='setruta' defaultSelected={ruta} onChange={(e) => setRuta(e.target.checked)}>¿Establece Ruta?</Switch>
                                        <Switch name='setdelete' defaultSelected={delet} onChange={(e) => setDelete(e.target.checked)}>¿Elimina Registros?</Switch>
                                        <div className="grid grid-cols-2 gap-4 justify-center items-center">
                                            <Button type="submit" variant="shadow" className="w-full bg-green-700 text-slate-100"> Editar Fiscal</Button>
                                            <Button onClick={() => deletePizarra()} variant="shadow" className="lg:w-full  bg-red-700 text-slate-100">Eliminar Fiscal</Button>
                                        </div>
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
