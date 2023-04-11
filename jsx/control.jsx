
// JSX del nuevo contenido del <div id="principal">
// Importante: cambio de 
//   buscar_foto(e.target.value)    ->     cambio_fecha(e.target.value)
// ya que la modificación del día del calendario implica la actualización
// no solo de la foto central sino de todas las fotos del mosaico de la semana
let nuevo_principal = ( <React.Fragment>
  <h1>APOD NASA</h1>
  <h2 id="titulo">Título: <span></span></h2>
  <img id="foto"/>
  <div id="datos">
      <div id="fecha" className="concepto">Fecha: <span>
          <input type="date" id="calendario" onChange={ (e) => { /*buscar_foto(e.target.value);*/ cambio_fecha(e.target.value); }}/>
      </span></div>
      <div id="mosaico"></div>
      <div id="autor" className="concepto">Autor: <span></span></div>
  </div>
  <div id="descripcion" className="concepto">Descripción: <span></span>
  </div> 
  </React.Fragment>);

// Insertar nuevo_principal dentro de <div id="principal"></div>
let anclaje = document.getElementById("principal");
ReactDOM.render(nuevo_principal, anclaje);



// Componente correspondiente al mosaico de fotos de la semana
let ElMosaico;

// Invocado cuando se cambie el calendario: se actualiza todo el 
// mosaico y la fotografía central así como su información asociada
async function cambio_fecha(fecha) {
    // Array con las siete fechas de la semana
    let semana = gen_fechas_semana(new Date(fecha) );  
    console.log("semana generada: ", semana);
    // Array con las siete informaciones de las fotos de la semana: espera síncrona
    let nueva_fotos_semana_info = await buscar_info_semana(semana);
    // Provocación de cambio de estado en ElMosaico: repintado automático
    ElMosaico.cambioSemana(nueva_fotos_semana_info);
    // La fecha elegida (parámetro) se utiliza para seleccionar la info. del día escogido
    let dia_elegido = nueva_fotos_semana_info.find( dia => { if (dia.date == fecha) return dia; });
    // Actualiza la fotografía, el autor, la descripción y la fecha de la APOD (búsquese en apod.js)
    actualizar_pagina(dia_elegido);
};
  

// Clase Foto_fecha: componente compuesto por una imagen (foto en miniatura) y su fecha
class Foto_fecha extends React.Component {
  render() {
    return (
      <div className="miniatura">
          <img id={"foto-"+this.props.info_dia.date}  src={this.props.info_dia.url}
                onClick={(e)=>{actualizar_pagina(this.props.info_dia)}} />
          <p className="fecha">{this.props.info_dia.date}</p>
      </div>    
    );
  } 
}



// Clase mosaico de todas las fotos de la semana
class Mosaico extends React.Component {

  // Constructor
  // Estado consistirá en el array de la información de fotos de la semana.
  // Sugerencia de denominación: fotos_semana_info
  constructor() {
    super();
    this.state={fotos_semana_info: []};
  }

  // Actualización del estado con una copia de la propiedad fotos_semana_info de la 
  // creación del componente tras el montaje del componente
  componentDidMount() {
    this.setState({fotos_semana_info: this.props.fotos_semana_info.slice()});
  }

  // Actualización del estado del sistema -> repintado
  cambioSemana(fotos_semana_info) {
    this.setState({fotos_semana_info: fotos_semana_info.slice()});
  } 

  // retorna el mosiaco compuesto por un array de componentes
  // de la clase Foto_fecha
  render() {


    // let mosaico = [];
    // for (let i=0; i<7; i++) {
    //   let info_dia = this.state.fotos_semana_info[i];
    //   if (info_dia!=undefined)
    //     mosaico[i] = <Foto_fecha key={i} info_dia={info_dia} />
    // }
    // return mosaico;


    
    let mosaico = this.state.fotos_semana_info.map((info_dia, idx)=>
      <Foto_fecha key={idx} info_dia={info_dia} />
    )
    return mosaico;
    
  }
 
}  








// Pinta por primera y única vez el mosaico. Después, simplemente habrá que
// actualizar su estado mediante el método .cambioSemana()
async function print_mosaico() {
  let fotos_semana_info = await buscar_info_semana(gen_fechas_semana(new Date()));
  let ElemMosaico = <Mosaico fotos_semana_info={fotos_semana_info} />;
  ElMosaico = ReactDOM.render(ElemMosaico, document.getElementById("mosaico"));
}

// Devuelve en un array todas las fechas (de lunes a domingo)
// correspondientes al día del parámetro, siendo dicho parámetro
// un objeto de la clase Date
function gen_fechas_semana(dia) { 
  n_dia = dia.getDay();
  n_dia = (n_dia==0)? 7 : n_dia;
  
  let semana = [];
  for (let i = 1; i<=7; i++ ) {
    /*
      lunes:   new Date( new Date(dia)-(n_dia-1)*24*60*60*1000 ); 
      martes:  new Date( new Date(dia)-(n_dia-2)*24*60*60*1000 ); 
      ...
      domingo: new Date( new Date(dia)-(n_dia-7)*24*60*60*1000 ); 
    */
    let dia_sem = new Date( new Date(dia)-(n_dia-i)*24*60*60*1000 ); 
    let fecha = dia_sem.getFullYear() + "-";
    fecha += ( ( (dia_sem.getMonth()+1) < 10 )? "0" : "") + (dia_sem.getMonth()+1) + "-";
    fecha += ( (  (dia_sem.getDate())   < 10 )? "0" : "") + dia_sem.getDate();
    semana.push(fecha);
   }

  return semana;
}


// Función asíncrona que devuelve toda la información del día indicado en 
// el parmetro fecha (formato "AAAA-MM_DD")
// Si no existe dicha información, se devuelve el JSON vacío por defecto
// { url: "sinfoto.png", explanation: "Sin foto", title: "Sin foto", copyright: "Sin foto", date: fecha}
async function buscar_info_dia (fecha) {
  const URL = "https://api.nasa.gov/planetary/apod?api_key=" + API_KEY + "&date="+fecha;

  datos = await fetch(URL, {method: 'GET'})
    .then ((respuesta) => { if (respuesta.ok) {
                              return respuesta.json()} 
                            else {
                              return Promise.reject(); 
                            }
                          })  
	  .then( json => json )
	  .catch(() => { return { url: "sinfoto.png", explanation: "Sin foto", title: "Sin foto", copyright: "Sin foto", date: fecha} } );
  return datos;
}

// función asíncrona que acumula en un array la información de toda la semana de la APOD
async function buscar_info_semana(semana) {
  console.log("Semana a buscar: ", semana);
  fotos_semana_info = [];
  for (let i = 0; i < 7; i++) {
     fotos_semana_info.push(await buscar_info_dia(semana[i]));
    //fotos_semana_info[i]=await buscar_info_dia(semana[i]);
  }
  return fotos_semana_info;
}





// Arranque (búsquese en apod.js)
arranque();

// Dibuja el mosaico con las fotos correspondientes a la semana
// del dia de hoy, y cuando acaba entonces provoca un cambio de fecha
// para pintar en la fotografía central la APOD de hoy.
// A partir de este instante, el cambio de estado en el mosaico depende
// del selector de fecha
print_mosaico().then(()=>{cambio_fecha(hoy())});