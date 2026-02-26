-- ============================================================
-- Chemical Compatibility Matrix — GuiaDelSalon.com
-- Migration: 20260226000001
-- ============================================================

-- Table definition
CREATE TABLE IF NOT EXISTS public.chemical_compatibility (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_done text NOT NULL,
  treatment_desired text NOT NULL,
  compatibility text NOT NULL CHECK (compatibility IN ('green', 'yellow', 'red')),
  wait_weeks integer,
  strand_test boolean NOT NULL DEFAULT false,
  risk_summary text NOT NULL,
  technical_explanation text NOT NULL,
  simple_explanation text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chemical_compatibility_pair_unique UNIQUE (treatment_done, treatment_desired),
  CONSTRAINT valid_treatment_done CHECK (treatment_done IN (
    'decoloracion',
    'alisado_keratina',
    'alisado_naoh',
    'alisado_tioglicolato',
    'henna_natural',
    'henna_metalica'
  )),
  CONSTRAINT valid_treatment_desired CHECK (treatment_desired IN (
    'decoloracion',
    'alisado_keratina',
    'alisado_naoh',
    'alisado_tioglicolato',
    'henna_natural',
    'henna_metalica'
  ))
);

-- Composite index for O(1) lookup by treatment pair
CREATE INDEX IF NOT EXISTS idx_chemical_compatibility_pair
  ON public.chemical_compatibility (treatment_done, treatment_desired);

-- Index for filtering by compatibility level (admin analytics)
CREATE INDEX IF NOT EXISTS idx_chemical_compatibility_level
  ON public.chemical_compatibility (compatibility);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.chemical_compatibility ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required — tool is public)
CREATE POLICY "chemical_compatibility_public_read"
  ON public.chemical_compatibility
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write access: authenticated users only (admin maintenance)
CREATE POLICY "chemical_compatibility_admin_insert"
  ON public.chemical_compatibility
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "chemical_compatibility_admin_update"
  ON public.chemical_compatibility
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chemical_compatibility_admin_delete"
  ON public.chemical_compatibility
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Seed Data — All 36 treatment pair combinations
-- Source: peer-reviewed cosmetic chemistry literature 2018–2026
-- ============================================================

INSERT INTO public.chemical_compatibility
  (treatment_done, treatment_desired, compatibility, wait_weeks, strand_test, risk_summary, technical_explanation, simple_explanation, source)
VALUES

-- ── SELF-PAIRS ──────────────────────────────────────────────

('decoloracion', 'decoloracion', 'yellow', 3, true,
 'Daño oxidativo acumulativo. El H₂O₂ repetido convierte más cystina en ácido cisteico, aumentando la porosidad progresivamente.',
 'Cada sesión de H₂O₂ oxida irreversiblemente la cystina (–S–S–) a ácido cisteico (–SO₃H), elimina 18-MEA de la capa F y aumenta la carga negativa cortical. La decoloración repetida sin intervalo suficiente multiplica la pérdida proteica (hasta 276% sobre pelo virgen con sesiones acumuladas) y eleva el índice de porosidad por encima del umbral de rotura estructural.',
 'Como lijar madera una y otra vez sin barnizarla: cada vez queda más fina y frágil hasta que se rompe. Tu cabello necesita tiempo para recuperar su barrera protectora antes de una nueva decoloración.',
 'PMC10075350 — Rodrigues et al., International Journal of Trichology (2022)'),

('alisado_keratina', 'alisado_keratina', 'yellow', 16, false,
 'Aplicación prematura genera pérdida proteica acumulada y puede reactivar liberación de ácido glioxílico residual.',
 'El ácido glioxílico (GA) forma adductos estables con la queratina (hemi(thio)acetales) que duran 3–4 meses. Una nueva aplicación antes de ese período acumula daño en el CMC —ya expandido de 45.5 Å nativos a ~57 Å post-GA— y añade pérdida proteica de 3.56 μg/g por cada ciclo, la mayor de todos los alisantes.',
 'Como aplicar una segunda capa de barniz antes de que la primera seque: no mejoras el acabado, solo añades capas que terminan descascarillándose. El tratamiento dura 3–4 meses; respétalo.',
 'PMC10405601 (Cornacchione et al., 2023); PMC8280444 (Gavazzoni Dias et al., 2021)'),

('alisado_naoh', 'alisado_naoh', 'red', null, false,
 'El NaOH convierte los puentes disulfuro en lantionina permanente. Una segunda aplicación hidroliza directamente la cadena peptídica sin efecto cosmético adicional.',
 'El hidróxido sódico convierte ~1/3 de los puentes disulfuro en lantionina (tioéter irreversible). El 2/3 restante ya relantionizado no puede volver a ser procesado. Una segunda aplicación de NaOH actúa sobre los enlaces peptídicos, produciendo hidrólisis alcalina directa de la queratina cortical. Pérdida proteica >500% sobre virgen documentada en tratamientos repetidos.',
 'Como doblar una varilla de acero ya doblada en el mismo punto: la primera vez la doblas, la segunda la quiebras. El hidróxido ya hizo su trabajo permanente; volver a aplicarlo no alisa más, sino que quiebra la fibra.',
 'PMC9073307 (Boga et al., 2022); Milady Professional Cosmetology Ch. 20'),

