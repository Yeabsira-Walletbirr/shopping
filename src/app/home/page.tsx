import TransparentResponsiveHeader from "@/components/HeaderDrawer";
import HeroSection from "@/components/heroSection";
import { IconButton, InputBase, Paper } from "@mui/material";
import Image from "next/image";
import SearchIcon from '@mui/icons-material/SearchOutlined';
import YourCartButton from "@/components/cartButton";

export const revalidate = 60; // Enable ISR: Regenerate every 60s

export default function Home() {

  return (
    <>
      <HeroSection />
    </>
  );
}
