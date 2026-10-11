export const GODS = {
  raijin:{id:'raijin',name:'Raijin',title:'Señor de la tormenta',symbol:'ϟ',color:'#70e4e9',role:'Control',description:'Domina el ritmo del duelo y castiga al rival con una descarga que reduce su movilidad.',skill:{name:'Tormenta',cooldown:8,description:'Ralentiza al rival durante 1,7 segundos.'},stats:{speed:7.8,size:100,power:7}},
  fujin:{id:'fujin',name:'Fujin',title:'Señor del viento',symbol:'〰',color:'#91e58a',role:'Movilidad',description:'Una deidad veloz que corrige su posición en un instante para alcanzar pelotas difíciles.',skill:{name:'Ráfaga',cooldown:6,description:'Se impulsa hacia la altura de la pelota.'},stats:{speed:9.3,size:84,power:6}},
  kagutsuchi:{id:'kagutsuchi',name:'Kagutsuchi',title:'Dios del fuego',symbol:'✹',color:'#ff805f',role:'Ataque',description:'Convierte los intercambios largos en una prueba de reflejos con una pelota abrasadora.',skill:{name:'Llamarada',cooldown:9,description:'Acelera la pelota y la envuelve en fuego.'},stats:{speed:6.7,size:108,power:9}},
  susanoo:{id:'susanoo',name:'Susanoo',title:'Dios de las mareas',symbol:'≋',color:'#7c9cff',role:'Defensa',description:'Resiste la presión y gana una oportunidad extra cuando parece que el punto está perdido.',skill:{name:'Maremoto',cooldown:10,description:'Bloquea una pelota que iba a salir de la arena.'},stats:{speed:6.2,size:124,power:7}},
  amaterasu:{id:'amaterasu',name:'Amaterasu',title:'Diosa del sol',symbol:'☼',color:'#f4ce78',role:'Defensa',description:'Invoca luz divina para ampliar su zona de cobertura durante un breve periodo.',skill:{name:'Resplandor',cooldown:9,description:'Aumenta el tamaño de la paleta durante 2 segundos.'},stats:{speed:7.2,size:106,power:7}},
  inari:{id:'inari',name:'Inari',title:'Diosa del espejismo',symbol:'狐',color:'#e8a0e6',role:'Engaño',description:'Desorienta al oponente y convierte movimientos simples en decisiones difíciles.',skill:{name:'Espejismo',cooldown:8,description:'Invierte los controles del rival durante 1,5 segundos.'},stats:{speed:8.4,size:92,power:8}},
  hades:{id:'hades',name:'Hades',title:'Señor del inframundo',symbol:'♜',color:'#b6a0ff',role:'Debilitamiento',description:'Extiende una sombra sobre la paleta rival y reduce su cobertura durante un breve instante.',skill:{name:'Sombra del inframundo',cooldown:10,description:'Reduce el tamaño de la paleta rival durante 2 segundos.'},stats:{speed:7.1,size:105,power:8}},
  athena:{id:'athena',name:'Atenea',title:'Diosa de la estrategia',symbol:'⌘',color:'#f0d18a',role:'Contraataque',description:'Lee el intercambio y prepara un golpe de respuesta más veloz en el siguiente contacto.',skill:{name:'Contraataque',cooldown:9,description:'El siguiente golpe con la paleta devuelve la pelota con velocidad aumentada.'},stats:{speed:7.6,size:102,power:8}},
  odin:{id:'odin',name:'Odín',title:'Padre de los dioses nórdicos',symbol:'ᚠ',color:'#b7c7e8',role:'Precisión',description:'Sacrifica la fuerza bruta por una lectura precisa del intercambio.',skill:{name:'Visión de las runas',cooldown:9,description:'Reduce brevemente la velocidad de la pelota para ganar tiempo de reacción.'},stats:{speed:7.4,size:100,power:7}},
  quetzalcoatl:{id:'quetzalcoatl',name:'Quetzalcóatl',title:'Serpiente emplumada',symbol:'羽',color:'#78d6a3',role:'Control aéreo',description:'Controla las corrientes y cambia la trayectoria del intercambio.',skill:{name:'Viento emplumado',cooldown:8,description:'Desvía la trayectoria vertical de la pelota y la devuelve hacia el centro.'},stats:{speed:8.1,size:96,power:7}},
  zeus:{id:'zeus',name:'Zeus',title:'Rey del Olimpo',symbol:'ϟ',color:'#ffe17a',role:'Impacto eléctrico',description:'Desata un rayo que acelera la pelota y entorpece por un instante la respuesta rival.',skill:{name:'Rayo del Olimpo',cooldown:9,description:'Acelera la pelota con energía eléctrica y ralentiza brevemente al rival.'},stats:{speed:7.5,size:98,power:9}},
  anubis:{id:'anubis',name:'Anubis',title:'Guardián de la Duat',symbol:'𓃣',color:'#e6a56b',role:'Supervivencia',description:'Pesa el destino del punto y puede rescatar una pelota que parecía perdida.',skill:{name:'Juicio de la Duat',cooldown:11,description:'Si la pelota está por salir por tu lado, la devuelve al juego; si no, invoca un escudo temporal.'},stats:{speed:7.3,size:104,power:8}},
  poseidon:{id:'poseidon',name:'Poseidón',title:'Señor de los mares',symbol:'♆',color:'#65bde9',role:'Control de trayectoria',description:'Convoca una corriente marina que cambia el ángulo del intercambio sin alterar el color blanco de la pelota.',skill:{name:'Marea abisal',cooldown:9,description:'Desvía la trayectoria vertical de la pelota y ralentiza ligeramente al rival.'},stats:{speed:7.1,size:112,power:8}},
  loki:{id:'loki',name:'Loki',title:'Dios de las tretas',symbol:'ᛟ',color:'#d49aff',role:'Engaño',description:'Siembra confusión con una ilusión breve que invierte los controles del rival.',skill:{name:'Doble engañoso',cooldown:9,description:'Invierte los controles rivales durante 1,7 segundos y deja una señal de espejismo.'},stats:{speed:8.7,size:88,power:7}},
  thor:{id:'thor',name:'Thor',title:'Dios del trueno',symbol:'⚡',color:'#9bb8ff',role:'Impacto',description:'Convierte cada intercambio en un golpe de fuerza atronadora.',skill:{name:'Mjölnir',cooldown:9,description:'Acelera la pelota y libera una descarga breve alrededor de ella.'},stats:{speed:7.4,size:108,power:9}},
  medusa:{id:'medusa',name:'Medusa',title:'Gorgona del mito griego',symbol:'◉',color:'#a8e08a',role:'Control',description:'Su mirada petrifica los reflejos del rival por un instante.',skill:{name:'Mirada pétrea',cooldown:10,description:'Invierte brevemente los controles rivales y reduce su movilidad.'},stats:{speed:7.7,size:96,power:8}},
  gaia:{id:'gaia',name:'Gaia',title:'Madre primordial de la Tierra',symbol:'♧',color:'#78c98b',role:'Resistencia',description:'La fuerza primordial de la tierra amplía su zona de defensa.',skill:{name:'Bastión de la Tierra',cooldown:10,description:'Aumenta temporalmente el tamaño de la paleta.'},stats:{speed:6.9,size:116,power:8}},
  thoth:{id:'thoth',name:'Thoth',title:'Dios egipcio del conocimiento',symbol:'𓁟',color:'#80d9d0',role:'Precisión',description:'Calcula el movimiento de la pelota y altera el ritmo del intercambio.',skill:{name:'Cálculo sagrado',cooldown:9,description:'Reduce brevemente la velocidad de la pelota.'},stats:{speed:7.8,size:98,power:7}},
  kali:{id:'kali',name:'Kali',title:'Diosa de la transformación',symbol:'✺',color:'#e78cba',role:'Presión',description:'Desata una ráfaga agresiva que reduce la cobertura rival.',skill:{name:'Danza del tiempo',cooldown:10,description:'Reduce la paleta rival y acelera ligeramente la pelota.'},stats:{speed:8,size:94,power:9}},
  apollo:{id:'apollo',name:'Apolo',title:'Dios griego de la luz y la profecía',symbol:'☀',color:'#ffd27a',role:'Contraataque',description:'Lee la trayectoria y prepara una devolución precisa.',skill:{name:'Flecha solar',cooldown:9,description:'Potencia el siguiente golpe con la paleta.'},stats:{speed:8.1,size:100,power:8}}
};

