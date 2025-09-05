"use client";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Card,
  CardBody,
  DatePicker,
  Button,
  Divider,
  CardHeader,
} from "@heroui/react";
import classNames from "classnames";
import { useEffect, useState, useRef } from "react";
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import { toast } from "react-toastify";
import axios from "axios";
import { ScrollUpIcon } from "../icons";
import jsPDF from 'jspdf';
import { usePDF } from 'react-to-pdf';
interface IndexProps {
  horarios?: any;
  rutas?: any;
  fiscales?: any;
  timestamps?: any;
  unidades?: any;
  payload?: any;
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return { fecha: `${year}-${month}-${day}` };
};

// Uso de la función
const todayDate = getTodayDate();



//componente card

interface CustomCardProps {
  columns1: { key: string, label: string }[];
  titulo: string;
  group: any[];
  onDownload: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({ columns1, titulo, group, onDownload }) => {
  return (
    <Card className='relative'>
      <CardHeader>
        <h1 className="font-bold text-lg">{titulo}</h1>
      </CardHeader>
      <Divider />
      <CardBody className='h-72'>
        <Table>
          <TableHeader columns={columns1} aria-label="Tabla">
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={group} aria-label="Tabla">
            {(item) => (
              <TableRow key={(item as any).key} className={classNames('rounded', {
                "bg-red-700": (item as any).onTime == false,
              })}
                aria-label="Tabla">
                {(columnKey) => (
                  <TableCell>
                    {/* <Link href={`/registros/${item.key}`}> */}
                    {getKeyValue(item, columnKey)}
                    {/* </Link> */}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};






export default function Index({
  horarios,
  rutas,
  fiscales,
  timestamps,
  unidades,
  payload,
}: IndexProps) {
  const horarios_ = JSON.parse(horarios);
  const rutas_ = JSON.parse(rutas);
  const fiscales_ = JSON.parse(fiscales).sort((a: any, b: any) =>
    a.numero.localeCompare(b.numero)
  );
  // const timestamps_ = JSON.parse(timestamps);
  const unidades_ = JSON.parse(unidades).sort(
    (a: any, b: any) => a.numero - b.numero
  );
  const [fecha, setFecha] = useState<any>(todayDate.fecha);
  const [unidad, setUnidad] = useState<any>(null);
  const [ruta, setRuta] = useState<any>(null);
  const [fiscal, setFiscal] = useState<any>(null);
  const [horario, setHorario] = useState<any>(null);
  const [timestamps_, setTimestamps_] = useState<any>([]);
  const [showRows, setShowRows] = useState(false);
  const [showOrden, setShowOrden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mostrarRetardados, setMostrarRetardados] = useState(true)
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY == 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/timestamps", { fecha: fecha });
      setTimestamps_(response.data);
    } catch (error) {
      console.log('error', fecha);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [fecha]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, "0");
    return `${year}-${month}-${day}  ${strHours}:${minutes} ${ampm}`;
  };
  const formatHour = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes} ${ampm}`;
  };
  const formatHour30secs = (dateString: string) => {
    const date = new Date(dateString);
    date.setSeconds(date.getSeconds() - 30); // Adelantar 30 segundos jasjsjjadas
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes} ${ampm}`;
  };
  const compareTimeDifference = (time1: string, time2: string): number => {
    // Función para convertir hora en formato hh:mm AM/PM a objeto Date
    const convertTo24HourFormat = (time: string): Date => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (modifier == 'PM' && hours !== 12) {
        hours += 12;
      }
      if (modifier == 'AM' && hours == 12) {
        hours = 0;
      }

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const date1 = convertTo24HourFormat(time1);
    const date2 = convertTo24HourFormat(time2);

    // Calcular la diferencia en minutos
    const diffInMs = Math.abs(date1.getTime() - date2.getTime());
    const diffInMinutes = Math.floor(diffInMs / 60000);

    return diffInMinutes;
  };

  //Comparación de datos

  const [fiscalA, setFiscalA] = useState<any>(null);
  const [fiscalB, setFiscalB] = useState<any>(null);
  const [timeCompare, settimeCompare] = useState<any>(null);

  const getTimestamps: any[] = timestamps_.map((timestamp: any) => {
    const ruta = rutas_.filter((r: any) => r._id == timestamp.id_ruta);
    const fiscal = fiscales_.filter((f: any) => f._id == timestamp.id_fiscal);
    const unidad = unidades_.filter((u: any) => u._id == timestamp.id_unidad);
    if (timestamp.timestamp_salida == null) {
      return {
        key: timestamp._id,
        hora_date: formatDate(timestamp.createdAt),
        hora_servidor: formatHour30secs(timestamp.createdAt),
        hora_telefono: formatHour30secs(timestamp.timestamp_telefono),
        unidad: unidad[0].numero,
        ruta: ruta[0].nombre,
        fiscal: fiscal[0].ubicacion,
      };
    } else {
      return {
        key: timestamp._id,
        hora_date: formatDate(timestamp.timestamp_salida),
        //  hora_servidor: formatHour(timestamp.createdAt),
        hora_servidor: formatHour(timestamp.timestamp_salida),
        hora_telefono: formatHour(timestamp.timestamp_telefono),
        unidad: unidad[0].numero,
        ruta: ruta[0].nombre,
        fiscal: fiscal[0].ubicacion,
      };
    }

  });
  let rows = getTimestamps.filter((timestamp: any) => {
    let registros = timestamp.hora_date.includes(fecha);
    return registros;
  });

  rows.sort((a: any, b: any) => new Date(a.hora_date).getTime() - new Date(b.hora_date).getTime());

  //filtrado de datos
  let columns1 = [
    {
      key: "hora_servidor",
      label: "Hora Servidor",
    },
    {
      key: "hora_telefono",
      label: "Hora Teléfono",
    },
    {
      key: "unidad",
      label: "Unidad",
    },
    {
      key: "ruta",
      label: "Ruta",
    },
    {
      key: "fiscal",
      label: "Fiscal",
    },
    {
      key: "onTimeText",
      label: "¿A tiempo?",
    },
    {
      key: "diff",
      label: "Diferencia (min)",
    },
    {
      key: "delay",
      label: "Retraso (min)",
    }
  ];
  let columns2 = [
    {
      key: "unidad",
      label: "Control",
    },
    {
      key: "hora_salida",
      label: "Hora Salida",
    },
    {
      key: "ruta",
      label: "Ruta",
    },
    {
      key: "hora_telefono",
      label: "Hora Teléfono",
    },
    {
      key: "fiscal",
      label: "Fiscal",
    },
    {
      key: "onTimeText",
      label: "¿A tiempo?",
    },
    {
      key: "diff",
      label: "Diferencia (min)",
    },
    {
      key: "delay",
      label: "Retraso (min)",
    }
  ];
  let columns = [
    {
      key: "hora_servidor",
      label: "Hora",
    },
    // {
    //   key: "hora_telefono",
    //   label: "Hora Teléfono",
    // },
    {
      key: "unidad",
      label: "Unidad",
    },
    {
      key: "ruta",
      label: "Ruta",
    },
    {
      key: "fiscal",
      label: "Fiscal",
    },
  ];

  let columnsFisc = [
    {
      key: "Fiscal", // Debe coincidir con `item.Fiscal`
      label: "Punto-Fiscal"
    },
    {
      key: "cantidad", // Debe coincidir con `item.cantidad`
      label: "Cantidad"
    }
  ];

  if (fiscal !== "Terminal") {
    // Hacemos una copia del arreglo para no modificar el original directamente (buena práctica).
    columns = columns.map(column => {
      if (column.key === "hora_servidor") {
        // Si encontramos la columna, devolvemos un nuevo objeto con la key modificada.
        return { ...column, key: "hora_telefono" };
      }
      // Para las demás columnas, las devolvemos sin cambios.
      return column;
    });
  }
  if (ruta && unidad) {
    columns = [
      {
        key: "hora_servidor",
        label: "Hora",
      },
      // {
      //   key: "hora_telefono",
      //   label: "Hora Teléfono",
      // },
      {
        key: "unidad",
        label: "Unidad",
      },
      {
        key: "ruta",
        label: "Ruta",
      },
      {
        key: "fiscal",
        label: "Fiscal",
      },
      {
        key: "onTimeText",
        label: "On Time",
      },
      {
        key: "diff",
        label: "Diferencia (min)",
      },
      {
        key: "delay",
        label: "Retraso (min)",
      }
    ];
    rows = rows.filter((timestamp: any) => timestamp.unidad == unidad && timestamp.ruta == ruta);
  } else if (ruta) {
    columns = [
      {
        key: "hora_servidor",
        label: "Hora",
      },
      // {
      //   key: "hora_telefono",
      //   label: "Hora Teléfono",
      // },
      {
        key: "unidad",
        label: "Unidad",
      },
      {
        key: "ruta",
        label: "Ruta",
      },
      {
        key: "fiscal",
        label: "Fiscal",
      },
      {
        key: "onTimeText",
        label: "On Time",
      },
      {
        key: "diff",
        label: "Diferencia (min)",
      },
      {
        key: "delay",
        label: "Retraso (min)",
      }
    ];
    rows = rows.filter(
      (timestamp: any) => timestamp.ruta == ruta
    );
  } else if (fiscal) {
    rows = rows.filter((timestamp: any) => timestamp.fiscal == fiscal);
  } else if (unidad) {
    rows = rows.filter((timestamp: any) => timestamp.unidad == unidad);
  }

  //Función para resetear los filtros
  const resetFilter = () => {
    setUnidad(null);
    setRuta(null);
    setFiscal(null);
    setHorario(null);
    setFiscalA(null)
    setFiscalB(null)
    settimeCompare(null)
  };

 
  const fiscalAExists = rows.some((row: any) => row.fiscal == fiscalA);
  const fiscalBExists = rows.some((row: any) => row.fiscal == fiscalB);


  //seccionar la comparación automáticamente por unidad independientemente de la ruta, definir los tiempos de comparación en minutos en las determinadas sitauciones


  const setTimestamps: any[] = rows.map((timestamp: any) => {
    return {
      key: timestamp.key,
      unidad: timestamp.unidad,
      hora_servidor: timestamp.hora_servidor,
      hora_telefono: timestamp.hora_telefono,
      fiscal: timestamp.fiscal,
      ruta: timestamp.ruta,
    };
  });

  // Lista de todas las unidades que existen en el array de timestamps
  const unidadesordenadas = [...new Set(setTimestamps.map((timestamp: any) => timestamp.unidad))].sort((a, b) => a - b);
  // console.log("Unidades ordenadas:", unidadesordenadas);
  // setUnidadesOrdenadas(unidadesordenadas);








  // Función para comparar registros
  const compareTimestamps = (timestamps: any[]) => {
    const grouped = timestamps.reduce((acc: any, timestamp: any) => {
      const key = `${timestamp.unidad}-${timestamp.ruta}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(timestamp);
      return acc;
    }, {});

    // Ordenar las claves de los grupos por el número de unidad
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const unitA = parseInt(a.split('-')[0], 10);
      const unitB = parseInt(b.split('-')[0], 10);
      return unitA - unitB;
    });
    let sortedRegistros: any[] = []
    sortedKeys.forEach((key) => {
      const group = grouped[key];
      const fiscales = new Set(group.map((timestamp: any) => timestamp.fiscal));
      if (fiscales.size > 1) {
        // Convertir hora_servidor a minutos
        const convertToMinutes = (timeString: string) => {
          const [time, modifier] = timeString.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier == 'PM' && hours !== 12) {
            hours += 12;
          }
          if (modifier == 'AM' && hours == 12) {
            hours = 0;
          }
          return hours * 60 + minutes;
        };
        // Comparar la posición 0 con la posición 1 solo si el primer fiscal es "Terminal" y el segundo es "Centro"
        // comparación de tiempos para las rutas

        //confitería el loro
        for (let i = 0; i < group.length - 1; i++) {
          if (group[i]?.fiscal == "Terminal" && group[i + 1]?.fiscal == "Confitería el Loro") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 15;
            group[i + 1].onTimeText = diff <= 15 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 15 ? diff - 15 : 0;
          }

          //Dorsay
          if (group[i]?.fiscal == "Terminal" && group[i + 1]?.fiscal == "Dorsay") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 23;
            group[i + 1].onTimeText = diff <= 23 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 23 ? diff - 23 : 0;
          }

          if (group[i]?.fiscal == "Terminal" && group[i + 2]?.fiscal == "Dorsay") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 23;
            group[i + 2].onTimeText = diff <= 23 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 23 ? diff - 23 : 0;
          }


          //biblioteca

          if (group[i]?.fiscal == "Terminal" && group[i + 1]?.fiscal == "Biblioteca") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 28;
            group[i + 1].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 28 ? diff - 28 : 0;
          }

          if (group[i]?.fiscal == "Terminal" && group[i + 2]?.fiscal == "Biblioteca") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 28;
            group[i + 2].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 28 ? diff - 28 : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 3]?.fiscal == "Biblioteca") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            group[i + 3].hora_salida = group[i].hora_servidor
            group[i + 3].onTime = diff <= 28;
            group[i + 3].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 3].diff = diff;
            group[i + 3].delay = diff > 28 ? diff - 28 : 0;
          }

          //plazuela de táriba

          if (group[i]?.fiscal == "Terminal" && group[i + 1]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 40;
            group[i + 1].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 40 ? diff - 40 : 0;
          }

          if (group[i]?.fiscal == "Terminal" && group[i + 2]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 40;
            group[i + 2].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 40 ? diff - 40 : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 3]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            group[i + 3].hora_salida = group[i].hora_servidor
            group[i + 3].onTime = diff <= 40;
            group[i + 3].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 3].diff = diff;
            group[i + 3].delay = diff > 40 ? diff - 40 : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 4]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 4].hora_telefono);
            const diff = time2 - time1;
            group[i + 4].hora_salida = group[i].hora_servidor
            group[i + 4].onTime = diff <= 40;
            group[i + 4].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 4].diff = diff;
            group[i + 4].delay = diff > 40 ? diff - 40 : 0;
          }

          //central cordero
          if (group[i]?.fiscal == "Terminal" && group[i + 1]?.fiscal == "Central Cordero") {
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = (ruta?.nombre == '4/2 S') ? 77 : 72;
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= tiempo;
            group[i + 1].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > tiempo ? diff - tiempo : 0;
          }

          if (group[i]?.fiscal == "Terminal" && group[i + 2]?.fiscal == "Central Cordero") {
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = (ruta?.nombre == '4/2 S') ? 77 : 72;
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= tiempo;
            group[i + 2].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > tiempo ? diff - tiempo : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 3]?.fiscal == "Central Cordero") {
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = (ruta?.nombre == '4/2 S') ? 77 : 72;
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            group[i + 3].hora_salida = group[i].hora_servidor
            group[i + 3].onTime = diff <= tiempo;
            group[i + 3].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 3].diff = diff;
            group[i + 3].delay = diff > tiempo ? diff - tiempo : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 4]?.fiscal == "Central Cordero") {
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = (ruta?.nombre == '4/2 S') ? 77 : 72;
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 4].hora_telefono);
            const diff = time2 - time1;
            group[i + 4].hora_salida = group[i].hora_servidor
            group[i + 4].onTime = diff <= tiempo;
            group[i + 4].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 4].diff = diff;
            group[i + 4].delay = diff > tiempo ? diff - tiempo : 0;
          }
          if (group[i]?.fiscal == "Terminal" && group[i + 5]?.fiscal == "Central Cordero") {
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = (ruta?.nombre == '4/2 S') ? 77 : 72;
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 5].hora_telefono);
            const diff = time2 - time1;
            group[i + 5].hora_salida = group[i].hora_servidor
            group[i + 5].onTime = diff <= tiempo;
            group[i + 5].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 5].diff = diff;
            group[i + 5].delay = diff > tiempo ? diff - tiempo : 0;
          }

          //
          //
          // rutas bajando R1 y R2

          //central cordero
          if (group[i]?.fiscal == "R1R2" && group[i + 1]?.fiscal == "Central Cordero") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 10;
            group[i + 1].onTimeText = diff <= 10 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 10 ? diff - 10 : 0;
          }
          //plaza andrés bello
          if (group[i]?.fiscal == "R1R2" && group[i + 1]?.fiscal == "Plaza Andrés Bello") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 18;
            group[i + 1].onTimeText = diff <= 18 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 18 ? diff - 18 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 2]?.fiscal == "Plaza Andrés Bello") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 18;
            group[i + 2].onTimeText = diff <= 18 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 18 ? diff - 18 : 0;
          }


          // bomba san rafael
          if (group[i]?.fiscal == "R1R2" && group[i + 1]?.fiscal == "Bomba San Rafael") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 28;
            group[i + 1].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 28 ? diff - 28 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 2]?.fiscal == "Bomba San Rafael") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 28;
            group[i + 2].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 28 ? diff - 28 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 3]?.fiscal == "Bomba San Rafael") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            group[i + 3].hora_salida = group[i].hora_servidor
            group[i + 3].onTime = diff <= 28;
            group[i + 3].onTimeText = diff <= 28 ? "A tiempo" : "Retardado";
            group[i + 3].diff = diff;
            group[i + 3].delay = diff > 28 ? diff - 28 : 0;
          }


          //Plazuela de Táriba
          if (group[i]?.fiscal == "R1R2" && group[i + 1]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= 40;
            group[i + 1].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > 40 ? diff - 40 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 2]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= 40;
            group[i + 2].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > 40 ? diff - 40 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 3]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            group[i + 3].hora_salida = group[i].hora_servidor
            group[i + 3].onTime = diff <= 40;
            group[i + 3].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 3].diff = diff;
            group[i + 3].delay = diff > 40 ? diff - 40 : 0;
          }
          if (group[i]?.fiscal == "R1R2" && group[i + 4]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 4].hora_telefono);
            const diff = time2 - time1;
            group[i + 4].hora_salida = group[i].hora_servidor
            group[i + 4].onTime = diff <= 40;
            group[i + 4].onTimeText = diff <= 40 ? "A tiempo" : "Retardado";
            group[i + 4].diff = diff;
            group[i + 4].delay = diff > 40 ? diff - 40 : 0;
          }
          //Terminal
          // if (group[i]?.fiscal == "R1R2" && group[i + 1]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 1].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 1].onTime = diff <= 70;
          //   group[i + 1].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
          //   group[i + 1].diff = diff;
          //   group[i + 1].delay = diff > 70 ? diff - 70 : 0;
          // }
          // if (group[i]?.fiscal == "R1R2" && group[i + 2]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 2].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 2].onTime = diff <= 70;
          //   group[i + 2].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
          //   group[i + 2].diff = diff;
          //   group[i + 2].delay = diff > 70 ? diff - 70 : 0;
          // }
          // if (group[i]?.fiscal == "R1R2" && group[i + 3]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 3].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 3].onTime = diff <= 70;
          //   group[i + 3].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
          //   group[i + 3].diff = diff;
          //   group[i + 3].delay = diff > 70 ? diff - 70 : 0;
          // }
          // if (group[i]?.fiscal == "R1R2" && group[i + 4]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 4].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 4].onTime = diff <= 70;
          //   group[i + 4].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
          //   group[i + 4].diff = diff;
          //   group[i + 4].delay = diff > 70 ? diff - 70 : 0;
          // }
          // if (group[i]?.fiscal == "R1R2" && group[i + 5]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 5].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 5].onTime = diff <= 70;
          //   group[i + 5].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
          //   group[i + 5].diff = diff;
          //   group[i + 5].delay = diff > 70 ? diff - 70 : 0;
          // }

          // R8
          if (group[i]?.fiscal == "Central Cordero" && group[i + 1]?.fiscal == "Plaza Andrés Bello") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            if (ruta?.nombre == 'R8') {
              const diff = time2 - time1;
              group[i + 1].hora_salida = group[i].hora_servidor
              group[i + 1].onTime = diff <= 48;
              group[i + 1].onTimeText = diff <= 48 ? "A tiempo" : "Retardado";
              group[i + 1].diff = diff;
              group[i + 1].delay = diff > 48 ? diff - 48 : 0;
            }
          }
          if (group[i]?.fiscal == "Central Cordero" && group[i + 2]?.fiscal == "Bomba San Rafael") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const diff = time2 - time1;
            if (ruta?.nombre == 'R8') {
              group[i + 2].hora_salida = group[i].hora_servidor
              group[i + 2].onTime = diff <= 58;
              group[i + 2].onTimeText = diff <= 58 ? "A tiempo" : "Retardado";
              group[i + 2].diff = diff;
              group[i + 2].delay = diff > 58 ? diff - 58 : 0;
            }
          }
          if (group[i]?.fiscal == "Central Cordero" && group[i + 3]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 3].hora_telefono);
            const diff = time2 - time1;
            if (ruta?.nombre == 'R8') {
              group[i + 3].hora_salida = group[i].hora_servidor
              group[i + 3].onTime = diff <= 70;
              group[i + 3].onTimeText = diff <= 70 ? "A tiempo" : "Retardado";
              group[i + 3].diff = diff;
              group[i + 3].delay = diff > 70 ? diff - 70 : 0;
            }
          }
          // if (group[i]?.fiscal == "Central Cordero" && group[i + 4]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 4].hora_telefono);
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   if (ruta?.nombre == 'R8') {
          //     group[i + 4].onTime = diff <= 90;
          //     group[i + 4].onTimeText = diff <= 90 ? "A tiempo" : "Retardado";
          //     group[i + 4].diff = diff;
          //     group[i + 4].delay = diff > 90 ? diff - 90 : 0;
          //   }
          // }

          //
          // Rutas bajando R6 y R7 y R8
          if (group[i]?.fiscal == "Central Cordero" && group[i + 1]?.fiscal == "Bomba San Rafael") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = 0
            if (ruta?.nombre == 'R6') {
              tiempo = 19
            } else if (ruta?.nombre == 'R7') {
              tiempo = 27
            } else if (ruta?.nombre == 'R8') {
              tiempo = 58
            } else if (ruta?.nombre == 'R2') {
              tiempo = 18
            } else if (ruta?.nombre == 'R1') {
              tiempo = 18
            }
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= tiempo;
            group[i + 1].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > tiempo ? diff - tiempo : 0;
          }

          if (group[i]?.fiscal == "Central Cordero" && group[i + 1]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 1].hora_telefono);
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = 0
            if (ruta?.nombre == 'R6') {
              tiempo = 31
            } else if (ruta?.nombre == 'R7') {
              tiempo = 39
            } else if (ruta?.nombre == 'R8') {
              tiempo = 70
            }
            else if (ruta?.nombre == 'R2') {
              tiempo = 30
            } else if (ruta?.nombre == 'R1') {
              tiempo = 30
            }
            const diff = time2 - time1;
            group[i + 1].hora_salida = group[i].hora_servidor
            group[i + 1].onTime = diff <= tiempo;
            group[i + 1].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 1].diff = diff;
            group[i + 1].delay = diff > tiempo ? diff - tiempo : 0;
          }
          if (group[i]?.fiscal == "Central Cordero" && group[i + 2]?.fiscal == "Plazuela de Táriba") {
            const time1 = convertToMinutes(group[i].hora_servidor);
            const time2 = convertToMinutes(group[i + 2].hora_telefono);
            const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
            let tiempo = 0
            if (ruta?.nombre == 'R6') {
              tiempo = 31
            } else if (ruta?.nombre == 'R7') {
              tiempo = 39
            } else if (ruta?.nombre == 'R8') {
              tiempo = 70
            }
            else if (ruta?.nombre == 'R2') {
              tiempo = 30
            } else if (ruta?.nombre == 'R1') {
              tiempo = 30
            }
            const diff = time2 - time1;
            group[i + 2].hora_salida = group[i].hora_servidor
            group[i + 2].onTime = diff <= tiempo;
            group[i + 2].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
            group[i + 2].diff = diff;
            group[i + 2].delay = diff > tiempo ? diff - tiempo : 0;
          }



          // if (group[i]?.fiscal == "Central Cordero" && group[i + 1]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 1].hora_telefono);
          //   const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
          //   let tiempo = 0
          //   console.log(group[i], 'nombre de la ruta')
          //   if (ruta?.nombre == 'R6') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R7') {
          //     tiempo = 70
          //   } else if (ruta?.nombre == 'R8') {
          //     tiempo = 100
          //   }
          //   else if (ruta?.nombre == 'R2') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R1') {
          //     tiempo = 60
          //   }
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 1].onTime = diff <= tiempo;
          //   group[i + 1].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
          //   group[i + 1].diff = diff;
          //   group[i + 1].delay = diff > tiempo ? diff - tiempo : 0;
          // }
          // if (group[i]?.fiscal == "Central Cordero" && group[i + 2]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 2].hora_telefono);
          //   const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
          //   let tiempo = 0
          //   if (ruta?.nombre == 'R6') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R7') {
          //     tiempo = 70
          //   } else if (ruta?.nombre == 'R8') {
          //     tiempo = 100
          //   }
          //   else if (ruta?.nombre == 'R2') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R1') {
          //     tiempo = 60
          //   }
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 2].onTime = diff <= tiempo;
          //   group[i + 2].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
          //   group[i + 2].diff = diff;
          //   group[i + 2].delay = diff > tiempo ? diff - tiempo : 0;
          // }
          // if (group[i]?.fiscal == "Central Cordero" && group[i + 3]?.fiscal == "Terminal") {
          //   const time1 = convertToMinutes(group[i].hora_servidor);
          //   const time2 = convertToMinutes(group[i + 3].hora_telefono);
          //   const ruta = rutas_.find((ruta: any) => ruta.nombre == group[i].ruta);
          //   let tiempo = 0
          //   if (ruta?.nombre == 'R6') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R7') {
          //     tiempo = 70
          //   } else if (ruta?.nombre == 'R8') {
          //     tiempo = 100
          //   }
          //   else if (ruta?.nombre == 'R2') {
          //     tiempo = 60
          //   } else if (ruta?.nombre == 'R1') {
          //     tiempo = 60
          //   }
          //   const diff = time2 - time1;
          // group[i].hora_salida = group[i].hora_servidor
          //   group[i + 3].onTime = diff <= tiempo;
          //   group[i + 3].onTimeText = diff <= tiempo ? "A tiempo" : "Retardado";
          //   group[i + 3].diff = diff;
          //   group[i + 3].delay = diff > tiempo ? diff - tiempo : 0;
          // }



        }
        const sorted = {
          title: key,
          group,
        }
        sortedRegistros.push(sorted)
      }
    });
    return sortedRegistros;
  };

  // Función para filtrar registros retardados
  const getRegistrosRetardados = (registrosOrdenados: any[]): any[] => {
    return registrosOrdenados.filter(registro =>
      registro.group.some((item: any) => item.onTime == false)
    );
  };

  // Llamar a la función de comparación
  const registrosOrdenados = compareTimestamps(setTimestamps);
  // console.log(registrosOrdenados);

  // Filtrar registros retardados
  const registrosRetardados = getRegistrosRetardados(registrosOrdenados);
  // console.log(registrosRetardados);

  const listaRetardados = registrosRetardados.flatMap(registro =>
    registro.group.filter((item: { onTime: boolean; }) => item.onTime === false)
  );

  const datosParaTabla = setTimestamps.reduce((acumulador, timestamp) => {
    const fiscal = timestamp.fiscal;

    // Busca si el fiscal ya existe en nuestro array 'acumulador'
    const fiscalExistente = acumulador.find((item: { Fiscal: any; }) => item.Fiscal === fiscal);

    if (fiscalExistente) {
      // Si ya existe, simplemente incrementa su contador
      fiscalExistente.cantidad++;
    } else {
      // Si es la primera vez que lo vemos, lo añadimos al array con cantidad 1
      acumulador.push({
        Fiscal: fiscal,
        cantidad: 1,
      });
    }

    return acumulador;
  }, []); // El valor inicial del acumulador es un array vacío []

  // 3. Resultado final listo para la tabla
  console.log(datosParaTabla);

  //descargar imagenes
  const [selectedRegistro, setSelectedRegistro] = useState<any[]>()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);


  const handleDownloadImage = async (index: number, title: string) => {
    const ref = cardRefs.current[index];
    if (ref && hiddenContainerRef.current) {
      // Limpiar el contenedor oculto
      hiddenContainerRef.current.innerHTML = '';
      if (index >= 0 && index < registrosRetardados.length) {
        setSelectedRegistro(registrosRetardados[index]);
      }
      // Extraer los datos de la tabla
      const tableData = ref.outerHTML || '';
      console.log(registrosRetardados[index])
      // Crear un nuevo componente que contenga los datos

      const cardHtml = ReactDOMServer.renderToString(
        <CustomCard
          columns1={columns1}
          titulo={registrosRetardados[index].title}
          group={registrosRetardados[index].group}
          onDownload={() => handleDownloadImage(index, registrosRetardados[index].title)}
        />
      );


      const cardClone = document.createElement('div');
      cardClone.innerHTML = cardHtml;;

      // Aplicar estilos mínimos para asegurar que la tabla se renderice completamente
      cardClone.style.position = 'absolute';
      cardClone.style.top = '0';
      cardClone.style.left = '0';
      cardClone.style.width = 'auto';
      cardClone.style.height = 'auto';
      cardClone.style.overflow = 'visible';
      // Añadir el clon al contenedor oculto
      if (hiddenContainerRef.current) {
        hiddenContainerRef.current.appendChild(cardClone)
      }


      // Usar requestAnimationFrame para mejorar el rendimiento
      requestAnimationFrame(async () => {
        const canvas = await html2canvas(cardClone, { useCORS: true });
        const dataUrl = canvas.toDataURL('image/jpeg', 1);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${title} ${fecha}.jpeg`;
        link.click();

        // Limpiar el contenedor oculto
        if (hiddenContainerRef.current) {
          hiddenContainerRef.current.innerHTML = '';
        }
      });
    }
  };
  // recolectar los datos del servidor y hacer de nuevo otro componente en vez de clonar  ----> opción para desarrollar después
  //  Crear un nuevo PDF
  const handleDownloadAllRetardados = async () => {
    if (hiddenContainerRef.current) {
      // Limpiar el contenedor oculto
      hiddenContainerRef.current.innerHTML = '';

      // Crear un contenedor para todos los registros retardados
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = 'auto';
      container.style.height = 'auto';
      container.style.overflow = 'visible';

      // Añadir todos los registros retardados al contenedor
      registrosRetardados.forEach((registro, index) => {
        const cardHtml = ReactDOMServer.renderToString(
          <CustomCard
            columns1={columns1}
            titulo={registro.title}
            group={registro.group}
            onDownload={() => handleDownloadImage(index, registro.title)}
          />
        );

        const cardClone = document.createElement('div');
        cardClone.innerHTML = cardHtml;
        container.appendChild(cardClone);
      });

      // Añadir el contenedor al contenedor oculto
      hiddenContainerRef.current.appendChild(container);

      // Usar requestAnimationFrame para mejorar el rendimiento
      requestAnimationFrame(async () => {
        const pdf = new jsPDF();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        let yOffset = 14;

        pdf.text(`Registros Retardados de ${fecha}`, 10, 10);

        for (let i = 0; i < container.children.length; i++) {
          const cardClone = container.children[i] as HTMLElement;
          const canvas = await html2canvas(cardClone, { useCORS: true });
          const imgData = canvas.toDataURL('image/jpeg');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          if (yOffset + pdfHeight > pageHeight) {
            pdf.addPage();
            yOffset = 10; // Reiniciar el offset en la nueva página
          }

          pdf.addImage(imgData, 'JPEG', 10, yOffset, pdfWidth, pdfHeight);
          yOffset += pdfHeight; // Añadir margen entre imágenes
        }
        pdf.save(`Registros Retardados de ${fecha}.pdf`);

        // Limpiar el contenedor oculto
        if (hiddenContainerRef.current) {
          hiddenContainerRef.current.innerHTML = '';
        }
      });
    }
  };


  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, registrosOrdenados.length);
  }, [registrosOrdenados]);


  //pdf de la lista de retardados

  const { toPDF, targetRef } = usePDF({ filename: `retardados${fecha}` });
  const { toPDF: toPDFPuntos, targetRef: targetRefPuntos } = usePDF({ filename: `puntos${fecha}` });


  return (
    <div>
      <div ref={hiddenContainerRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: 'auto', height: 'auto', overflow: 'hidden' }}></div>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="inline-block max-w-xl text-center justify-center">
          <h1 className="text-2xl font-bold">Horarios Fiscales</h1>
        </div>
        <div>
          <Card>
            <CardBody className=" p-5 flex flex-wrap flex-col gap-6 justify-center items-center">
              <div className='flex flex-col gap-6 sm:flex-row'>
                <div>
                  <label
                    htmlFor="fecha"
                    className="block text-sm font-medium dark:text-slate-100 text-gray-700"
                  >
                    Fecha
                  </label>
                  <input
                    id="fecha"
                    type="date"
                    value={fecha ? fecha : ""}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      setUnidad(null);
                      setRuta(null);
                      setFiscal(null);
                    }}
                    className="mt-1 block w-full pl-3 pr-2 py-2 text-base border border-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label="Selector de fecha"
                  />
                </div>
                <div className='hidden sm:block'>
                  <label
                    htmlFor="unidad"
                    className="block text-sm font-medium dark:text-slate-100 text-gray-700"
                  >
                    Unidad
                  </label>
                  <select
                    id="unidad"
                    value={unidad ? unidad : ""}
                    onChange={(e) => {
                      setUnidad(e.target.value);
                      setFiscal(null);
                    }}
                    className="mt-1 block w-full pl-3 pr-8 py-2 text-base border border-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label="Selector de unidad"
                  >
                    <option value="" disabled>
                      Elige una unidad
                    </option>
                    {unidades_.map((unidad: any) => (
                      <option key={unidad._id} value={unidad.numero}>
                        {unidad.numero}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='hidden sm:block'>
                  <label
                    htmlFor="ruta"
                    className="block text-sm font-medium dark:text-slate-100 text-gray-700"
                    aria-label="Selector de ruta"
                  >
                    Ruta
                  </label>
                  <select //hacer un SELECT
                    id="ruta"
                    value={ruta ? ruta : ""}
                    onChange={(e) => {
                      setRuta(e.target.value);
                      setFiscal(null);
                    }}
                    className="mt-1 block w-full pl-3 pr-8 py-2 text-base border border-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label="Selector de ruta"
                  >
                    <option value="" disabled>
                      Elige una ruta
                    </option>
                    {rutas_.map((unidad: any) => (
                      <option key={unidad._id} value={unidad.nombre}>
                        {unidad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='hidden sm:block'>
                  <label
                    htmlFor="fiscal"
                    className="block text-sm font-medium dark:text-slate-100 text-gray-700"
                  >
                    Fiscal
                  </label>
                  <select //hacer un SELECT
                    id="fiscal"
                    value={fiscal ? fiscal : ""}
                    onChange={(e) => {
                      setFiscal(e.target.value);
                      setUnidad(null);
                      setRuta(null);
                    }}
                    className="mt-1 block w-full pl-3 pr-8 py-2 text-base border border-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label="Selector de fiscal"
                  >
                    <option value="" disabled>
                      Elige un fiscal
                    </option>
                    {fiscales_.map((unidad: any) => (
                      <option key={unidad._id} value={unidad.ubicacion}>
                        {unidad.ubicacion}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
              <div className='flex flex-col sm:flex-row sm:justify-end sm:items-end justify-center items-center gap-4'>
                <Button onPress={resetFilter} className="bg-sky-600 font-bold">
                  Reset
                </Button>
                <Button onPress={() => setShowRows(!showRows)} className="bg-sky-600 font-bold">
                  {showRows ? "Ocultar Lista" : "Mostrar Lista"}
                </Button>

                {todayDate.fecha == fecha ? (
                  <>
                    {loading ? <Button className="bg-sky-600 font-bold cursor-default">
                      Cargando...
                    </Button> : <Button onPress={fetchData} className="bg-sky-600 font-bold">
                      Refrescar registros
                    </Button>}
                  </>
                ) : ''}

                <Button onPress={() => setShowOrden(!showOrden)} className="bg-sky-600 font-bold">
                  {showOrden ? "Ocultar Registros Ordenados" : "Mostrar Registros Ordenados"}
                </Button>
                {showOrden ? <Button onPress={() => setMostrarRetardados(!mostrarRetardados)} className="bg-sky-600 font-bold"> {mostrarRetardados ? "Todos los Registros" : "Solo Retardados"}</Button> : ''}
                {showOrden && mostrarRetardados ? <Button onPress={handleDownloadAllRetardados} className="bg-sky-600 font-bold">Imprimir PDF</Button> : ''}
                {/* <Button onPress={generatePDF} className="bg-sky-600 font-bold">
                 Imprimir Retardados
                </Button> */}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
      {showOrden && <section className='flex flex-col items-center justify-center gap-4'>
        <h1 className="text-xl font-bold mt-4">Registros ordenados</h1>
        <div className={`p-5 grid grid-cols-1 ${mostrarRetardados ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4 `}>
          {mostrarRetardados ? registrosRetardados && registrosRetardados.map((registro: any, index: number) => (
            <Card className='relative' key={registro.title} ref={el => { cardRefs.current[index] = el; }}>
              <CardHeader>
                <Button
                  onPress={() => handleDownloadImage(index, registro.title)}
                  className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded"
                >
                  Descargar
                </Button>
                <h1 className="font-bold text-lg">{registro.title}</h1>
              </CardHeader>
              <Divider />
              <CardBody className='h-72'>
                <Table aria-label={`Tabla de ${registro.title}`}>
                  <TableHeader columns={columns1} aria-label="Tabla">
                    {(column) => (
                      <TableColumn key={column.key}>{column.label}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={registro.group} aria-label="Tabla" >
                    {(item) => (
                      <TableRow key={(item as any).key} className={classNames('rounded', {
                        "bg-red-700": (item as any).onTime == false,
                      })}
                        aria-label="Tabla">
                        {(columnKey) => (
                          <TableCell>
                            {/* <Link href={`/registros/${item.key}`}> */}
                            {getKeyValue(item, columnKey)}
                            {/* </Link> */}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )) : registrosOrdenados && registrosOrdenados.map((registro: any, index: number) => (
            <Card className='relative' key={registro.title} ref={el => { cardRefs.current[index] = el; }}>
              <CardHeader>
                {mostrarRetardados && <Button
                  onPress={() => handleDownloadImage(index, registro.title)}
                  className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded"
                >
                  Descargar
                </Button>}
                <h1 className="font-bold text-lg">{registro.title}</h1>
              </CardHeader>
              <Divider />
              <CardBody className='h-72'>
                <Table aria-label={`Tabla de ${registro.title}`}>
                  <TableHeader columns={columns1} aria-label="Tabla">
                    {(column) => (
                      <TableColumn key={column.key}>{column.label}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={registro.group} aria-label="Tabla" >
                    {(item) => (
                      <TableRow key={(item as any).key} className={classNames('rounded', {
                        "bg-red-700": (item as any).onTime == false,
                      })}
                        aria-label="Tabla">
                        {(columnKey) => (
                          <TableCell>
                            {/* <Link href={`/registros/${item.key}`}> */}
                            {getKeyValue(item, columnKey)}
                            {/* </Link> */}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>}

       {/* lista de retardados */}


      <section  className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4 sm:px-6 lg:px-8 xl:px-12">
        <h1 className="text-xl font-bold">Lista de Retardados</h1>
        <Button onPress={() => toPDF()} className="">Descargar Pdf </Button>
        {listaRetardados.length > 0 ? (
          <Table ref={targetRef}  className='max-w-3xl' aria-label="Example table with dynamic content">
            <TableHeader columns={columns2} aria-label="Tabla">
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={listaRetardados} aria-label="Tabla">
              {(item) => (
                <TableRow
                  key={(item as any).key}
                  className={classNames("rounded")}
                  aria-label="Tabla"
                >
                  {(columnKey) => (
                    <TableCell>
                      {/* <Link href={`/registros/${item.key}`}> */}
                      {getKeyValue(item, columnKey)}
                      {/* </Link> */}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <p>No hay Retardados</p>
        )}
      </section>

      <section className="w-1/3 max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4 sm:px-6 lg:px-8">
          <h1 className='text-xl font-bold'>Control de puntos</h1>
        <Button onPress={() => toPDFPuntos()} className="">Descargar Pdf </Button>
        {datosParaTabla.length > 0 ? (
          <Table ref={targetRefPuntos} className='max-w-3xl' aria-label="Example table with dynamic content">
            <TableHeader columns={columnsFisc} aria-label="Tabla">
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={datosParaTabla} aria-label="Tabla">
              {(item) => (
                <TableRow
                  key={`${(item as any).fiscal}`} 
                  className={classNames("rounded")}
                  aria-label="Tabla"
                >
                  {(columnKey) => (
                    <TableCell>
                      {getKeyValue(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <p>No hay Registros</p>
        )}
        </section>
      
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">


        <h1 className="text-xl font-bold">Registros diarios</h1>
        <div className={classNames("grid grid-cols-1 md:grid-cols-3 gap-4")}>
          <div
            className={classNames("flex gap-3", {
              "col-span-2": ruta,
              "col-span-3": !ruta,
            })}
          >
            <Table aria-label="Example table with dynamic content">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={showRows ? rows : []}>
                {(item) => (
                  <TableRow key={item.key} className={classNames('rounded', {
                    "bg-red-700": item.onTime == false,
                  })}>
                    {(columnKey) => (
                      <TableCell>
                        {/* <Link href={`/registros/${item.key}`}> */}
                        {getKeyValue(item, columnKey)}
                        {/* </Link> */}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* mostrar registros ordenados */}

        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div>
          <h1 className="text-xl font-bold">Lista de Unidades</h1>
          <div>
            <Card>
              <CardBody className='flex flex-row gap-4'>
                <ul className="flex flex-wrap gap-2">
                  {unidadesordenadas && unidadesordenadas.map((unidad: any) => (
                    <li key={unidad}>{unidad}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
      {!isAtTop && (
        <div className=" fixed bottom-4 right-4 z-50">
          {todayDate.fecha == fecha ? (
            <>
              {loading ? <Button className="bg-red-600 font-bold p-4 rounded-full shadow-lg cursor-default">
                Cargando...
              </Button> : <Button onPress={fetchData} className="bg-red-600 font-bold p-4 rounded-full shadow-lg">
                Refrescar registros
              </Button>
              }
            </>
          )
            : ''}
          <Button onPress={scrollUp} className="bg-sky-600 font-bold p-4 rounded-full shadow-lg m-4">
            Subir
            <ScrollUpIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