('alisado_tioglicolato', 'alisado_tioglicolato', 'yellow', 8, true,
 'Daño reductivo-oxidativo acumulado. Cada ciclo erosiona progresivamente la reserva de puentes disulfuro.',
 'El tioglicolato de amonio (AT) reduce cystina → 2× cisteína libre (–SH), luego re-oxidada con H₂O₂. Cada ciclo deja 5–10% de tioles sin re-oxidar. La pérdida proteica del AT es 159% sobre virgen; ciclos antes de 8 semanas elevan ese valor acumulativamente.',
 'Como deshacer y rehacer el nudo de una cuerda repetidamente: cada vez que la deshaces, algunas fibras quedan dañadas y el nudo siguiente es menos firme. Esperar 8 semanas da tiempo para que la fibra recupere parte de su resistencia.',
 'PMC9073307 (Boga et al., 2022); PMC8280444 (Gavazzoni Dias et al., 2021)'),

('henna_natural', 'henna_natural', 'green', null, false,
 'Sin contraindicaciones extraordinarias. La aplicación repetida de henna natural solo intensifica el color.',
 'La lawsona (2-hidroxi-1,4-naftoquinona) se une a los grupos –NH₂ de lisina e histidina vía adición de Michael, formando adductos estables. Aplicaciones sucesivas añaden capas pigmentarias adicionales sin reaccionar negativamente con depósitos previos. No existe riesgo de daño estructural ni formación de compuestos tóxicos con henna 100% natural.',
 'Como aplicar varias capas de pintura natural sobre madera: cada capa añade color y protección, sin interaccionar negativamente con las anteriores. Solo asegúrate de que la henna sea 100% natural, sin aditivos.',
 'Osman et al., J. Applied Toxicology (2003); Rainbow Research Corporation'),

('henna_metalica', 'henna_metalica', 'yellow', null, false,
 'Los depósitos metálicos se acumulan progresivamente, aumentando el riesgo de reacción exotérmica ante cualquier servicio oxidativo futuro.',
 'Las sales metálicas (Pb(OAc)₂, AgNO₃, CuSO₄) forman complejos metal–sulfuro en la corteza. Cada aplicación profundiza el depósito. No existe reacción peligrosa entre depósitos metálicos sucesivos, pero el inventario de metales catalíticos aumenta, haciendo cada vez más probable y violenta una eventual reacción de Fenton si se expone a H₂O₂.',
 'Como cargar un condensador eléctrico: cada aplicación añade más carga metálica en el pelo. En sí no es peligroso, pero cuando llegue un blanqueamiento futuro, esa carga acumulada desencadenará una reacción mucho más violenta.',
 'Back2MyRoots — Metallic salts in hair colour; PMC5931532 (2018)'),

-- ── CROSS-PAIRS: DECOLORACIÓN ────────────────────────────────

('decoloracion', 'alisado_keratina', 'yellow', 3, true,
 'Porosidad post-decoloración eleva la penetración del GA a niveles que reducen la entalpía de desnaturalización un 88% y multiplican la porosidad × 3.7.',
 'El H₂O₂ elimina el 18-MEA y oxida cystina → ácido cisteico. El GA posterior penetra 3× más en la cutícula comprometida. Cornacchione et al. (2023) documentan porosidad de 11.97% media (máx 20.89%) y entalpía de 2.3 J/g vs 17.5 J/g en virgen (reducción 88%). Orden preferido: decoloración primero, GA después.',
 'Como intentar barnizar madera mojada: el barniz penetra demasiado profundo y de forma desigual, sin crear una capa protectora eficaz. Espera 3–4 semanas para que la estructura se estabilice.',
 'PMC10405601 (Cornacchione et al., IUCr Journal, 2023)'),

('decoloracion', 'alisado_naoh', 'red', null, false,
 'Eliminación simultánea de ambos tipos de cross-links corticales (cystina → ácido cisteico por H₂O₂; cystina → lantionina por NaOH). Pérdida proteica documentada >356% sobre virgen. Riesgo de alopecia.',
 'El H₂O₂ oxida cystina (–S–S–) → ácido cisteico (–SO₃H). El NaOH convierte la cystina restante → lantionina (tioéter irreversible) e hidroliza la cadena peptídica (pH 12–14). La combinación elimina los DOS tipos principales de cross-links de la queratina cortical, produciendo colapso estructural. Barbosa et al. (2015) documentan 356% de pérdida proteica con tinte oxidativo + NaOH; la decoloración con H₂O₂ 6–12% es sustancialmente más agresiva.',
 'Como arrancar los tornillos de una silla y luego eliminar el pegamento: sin los dos sistemas de sujeción, la estructura se colapsa. Tu cabello usa dos tipos de enlaces para mantener su resistencia; esta combinación destruye ambos simultáneamente.',
 'PubMed 26177865 (Barbosa et al., 2015); PMC9073307 (Boga et al., 2022)'),

('decoloracion', 'alisado_tioglicolato', 'yellow', 4, true,
 'Alta porosidad post-decoloración facilita penetración excesiva del AT. Riesgo de sobre-reducción y reacción exotérmica si hay tioles residuales activos.',
 'El pelo post-decoloración tiene porosidad elevada (hasta 20.89%) que facilita entrada rápida del tioglicolato de amonio. Esta penetración acelerada puede sobre-reducir los puentes disulfuro más allá del punto necesario. Si quedan tioles libres sin neutralizar y se aplica H₂O₂ concentrado, existe riesgo de reacción exotérmica localizada y generación de H₂S.',
 'Como verter agua en una esponja ya empapada: la solución penetra demasiado rápido y profundo, sin control. El cabello blanqueado absorbe el relajante de forma incontrolada, pudiendo debilitarlo hasta la rotura.',
 'PMC9073307 (Boga et al., 2022); consenso profesional internacional'),

('decoloracion', 'henna_natural', 'yellow', 0, true,
 'La cutícula post-decoloración es muy porosa, causando absorción de lawsona excepcionalmente intensa y potencialmente desigual. Sin riesgo químico agudo, pero con alto riesgo estético.',
 'El H₂O₂ elimina el 18-MEA, eleva la porosidad y aumenta la carga negativa de la fibra. La lawsona (molécula hidrofóbica pequeña) penetra con mayor facilidad en la corteza comprometida, produciendo color más intenso. No existe reacción química peligrosa entre lawsona y H₂O₂ residual.',
 'Como teñir papel mojado: el color penetra mucho más profundo y queda más oscuro de lo esperado. La henna sobre pelo blanqueado puede resultar en un rojo muy intenso. Haz siempre una prueba de mechón.',
 'Osman et al., J. Applied Toxicology (2003); consenso profesional'),

('decoloracion', 'henna_metalica', 'yellow', 0, false,
 'Sin reacción peligrosa inmediata (H₂O₂ ya enjuagado). Sin embargo, los depósitos metálicos depositados hoy harán que FUTUROS servicios oxidativos sean extremadamente peligrosos.',
 'Una vez que el H₂O₂ ha sido enjuagado, no persiste activo. Las sales metálicas no generan reacción con peróxido residual. Sin embargo, los iones metálicos (Pb²⁺, Ag⁺, Cu²⁺) que se depositan permanecerán indefinidamente y harán incompatible cualquier futuro servicio oxidativo mediante reacción Fenton. Informar al cliente explícitamente.',
 'Es como instalar un sistema de gas en casa sabiendo que habrá fuego cerca: hoy no hay peligro porque están separados, pero la combinación futura es una bomba de relojería. Una vez aplicada la henna metálica, el pelo queda con restricción permanente para blanqueamientos futuros.',
 'Back2MyRoots — Metallic salts chemistry; PMC5931532 (2018)'),

-- ── CROSS-PAIRS: ALISADO KERATINA ───────────────────────────

('alisado_keratina', 'decoloracion', 'yellow', 3, true,
 'El H₂O₂ destruye el film GA antes de curar completamente, anulando el alisado y exponiendo la corteza ya dañada por el GA a agresión oxidativa adicional.',
 'El film de GA requiere 2–3 semanas para estabilizarse. Si el H₂O₂ alcalino (pH 9–10.5) se aplica antes, hidroliza los adductos GA-queratina y revierte parcialmente la conformación β→α. Simultáneamente, el H₂O₂ oxida la corteza con CMC ya expandido (57 Å), causando daño adicional en substrato comprometido.',
 'Como decolorar una tela recién teñida antes de que el tinte fije: el nuevo proceso destruye el trabajo anterior y deja la tela más dañada que sin ningún tratamiento. Espera 3 semanas para que el alisado asiente antes de decolorar.',
 'PMC10405601 (Cornacchione et al., 2023); Pure Keratin professional platform'),

('alisado_keratina', 'alisado_naoh', 'red', null, false,
 'Incompatibilidad documentada (PMC8280444, Tabla 2). El GA bloquea los sitios nucleófilos necesarios para la lantionización. Reacción ácido-base en fibra. Rotura severa documentada.',
 'Los adductos hemi(thio)acetal del GA (pH <2.0) ocupan los grupos –NH₂ y –SH necesarios para la formación de lantionina por NaOH (pH 12–14). El NaOH no puede formar lantionina en sitios bloqueados, pero hidroliza los adductos GA liberando productos de degradación. La diferencia de pH genera calor en la superficie de la fibra. Pérdida proteica acumulada (GA: 3.56 μg/g + NaOH: 2.76×) provoca rotura severa.',
 'Como intentar roscar un tornillo en un agujero que ya tiene otro tornillo: no entra, y el intento forzado daña ambos. El ácido glioxílico ya rellenó los puntos de anclaje que el hidróxido necesita.',
 'PMC8280444 Tabla 2 (Gavazzoni Dias et al., JEADV 2021)'),

