/** Resources — Class 10 CBQ PDFs (local viewer + download) + All-India Exam Syllabi & PYQ Portals.
 * Preserves existing Class 10 CFPQ PDF volumes while expanding resources across all examinations. */
"use client";

import { useState } from "react";
import { useTracker } from "../../../lib/storage";
import { CLASS_10_RESOURCES, CBSE_PYQ_PORTAL_URL } from "../../../lib/chapters";
import { assetUrl } from "../../../lib/site";
import { EmptyNotice, Modal, Pill, SpotCard } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";

const NAMES: Record<string, string> = {
  science: "Science",
  maths: "Mathematics",
  sst: "Social Science",
};

interface OfficialResourceLink {
  title: string;
  examName: string;
  category: "syllabus" | "pyq" | "ncert_books" | "formulae";
  url: string;
  source: string;
}

const OFFICIAL_EXTERNAL_RESOURCES: OfficialResourceLink[] = [
  {
    title: "CBSE Class 9 Official Curriculum & Learning Outcomes",
    examName: "CBSE Class 9",
    category: "syllabus",
    url: "https://cbseacademic.nic.in/curriculum_2026.html",
    source: "cbseacademic.nic.in",
  },
  {
    title: "NCERT Class 9 Official Digital Textbooks (Science, Maths, SST)",
    examName: "CBSE Class 9",
    category: "ncert_books",
    url: "https://ncert.nic.in/textbook.php",
    source: "ncert.nic.in",
  },
  {
    title: "CBSE Class 10 Board Official Sample Question Papers & Marking Schemes",
    examName: "CBSE Class 10",
    category: "pyq",
    url: "https://cbseacademic.nic.in/SQP_CLASSX_2025-26.html",
    source: "cbseacademic.nic.in",
  },
  {
    title: "CBSE Class 12 Senior Secondary Curriculum & Sample Papers",
    examName: "CBSE Class 12",
    category: "syllabus",
    url: "https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html",
    source: "cbseacademic.nic.in",
  },
  {
    title: "JEE (Main) Official Information Bulletin & Syllabus",
    examName: "JEE Main",
    category: "syllabus",
    url: "https://jeemain.nta.nic.in/",
    source: "jeemain.nta.nic.in",
  },
  {
    title: "JEE (Advanced) Past 10-Year Official Papers & Answer Keys",
    examName: "JEE Advanced",
    category: "pyq",
    url: "https://jeeadv.ac.in/past_qps.html",
    source: "jeeadv.ac.in",
  },
  {
    title: "NEET-UG Official Information Bulletin & Core Syllabus (NMC / NTA)",
    examName: "NEET-UG",
    category: "syllabus",
    url: "https://neet.nta.nic.in/",
    source: "neet.nta.nic.in",
  },
  {
    title: "UPSC Civil Services Previous 10-Year Prelims Question Papers",
    examName: "UPSC CSE",
    category: "pyq",
    url: "https://upsc.gov.in/examinations/previous-question-papers",
    source: "upsc.gov.in",
  },
  {
    title: "SSC CGL Previous Year Question Papers & Answer Keys Portal",
    examName: "SSC CGL",
    category: "pyq",
    url: "https://ssc.gov.in/",
    source: "ssc.gov.in",
  },
  {
    title: "GATE Official Question Papers with Verified Answer Keys",
    examName: "GATE",
    category: "pyq",
    url: "https://gate2026.iitr.ac.in/",
    source: "gate2026.iitr.ac.in",
  },
];

