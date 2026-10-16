/** Verified Current Affairs, Daily Quizzes & Revision Flashcards.
 * Derived from authentic official announcements (PIB, RBI, ISRO, Govt Gazette). */

import type { CurrentAffairsArticle, Flashcard } from "./types";

export const CURRENT_AFFAIRS_ARTICLES: CurrentAffairsArticle[] = [
  {
    id: "ca-isro-gaganyaan",
    title: "ISRO Achieves Key Milestones in Gaganyaan Human Spaceflight Propulsion Qualification",
    category: "science_tech",
    publicationDate: "2026-03-05",
    summary: "The Indian Space Research Organisation (ISRO) successfully qualified the human-rated CE20 cryogenic engine and Service Module Propulsion System (SMPS) for the upcoming uncrewed Gaganyaan-1 (G1) test flight.",
    examRelevance: ["UPSC CSE GS-3 (Science & Tech)", "SSC CGL (General Awareness)", "NDA / CDS"],
    keyTakeaways: [
      "The CE20 engine powers the cryogenic upper stage of the LVM3 human-rated launch vehicle.",
      "The G1 uncrewed flight carries the female humanoid robot 'Vyommitra' to monitor environmental parameters in the crew capsule.",
      "Human-rating requires safety factors of 1.4 across mechanical structures and redundant flight control avionics.",
    ],
    sourceName: "ISRO Press Release / PIB Delhi",
    sourceUrl: "https://www.isro.gov.in/",
    quizQuestion: {
      questionText: "What is the name of the female humanoid robot developed by ISRO for the uncrewed test flights of the Gaganyaan mission?",
      options: [
        { id: "A", text: "Vyommitra" },
        { id: "B", text: "Pragyan" },
        { id: "C", text: "Mitra" },
        { id: "D", text: "Gaganputri" },
      ],
      correctAnswer: "A",
      explanation: "Vyommitra ('friend in the sky') is the half-humanoid robot designed to simulate human functions and monitor life-support telemetry in the crew module.",
    },
  },
  {
    id: "ca-rbi-mpc",
    title: "RBI Monetary Policy Committee (MPC) Maintains Headline Inflation Target of 4%",
    category: "economy",
    publicationDate: "2026-02-12",
    summary: "The Reserve Bank of India's Monetary Policy Committee highlighted that core inflation has moderated, while food price volatility warrants a cautious monetary stance to ensure headline CPI aligns durably with the 4% target.",
    examRelevance: ["UPSC CSE GS-3 (Economy)", "Banking / IBPS PO (Banking Awareness)", "RBI Grade B"],
    keyTakeaways: [
      "Under the Flexible Inflation Targeting (FIT) framework (Section 45ZB of the RBI Act, 1934), the inflation target is 4% with a tolerance band of +/- 2% (2% to 6%).",
      "The MPC consists of 6 members: 3 from RBI and 3 external members appointed by the Central Government.",
      "The Governor of RBI holds a casting vote in the event of a tie.",
    ],
    sourceName: "Reserve Bank of India Monetary Policy Statement",
    sourceUrl: "https://www.rbi.org.in/",
    quizQuestion: {
      questionText: "Under Section 45ZB of the RBI Act, 1934, what is the composition of the Monetary Policy Committee (MPC)?",
      options: [
        { id: "A", text: "6 members: 3 from RBI and 3 appointed by the Central Government" },
        { id: "B", text: "5 members: all senior RBI Deputy Governors" },
        { id: "C", text: "7 members: chaired by the Union Finance Minister" },
        { id: "D", text: "4 members: 2 from Ministry of Finance and 2 from RBI" },
      ],
      correctAnswer: "A",
      explanation: "The MPC consists of 6 members: the RBI Governor (Chairperson), the Deputy Governor in charge of monetary policy, one RBI officer, and three external experts appointed by the Central Government.",
    },
  },
  {
    id: "ca-green-hydrogen",
    title: "National Green Hydrogen Mission: Strategic Interventions for Green Hydrogen Transition (SIGHT)",
    category: "environment",
    publicationDate: "2026-01-28",
    summary: "Ministry of New and Renewable Energy (MNRE) awarded capacity under the SIGHT Programme for domestic electrolyser manufacturing and green ammonia production to achieve 5 MMT annual capacity by 2030.",
    examRelevance: ["UPSC CSE GS-3 (Environment & Energy)", "JEE / NEET (Energy transition contexts)", "State PSCs"],
    keyTakeaways: [
      "Target: Production of 5 Million Metric Tonnes (MMT) of green hydrogen per annum by 2030.",
      "Green hydrogen is produced via electrolysis of water powered entirely by renewable electricity (solar, wind).",
      "Reduces dependence on fossil fuels in hard-to-abate sectors like steel, refineries, and fertilizer production.",
    ],
    sourceName: "MNRE / Press Information Bureau",
    sourceUrl: "https://mnre.gov.in/",
    quizQuestion: {
      questionText: "Which chemical process is utilized to produce 'Green Hydrogen' using renewable energy?",
      options: [
        { id: "A", text: "Electrolysis of water powered by renewable power" },
        { id: "B", text: "Steam Methane Reforming (SMR) with coal" },
        { id: "C", text: "Thermal cracking of heavy petroleum crude" },
        { id: "D", text: "Catalytic oxidation of natural gas" },
      ],
      correctAnswer: "A",
      explanation: "Green hydrogen is generated through water electrolysis (splitting H2O into H2 and O2) using renewable electricity with zero direct greenhouse gas emissions.",
    },
  },
  {
    id: "ca-digital-public-infra",
    title: "India Stack and UPI Global Integration: Cross-Border Linkages with Singapore, UAE, and Europe",
    category: "national",
    publicationDate: "2026-02-20",
    summary: "National Payments Corporation of India (NPCI) expanded real-time bilateral remittance linkages connecting India's UPI with foreign fast-payment systems, dramatically lowering cross-border remittance costs.",
    examRelevance: ["UPSC CSE GS-2 & GS-3", "Banking PO (Financial Awareness)", "SSC CGL"],
    keyTakeaways: [
      "UPI (Unified Payments Interface) was developed by NPCI and launched in 2016.",
      "Operates on IMPS infrastructure enabling instant, 24/7/365 person-to-person and merchant transfers.",
      "India Stack encompasses identity (Aadhaar), payments (UPI), and data empowerment (DEPA / Account Aggregator).",
    ],
    sourceName: "NPCI / Ministry of Electronics & IT (MeitY)",
    sourceUrl: "https://www.npci.org.in/",
    quizQuestion: {
      questionText: "Which organization developed and operates the Unified Payments Interface (UPI) in India?",
      options: [
        { id: "A", text: "National Payments Corporation of India (NPCI)" },
        { id: "B", text: "Reserve Bank of India (RBI) directly" },
        { id: "C", text: "Unique Identification Authority of India (UIDAI)" },
        { id: "D", text: "NITI Aayog" },
      ],
      correctAnswer: "A",
      explanation: "NPCI, an initiative of RBI and the Indian Banks' Association (IBA) under the Payment and Settlement Systems Act, 2007, developed and manages UPI.",
    },
  },
  {
    id: "ca-environment-wetlands",
    title: "India Expands Ramsar Wetland Network: Focus on Ecological Conservation",
    category: "environment",
    publicationDate: "2026-02-02",
    summary: "On World Wetlands Day, India designated additional ecologically sensitive wetlands as Wetlands of International Importance under the Ramsar Convention, reinforcing migratory bird corridor protection.",
    examRelevance: ["UPSC CSE Prelims (Environment)", "NEET (Ecology)", "SSC CGL (General Awareness)"],
    keyTakeaways: [
      "The Ramsar Convention is an intergovernmental treaty adopted in 1971 in Ramsar, Iran, for the conservation and wise use of wetlands.",
      "Montreux Record is a register of wetland sites on the Ramsar List where changes in ecological character have occurred, are occurring, or are likely to occur.",
      "In India, Keoladeo National Park (Rajasthan) and Loktak Lake (Manipur) are listed in the Montreux Record.",
    ],
    sourceName: "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    sourceUrl: "https://moef.gov.in/",
    quizQuestion: {
      questionText: "Which of the following Indian wetlands are currently placed on the Montreux Record under the Ramsar Convention?",
      options: [
        { id: "A", text: "Keoladeo National Park and Loktak Lake" },
        { id: "B", text: "Chilika Lake and Sundarbans" },
        { id: "C", text: "Vembanad Lake and Wular Lake" },
        { id: "D", text: "Sambhar Lake and Harike Wetland" },
      ],
      correctAnswer: "A",
      explanation: "Currently, Keoladeo National Park (Rajasthan) and Loktak Lake (Manipur) are the two Indian sites on the Montreux Record. (Chilika Lake was once included but successfully removed after ecological restoration).",
    },
  },
];

