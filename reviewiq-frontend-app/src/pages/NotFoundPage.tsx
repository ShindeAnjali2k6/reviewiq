/**
 * NotFoundPage
 *
 * Rendered for any route that doesn't match a defined page.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft } from "lucide-react";
import { Button, GlassCard } from "../components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <GlassCard className="flex flex-col items-center gap-4 px-10 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 text-indigo-300">
            <Compass className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-500">404</p>
            <h1 className="text-2xl font-semibold text-white">Page not found</h1>
            <p className="max-w-sm text-sm text-slate-400">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          <Link to="/dashboard">
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}