export default function ResourcesPage() {
  const { profile, ready } = useTracker();
  const [viewing, setViewing] = useState<{ title: string; path: string } | null>(null);
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No student yet" copy="Finish onboarding first." />;

  const isClass10 = profile.grade === 10;

  const filteredLinks = OFFICIAL_EXTERNAL_RESOURCES.filter((res) => {
    if (resourceFilter !== "all" && res.category !== resourceFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        res.title.toLowerCase().includes(term) ||
        res.examName.toLowerCase().includes(term) ||
        res.source.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
              Curriculum Documents & Question Banks
            </p>
            <h1 className="display-tight text-[26px] font-bold tracking-tight sm:text-[34px]">
              Study Resources Library
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#0099ff]/10 px-3 py-1 text-[12px] font-semibold text-[#38bdf8] ring-1 ring-[#0099ff]/25 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-[#0099ff]" />
            Authentic Official Educational Materials
          </span>
        </div>
      </Reveal>

      {/* Class 10 Local CFPQ PDFs section (Preserved 100%) */}
      {isClass10 && (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">
              Class 10 Competency Focused Practice Questions (CFPQ)
            </h2>
            <span className="font-mono text-[11px] text-[#777]">8 Volumes On-Device</span>
          </div>

          {Object.entries(NAMES).map(([id, name]) => {
            const items = CLASS_10_RESOURCES[id] ?? [];
            return (
              <SpotCard key={id} className="glass-hi rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-6">
                <h3 className="border-b border-white/10 pb-2 font-mono text-[12px] font-semibold tracking-[0.08em] text-[#ccc] uppercase">
                  {name}
                </h3>
                {items.length === 0 ? (
                  <p className="mt-3 text-[14px] text-[#999]">No PDFs for this subject yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-white/[0.06]">
                    {items.map((it, i) => (
                      <li key={it.path} className="flex items-center gap-1 py-1">
                        <button
                          type="button"
                          onClick={() => setViewing(it)}
                          aria-label={`View ${it.title}`}
                          className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <span className="tnum flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-mono text-[12px] font-bold">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium">{it.title}</span>
                            <span className="block text-[12.5px] text-[#777]">Tap to read · PDF</span>
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </button>
                        <a
                          href={assetUrl(it.path)}
                          download
                          aria-label={`Download ${it.title}`}
                          title="Download"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10 transition-colors hover:bg-[#262626]"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </SpotCard>
            );
          })}
        </div>
      )}

      {/* Expanded Multi-Exam Syllabi, PYQ Portals & NCERT E-books */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[17px] font-semibold tracking-tight">
            Official Syllabi, Past Papers & NCERT Portals
          </h2>
          <span className="font-mono text-[11px] text-[#777]">Direct Government Portals</span>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources by exam, subject, or title..."
            className="h-11 w-full rounded-[12px] bg-[#141414] px-4 text-[13.5px] text-white ring-1 ring-white/10 placeholder:text-[#666] outline-none focus:ring-[#0099ff]"
          />

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Formats" },
              { id: "syllabus", label: "Official Syllabi" },
              { id: "pyq", label: "Previous Year Papers" },
              { id: "ncert_books", label: "NCERT Digital Books" },
            ].map((f) => (
              <Pill
                key={f.id}
                active={resourceFilter === f.id}
                onClick={() => setResourceFilter(f.id)}
              >
                {f.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Resources Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredLinks.map((item, idx) => (
            <SpotCard
              key={idx}
              className="flex flex-col justify-between rounded-[16px] bg-[#141414] p-4 ring-1 ring-white/[0.06] hover:bg-[#181818]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-white">
                    {item.examName}
                  </span>
                  <span className="text-[#888]">{item.source}</span>
                </div>
                <h4 className="mt-2.5 text-[14.5px] font-medium leading-snug text-white">
                  {item.title}
                </h4>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[12.5px]">
                <span className="text-[11.5px] uppercase tracking-wider text-[#777]">
                  {item.category.replace("_", " ")}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-white hover:underline"
                >
                  <span>Open Portal</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <path d="M15 3h6v6" />
                    <path d="M10 14L21 3" />
                  </svg>
                </a>
              </div>
            </SpotCard>
          ))}
        </div>
      </div>

      {/* PDF Modal Viewer for Class 10 On-Device PDFs */}
      {viewing && (
        <Modal title={viewing.title} wide fullscreen onClose={() => setViewing(null)}>
          <div className="flex h-[calc(100dvh-140px)] flex-col overflow-hidden rounded-[10px] bg-[#0a0a0a] sm:h-[62dvh]">
            <iframe src={assetUrl(viewing.path)} title={viewing.title} className="h-full w-full flex-1 border-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={assetUrl(viewing.path)}
              download
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black"
            >
              Download PDF
            </a>
            <a
              href={assetUrl(viewing.path)}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center rounded-full bg-[#1c1c1c] px-5 text-[13px] font-medium ring-1 ring-white/10"
            >
              Open in new tab ↗
            </a>
          </div>
          <p className="mt-2 text-[12.5px] text-[#666]">
            Pinch to zoom works in the viewer. On small screens, &ldquo;Open in new tab&rdquo; gives the full reader.
          </p>
        </Modal>
      )}
    </div>
  );
}
