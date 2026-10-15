import type { Metadata } from "next";
import Landing from "../components/landing";

export const metadata: Metadata = {
  title: "StudyOS - CBSE Study Tracker",
  description:
    "StudyOS — offline-first evolution of the CBSE Study Tracker. Backward exam planning, stage tracking, insights, and question banks.",
};

export default function Home() {
  return <Landing />;
}