('alisado_keratina', 'alisado_tioglicolato', 'red', null, false,
 'Incompatibilidad documentada (PMC8280444). El GA bloquea los sitios –SH libres que el AT necesita. Formación de derivados tioaldehído impredecibles. Rotura capilar severa.',
 'El mecanismo del AT requiere acceso a grupos –SH de cisteína libre. Los adductos hemi(thio)acetal del GA modifican estos sitios nucleófilos. El AT no puede reducir eficazmente los puentes disulfuro, pero reacciona con grupos aldehído libres del GA formando derivados tioaldehído de química impredecible. PMC8280444 Tabla 2 lista explícitamente GA ↔ AT como incompatible con rotura capilar como consecuencia documentada.',
 'Como intentar aflojar tornillos con una llave que no encaja en la cabeza: no afloja los tornillos (no hace el efecto alisante), pero sí araña el metal (daña el cabello). Las dos herramientas químicas interfieren entre sí sin lograr su propósito.',
 'PMC8280444 Tabla 2 (Gavazzoni Dias et al., JEADV 2021)'),

('alisado_keratina', 'henna_natural', 'yellow', 4, true,
 'La lawsona compite con el GA por los mismos sitios –NH₂ de la queratina, resultando en distribución irregular del pigmento y alisado cosméticamente ineficaz.',
 'Tanto el GA como la lawsona se unen preferentemente a –NH₂ de lisina e histidina. Si el film GA está presente, la lawsona no accede a muchos sitios, resultando en pigmentación irregular. A 180–200°C (plancha GA en futura sesión), la lawsona residual sufre oxidación térmica con viraje hacia tonos verdes-marrones. Cezanne desaconseja explícitamente el GA sobre pelo con henna.',
 'Como intentar pintar una pared que ya tiene un revestimiento impermeable: la pintura nueva (henna) no se adhiere bien porque la superficie (pelo tratado con GA) ya está cubierta. El resultado es irregular y decepcionante.',
 'PMC8280444; Cezanne Hair FAQ; kanbrik.com professional guide'),

('alisado_keratina', 'henna_metalica', 'yellow', 4, false,
 'Sin reacción aguda entre film GA y sales metálicas. Sin embargo, los depósitos metálicos harán que futuros servicios con plancha GA (200°C) sean peligrosos por catálisis térmica metálica.',
 'El film de GA no reacciona directamente con sales de Pb, Ag o Cu en ausencia de calor o H₂O₂. Pero los depósitos metálicos en la corteza interaccionarán peligrosamente con el calor (200°C) de cualquier futura sesión de alisado GA, generando degradación catalítica térmica. Si la henna contiene PPD, su polimerización a Base de Bandrowski a 200°C representa riesgo toxicológico adicional.',
 'Como almacenar gasolina en el garaje: hoy no hay fuego, pero mañana cuando uses la plancha (200°C en la próxima queratina), la combinación será peligrosa. La henna metálica deja una trampa en el cabello para futuros servicios.',
 'StatPearls NBK606092; PMC8280444; química de catálisis metálica térmica'),

-- ── CROSS-PAIRS: ALISADO NaOH ────────────────────────────────

('alisado_naoh', 'decoloracion', 'red', null, false,
 'El pelo con lantionina carece de puentes disulfuro que confieren elasticidad. La oxidación por H₂O₂ de la cystina residual produce colapso estructural total. Riesgo de alopecia permanente.',
 'El NaOH convierte ~1/3 de los puentes cystina en lantionina irreversible. El H₂O₂ posterior oxida la cystina residual a ácido cisteico e hidroliza peptídicamente la corteza debilitada. La combinación elimina prácticamente todos los cross-links corticales. Pérdida proteica combinada (NaOH + tinte oxidativo): 356% sobre virgen; decoloración con H₂O₂ 6–12% es 2–4× más agresiva que el tinte.',
 'Como intentar cocer un huevo que ya está duro: no puedes hacerlo más cocido, solo lo destruyes. El hidróxido ya modificó el cabello de forma permanente; añadir blanqueamiento encima no lo alisa más, sino que lo deshace.',
 'PubMed 26177865 (Barbosa et al., 2015); PMC9073307 (Boga et al., 2022)'),

('alisado_naoh', 'alisado_keratina', 'red', null, false,
 'Los sitios de anclaje del film GA (–NH₂ y –SH) han sido modificados por NaOH: la lantionina no es substrato para el GA. Film imposible de formar. Pérdida proteica acumulada catastrófica.',
 'El ácido glioxílico requiere –NH₂ libres y –SH accesibles para adductos estables. El NaOH convierte la cystina en lantionina (sin –SH libre) e hidroliza parcialmente los grupos amina. Los sitios necesarios para el GA están modificados o destruidos. La proteína cortical post-NaOH ya tiene 276% de pérdida proteica; añadir el daño del GA (3.56 μg/g) sobre este substrato produce rotura masiva.',
 'Como intentar pegar un adhesivo en una superficie tratada con disolvente: la superficie no acepta el adhesivo porque ya fue modificada. El ácido glioxílico no puede anclarse en un pelo que el hidróxido transformó radicalmente.',
 'PMC8280444 Tabla 2; PMC9073307 (Boga et al., 2022)'),

