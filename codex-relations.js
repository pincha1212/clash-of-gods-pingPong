/*
 * Red de relaciones del Códice. Independiente de GODS y de las habilidades.
 * Los vínculos son direccionales cuando corresponden a genealogía (from = progenitor).
 * Las notas indican variantes o límites de las tradiciones cuando son relevantes.
 */
export const CODEX_CONNECTIONS = [
  // Genealogía griega y generaciones divinas
  {from:'gaia',to:'cronus',type:'parent',note:'Gaia aparece como madre de Cronos en la genealogía hesiódica.'},
  {from:'gaia',to:'rhea',type:'parent',note:'Rea pertenece a la generación de los Titanes, nacida de Gaia y Urano en la tradición hesiódica.'},
  {from:'cronus',to:'zeus',type:'parent',note:'Cronos y Rea son sus padres en la genealogía griega más difundida.'},
  {from:'rhea',to:'zeus',type:'parent',note:'Rea protege a Zeus de Cronos cuando nace.'},
  {from:'cronus',to:'hades',type:'parent',note:'Hades es hijo de Cronos y Rea.'},
  {from:'rhea',to:'hades',type:'parent',note:'Hades es hijo de Cronos y Rea.'},
  {from:'cronus',to:'poseidon',type:'parent',note:'Poseidón es hijo de Cronos y Rea.'},
  {from:'rhea',to:'poseidon',type:'parent',note:'Poseidón es hijo de Cronos y Rea.'},
  {from:'zeus',to:'athena',type:'parent',note:'Atenea nace de la cabeza de Zeus en el relato más conocido; las versiones sobre su madre varían.'},
  {from:'zeus',to:'apollo',type:'parent',note:'Apolo es hijo de Zeus y Leto.'},
  {from:'zeus',to:'artemis',type:'parent',note:'Artemisa es hija de Zeus y Leto.'},
  {from:'zeus',to:'hermes',type:'parent',note:'Hermes es hijo de Zeus y Maia.'},
  {from:'zeus',to:'ares',type:'parent',note:'Ares suele aparecer como hijo de Zeus y Hera.'},
  {from:'zeus',to:'persephone',type:'parent',note:'Perséfone suele ser hija de Zeus y Deméter; Deméter no forma parte del plantel actual.'},
  {from:'zeus',to:'heracles',type:'parent',note:'Heracles es hijo de Zeus y la mortal Alcmena.'},
  {from:'zeus',to:'perseus',type:'parent',note:'Perseo es hijo de Zeus y Dánae.'},
  {from:'apollo',to:'artemis',type:'sibling',note:'Son gemelos, hijos de Zeus y Leto.'},
  {from:'hades',to:'persephone',type:'consort',note:'Su unión y el descenso de Perséfone tienen variantes antiguas y modernas.'},
  {from:'poseidon',to:'theseus',type:'parent',note:'Algunas versiones presentan a Poseidón como padre divino de Teseo; otras señalan a Egeo.'},
  {from:'gaia',to:'typhon',type:'parent',note:'En la Teogonía, Tifón nace de Gaia y Tártaro; otras tradiciones ofrecen genealogías diferentes.'},
  {from:'prometheus',to:'epimetheus',type:'sibling',note:'Prometeo y Epimeteo son hermanos en la genealogía griega.'},
  {from:'iapetus',to:'prometheus',type:'parent',note:'Prometeo es hijo de Jápeto en la genealogía más difundida.'},
  {from:'iapetus',to:'epimetheus',type:'parent',note:'Epimeteo es hijo de Jápeto en la genealogía más difundida.'},
  {from:'oceanus',to:'tethys',type:'consort',note:'Océano y Tetis aparecen como pareja de Titanes y progenitores de numerosos ríos y oceánides.'},
  {from:'hyperion',to:'theia',type:'consort',note:'Hiperión y Tea son pareja en la genealogía hesiódica.'},
  // Tradición nórdica
  {from:'odin',to:'thor',type:'parent',note:'Thor es hijo de Odín y Jörð en la tradición nórdica.'},
  {from:'loki',to:'fenrir',type:'parent',note:'Fenrir es hijo de Loki y la giganta Angrboda.'},
  {from:'loki',to:'jormungandr',type:'parent',note:'Jörmungandr es hijo de Loki y Angrboda.'},
  {from:'loki',to:'hel',type:'parent',note:'Hel es hija de Loki y Angrboda en las fuentes nórdicas conservadas.'},
  {from:'thor',to:'jormungandr',type:'rival',note:'Thor y la Serpiente del Mundo están unidos por un enfrentamiento destinado a culminar en el Ragnarök.'},
  {from:'odin',to:'fenrir',type:'rival',note:'Odín teme el papel de Fenrir en el Ragnarök; el lobo acabará devorándolo según la profecía.'},
  {from:'odin',to:'loki',type:'ally',note:'Loki acompaña a los dioses en varios relatos, aunque también provoca crisis; su vínculo con Odín es complejo.'},
  // Tradición egipcia
  {from:'isis',to:'horus',type:'parent',note:'Isis es madre de Horus en la tradición osiríaca.'},
  {from:'seth',to:'horus',type:'rival',note:'Horus y Seth disputan el trono de Egipto en un ciclo mítico con distintas versiones.'},
  {from:'anubis',to:'isis',type:'ally',note:'En el ciclo de Osiris, Anubis participa en los ritos funerarios y ayuda a restaurar el cuerpo del dios.'},
  {from:'ra',to:'horus',type:'family',note:'Horus y Ra pueden asociarse o fusionarse en títulos como Ra-Horajti; no son equivalentes en todas las épocas.'},
  // Tradiciones japonesas e índicas
  {from:'amaterasu',to:'susanoo',type:'sibling',note:'Amaterasu y Susanoo son hermanos en el mito de la purificación de Izanagi.'},
  {from:'amaterasu',to:'tsukuyomi',type:'sibling',note:'Amaterasu y Tsukuyomi nacen de la purificación de Izanagi en una versión del mito.'},
  {from:'susanoo',to:'tsukuyomi',type:'sibling',note:'Susanoo y Tsukuyomi forman parte de la tríada de deidades surgidas de la purificación de Izanagi en una tradición.'},
  {from:'indra',to:'arjuna',type:'parent',note:'Arjuna es hijo de Indra por intervención divina en el Mahabharata.'},
  {from:'shiva',to:'kali',type:'family',note:'Kali se vincula con la tradición de la Diosa y con Shiva en distintas corrientes hinduistas; la relación exacta depende del texto y el culto.'},
  {from:'indra',to:'vritra',type:'rival',note:'El combate de Indra contra Vritra libera las aguas retenidas en el mito védico.'},
  // Relaciones entre héroes y criaturas
  {from:'perseus',to:'medusa',type:'rival',note:'Perseo decapita a Medusa en el relato más conocido.'},
  {from:'athena',to:'perseus',type:'ally',note:'Atenea ayuda a Perseo, entre otras cosas, con el escudo pulido que le permite evitar la mirada directa de Medusa.'},
  {from:'heracles',to:'cerberus',type:'rival',note:'Capturar a Cerbero es uno de los trabajos de Heracles.'},
  {from:'heracles',to:'hydra',type:'rival',note:'La Hidra de Lerna es uno de los trabajos de Heracles.'},
  {from:'heracles',to:'nemean_lion',type:'rival',note:'El león de Nemea es el primero de los trabajos tradicionales de Heracles.'},
  {from:'theseus',to:'minotaur',type:'rival',note:'Teseo entra al laberinto de Creta y derrota al Minotauro en el relato clásico.'},
  {from:'odysseus',to:'poseidon',type:'rival',note:'La ira de Poseidón dificulta el regreso de Odiseo en la Odisea.'},
  {from:'achilles',to:'hector',type:'rival',note:'Su duelo es uno de los episodios centrales de la Ilíada.'},
  {from:'achilles',to:'patroclus',type:'ally',note:'Patroclo es el compañero más cercano de Aquiles en la Ilíada; el tipo exacto de vínculo se interpreta de distintas maneras.'},
  {from:'ajax',to:'hector',type:'rival',note:'Áyax y Héctor se enfrentan en un duelo que termina sin vencedor definitivo.'},
  {from:'orfeo',to:'hades',type:'ally',note:'Orfeo desciende al inframundo para intentar recuperar a Eurídice y negocia con sus soberanos.'},
  {from:'orfeo',to:'persephone',type:'ally',note:'Perséfone participa, junto con Hades, en el relato del descenso de Orfeo.'},
  {from:'bellerophon',to:'chimera',type:'rival',note:'Belerofonte derrota a la Quimera con ayuda de Pegaso en el mito más difundido.'},
];

