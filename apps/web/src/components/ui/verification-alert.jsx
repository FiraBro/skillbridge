// apps/web/src/components/ui/verification-alert.jsx
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export const VerificationAlert = ({ title, message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mb-6"
  >
    <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
      <HiOutlineCheckCircle className="h-4 w-4 stroke-emerald-600 dark:stroke-emerald-400" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="opacity-90">{message}</AlertDescription>
    </Alert>
  </motion.div>
);
