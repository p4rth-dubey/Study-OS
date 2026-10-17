/** Curriculum data — NCERT chapter lists + Class 10 resource catalogue.
 * Single interface: getSubjects(grade), plus the PDF catalogue and PYQ portal URL.
 * Ported 1:1 from the original local dataset (counts: C10 Sci 13 / Maths 14 /
 * SST 22 = H5+G7+C5+E5; C9 Sci 13 / Maths 8 / SST 9 across 5 groups). */

export interface Chapter {
  id: string;
  no: number;
  name: string;
}

export interface ChapterGroup {
  id: string;
  name: string | null;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  examKey: string;
  groups: ChapterGroup[];
}

export interface PdfResource {
  title: string;
  path: string;
}

const CLASS_10: Subject[] = [
  {
    id: "science",
    name: "Science",
    examKey: "science",
    groups: [
      {
        id: "science",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Chemical Reactions and Equations" },
          { id: "ch2", no: 2, name: "Acids, Bases and Salts" },
          { id: "ch3", no: 3, name: "Metals and Non-metals" },
          { id: "ch4", no: 4, name: "Carbon and its Compounds" },
          { id: "ch5", no: 5, name: "Life Processes" },
          { id: "ch6", no: 6, name: "Control and Coordination" },
          { id: "ch7", no: 7, name: "How do Organisms Reproduce?" },
          { id: "ch8", no: 8, name: "Heredity" },
          { id: "ch9", no: 9, name: "Light – Reflection and Refraction" },
          { id: "ch10", no: 10, name: "Human Eye and Colourful World" },
          { id: "ch11", no: 11, name: "Electricity" },
          { id: "ch12", no: 12, name: "Magnetic Effects of Electric Current" },
          { id: "ch13", no: 13, name: "Our Environment" },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    examKey: "maths",
    groups: [
      {
        id: "maths",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Real Numbers" },
          { id: "ch2", no: 2, name: "Polynomials" },
          { id: "ch3", no: 3, name: "Pair of Linear Equations in Two Variables" },
          { id: "ch4", no: 4, name: "Quadratic Equations" },
          { id: "ch5", no: 5, name: "Arithmetic Progressions" },
          { id: "ch6", no: 6, name: "Triangles" },
          { id: "ch7", no: 7, name: "Coordinate Geometry" },
          { id: "ch8", no: 8, name: "Introduction to Trigonometry" },
          { id: "ch9", no: 9, name: "Some Applications of Trigonometry" },
          { id: "ch10", no: 10, name: "Circles" },
          { id: "ch11", no: 11, name: "Areas Related to Circles" },
          { id: "ch12", no: 12, name: "Surface Areas and Volumes" },
          { id: "ch13", no: 13, name: "Statistics" },
          { id: "ch14", no: 14, name: "Probability" },
        ],
      },
    ],
  },
  {
    id: "sst",
    name: "Social Science",
    examKey: "sst",
    groups: [
      {
        id: "history",
        name: "History",
        chapters: [
          { id: "hist_ch1", no: 1, name: "The Rise of Nationalism in Europe" },
          { id: "hist_ch2", no: 2, name: "Nationalism in India" },
          { id: "hist_ch3", no: 3, name: "The Making of a Global World" },
          { id: "hist_ch4", no: 4, name: "The Age of Industrialisation" },
          { id: "hist_ch5", no: 5, name: "Print Culture and the Modern World" },
        ],
      },
      {
        id: "geography",
        name: "Geography",
        chapters: [
          { id: "geo_ch1", no: 1, name: "Resources and Development" },
          { id: "geo_ch2", no: 2, name: "Forest and Wildlife Resources" },
          { id: "geo_ch3", no: 3, name: "Water Resources" },
          { id: "geo_ch4", no: 4, name: "Agriculture" },
          { id: "geo_ch5", no: 5, name: "Minerals and Energy Resources" },
          { id: "geo_ch6", no: 6, name: "Manufacturing Industries" },
          { id: "geo_ch7", no: 7, name: "Life Lines of National Economy" },
        ],
      },
      {
        id: "civics",
        name: "Political Science (Civics)",
        chapters: [
          { id: "pol_ch1", no: 1, name: "Power Sharing" },
          { id: "pol_ch2", no: 2, name: "Federalism" },
          { id: "pol_ch3", no: 3, name: "Gender, Religion and Caste" },
          { id: "pol_ch4", no: 4, name: "Political Parties" },
          { id: "pol_ch5", no: 5, name: "Outcomes of Democracy" },
        ],
      },
      {
        id: "economics",
        name: "Economics",
        chapters: [
          { id: "eco_ch1", no: 1, name: "Development" },
          { id: "eco_ch2", no: 2, name: "Sectors of the Indian Economy" },
          { id: "eco_ch3", no: 3, name: "Money and Credit" },
          { id: "eco_ch4", no: 4, name: "Globalisation and the Indian Economy" },
          { id: "eco_ch5", no: 5, name: "Consumer Rights" },
        ],
      },
    ],
  },
];

const CLASS_9: Subject[] = [
  {
    id: "science",
    name: "Science",
    examKey: "science",
    groups: [
      {
        id: "science",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Exploration: Entering the World of Secondary Science" },
          { id: "ch2", no: 2, name: "Cell: The Building Block of Life" },
          { id: "ch3", no: 3, name: "Tissues in Action" },
          { id: "ch4", no: 4, name: "Describing Motion Around Us" },
          { id: "ch5", no: 5, name: "Exploring Mixtures and their Separation" },
          { id: "ch6", no: 6, name: "How Forces Affect Motion" },
          { id: "ch7", no: 7, name: "Work, Energy, and Simple Machines" },
          { id: "ch8", no: 8, name: "Journey Inside the Atom" },
          { id: "ch9", no: 9, name: "Atomic Foundations of Matter" },
          { id: "ch10", no: 10, name: "Sound Waves: Characteristics and Applications" },
          { id: "ch11", no: 11, name: "Reproduction: How Life Continues" },
          { id: "ch12", no: 12, name: "Patterns in Life: Diversity and Classification" },
          { id: "ch13", no: 13, name: "Earth as a System: Energy, Matter, and Life" },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    examKey: "maths",
    groups: [
      {
        id: "maths",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Orienting Yourself: The Use of Coordinates" },
          { id: "ch2", no: 2, name: "Introduction to Linear Polynomials" },
          { id: "ch3", no: 3, name: "The World of Numbers" },
          { id: "ch4", no: 4, name: "Exploring Algebraic Identities" },
          { id: "ch5", no: 5, name: "I'm Up and Down, and Round and Round" },
          { id: "ch6", no: 6, name: "Measuring Space: Perimeter and Area" },
          { id: "ch7", no: 7, name: "The Mathematics of Maybe: Introduction to Probability" },
          { id: "ch8", no: 8, name: "Predicting What Comes Next: Exploring Sequences and Progressions" },
        ],
      },
    ],
  },
  {
    id: "sst",
    name: "Social Science",
    examKey: "sst",
    groups: [
      {
        id: "intro",
        name: null,
        chapters: [{ id: "ch1", no: 1, name: "Understanding Social Science" }],
      },
      {
        id: "geography",
        name: "Geography",
        chapters: [
          { id: "ch2", no: 2, name: "Shaping of the Earth's Surface" },
          { id: "ch3", no: 3, name: "Atmosphere and Climate" },
        ],
      },
      {
        id: "history",
        name: "History",
        chapters: [
          { id: "ch4", no: 4, name: "Early Humans and Beginning of Civilisation" },
          { id: "ch5", no: 5, name: "State and Society up to 1000 CE" },
        ],
      },
      {
        id: "polsci",
        name: "Political Science",
        chapters: [
          { id: "ch6", no: 6, name: "Democracy" },
          { id: "ch7", no: 7, name: "Elections" },
        ],
      },
      {
        id: "economics",
        name: "Economics",
        chapters: [
          { id: "ch8", no: 8, name: "Building Blocks in Economics: The Problem of Choice" },
          { id: "ch9", no: 9, name: "The Price Puzzle: What Drives the Market" },
        ],
      },
    ],
  },
];

export function getSubjects(grade: number): Subject[] {
  return grade === 9 ? CLASS_9 : CLASS_10;
}

export const JEE_SUBJECTS: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    examKey: "physics",
    groups: [
      {
        id: "mechanics",
        name: "Mechanics",
        chapters: [
          { id: "phy_units", no: 1, name: "Units, Dimensions and Measurements" },
          { id: "phy_kinematics", no: 2, name: "Kinematics (1D & 2D Motion)" },
          { id: "phy_nl", no: 3, name: "Laws of Motion & Friction" },
          { id: "phy_wep", no: 4, name: "Work, Energy and Power" },
          { id: "phy_rot", no: 5, name: "Rotational Motion & Centre of Mass" },
          { id: "phy_grav", no: 6, name: "Gravitation" },
        ],
      },
      {
        id: "thermo_waves",
        name: "Thermodynamics & Waves",
        chapters: [
          { id: "phy_fluids", no: 7, name: "Properties of Solids and Fluids" },
          { id: "phy_thermo", no: 8, name: "Thermodynamics and Heat Transfer" },
          { id: "phy_ktg", no: 9, name: "Kinetic Theory of Gases" },
          { id: "phy_shm", no: 10, name: "Oscillations (Simple Harmonic Motion)" },
          { id: "phy_waves", no: 11, name: "Wave Motion and Sound Waves" },
        ],
      },
      {
        id: "electromagnetism",
        name: "Electrodynamics & Magnetism",
        chapters: [
          { id: "phy_electro", no: 12, name: "Electrostatics and Electric Potential" },
          { id: "phy_curr", no: 13, name: "Current Electricity and Circuits" },
          { id: "phy_mag", no: 14, name: "Magnetic Effects of Current & Magnetism" },
          { id: "phy_emi", no: 15, name: "Electromagnetic Induction & Alternating Currents" },
          { id: "phy_emw", no: 16, name: "Electromagnetic Waves" },
        ],
      },
      {
        id: "optics_modern",
        name: "Optics & Modern Physics",
        chapters: [
          { id: "phy_ray", no: 17, name: "Ray Optics and Optical Instruments" },
          { id: "phy_wave_opt", no: 18, name: "Wave Optics (Interference & Diffraction)" },
          { id: "phy_dual", no: 19, name: "Dual Nature of Radiation and Matter" },
          { id: "phy_atoms", no: 20, name: "Atoms and Nuclei" },
          { id: "phy_semi", no: 21, name: "Semiconductor Electronics and Logic Gates" },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    examKey: "chemistry",
    groups: [
      {
        id: "physical",
        name: "Physical Chemistry",
        chapters: [
          { id: "chem_mole", no: 1, name: "Some Basic Concepts of Chemistry (Mole Concept)" },
          { id: "chem_atom", no: 2, name: "Atomic Structure" },
          { id: "chem_thermo", no: 3, name: "Chemical Thermodynamics and Enthalpy" },
          { id: "chem_eq", no: 4, name: "Chemical and Ionic Equilibrium" },
          { id: "chem_redox", no: 5, name: "Redox Reactions and Electrochemistry" },
          { id: "chem_kinetics", no: 6, name: "Chemical Kinetics" },
          { id: "chem_solutions", no: 7, name: "Solutions and Colligative Properties" },
        ],
      },
      {
        id: "inorganic",
        name: "Inorganic Chemistry",
        chapters: [
          { id: "chem_periodic", no: 8, name: "Classification of Elements & Periodicity" },
          { id: "chem_bonding", no: 9, name: "Chemical Bonding and Molecular Structure" },
          { id: "chem_pblock", no: 10, name: "p-Block Elements" },
          { id: "chem_dfblock", no: 11, name: "d- and f-Block Elements" },
          { id: "chem_coord", no: 12, name: "Coordination Compounds" },
        ],
      },
      {
        id: "organic",
        name: "Organic Chemistry",
        chapters: [
          { id: "chem_goc", no: 13, name: "General Organic Chemistry (GOC & Isomerism)" },
          { id: "chem_hydrocarbons", no: 14, name: "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)" },
          { id: "chem_halo", no: 15, name: "Haloalkanes and Haloarenes" },
          { id: "chem_oxygen", no: 16, name: "Alcohols, Phenols and Ethers" },
          { id: "chem_carbonyl", no: 17, name: "Aldehydes, Ketones and Carboxylic Acids" },
          { id: "chem_nitrogen", no: 18, name: "Organic Compounds Containing Nitrogen (Amines)" },
          { id: "chem_biomolecules", no: 19, name: "Biomolecules" },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    examKey: "maths",
    groups: [
      {
        id: "algebra",
        name: "Algebra",
        chapters: [
          { id: "math_sets", no: 1, name: "Sets, Relations and Functions" },
          { id: "math_complex", no: 2, name: "Complex Numbers and Quadratic Equations" },
          { id: "math_matrices", no: 3, name: "Matrices and Determinants" },
          { id: "math_pnc", no: 4, name: "Permutations and Combinations" },
          { id: "math_binomial", no: 5, name: "Binomial Theorem and Applications" },
          { id: "math_seq", no: 6, name: "Sequence and Series (AP, GP)" },
        ],
      },
      {
        id: "calculus",
        name: "Calculus",
        chapters: [
          { id: "math_limits", no: 7, name: "Limits, Continuity and Differentiability" },
          { id: "math_aod", no: 8, name: "Applications of Derivatives" },
          { id: "math_indef", no: 9, name: "Indefinite and Definite Integrals" },
          { id: "math_area", no: 10, name: "Differential Equations and Area under Curves" },
        ],
      },
      {
        id: "coord_vectors",
        name: "Coordinate Geometry & Vectors",
        chapters: [
          { id: "math_lines", no: 11, name: "Straight Lines and Circles" },
          { id: "math_conics", no: 12, name: "Conic Sections (Parabola, Ellipse, Hyperbola)" },
          { id: "math_vectors", no: 13, name: "Vector Algebra" },
          { id: "math_3d", no: 14, name: "Three-Dimensional Geometry" },
          { id: "math_prob", no: 15, name: "Probability and Statistics" },
          { id: "math_trig", no: 16, name: "Trigonometric Functions & Equations" },
        ],
      },
    ],
  },
];

export const NEET_SUBJECTS: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    examKey: "physics",
    groups: [
      {
        id: "mechanics",
        name: "Mechanics & Thermal",
        chapters: [
          { id: "n_phy_kinematics", no: 1, name: "Kinematics & Laws of Motion" },
          { id: "n_phy_wep", no: 2, name: "Work, Energy and Power" },
          { id: "n_phy_rot", no: 3, name: "System of Particles and Rotational Motion" },
          { id: "n_phy_grav", no: 4, name: "Gravitation & Properties of Bulk Matter" },
          { id: "n_phy_thermo", no: 5, name: "Thermodynamics & Kinetic Theory" },
          { id: "n_phy_shm", no: 6, name: "Oscillations and Waves" },
        ],
      },
      {
        id: "electro_optics",
        name: "Electrodynamics & Modern Physics",
        chapters: [
          { id: "n_phy_electro", no: 7, name: "Electrostatics & Capacitance" },
          { id: "n_phy_curr", no: 8, name: "Current Electricity" },
          { id: "n_phy_mag", no: 9, name: "Magnetic Effects of Current & EMI" },
          { id: "n_phy_optics", no: 10, name: "Ray Optics and Wave Optics" },
          { id: "n_phy_modern", no: 11, name: "Dual Nature, Atoms, Nuclei & Semiconductor Devices" },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    examKey: "chemistry",
    groups: [
      {
        id: "physical",
        name: "Physical Chemistry",
        chapters: [
          { id: "n_chem_basic", no: 1, name: "Basic Concepts & Atomic Structure" },
          { id: "n_chem_thermo", no: 2, name: "Thermodynamics & Chemical Equilibrium" },
          { id: "n_chem_redox", no: 3, name: "Electrochemistry & Chemical Kinetics" },
          { id: "n_chem_solutions", no: 4, name: "Solutions" },
        ],
      },
      {
        id: "inorganic",
        name: "Inorganic Chemistry",
        chapters: [
          { id: "n_chem_bonding", no: 5, name: "Periodicity & Chemical Bonding" },
          { id: "n_chem_block", no: 6, name: "p-Block, d- and f-Block Elements" },
          { id: "n_chem_coord", no: 7, name: "Coordination Compounds" },
        ],
      },
      {
        id: "organic",
        name: "Organic Chemistry",
        chapters: [
          { id: "n_chem_goc", no: 8, name: "Organic Chemistry Principles & Hydrocarbons" },
          { id: "n_chem_functional", no: 9, name: "Haloalkanes, Alcohols, Phenols & Ethers" },
          { id: "n_chem_carbonyl", no: 10, name: "Aldehydes, Ketones, Carboxylic Acids & Amines" },
          { id: "n_chem_bio", no: 11, name: "Biomolecules" },
        ],
      },
    ],
  },
  {
    id: "biology",
    name: "Biology (Botany & Zoology)",
    examKey: "biology",
    groups: [
      {
        id: "diversity_cell",
        name: "Cell Biology & Living World",
        chapters: [
          { id: "bio_diversity", no: 1, name: "Diversity in the Living World & Biological Classification" },
          { id: "bio_plant_kingdom", no: 2, name: "Plant Kingdom and Animal Kingdom" },
          { id: "bio_morphology", no: 3, name: "Morphology & Anatomy of Flowering Plants" },
          { id: "bio_cell_unit", no: 4, name: "Cell: The Unit of Life & Cell Cycle" },
          { id: "bio_biomolecules", no: 5, name: "Biomolecules" },
        ],
      },
      {
        id: "physiology",
        name: "Plant & Human Physiology",
        chapters: [
          { id: "bio_photosynthesis", no: 6, name: "Photosynthesis in Higher Plants" },
          { id: "bio_respiration", no: 7, name: "Respiration in Plants and Plant Growth" },
          { id: "bio_breathing", no: 8, name: "Breathing and Exchange of Gases" },
          { id: "bio_circulation", no: 9, name: "Body Fluids and Circulation" },
          { id: "bio_excretion", no: 10, name: "Excretory Products and their Elimination" },
          { id: "bio_locomotion", no: 11, name: "Locomotion and Movement" },
          { id: "bio_neural", no: 12, name: "Neural Control and Chemical Coordination" },
        ],
      },
      {
        id: "genetics_ecology",
        name: "Genetics, Biotech & Ecology",
        chapters: [
          { id: "bio_reproduction_plants", no: 13, name: "Sexual Reproduction in Flowering Plants" },
          { id: "bio_human_reproduction", no: 14, name: "Human Reproduction & Reproductive Health" },
          { id: "bio_heredity", no: 15, name: "Principles of Inheritance and Variation" },
          { id: "bio_molecular", no: 16, name: "Molecular Basis of Inheritance" },
          { id: "bio_evolution", no: 17, name: "Evolution" },
          { id: "bio_biotech_principles", no: 18, name: "Biotechnology: Principles and Processes" },
          { id: "bio_biotech_app", no: 19, name: "Biotechnology and its Applications" },
          { id: "bio_organisms", no: 20, name: "Organisms and Populations" },
          { id: "bio_ecosystem", no: 21, name: "Ecosystem & Biodiversity Conservation" },
        ],
      },
    ],
  },
];

export const UPSC_SUBJECTS: Subject[] = [
  {
    id: "gs-paper-1",
    name: "General Studies Paper I",
    examKey: "gs-paper-1",
    groups: [
      {
        id: "history_culture",
        name: "History & Art-Culture",
        chapters: [
          { id: "upsc_ancient", no: 1, name: "Ancient & Medieval Indian History" },
          { id: "upsc_modern", no: 2, name: "Modern Indian History & Freedom Struggle" },
          { id: "upsc_art", no: 3, name: "Indian Art, Architecture & Culture" },
        ],
      },
      {
        id: "polity_governance",
        name: "Polity & Constitution",
        chapters: [
          { id: "upsc_const", no: 4, name: "Preamble, Fundamental Rights & DPSP" },
          { id: "upsc_parliament", no: 5, name: "Parliament, Executive & Union Judiciary" },
          { id: "upsc_federal", no: 6, name: "Federal Structure & Panchayati Raj Institutions" },
        ],
      },
      {
        id: "economy_env",
        name: "Economy, Geography & Environment",
        chapters: [
          { id: "upsc_geo", no: 7, name: "Physical, Economic & World Geography" },
          { id: "upsc_econ", no: 8, name: "Indian Economy, Banking & Budgeting" },
          { id: "upsc_env", no: 9, name: "Ecology, Biodiversity & Climate Treaties" },
          { id: "upsc_sci", no: 10, name: "Science & Technology and Current Affairs" },
        ],
      },
    ],
  },
  {
    id: "csat-paper-2",
    name: "CSAT Paper II (Aptitude)",
    examKey: "csat-paper-2",
    groups: [
      {
        id: "csat",
        name: "Aptitude & Comprehension",
        chapters: [
          { id: "csat_rc", no: 1, name: "Reading Comprehension Passages" },
          { id: "csat_reasoning", no: 2, name: "Logical Reasoning & Analytical Ability" },
          { id: "csat_numeracy", no: 3, name: "Basic Numeracy & Data Interpretation" },
        ],
      },
    ],
  },
];

export const SSC_SUBJECTS: Subject[] = [
  {
    id: "reasoning",
    name: "General Intelligence & Reasoning",
    examKey: "reasoning",
    groups: [
      {
        id: "gi",
        name: null,
        chapters: [
          { id: "ssc_analogies", no: 1, name: "Analogies & Classification" },
          { id: "ssc_series", no: 2, name: "Number & Alphabet Series" },
          { id: "ssc_coding", no: 3, name: "Coding-Decoding & Blood Relations" },
          { id: "ssc_nonverbal", no: 4, name: "Non-Verbal & Pattern Completion" },
        ],
      },
    ],
  },
  {
    id: "quant",
    name: "Quantitative Aptitude",
    examKey: "quant",
    groups: [
      {
        id: "qa",
        name: null,
        chapters: [
          { id: "ssc_arith", no: 1, name: "Arithmetic (Percentage, Profit-Loss, Time-Work, Ratio)" },
          { id: "ssc_adv_math", no: 2, name: "Advanced Math (Algebra, Geometry, Mensuration, Trigonometry)" },
          { id: "ssc_di", no: 3, name: "Data Interpretation (Tables & Graphs)" },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "English Comprehension",
    examKey: "english",
    groups: [
      {
        id: "eng",
        name: null,
        chapters: [
          { id: "ssc_grammar", no: 1, name: "Grammar & Error Spotting" },
          { id: "ssc_vocab", no: 2, name: "Vocabulary, Idioms & Antonyms" },
          { id: "ssc_cloze", no: 3, name: "Cloze Test & Reading Comprehension" },
        ],
      },
    ],
  },
  {
    id: "awareness",
    name: "General Awareness",
    examKey: "awareness",
    groups: [
      {
        id: "ga",
        name: null,
        chapters: [
          { id: "ssc_static_gk", no: 1, name: "Indian History, Polity & Geography" },
          { id: "ssc_gen_science", no: 2, name: "General Science (Physics, Chemistry, Biology)" },
          { id: "ssc_ca", no: 3, name: "Current Events of National Importance" },
        ],
      },
    ],
  },
];

export const BANKING_SUBJECTS: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Aptitude",
    examKey: "quant",
    groups: [
      {
        id: "bank_qa",
        name: null,
        chapters: [
          { id: "bank_speed", no: 1, name: "Simplification & Number Series" },
          { id: "bank_di", no: 2, name: "Data Interpretation (Tables, Bar, Pie, Caselets)" },
          { id: "bank_arith", no: 3, name: "Arithmetic Word Problems" },
        ],
      },
    ],
  },
  {
    id: "reasoning",
    name: "Reasoning Ability",
    examKey: "reasoning",
    groups: [
      {
        id: "bank_reasoning",
        name: null,
        chapters: [
          { id: "bank_puzzles", no: 1, name: "Seating Arrangements & Complex Puzzles" },
          { id: "bank_syllogism", no: 2, name: "Syllogisms, Inequality & Direction Sense" },
          { id: "bank_coding", no: 3, name: "Coding-Decoding & Machine Input-Output" },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "English Language",
    examKey: "english",
    groups: [
      {
        id: "bank_english",
        name: null,
        chapters: [
          { id: "bank_rc", no: 1, name: "Reading Comprehension & Cloze Test" },
          { id: "bank_errors", no: 2, name: "Error Detection & Sentence Improvement" },
          { id: "bank_vocab", no: 3, name: "Word Swap, Fillers & Parajumbles" },
        ],
      },
    ],
  },
];

export function getSubjectsForProfile(profile: { grade?: number; targetExam?: string }): Subject[] {
  const target = profile.targetExam;
  if (target === "jee-main" || target === "jee-advanced") return JEE_SUBJECTS;
  if (target === "neet-ug") return NEET_SUBJECTS;
  if (target === "upsc-cse") return UPSC_SUBJECTS;
  if (target === "ssc-cgl") return SSC_SUBJECTS;
  if (target === "banking-po") return BANKING_SUBJECTS;
  if (target === "cbse-9" || profile.grade === 9) return CLASS_9;
  return CLASS_10; // Default to Class 10
}

/** Scoped chapter id — ensures chapter IDs are distinct across subjects and groups */
export function scopedChapterId(
  subjectId: string,
  groupId: string,
  chapterId: string,
  gradeOrExam?: number | string,
): string {
  if (gradeOrExam === 10 && subjectId === "sst" && groupId) return `${groupId}.${chapterId}`;
  if (groupId && groupId !== subjectId) return `${groupId}.${chapterId}`;
  return chapterId;
}

export const CLASS_10_RESOURCES: Record<string, PdfResource[]> = {
  science: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/science/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/science/cfpq-vol2.pdf" },
  ],
  maths: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/maths/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/maths/cfpq-vol2.pdf" },
    { title: "Competency Focused Practice Questions — Vol 3", path: "/pdfs/class10/maths/cfpq-vol3.pdf" },
    { title: "Competency Focused Practice Questions — Vol 4", path: "/pdfs/class10/maths/cfpq-vol4.pdf" },
  ],
  sst: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/sst/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/sst/cfpq-vol2.pdf" },
  ],
};

export const CBSE_PYQ_PORTAL_URL = "https://www.cbse.gov.in/cbsenew/question-paper.html";

