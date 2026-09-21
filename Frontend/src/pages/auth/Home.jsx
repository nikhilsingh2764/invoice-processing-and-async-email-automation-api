import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features"
import stats from "../../components/landing/Stats"
import HowItWorks from "../../components/landing/HowItWorks";
import Testimonials from "../../components/landing/Testimonials";
import FAQ from "../../components/landing/FAQ";
import CTA from "../../components/landing/CTA";



const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <stats/>
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
};

export default Home;