('alisado_naoh', 'alisado_tioglicolato', 'red', null, false,
 'Incompatibilidad química absoluta. La lantionina formada por NaOH no puede ser reducida por el tioglicolato. Sin efecto alisante; rotura de proteína residual.',
 'La lantionina (–CH₂–S–CH₂–, tioéter) formada por NaOH es química e irreduciblemente inerte al tioglicolato de amonio. El AT solo puede reducir enlaces disulfuro (–S–S–); el tioéter lantionina no es reducible. El AT residual reacciona de forma no específica con proteína no modificada, generando hidrólisis proteica adicional sin efecto cosmético. Conocida en la industria como incompatibilidad absoluta never mix hydroxide and thio.',
 'Como intentar desatar un nudo que fue soldado con fuego: el nudo ya no es un nudo, es una pieza sólida. El tioglicolato solo puede aflojar nudos (puentes disulfuro), no soldaduras (lantionina permanente). Solo daña lo que queda.',
 'PMC8280444; PMC9073307; Milady Professional Cosmetology Ch. 20'),

('alisado_naoh', 'henna_natural', 'yellow', 2, false,
 'Sin riesgo de reacción química aguda. El NaOH puede alterar sitios de anclaje de la lawsona. Posible viraje de color. Efecto cosmético ligeramente inferior al esperado.',
 'El NaOH hidroliza parcialmente los grupos –NH₂ de lisina e histidina (sustratos de la lawsona), reduciendo la densidad de sitios disponibles para la adición de Michael. Resultado: color de henna potencialmente menos intenso y menos uniforme. El NaOH puede también degradar el anillo naftoquinónico de la lawsona con viraje cromático menor. No existe reacción peligrosa documentada entre NaOH previo y henna natural.',
 'Como pintar madera tratada con un producto alcalino: la pintura puede quedar un poco menos viva y uniforme porque el tratamiento anterior alteró la superficie. Espera 2 semanas para que el pelo se estabilice antes de la henna.',
 'GrowAfricanHairLong professional blog; Rainbow Research Corporation; Surya Brasil FAQ'),

('alisado_naoh', 'henna_metalica', 'yellow', 0, false,
 'Sin reacción peligrosa inmediata. Los depósitos metálicos en pelo ya comprometido por NaOH crearán una situación de doble riesgo para cualquier servicio oxidativo futuro. Se desaconseja fuertemente.',
 'El NaOH post-enjuague no persiste activo. La henna metálica puede depositarse sin reacción química aguda. Sin embargo, el pelo post-NaOH tiene ya 276% de pérdida proteica y estructura cortical gravemente comprometida. Añadir depósitos metálicos en este substrato debilitado crea un sistema en el que cualquier futuro H₂O₂ causará reacción de Fenton sobre fibra pre-dañada, con altísimo riesgo de disolución.',
 'Como instalar cables eléctricos defectuosos en una casa con el sistema de gas ya dañado: cada problema por separado es preocupante, pero juntos crean una situación extremadamente peligrosa para el futuro. Se desaconseja encarecidamente.',
 'Química de reacción Fenton; PMC9073307; Back2MyRoots'),

-- ── CROSS-PAIRS: ALISADO TIOGLICOLATO ───────────────────────

('alisado_tioglicolato', 'decoloracion', 'yellow', 4, true,
 'La porosidad elevada post-AT facilita penetración excesiva del H₂O₂. Riesgo de reacción exotérmica si la neutralización del AT fue incompleta.',
 'El pelo post-AT tiene porosidad elevada. Si el AT no fue neutralizado completamente (tioles residuales –SH presentes), estos reaccionan exotérmicamente con el H₂O₂ de alta concentración del blanqueador (6–12%), generando calor localizado y H₂S. La verificación de la completitud de la neutralización es obligatoria antes de proceder.',
 'Como mezclar agua con cal viva antes de que enfríe completamente: si el proceso anterior no terminó del todo, la nueva reacción genera calor inesperado. Espera 4 semanas para asegurarte de que el relajante neutralizó por completo antes de blanquear.',
 'PMC9073307 (Boga et al., 2022); consenso profesional internacional'),

('alisado_tioglicolato', 'alisado_keratina', 'red', null, false,
 'El AT modifica los mismos sitios –SH que el GA necesita. Los puentes disulfuro reposicionados por AT crean un substrato incompatible con el film GA. Rotura capilar documentada.',
 'El AT reduce cystina a cisteína libre (–SH) y re-oxida los tioles en posición nueva. El GA requiere –SH y –NH₂ libres para sus adductos. El substrato post-AT, aunque neutralizado, tiene geometría de puentes disulfuro alterada y 159% de pérdida proteica adicional. PMC8280444 Tabla 2 documenta AT ↔ GA como incompatibles con rotura capilar como consecuencia.',
 'Como intentar ensamblar dos piezas LEGO de sistemas diferentes: los conectores no encajan aunque parezcan similares. El tioglicolato y el ácido glioxílico actúan en los mismos puntos de agarre de la proteína capilar, pero de formas incompatibles.',
 'PMC8280444 Tabla 2 (Gavazzoni Dias et al., JEADV 2021)'),

