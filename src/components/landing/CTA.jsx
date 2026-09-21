import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

import Container from "../common/Container";
import { ROUTES } from "../../constants/routes";

const CTA = () => {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700" />

      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

      <Container className="relative">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto max-w-5xl rounded-[40px] border border-white/20 bg-white/10 p-12 text-center backdrop-blur-xl"
        >
          <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold tracking-wide text-white">
            READY TO START?
          </span>

          <h2 className="mt-8 text-4xl font-extrabold leading-tight text-white lg:text-6xl">
            Manage Your Business
            <br />
            Like a Professional
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-blue-100">
            Create invoices, manage customers, organize products,
            track payments and send beautiful PDF invoices —
            all from one modern dashboard.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">
            <Link
              to={ROUTES.SIGNUP}
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-blue-700 shadow-xl transition hover:scale-105"
            >
              Create Free Account

              <ArrowRight size={20} />
            </Link>

            <button className="inline-flex items-center gap-3 rounded-2xl border border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10">
              <PlayCircle size={22} />

              Watch Demo
            </button>
          </div>

          <div className="mt-14 grid gap-8 border-t border-white/20 pt-10 sm:grid-cols-3">
            <div>
              <h3 className="text-3xl font-bold text-white">
                100%
              </h3>

              <p className="mt-2 text-blue-100">
                Responsive Design
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                Secure
              </h3>

              <p className="mt-2 text-blue-100">
                JWT Authentication
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                Fast
              </h3>

              <p className="mt-2 text-blue-100">
                Redis Powered Backend
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTA;