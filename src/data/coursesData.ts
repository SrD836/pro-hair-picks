export type CourseModality = "online" | "presencial";
export type CourseLang = "ES" | "EN" | "BOTH";

export interface Course {
  id: number;
  lang: CourseLang;
  modality: CourseModality;
  name: { es: string; en: string };
  school: string;
  location: string;
  price: string;
  duration: string;
  hours: string;
  professionalOutlets: { es: string[]; en: string[] };
  curriculum: { es: string[]; en: string[] };
  url: string;
  imageUrl: string;
}

export const courses: Course[] = [
  // ── PRESENCIALES ESPAÑA ──────────────────────────────────────────────────
  {
    id: 1,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Curso Oficial de Peluquería",
      en: "Official Hairdressing Course",
    },
    school: "Escuela Pro Valliance",
    location: "Madrid, España",
    price: "~1.800 €",
    duration: "6 meses",
    hours: "600 h",
    professionalOutlets: {
      es: ["Estilista en salón", "Colorista profesional", "Emprendimiento propio"],
      en: ["Salon stylist", "Professional colorist", "Own business"],
    },
    curriculum: {
      es: ["Corte técnico y creativo", "Colorimetría y decoloración", "Peinados y recogidos", "Bolsa de trabajo incluida"],
      en: ["Technical & creative cutting", "Colorimetry & bleaching", "Updos & styling", "Job placement included"],
    },
    url: "https://www.escuelaprovalliancemadrid.com/curso-de-peluqueria/",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Máster en Color y Corte Avanzado",
      en: "Master in Advanced Color & Cutting",
    },
    school: "Universidad de la Imagen",
    location: "Madrid, España",
    price: "150 – 350 €",
    duration: "1 – 3 días",
    hours: "8 – 24 h",
    professionalOutlets: {
      es: ["Especialista en color", "Formador/a de peluquería", "Colorista freelance"],
      en: ["Color specialist", "Hairdressing trainer", "Freelance colorist"],
    },
    curriculum: {
      es: ["Técnicas europeas de corte", "Balayage y mechas californianas", "Corrección de color", "Tendencias internacionales"],
      en: ["European cutting techniques", "Balayage & highlights", "Color correction", "International trends"],
    },
    url: "https://www.universidaddelaimagen.com/cursos-peluqueria-presenciales/",
    imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Academia de Peluquería Profesional",
      en: "Professional Hairdressing Academy",
    },
    school: "Alberto Dugarte Academia",
    location: "Madrid, España",
    price: "500 – 1.500 €",
    duration: "Variable (módulos)",
    hours: "40 – 120 h",
    professionalOutlets: {
      es: ["Barbero profesional", "Estilista masculino", "Artista de peinados"],
      en: ["Professional barber", "Men's stylist", "Hairstyle artist"],
    },
    curriculum: {
      es: ["Corte masculino clásico y moderno", "Coloración y decoloración", "Barba y afeitado", "Peinados artísticos"],
      en: ["Classic & modern men's cutting", "Coloring & bleaching", "Beard & shaving", "Artistic hairstyles"],
    },
    url: "https://albertodugarte.com/academia-peluqueria-madrid/",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Curso Barbería Profesional INTENSIVE",
      en: "Professional Barbering INTENSIVE Course",
    },
    school: "Brain On Academy",
    location: "Sevilla, España",
    price: "1.000 €",
    duration: "Intensivo",
    hours: "80 h",
    professionalOutlets: {
      es: ["Barbero profesional", "Propietario de barbería", "Instructor de barbería"],
      en: ["Professional barber", "Barbershop owner", "Barber instructor"],
    },
    curriculum: {
      es: ["Barbería clásica y contemporánea", "Degradados y fades", "Tendencias urbanas", "Gestión del cliente"],
      en: ["Classic & contemporary barbering", "Fades & gradients", "Urban trends", "Client management"],
    },
    url: "https://www.brainonacademy.com/producto/curso-barberia-profesional/",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Técnico en Peluquería – Titulación Oficial",
      en: "Official Hairdressing Technician Diploma",
    },
    school: "Quality Center Academia",
    location: "Barcelona, España",
    price: "~1.975 € (matrícula + 18 cuotas)",
    duration: "18 meses",
    hours: "1.000 h",
    professionalOutlets: {
      es: ["Técnico de peluquería", "Responsable de salón", "Emprendedor en belleza"],
      en: ["Hairdressing technician", "Salon manager", "Beauty entrepreneur"],
    },
    curriculum: {
      es: ["Formación teórico-práctica completa", "Corte, color y tratamientos", "Gestión de salón", "Título oficial válido para trabajar"],
      en: ["Full theoretical & practical training", "Cut, color & treatments", "Salon management", "Official diploma to work legally"],
    },
    url: "https://academiaquality.com/curso-de-peluqueria",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    lang: "ES",
    modality: "presencial",
    name: {
      es: "Máster en Color y Corte Avanzado",
      en: "Master in Advanced Color & Cut",
    },
    school: "C&C Academia Casanova",
    location: "Barcelona, España",
    price: "~600 €",
    duration: "1 mes",
    hours: "80 h",
    professionalOutlets: {
      es: ["Colorista experto/a", "Estilista de moda", "Docente de peluquería"],
      en: ["Expert colorist", "Fashion stylist", "Hairdressing educator"],
    },
    curriculum: {
      es: ["Color avanzado y corrección", "Técnicas de corte europeas", "Tendencias de pasarela", "Prácticas en clientes reales"],
      en: ["Advanced color & correction", "European cutting techniques", "Runway trends", "Hands-on with real clients"],
    },
    url: "https://www.academiacasanova.com/curso/curso-reafirmacion-en-peluqueria-crp/",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
  },

  // ── PRESENCIALES EEUU ────────────────────────────────────────────────────
  {
    id: 7,
    lang: "EN",
    modality: "presencial",
    name: {
      es: "Programa de Cosmetología Profesional",
      en: "Professional Cosmetology Program",
    },
    school: "Paul Mitchell Schools",
    location: "Los Ángeles, EE.UU.",
    price: "~$15.000 – $20.000",
    duration: "12 – 18 meses",
    hours: "1.500 h",
    professionalOutlets: {
      es: ["Cosmetólogo/a licenciado/a", "Estilista de cine/TV", "Propietario/a de salón"],
      en: ["Licensed cosmetologist", "Film/TV stylist", "Salon owner"],
    },
    curriculum: {
      es: ["Diseño de cabello", "Corte y coloración multicultural", "Maquillaje y uñas", "Tendencias de moda y arte capilar"],
      en: ["Hair design", "Multicultural cutting & coloring", "Makeup & nail art", "Fashion trends & hair artistry"],
    },
    url: "https://paulmitchell.edu/shermanoaks/programs/cosmetology",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format&fit=crop",
  },
  {
    id: 8,
    lang: "EN",
    modality: "presencial",
    name: {
      es: "Cosmetología y Estilismo Capilar",
      en: "Hairdressing & Cosmetology Program",
    },
    school: "Brittany Beauty Academy",
    location: "Nueva York, EE.UU.",
    price: "~$10.000 – $14.000",
    duration: "Variable (12 – 31 h/sem)",
    hours: "1.000 h",
    professionalOutlets: {
      es: ["Estilista con licencia NY", "Colorista de salón premium", "Emprendedor/a en belleza"],
      en: ["NY licensed stylist", "Premium salon colorist", "Beauty entrepreneur"],
    },
    curriculum: {
      es: ["Servicios de corte y tinte", "Manicura y pedicura", "Instrucción por profesores certificados de NY", "Modalidad híbrida (presencial + Zoom)"],
      en: ["Cutting & coloring services", "Manicure & pedicure", "NY state certified instructors", "Hybrid format (on-site + Zoom)"],
    },
    url: "https://brittanyacademy.edu/programs/hairdressing-cosmetology/",
    imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b7?w=600&auto=format&fit=crop",
  },
  {
    id: 9,
    lang: "EN",
    modality: "presencial",
    name: {
      es: "Programa de Cosmetología – Miami",
      en: "Cosmetology & Beauty Program – Miami",
    },
    school: "American Beauty & Trade School (ABS)",
    location: "Miami, EE.UU.",
    price: "~$12.000 – $16.000",
    duration: "12 – 18 meses",
    hours: "1.500 h",
    professionalOutlets: {
      es: ["Cosmetólogo/a licenciado/a FL", "Especialista en spa médico", "Estilista de lujo"],
      en: ["FL licensed cosmetologist", "Medical spa specialist", "Luxury stylist"],
    },
    curriculum: {
      es: ["Cosmetología completa", "Estética y tratamientos faciales", "Técnicas para spa médico", "Emprendimiento en belleza"],
      en: ["Full cosmetology", "Esthetics & facial treatments", "Medical spa techniques", "Beauty entrepreneurship"],
    },
    url: "https://absmiami.edu/",
    imageUrl: "https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&auto=format&fit=crop",
  },

  // ── ONLINE INTERNACIONALES ───────────────────────────────────────────────
  {
    id: 10,
    lang: "EN",
    modality: "online",
    name: {
      es: "Domina el Arte y Ciencia de la Coloración Capilar",
      en: "Mastering the Art & Science of Hair Coloring",
    },
    school: "Udemy",
    location: "Online – Global",
    price: "~15 – 25 €",
    duration: "Autoestudio",
    hours: "20+ h",
    professionalOutlets: {
      es: ["Colorista capilar", "Estilista independiente", "Técnico/a de salón"],
      en: ["Hair colorist", "Freelance stylist", "Salon technician"],
    },
    curriculum: {
      es: ["Fundamentos de colorimetría", "Balayage y mechas", "Corrección de color", "Entrada al mercado profesional"],
      en: ["Colorimetry fundamentals", "Balayage & highlights", "Color correction", "Breaking into the professional market"],
    },
    url: "https://www.udemy.com/course/mastering-the-art-and-science-of-hair-coloring/",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop",
  },
  {
    id: 11,
    lang: "EN",
    modality: "online",
    name: {
      es: "Conviértete en Colorista Experto/a",
      en: "Become an Expert Colorist",
    },
    school: "Udemy – Coach Kimmy",
    location: "Online – Global",
    price: "~20 – 30 €",
    duration: "Autoestudio",
    hours: "30+ h",
    professionalOutlets: {
      es: ["Colorista de alto nivel", "Formador/a en coloración", "Consultor/a de imagen capilar"],
      en: ["High-end colorist", "Coloring educator", "Hair image consultant"],
    },
    curriculum: {
      es: ["Coloración avanzada en salón", "35 años de experiencia destilados", "Técnicas de ombre y fantasía", "Casos prácticos reales"],
      en: ["Advanced salon coloring", "35 years of expertise", "Ombre & fantasy techniques", "Real case studies"],
    },
    url: "https://www.udemy.com/course/become-an-expert-colorist/",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
  },
  {
    id: 12,
    lang: "BOTH",
    modality: "online",
    name: {
      es: "Curso de Estilismo y Peluquería para Principiantes",
      en: "Beginner Hairstylist / Hairdresser / Barber Course",
    },
    school: "Udemy",
    location: "Online – Global",
    price: "~12 – 18 €",
    duration: "Autoestudio",
    hours: "16 módulos",
    professionalOutlets: {
      es: ["Barbero/a básico", "Estilista de salón", "Asistente de peluquería"],
      en: ["Entry-level barber", "Salon stylist", "Hairdressing assistant"],
    },
    curriculum: {
      es: ["16 módulos prácticos", "Corte hombre y mujer", "Técnicas de barbería básica", "Disponible en inglés e hindi"],
      en: ["16 practical modules", "Men's & women's cutting", "Basic barbering techniques", "Available in English & Hindi"],
    },
    url: "https://www.udemy.com/course/hairstylist/",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop",
  },
  {
    id: 13,
    lang: "ES",
    modality: "online",
    name: {
      es: "Cursos de Peluquería Online con Certificado",
      en: "Online Hairdressing Courses with Certificate",
    },
    school: "Universidad de la Imagen",
    location: "Online – España / Global",
    price: "50 – 200 €",
    duration: "Variable",
    hours: "10 – 40 h",
    professionalOutlets: {
      es: ["Especialista en colorimetría", "Peinador/a profesional", "Formador/a online"],
      en: ["Colorimetry specialist", "Professional hairdresser", "Online educator"],
    },
    curriculum: {
      es: ["Colorimetría avanzada", "Técnicas de corte online", "Peinados y recogidos", "Certificado descargable"],
      en: ["Advanced colorimetry", "Online cutting techniques", "Updos & hairstyles", "Downloadable certificate"],
    },
    url: "https://www.universidaddelaimagen.com/cursos-peluqueria-online/",
    imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop",
  },
  {
    id: 14,
    lang: "ES",
    modality: "online",
    name: {
      es: "Peluquería Estilista Profesional",
      en: "Professional Hair Styling – Distance Learning",
    },
    school: "ISE Cursos",
    location: "Online – España",
    price: "~300 – 500 €",
    duration: "6 meses",
    hours: "300 h",
    professionalOutlets: {
      es: ["Estilista profesional", "Técnico/a de peluquería", "Autónomo/a del sector belleza"],
      en: ["Professional stylist", "Hairdressing technician", "Freelance beauty professional"],
    },
    curriculum: {
      es: ["Formación completa a distancia", "Corte, color y estilismo", "Título homologado", "Tutores especializados online"],
      en: ["Full distance learning", "Cut, color & styling", "Accredited diploma", "Specialized online tutors"],
    },
    url: "https://www.isecursos.com/detalle-374",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop",
  },
  {
    id: 15,
    lang: "EN",
    modality: "presencial",
    name: {
      es: "Corte Creativo y Color – Formación Internacional",
      en: "Creative Cutting & Colour – International Training",
    },
    school: "TONI&GUY Academy",
    location: "Londres, Reino Unido (visados internacionales)",
    price: "~800 – 1.500 £",
    duration: "5 días",
    hours: "40 h",
    professionalOutlets: {
      es: ["Estilista de nivel internacional", "Artista editorial", "Formador/a de marcas globales"],
      en: ["International-level stylist", "Editorial hair artist", "Global brand educator"],
    },
    curriculum: {
      es: ["Corte creativo con equipo artístico internacional", "Color de vanguardia", "Salidas en salones de lujo", "Apto para visado de estudiante internacional"],
      en: ["Creative cutting with international artistic team", "Cutting-edge color", "Luxury salon career paths", "Suitable for international student visa"],
    },
    url: "https://toniandguy.com/education/creative-cutting-and-colour",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format&fit=crop",
  },
];
