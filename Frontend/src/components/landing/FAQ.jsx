import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import Container from "../common/Container";

const faqs = [
  {
    question: "How do I create my first invoice?",
    answer:
      "Simply create your business profile, add your customers and products, then click 'Create Invoice'. The application automatically generates a professional invoice for you.",
  },
  {
    question: "Can I download invoices as PDF?",
    answer:
      "Yes. Every invoice can be downloaded as a clean, printable PDF that is ready to send or print.",
  },
  {
    question: "Can I email invoices directly?",
    answer:
      "Absolutely. You can send invoices directly to customers from the dashboard without leaving the application.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes. Authentication, JWT tokens, refresh tokens, OTP verification and protected APIs keep your business data secure.",
  },
  {
    question: "Can I manage multiple customers and products?",
    answer:
      "Yes. You can create, update, search and organize unlimited customers and products from your dashboard.",
  },
  {
    question: "Is the application mobile responsive?",
    answer:
      "Yes. The interface is fully responsive and optimized for desktops, tablets and mobile devices.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      className="bg-slate-50 py-24 dark:bg-slate-900"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            FAQ
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl space-y-5">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              layout
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <button
                onClick={() =>
                  setOpen(open === index ? -1 : index)
                }
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold">
                  {faq.question}
                </span>

                <motion.div
                  animate={{
                    rotate: open === index ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                >
                  <ChevronDown />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === index && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    <div className="border-t border-slate-200 px-6 py-5 leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;