('alisado_tioglicolato', 'alisado_naoh', 'red', null, false,
 'Incompatibilidad absoluta. Los puentes disulfuro reposicionados por AT no pueden ser procesados eficazmente por NaOH. Colapso proteico catastrófico.',
 'El AT reduce y re-oxida los puentes disulfuro en posición nueva. El NaOH posterior actúa sobre estos puentes reposicionados, formando lantionina en configuración espacial incorrecta y adicionalmente hidroliza la proteína residual. La diferencia de pH (AT: 9–9.5; NaOH: 12–14) sobre fibra comprometida genera hidrólisis proteica acelerada. Incompatibilidad absoluta establecida en Milady y toda la literatura profesional.',
 'Como intentar poner el pelo en un molde diferente cuando ya está fraguado: el molde primero (tioglicolato) ya hizo su efecto permanente. El segundo molde (hidróxido) no puede remodelar lo que está fijo, solo puede fragmentarlo.',
 'PMC8280444; Milady Professional Cosmetology Ch. 20; PMC9073307'),

('alisado_tioglicolato', 'henna_natural', 'yellow', 2, false,
 'Tioles residuales del AT pueden reducir la lawsona (quinona→hidroquinona), alterando el color de la henna. Efecto estético inferior al esperado. Sin riesgo de seguridad aguda.',
 'El tioglicolato tiene potencial reductor sobre quinonas. La lawsona (2-hidroxi-1,4-naftoquinona) puede ser parcialmente reducida a leucolawsona (hidroquinona sin color) por tioles residuales no neutralizados del AT, produciendo decoloración o pigmentación irregular. Después de 2 semanas y 5+ lavados, el AT residual es mínimo y la henna puede proceder con resultados más predecibles.',
 'Como aplicar barniz de color sobre una superficie tratada con un disolvente: el disolvente residual puede lavar parte del color antes de que fije bien. Espera 2 semanas para que el relajante se elimine completamente antes de la henna.',
 'Consenso profesional; GrowAfricanHairLong; Rainbow Research Corporation'),

('alisado_tioglicolato', 'henna_metalica', 'yellow', 2, false,
 'Sin reacción aguda entre AT neutralizado y sales metálicas. Los depósitos metálicos crearán incompatibilidad permanente con cualquier futuro servicio oxidativo o neutralizante de AT.',
 'El AT neutralizado con H₂O₂ no genera reacción directa con sales metálicas de la henna compuesta. Pero al depositar iones metálicos en la corteza comprometida por AT (159% pérdida proteica), cualquier futuro H₂O₂ de neutralizante de AT subsiguiente desencadenará reacción de Fenton: Cu²⁺ + H₂O₂ → •OH (cascada exotérmica). Informar al cliente de esta restricción permanente.',
 'Es como mezclar dos ingredientes inocuos por separado que forman una combinación peligrosa: el relajante (ya terminado) y la henna metálica (aplicada hoy) no reaccionan entre sí, pero los metales depositados hoy crean una trampa para futuros servicios que usen agua oxigenada.',
 'Química de Fenton; Back2MyRoots; lustroushenna.com'),

-- ── CROSS-PAIRS: HENNA NATURAL ───────────────────────────────

('henna_natural', 'decoloracion', 'yellow', 0, true,
 'Sin emergencia química, pero el H₂O₂ oxida la lawsona causando virajes de color impredecibles. El blanqueamiento puede ser ineficaz en zonas pigmentadas con lawsona. Prueba de mechón obligatoria.',
 'La lawsona (C₁₀H₆O₃) unida covalentemente a la queratina es susceptible a oxidación por H₂O₂. El anillo naftoquinónico se oxida a productos de degradación que producen tonalidades verdes, amarillas o marrones. Parte del H₂O₂ es consumido en esta oxidación en lugar de en la melanocortical, reduciendo la eficacia del blanqueamiento. El enlace lawsona-queratina es permanente; ningún tiempo de espera elimina la incompatibilidad cromática.',
 'Como intentar eliminar una mancha de tinta permanente con agua oxigenada: la agua oxigenada reacciona con la tinta de forma impredecible, creando colores inesperados en lugar de dejar el papel blanco. La henna está fusionada con el pelo de forma permanente.',
 'Osman et al., J. Applied Toxicology (2003); consenso profesional'),

('henna_natural', 'alisado_keratina', 'yellow', 4, true,
 'La lawsona ocupa sitios –NH₂ necesarios para el film GA. Film irregular y alisado ineficaz. A 200°C, la lawsona se degrada con viraje de color. Cezanne desaconseja explícitamente el GA sobre pelo con henna.',
 'Tanto el GA como la lawsona se unen preferentemente a grupos –NH₂ de lisina e histidina. Con lawsona presente, el GA no puede acceder a muchos sitios, produciendo alisado desigual. La plancha a 180–200°C oxida térmicamente la lawsona residual con degradación hacia tonos verdes-marrones. La marca Cezanne indica que no puede garantizar el resultado en pelo con henna.',
 'Como intentar sellar una madera que ya tiene barniz incompatible: la nueva capa no agarra donde hay barniz viejo, quedando un resultado parcheado e irregular. Espera 4–6 semanas y trabaja solo sobre el recrecimiento.',
 'Cezanne Hair FAQ; PMC8280444; PMC10075350'),

('henna_natural', 'alisado_naoh', 'yellow', 2, false,
 'Sin reacción de seguridad aguda. La lawsona puede ocluir la corteza, reduciendo la eficacia del relajante. El NaOH puede degradar el adducto lawsona-queratina con viraje de color.',
 'El enlace covalente lawsona-queratina es relativamente estable a pH 12–14, aunque puede hidrolizarse parcialmente. La lawsona depositada en la cutícula puede crear un efecto oclusivo que ralentice la penetración del NaOH, requiriendo mayor tiempo de procesado y aumentando el riesgo de sobre-procesado en otras zonas. No existe reacción exotérmica ni compuestos tóxicos documentados entre lawsona y NaOH.',
 'Como encerar un coche antes de pintarlo: la cera (henna) dificulta que la nueva pintura (relajante) penetre bien. El resultado puede ser desigual. Espera 2 semanas para que se lave la henna no fijada antes del relajante.',
 'GrowAfricanHairLong; Rainbow Research Corporation; Surya Brasil FAQ'),

('henna_natural', 'alisado_tioglicolato', 'yellow', 2, false,
 'Los grupos tiol del AT pueden reducir parcialmente la lawsona (quinona→hidroquinona), alterando el color de la henna. La lawsona puede ocluir el acceso del AT a los puentes disulfuro. Eficacia reducida.',
 'El tioglicolato tiene potencial reductor sobre el sistema quinónico de la lawsona. Esto no genera peligro agudo, pero produce decoloración parcial de la henna y puede dejar el relajante con acceso reducido a los puentes disulfuro corticales en zonas más densamente pigmentadas con lawsona.',
 'Como usar un limpiador poderoso para limpiar una superficie barnizada: el limpiador hace su trabajo, pero también puede dañar el barniz. El relajante puede funcionar pero también puede alterar el color de la henna de forma impredecible.',
 'Consenso profesional; química de potenciales redox de quinonas'),

('henna_natural', 'henna_metalica', 'yellow', 0, false,
 'Sin reacción química entre lawsona y sales metálicas. Los depósitos metálicos añadidos harán que futuros servicios oxidativos sean extremadamente peligrosos. Informar al cliente explícitamente.',
 'La lawsona no reacciona con Pb²⁺, Ag⁺ o Cu²⁺ de forma peligrosa. Los depósitos metálicos se integran en la corteza sin interaccionar con los adductos lawsona-queratina. Sin embargo, el pelo tendrá ahora ambos pigmentos. Cualquier futuro H₂O₂ sobre este pelo generará: (1) viraje de color de la lawsona Y (2) reacción de Fenton con los metales. El resultado es doblemente impredecible y potencialmente muy peligroso.',
 'Es combinar dos tipos de pintura incompatibles en la misma pared: individualmente son manejables, pero cuando llegue el momento de repintarla (con servicios oxidativos futuros), la reacción de los dos tipos juntos será explosiva e impredecible.',
 'Química de Fenton; Back2MyRoots; consenso profesional'),

-- ── CROSS-PAIRS: HENNA METÁLICA ─────────────────────────────

('henna_metalica', 'decoloracion', 'red', null, false,
 'EMERGENCIA QUÍMICA AGUDA. Los iones metálicos (especialmente Cu²⁺) catalizan la descomposición violenta del H₂O₂ (reacción de Fenton). El pelo hierve: calor extremo, vapores de H₂S, disolución de la fibra, quemaduras en cuero cabelludo. NUNCA realizar.',
 'Cu²⁺ cataliza la descomposición de H₂O₂ en ciclo de Fenton modificado: Cu²⁺ + H₂O₂ → Cu⁺ + •OH + H⁺; Cu⁺ + H₂O₂ → Cu²⁺ + OH⁻ + •OH. Genera radicales hidroxilo en cascada con liberación masiva de calor, disuelve la proteína capilar mediante oxidación radical, y oxida la cisteína a H₂S gaseoso. Los persulfatos del blanqueador amplían la reacción (PMC5931532). El pelo humea, burbujea y se disuelve en minutos.',
 'Es como mezclar lejía con amoníaco, pero directamente en el cabello de tu cliente: la reacción es violenta, instantánea y causa quemaduras. Los metales de la henna actúan como un catalizador explosivo para el agua oxigenada del blanqueamiento. Esta es una de las emergencias más peligrosas de un salón.',
 'PMC5931532; química de Fenton; consenso profesional unánime; Back2MyRoots'),

