import { motion } from "framer-motion";
import {
  FileText,
  Users,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

import Container from "../common/Container";

const stats = [
  {
    title: "Invoices Generated",
    value: "50K+",
    description: "Professional invoices created",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Businesses",
    value: "5,000+",
    description: "Growing businesses trust us",
    icon: Users,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Revenue Managed",
    value: "₹25Cr+",
    description: "Invoices processed securely",
    icon: IndianRupee,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Uptime",
    value: "99.9%",
    description: "Reliable platform availability",
    icon: ShieldCheck,
    color: "from-violet-500 to-purple-600",
  },
];

const Stats = () => {
  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            TRUSTED PLATFORM
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
            Numbers That Speak
          </h2>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
            Built for freelancers, startups and growing businesses that
            need fast and professional invoice management.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className={`h-2 w-full bg-gradient-to-r ${item.color}`}
                />

                <div className="p-8">
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color} text-white`}
                  >
                    <Icon size={30} />
                  </div>

                  <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {item.value}
                  </h3>

                  <p className="mt-2 text-lg font-semibold">
                    {item.title}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Companies */}

        <div className="mt-24 border-t border-slate-200 pt-14 dark:border-slate-800">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
            Trusted by Modern Businesses
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 text-center font-bold text-slate-400 sm:grid-cols-3 lg:grid-cols-6">
            <div>Startup</div>
            <div>Agency</div>
            <div>Retail</div>
            <div>Healthcare</div>
            <div>Education</div>
            <div>Technology</div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Stats;