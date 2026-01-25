// apps/web/src/components/ui/auth-card.jsx
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const BackgroundParticles = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-primary/10 rounded-full blur-[100px] dark:bg-primary/5"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -40, 40, 0],
        }}
        transition={{
          duration: 10 + i,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: 300,
          height: 300,
          left: `${15 * i}%`,
          top: `${20 * i}%`,
        }}
      />
    ))}
  </div>
);

export const AuthCard = ({ children, title, description, footer }) => (
  <div className="relative w-full">
    <BackgroundParticles />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl dark:shadow-none dark:border-white/10 dark:bg-slate-900/40">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/40 pt-4">
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