('henna_metalica', 'alisado_keratina', 'red', null, false,
 'Los depósitos metálicos catalizan reacciones de degradación proteica térmica a 180–200°C. El PPD de la henna compuesta puede polimerizarse a Base de Bandrowski (compuesto mutagénico) a esta temperatura.',
 'A 180–200°C, el Cu²⁺ actúa como catalizador en reacciones de oxidación térmica de la queratina, generando radicales libres que degradan la proteína más allá del efecto térmico normal. El PPD frecuentemente presente en henna compuesta se polimeriza bajo calor en Base de Bandrowski (2,5-diaminofenil-4-[p-aminofenilamino]-bencenediol), compuesto con actividad mutagénica confirmada (StatPearls NBK606092).',
 'Como calentar con soplete un objeto que contiene cables eléctricos: el calor normal es seguro para madera/metal, pero en presencia de cables eléctricos (metales de henna) desencadena un cortocircuito (reacción química peligrosa). La plancha a 200°C más metales es una reacción destructiva inevitable.',
 'StatPearls NBK606092; PMC8280444; química de catálisis metálica térmica'),

('henna_metalica', 'alisado_naoh', 'red', null, false,
 'El NaOH disuelve parcialmente los depósitos metálicos liberando iones libres en la corteza, que catalizan hidrólisis proteica amplificada. Derretimiento capilar documentado en fuentes profesionales.',
 'El hidróxido sódico precipita acetatos metálicos: Pb(OAc)₂ + 2 NaOH → Pb(OH)₂↓ + 2 NaOAc. Los hidróxidos metálicos precipitados forman pasta que bloquea la penetración uniforme del NaOH, generando sobre-procesado localizado. Los iones Pb²⁺, Ag⁺ o Cu²⁺ liberados catalizan hidrólisis proteica de la queratina en condiciones alcalinas, amplificando la pérdida proteica del NaOH (ya 276%) hasta niveles de disolución de la fibra.',
 'Como añadir ácido a una mezcla que ya contiene metales activos: la reacción se descontrola, generando subproductos inesperados y muy dañinos. El cabello con henna metálica no acepta relajantes alcalinos sin riesgo de derretirse literalmente.',
 'Química de hidróxidos metálicos; lustroushenna.com; Back2MyRoots; GrowAfricanHairLong'),

('henna_metalica', 'alisado_tioglicolato', 'red', null, false,
 'El tioglicolato es consumido por reducción de iones metálicos (Cu²⁺), dejando menos reactivo para los puentes disulfuro. El Cu⁰ generado cataliza química de Fenton con el H₂O₂ neutralizante. Daño severo.',
 'Cu²⁺ + 2 R–SH → Cu⁰ + R–SS–R + 2H⁺. El tioglicolato (R–SH) es oxidado por iones Cu²⁺ en lugar de actuar sobre los puentes disulfuro de la queratina. El cobre reducido (Cu⁰) y Cu⁺ generados en la corteza son altamente reactivos ante el H₂O₂ del neutralizante estándar, desencadenando reacción de Fenton: Cu⁺ + H₂O₂ → Cu²⁺ + •OH + OH⁻. El relajante no funciona correctamente y el neutralizante desencadena daño oxidativo radical severo.',
 'Como usar pegamento industrial para unir dos superficies, pero una tiene aceite: el pegamento se gasta reaccionando con el aceite (metales) en lugar de unir las superficies (alisado). El resultado no solo no funciona, sino que crea subproductos peligrosos.',
 'Química redox metal-tiol; PMC5931532; lustroushenna.com'),

('henna_metalica', 'henna_natural', 'yellow', 0, false,
 'Sin reacción química aguda entre depósitos metálicos y lawsona. La henna natural se deposita sobre pelo con sales metálicas sin generar emergencia. Los metales preexistentes siguen haciendo incompatible cualquier servicio oxidativo futuro.',
 'La lawsona no reacciona de forma peligrosa con los iones Pb²⁺, Ag⁺ o Cu²⁺ presentes como depósitos en la corteza. La lawsona puede unirse a los –NH₂ disponibles sin interacción violenta con los complejos metal-sulfuro. Sin embargo, la situación de base sigue siendo de riesgo: los depósitos metálicos permanecen inalterados e incompatibles con H₂O₂. La henna natural adicional no mejora ni empeora esta situación.',
 'Como poner una segunda capa de pintura sobre una pared que ya tiene un problema de humedad: la segunda capa no causa problema por sí misma, pero tampoco soluciona el problema subyacente (los metales). El riesgo para futuros tratamientos oxidativos permanece exactamente igual.',
 'Química de coordinación metal-naftoquinona; consenso profesional');

-- Verify row count
DO $$
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM public.chemical_compatibility;
  IF row_count != 36 THEN
    RAISE EXCEPTION 'Expected 36 rows in chemical_compatibility, got %', row_count;
  END IF;
  RAISE NOTICE 'chemical_compatibility seeded successfully: % rows', row_count;
END $$;
