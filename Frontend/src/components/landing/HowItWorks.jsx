import { motion } from "framer-motion";
import {
  UserPlus,
  Building2,
  Users,
  Package,
  FileText,
  Mail,
} from "lucide-react";

import Container from "../common/Container";

const steps = [
  {
    title: "Create Your Account",
    description:
      "Sign up securely using email verification or Google authentication and access your personal dashboard.",
    icon: UserPlus,
    color: "bg-blue-600",
  },
  {
    title: "Setup Business Profile",
    description:
      "Add your business information including GST, address, contact details and branding.",
    icon: Building2,
    color: "bg-indigo-600",
  },
  {
    title: "Add Customers",
    description:
      "Store customer information once and reuse it while generating future invoices.",
    icon: Users,
    color: "bg-emerald-600",
  },
  {
    title: "Create Products",
    description:
      "Manage products, pricing, tax information and descriptions from one place.",
    icon: Package,
    color: "bg-orange-500",
  },
  {
    title: "Generate Invoice",
    description:
      "Select customers and products to instantly create professional invoices.",
    icon: FileText,
    color: "bg-violet-600",
  },
  {
    title: "Download or Email PDF",
    description:
      "Download PDF invoices or send them directly to customers with one click.",
    icon: Mail,
    color: "bg-pink-600",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-24 dark:bg-slate-900"
    >
      <Container>
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            HOW IT WORKS
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
            Create Professional Invoices
            <br />
            In Just Six Steps
          </h2>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            Our workflow is designed to be simple, fast and intuitive,
            allowing you to focus on your business instead of paperwork.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Center Line */}
          <div className="absolute left-1/2 hidden h-full w-1 -translate-x-1/2 rounded-full bg-slate-200 lg:block dark:bg-slate-700" />

          <div className="space-y-14">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className={`flex items-center ${
                    index % 2 === 0
                      ? "lg:flex-row"
                      : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className="w-full lg:w-1/2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
                      <div
                        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-white`}
                      >
                        <Icon size={30} />
                      </div>

                      <span className="text-sm font-semibold text-blue-600">
                        STEP {index + 1}
                      </span>

                      <h3 className="mt-3 text-2xl font-bold">
                        {step.title}
                      </h3>

                      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative hidden w-24 justify-center lg:flex">
                    <div
                      className={`z-10 flex h-14 w-14 items-center justify-center rounded-full ${step.color} text-lg font-bold text-white shadow-xl`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="hidden lg:block lg:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;