export const REVISION_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    category: "polity",
    topic: "Fundamental Rights",
    front: "Which Fundamental Right in the Indian Constitution is referred to by Dr. B.R. Ambedkar as the 'Heart and Soul of the Constitution'?",
    back: "Article 32 — Right to Constitutional Remedies (the right to move the Supreme Court via writs: Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, and Certiorari).",
    examTag: "UPSC / SSC / Law",
  },
  {
    id: "fc-2",
    category: "science_tech",
    topic: "Space & Physics",
    front: "What is the escape velocity from the surface of the Earth, and how is it related to orbital velocity?",
    back: "Escape velocity v_e = sqrt(2 * g * R) ≈ 11.2 km/s. It is sqrt(2) times (~1.414x) the orbital velocity v_o near Earth's surface (v_e = sqrt(2) * v_o).",
    examTag: "JEE / NEET / Defence",
  },
  {
    id: "fc-3",
    category: "economy",
    topic: "Banking & Macroeconomics",
    front: "What is Statutory Liquidity Ratio (SLR), and in what forms can commercial banks maintain it?",
    back: "SLR is the mandatory reserve percentage of Net Demand and Time Liabilities (NDTL) that banks must maintain in liquid assets: cash, gold, or approved government securities (G-Secs/T-Bills).",
    examTag: "Banking PO / UPSC GS-3",
  },
  {
    id: "fc-4",
    category: "environment",
    topic: "Ecology & Climate",
    front: "What are the six greenhouse gases originally covered under the Kyoto Protocol?",
    back: "1. Carbon dioxide (CO2)\n2. Methane (CH4)\n3. Nitrous oxide (N2O)\n4. Hydrofluorocarbons (HFCs)\n5. Perfluorocarbons (PFCs)\n6. Sulphur hexafluoride (SF6)",
    examTag: "UPSC / State PSC",
  },
];
