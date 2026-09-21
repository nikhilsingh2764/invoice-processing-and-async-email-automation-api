import { motion } from "framer-motion";
import { Star } from "lucide-react";

import Container from "../common/Container";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Startup Founder",
    company: "TechNova",
    image: "https://i.pravatar.cc/150?img=12",
    review:
      "InvoicePilot has completely simplified our invoicing process. Creating invoices now takes less than a minute.",
  },
  {
    name: "Priya Verma",
    role: "Freelance Designer",
    company: "Creative Studio",
    image: "https://i.pravatar.cc/150?img=25",
    review:
      "The PDF invoices look extremely professional. My clients love the clean design and email delivery feature.",
  },
  {
    name: "Amit Patel",
    role: "Business Owner",
    company: "Patel Enterprises",
    image: "https://i.pravatar.cc/150?img=15",
    review:
      "Managing customers, products and invoices from one dashboard saves us hours every week.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            TESTIMONIALS
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 dark:text-white">
            Loved by Businesses
          </h2>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
            Businesses trust InvoicePilot to create professional invoices,
            manage customers and streamline daily operations.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.12,
                duration: 0.5,
              }}
              whileHover={{
                y: -8,
              }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="leading-8 text-slate-600 dark:text-slate-400">
                "{item.review}"
              </p>

              <div className="mt-8 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-full object-cover"
                />

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {item.role}
                  </p>

                  <p className="text-sm font-medium text-blue-600">
                    {item.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;