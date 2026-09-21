import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <h1 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-4 text-slate-600">
          🎉 Login Successful!
        </p>

        <p className="mt-2 text-slate-500">
          This is a temporary dashboard page.
          <br />
          We'll replace it with the complete dashboard layout,
          sidebar, header, analytics cards, tables and charts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/profile"
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Profile
          </Link>

          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-slate-200 px-6 py-3 text-slate-500"
          >
            Customers
          </button>

          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-slate-200 px-6 py-3 text-slate-500"
          >
            Products
          </button>

          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-slate-200 px-6 py-3 text-slate-500"
          >
            Invoices
          </button>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