// Sistema Piedra-Papel-Tijera: las clases determinan las ventajas del duelo.
export const GOD_CLASSES = {
  stone:['kagutsuchi','susanoo','hades','zeus','anubis','thor','kali'],
  paper:['amaterasu','inari','athena','odin','quetzalcoatl','gaia','thoth'],
  scissors:['raijin','fujin','poseidon','loki','medusa','apollo']
};
export const GOD_CLASS_BY_ID = Object.fromEntries(Object.entries(GOD_CLASSES).flatMap(([type,ids])=>ids.map(id=>[id,type])));
export const CLASS_INFO = {
  stone:{name:'Piedra',icon:'◆',beats:'scissors',beatsName:'Tijera',losesTo:'paper',losesToName:'Papel'},
  paper:{name:'Papel',icon:'▤',beats:'stone',beatsName:'Piedra',losesTo:'scissors',losesToName:'Tijera'},
  scissors:{name:'Tijera',icon:'✂',beats:'paper',beatsName:'Papel',losesTo:'stone',losesToName:'Piedra'}
};
export function matchupModifier(attackerId, defenderId){
  const attacker=GOD_CLASS_BY_ID[attackerId], defender=GOD_CLASS_BY_ID[defenderId];
  if(!attacker||!defender||attacker===defender)return 1;
  return CLASS_INFO[attacker].beats===defender?1.16:0.84;
}
export function matchupLabel(attackerId, defenderId){
  const a=GOD_CLASS_BY_ID[attackerId],b=GOD_CLASS_BY_ID[defenderId];
  if(!a||!b||a===b)return 'Sin ventaja de clase';
  return CLASS_INFO[a].beats===b?`${CLASS_INFO[a].name} vence a ${CLASS_INFO[b].name}`:`${CLASS_INFO[a].name} pierde contra ${CLASS_INFO[b].name}`;
}
export const SETTINGS = {width:1000,height:600,winScore:7,ballSpeed:7.2,maxBallSpeed:15,paddleWidth:13,basePaddleHeight:100,skillEnabled:true,itemsEnabled:true};