export const CODEX_MYTHS = [
 {id:'titanomachy',title:'La Titanomaquia',tradition:'Grecia antigua',summary:'La guerra entre los dioses olímpicos y los Titanes define el cambio de poder entre generaciones divinas. Las fuentes antiguas no narran todos los detalles del mismo modo.',characters:['zeus','cronus','rhea','gaia','atlas','prometheus','epimetheus']},
 {id:'birth-athena',title:'El nacimiento de Atenea',tradition:'Grecia antigua',summary:'Atenea surge de la cabeza de Zeus ya adulta y armada en la versión más conocida. Otras tradiciones ofrecen antecedentes distintos para su nacimiento.',characters:['zeus','athena']},
 {id:'twelve-labors',title:'Los trabajos de Heracles',tradition:'Grecia antigua',summary:'Una serie de pruebas impuestas a Heracles incluye enfrentarse a la Hidra, al león de Nemea y capturar a Cerbero.',characters:['heracles','hydra','nemean_lion','cerberus']},
 {id:'medusa-perseus',title:'Perseo y Medusa',tradition:'Grecia antigua',summary:'Perseo evita mirar directamente a Medusa y la decapita; Atenea aparece como aliada en versiones célebres del episodio.',characters:['perseus','medusa','athena']},
 {id:'labyrinth',title:'El laberinto de Creta',tradition:'Grecia antigua',summary:'Teseo entra al laberinto y vence al Minotauro. La historia también involucra a Ariadna, que no forma parte del plantel actual.',characters:['theseus','minotaur','poseidon']},
 {id:'underworld',title:'El descenso al inframundo',tradition:'Grecia antigua',summary:'Hades y Perséfone gobiernan el reino de los muertos. Orfeo intenta recuperar a Eurídice, mientras Heracles llega a ese reino durante uno de sus trabajos.',characters:['hades','persephone','orfeo','heracles','cerberus']},
 {id:'trojan-war',title:'La guerra de Troya',tradition:'Ciclo épico griego',summary:'Los relatos de la guerra conectan a Aquiles, Héctor, Patroclo, Áyax y Odiseo; la Ilíada se concentra en una parte limitada del conflicto.',characters:['achilles','hector','patroclus','ajax','odysseus']},
 {id:'odyssey',title:'El regreso de Odiseo',tradition:'Grecia antigua',summary:'Después de la guerra de Troya, Odiseo afronta pruebas durante su viaje de regreso. La hostilidad de Poseidón es una fuerza central del relato.',characters:['odysseus','poseidon']},
 {id:'prometheus-fire',title:'Prometeo y el fuego',tradition:'Grecia antigua',summary:'Prometeo desafía el orden de Zeus al favorecer a la humanidad. El relato del fuego tiene variantes y se vincula con la reflexión antigua sobre el progreso y sus costos.',characters:['prometheus','zeus','epimetheus']},
 {id:'ragnarok',title:'El Ragnarök',tradition:'Mitología nórdica',summary:'Las profecías del fin del mundo nórdico enlazan a Odín, Thor, Loki, Fenrir y Jörmungandr en una batalla de consecuencias cósmicas.',characters:['odin','thor','loki','fenrir','jormungandr','hel']},
 {id:'thor-serpent',title:'Thor y la Serpiente del Mundo',tradition:'Mitología nórdica',summary:'Thor se enfrenta repetidamente a Jörmungandr. Su combate final forma parte de las escenas más conocidas del Ragnarök.',characters:['thor','jormungandr']},
 {id:'horus-seth',title:'La disputa de Horus y Seth',tradition:'Mitología egipcia',summary:'Horus y Seth se enfrentan por la legitimidad del trono. Los episodios y el desenlace varían según los textos y los períodos egipcios.',characters:['horus','seth','isis','ra']},
 {id:'osiris-cycle',title:'Isis, Osiris y Horus',tradition:'Mitología egipcia',summary:'Isis busca restaurar a Osiris y proteger a Horus. Osiris no integra el plantel actual, pero es central para comprender este ciclo mítico.',characters:['isis','horus','anubis','seth']},
 {id:'cave-amaterasu',title:'Amaterasu y la cueva celestial',tradition:'Tradición sintoísta japonesa',summary:'Tras un conflicto con Susanoo, Amaterasu se oculta en una cueva y el mundo pierde la luz. Las otras deidades consiguen hacerla salir mediante una estratagema ritual.',characters:['amaterasu','susanoo','tsukuyomi']},
 {id:'indra-vritra',title:'Indra contra Vritra',tradition:'Tradición védica',summary:'Indra combate a Vritra, que retiene las aguas, y las libera con su arma, el vajra. Es uno de los relatos centrales de los himnos védicos.',characters:['indra','vritra']},
 {id:'arjuna-bow',title:'Arjuna y el legado de Indra',tradition:'Épica india · Mahabharata',summary:'Arjuna recibe armas y ayuda divina; en el Mahabharata, Indra es su padre celestial. Los episodios pertenecen a una tradición épica extensa con numerosas variantes.',characters:['arjuna','indra']},
 {id:'sun-wukong-journey',title:'El viaje al Oeste',tradition:'Literatura clásica china',summary:'Sun Wukong pasa de desafiar al cielo a acompañar la peregrinación del monje Xuanzang. La novela mezcla episodios cómicos, religiosos y de aventura.',characters:['sun_wukong']},
 {id:'nezha-journey',title:'Nezha y los desafíos celestiales',tradition:'Tradiciones religiosas y literatura china',summary:'Nezha aparece en relatos donde desafía fuerzas poderosas y protege a su comunidad. Sus historias cambian entre tradiciones religiosas, teatro y literatura.',characters:['nezha']},
 {id:'quetzalcoatl-traditions',title:'La Serpiente Emplumada',tradition:'Tradiciones mesoamericanas',summary:'Quetzalcóatl reúne significados distintos según la cultura y la época: viento, conocimiento, creación y legitimidad política, entre otros. No existe una única biografía universal.',characters:['quetzalcoatl']},
 {id:'arthurian',title:'El ciclo artúrico',tradition:'Tradiciones medievales europeas',summary:'Arturo, Merlín y Morgana cambian mucho entre versiones medievales y adaptaciones posteriores. Sus vínculos no son uniformes en todas las fuentes.',characters:['arthur','merlin','morgan']},
 {id:'song-of-roland',title:'La canción de Roldán',tradition:'Épica francesa medieval',summary:'Roldán es el héroe central de una chanson de geste que reelabora la retaguardia de la expedición de Carlomagno en Roncesvalles. El poema transforma un hecho histórico en una narración épica.',characters:['roland']},
 {id:'gilgamesh',title:'La epopeya de Gilgamesh',tradition:'Mesopotamia antigua',summary:'La epopeya explora la amistad, la pérdida y la mortalidad de un rey que emprende una búsqueda tras la muerte de Enkidu. Enkidu no forma parte del plantel actual.',characters:['gilgamesh_hero']},
 {id:'siegfried-dragon',title:'Sigfrido y el dragón',tradition:'Tradición germánica medieval',summary:'En la tradición de los Nibelungos, Sigfrido mata a un dragón y adquiere una invulnerabilidad incompleta. Las versiones y adaptaciones difieren en detalles.',characters:['siegfried']},
 {id:'beowulf-grendel',title:'Beowulf y Grendel',tradition:'Épica anglosajona',summary:'Beowulf combate a Grendel y después a su madre; años más tarde enfrenta a un dragón. Las criaturas de este poema no forman parte del plantel actual.',characters:['beowulf']},
 {id:'mulan-ballad',title:'La balada de Mulan',tradition:'Tradición literaria china',summary:'Mulan ocupa el lugar de su padre en el ejército en la balada que inspira muchas versiones posteriores. Los detalles de su biografía cambian con cada adaptación.',characters:['mulan']},
 {id:'momotaro',title:'Momotarō, el niño melocotón',tradition:'Folclore japonés',summary:'Momotarō emprende un viaje para combatir a los oni y se acompaña de animales que se convierten en aliados. Las versiones regionales difieren.',characters:['momotaro']},
 {id:'guan-yu',title:'Guan Yu y el Romance de los Tres Reinos',tradition:'Historia y literatura china',summary:'Guan Yu fue una figura histórica que alcanzó un estatus legendario en la tradición popular y en la novela histórica. Conviene distinguir al personaje histórico de sus relatos heroicos.',characters:['guan_yu']},
 {id:'robin-hood',title:'Las baladas de Robin Hood',tradition:'Folclore inglés',summary:'Robin Hood es una figura legendaria que evoluciona a través de baladas y relatos posteriores; no existe una biografía única aceptada para todas las versiones.',characters:['robin_hood']},
 {id:'orion-hunt',title:'Orión y la caza',tradition:'Grecia antigua',summary:'Orión aparece como un gran cazador en tradiciones distintas sobre su origen y muerte; su figura quedó asociada a una constelación.',characters:['orion','artemis']},
 {id:'bellerophon-chimera',title:'Belerofonte y la Quimera',tradition:'Grecia antigua',summary:'Belerofonte combate a la Quimera montado en Pegaso en el relato más difundido. El mito advierte también sobre el exceso de ambición del héroe.',characters:['bellerophon','chimera']},
 {id:'japanese-storm',title:'Tormenta y fuego en los mitos japoneses',tradition:'Tradiciones japonesas',summary:'Susanoo, Amaterasu, Tsukuyomi y Kagutsuchi pertenecen a relatos de origen y tensiones entre deidades. Sus episodios no forman un único ciclo lineal.',characters:['susanoo','amaterasu','tsukuyomi','kagutsuchi']}
];

export function getCodexConnections(id){
 return CODEX_CONNECTIONS.filter(link=>link.from===id||link.to===id).map(link=>({
  ...link,
  relatedId:link.from===id?link.to:link.from,
  label:connectionLabel(link,id)
 }));
}
function connectionLabel(link,id){
 if(link.type==='parent')return link.from===id?'Hijo/a de':'Progenitor/a de';
 if(link.type==='sibling')return 'Hermano/a';
 if(link.type==='consort')return 'Pareja en la tradición';
 if(link.type==='rival')return 'Rival o adversario';
 if(link.type==='ally')return 'Aliado o figura vinculada';
 return 'Vínculo mitológico';
}
export function getCodexMyths(id){return CODEX_MYTHS.filter(myth=>myth.characters.includes(id));}
