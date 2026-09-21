import { motion } from "framer-motion";
import {
  FileText,
  Users,
 Package,
  Mail,
  Download,
  BarChart3,
  ShieldCheck,
  Clock,
} from "lucide-react";

import Container from "../common/Container";

const features = [
  {
    title: "Invoice Management",
    description:
      "Create, edit, duplicate and manage professional invoices with ease.",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Customer Management",
    description:
      "Store customer details and generate invoices in just a few clicks.",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Product Catalog",
    description:
      "Manage products, pricing, GST and inventory information efficiently.",
    icon: Package,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Email Invoices",
    description:
      "Send beautiful PDF invoices directly to customers from your dashboard.",
    icon: Mail,
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "PDF Download",
    description:
      "Download clean, printable PDF invoices anytime with one click.",
    icon: Download,
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Track revenue, invoices, customers and business performance visually.",
    icon: BarChart3,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    title: "Secure Authentication",
    description:
      "JWT authentication, refresh tokens, OTP verification and Google Login.",
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Fast Performance",
    description:
      "Redis caching and optimized backend for quick response times.",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-slate-50 py-24 dark:bg-slate-900"
    >
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            FEATURES
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need
            <br />
            To Manage Your Business
          </h2>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            Powerful tools designed to simplify invoice management,
            customer tracking and business operations.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
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
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -8,
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color}`}
                >
                  <Icon size={30} />
                </div>

                <h3 className="mb-3 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="leading-7 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-8 flex items-center font-semibold text-blue-600 opacity-0 transition-all group-hover:opacity-100">
                  Learn More →
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Features;