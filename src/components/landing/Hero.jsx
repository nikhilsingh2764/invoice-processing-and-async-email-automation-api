import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";

import Container from "../common/Container";
import { ROUTES } from "../../constants/routes";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Container>
        <div className="grid min-h-[90vh] items-center gap-16 py-20 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              🚀 Modern Invoice Management Platform
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-slate-900 lg:text-6xl dark:text-white">
              Create Professional
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invoices in Seconds
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Manage customers, products, invoices, payments,
              downloadable PDFs and email invoices from one
              modern dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={ROUTES.SIGNUP}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started

                <ArrowRight size={18} />
              </Link>

              <Link
                to={ROUTES.LOGIN}
                className="rounded-xl border border-slate-300 px-7 py-4 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />

                <span className="text-sm font-medium">
                  Secure Login
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />

                <span className="text-sm font-medium">
                  PDF Export
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />

                <span className="text-sm font-medium">
                  Email Invoice
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Dashboard Overview
                  </h2>

                  <p className="text-sm text-slate-500">
                    Business Analytics
                  </p>
                </div>

                <div className="rounded-xl bg-blue-600 p-3 text-white">
                  <BarChart3 />
                </div>
              </div>

              <div className="grid gap-5">
                <div className="rounded-2xl bg-blue-50 p-5 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Total Revenue
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        ₹2,45,890
                      </h3>
                    </div>

                    <BarChart3
                      className="text-blue-600"
                      size={34}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border p-5">
                    <FileText
                      className="mb-3 text-indigo-600"
                    />

                    <h4 className="text-2xl font-bold">
                      185
                    </h4>

                    <p className="text-sm text-slate-500">
                      Invoices
                    </p>
                  </div>

                  <div className="rounded-2xl border p-5">
                    <Users
                      className="mb-3 text-emerald-600"
                    />

                    <h4 className="text-2xl font-bold">
                      84
                    </h4>

                    <p className="text-sm text-slate-500">
                      Customers
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">
                      Recent Activity
                    </span>

                    <span className="text-sm text-green-600">
                      Live
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Invoice #INV-1025</span>

                      <span className="font-semibold text-green-600">
                        Paid
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Invoice #INV-1026</span>

                      <span className="font-semibold text-yellow-600">
                        Pending
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Invoice #INV-1027</span>

                      <span className="font-semibold text-blue-600">
                        Sent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;